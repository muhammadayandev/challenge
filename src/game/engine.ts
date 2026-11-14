import { GAME_BALANCE } from './balance';
import { ACTION_DEFINITIONS, canPerformAction } from './actions';
import { MISSION_EVENTS } from './events';
import { generateRandomSeed, hashSeed, nextRandom } from './rng';
import {
  ActionId,
  Astronaut,
  GameState,
  MissionEventDefinition,
  MissionReport,
  ResourceDelta,
  SolLogEntry,
} from './types';

export function clampResource(value: number): number {
  return Math.max(
    GAME_BALANCE.mission.minResource,
    Math.min(GAME_BALANCE.mission.maxResource, Math.round(value))
  );
}

function createInitialCrew(): Astronaut[] {
  return [
    { id: 'c1', name: 'Cmdr. Maya Lin', role: 'Mission Commander', health: 100, radiationExposure: 0, status: 'Healthy' },
    { id: 'c2', name: 'Leo Vance', role: 'Systems Engineer', health: 100, radiationExposure: 0, status: 'Healthy' },
    { id: 'c3', name: 'Priya Nair', role: 'Astro-Botanist', health: 100, radiationExposure: 0, status: 'Healthy' },
    { id: 'c4', name: 'Sam Okafor', role: 'Planetary Scientist', health: 100, radiationExposure: 0, status: 'Healthy' },
  ];
}

function updateAstronautStatus(astro: Astronaut): Astronaut {
  const health = clampResource(astro.health);
  const radiationExposure = clampResource(astro.radiationExposure);
  let status: Astronaut['status'] = 'Healthy';
  if (health <= 35) status = 'Critical';
  else if (radiationExposure >= 55) status = 'Radiation Alert';
  else if (health <= 70) status = 'Tired';

  return { ...astro, health, radiationExposure, status };
}

function buildSolBriefing(
  sol: number,
  state: Pick<GameState, 'power' | 'lifeSupport' | 'shelterProtection' | 'greenhouseQueue' | 'earthComms'>
): string {
  const readySoon = state.greenhouseQueue.filter((g) => g.readyOnSol === sol);
  const harvestNote =
    readySoon.length > 0
      ? ` Bio-dome sensors show ${readySoon.length} crop batch ready to harvest at the end of this sol!`
      : '';
  const earthNote =
    state.earthComms.pendingReplyOnSol === sol
      ? ' Deep Space Network is receiving a queued transmission from Earth Mission Control.'
      : '';

  if (sol === 1) {
    return 'Welcome to Outpost 14! Your 4 astronauts just landed in Jezero Crater. Shelter walls are still thin (35/100). Choose 2 smart actions to build stability for the next 14 sols.';
  }
  if (state.lifeSupport <= 30) {
    return `URGENT SOL ${sol} BRIEFING: Life-support reserves are critically low (${state.lifeSupport}/100)! Prioritize Recycle Water or emergency conservation.${harvestNote}${earthNote}`;
  }
  if (state.power <= 30) {
    return `SOL ${sol} POWER ALERT: Battery reserves are low (${state.power}/100). Clean dusty solar panels or conserve electricity today.${harvestNote}${earthNote}`;
  }
  if (sol >= 12) {
    return `SOL ${sol} FINAL STRETCH: Supply rocket recovery window is approaching on Sol 14! Keep all systems stable and crew healthy.${harvestNote}${earthNote}`;
  }
  return `Sol ${sol} morning check complete. Systems are online across Outpost 14.${harvestNote}${earthNote}`;
}

export function createInitialState(customSeed?: string): GameState {
  const seed = (customSeed?.trim() || generateRandomSeed()).toUpperCase();
  const initialRng = hashSeed(seed);
  const delayRoll = nextRandom(initialRng);
  const oneWayMinutes = 4 + Math.floor(delayRoll.value * 18);

  const baseState: GameState = {
    seed,
    rngState: delayRoll.nextState,
    sol: 1,
    phase: 'briefing',
    status: 'active',
    actionPoints: GAME_BALANCE.mission.actionsPerSol,
    power: GAME_BALANCE.initial.power,
    lifeSupport: GAME_BALANCE.initial.lifeSupport,
    shelterProtection: GAME_BALANCE.initial.shelterProtection,
    solarPanelEfficiency: GAME_BALANCE.initial.solarPanelEfficiency,
    sciencePoints: GAME_BALANCE.initial.sciencePoints,
    dustStormActive: false,
    crew: createInitialCrew(),
    greenhouseQueue: [],
    earthComms: {
      oneWayMinutes,
      pendingReplyOnSol: null,
      pendingRequestTopic: null,
      blackoutActive: false,
      lastReplyMessage: null,
    },
    currentBriefing: '',
    currentSolActions: [],
    activeEvent: null,
    lastEventOutcome: null,
    lastEarthReply: null,
    lastHarvestSummary: null,
    lastEducationNote: null,
    usedEventIds: [],
    history: [],
    report: null,
  };

  baseState.currentBriefing = buildSolBriefing(1, baseState);
  return baseState;
}

export function startSolOperations(state: GameState): GameState {
  if (state.status !== 'active' || state.phase !== 'briefing') return state;
  return {
    ...state,
    phase: 'actions',
    lastEventOutcome: null,
    lastEarthReply: null,
    lastHarvestSummary: null,
  };
}

export function performAction(state: GameState, actionId: ActionId): GameState {
  const check = canPerformAction(state, actionId);
  if (!check.allowed) {
    return state;
  }

  const def = ACTION_DEFINITIONS.find((a) => a.id === actionId);
  if (!def) return state;

  const next: GameState = {
    ...state,
    crew: state.crew.map((c) => ({ ...c })),
    greenhouseQueue: [...state.greenhouseQueue],
    earthComms: { ...state.earthComms },
    currentSolActions: [...state.currentSolActions],
  };

  let deltas: ResourceDelta = {};
  let summary = '';

  switch (actionId) {
    case 'recycle_water': {
      const { powerCost, lifeSupportGain } = GAME_BALANCE.actions.recycleWater;
      const prevLife = next.lifeSupport;
      next.power = clampResource(next.power - powerCost);
      next.lifeSupport = clampResource(next.lifeSupport + lifeSupportGain);
      deltas = { power: -powerCost, lifeSupport: next.lifeSupport - prevLife };
      summary = `Water recycling restored Life Support to ${next.lifeSupport}/100.`;
      break;
    }
    case 'operate_greenhouse': {
      const { powerCost, lifeSupportCost, harvestDelaySols } = GAME_BALANCE.actions.operateGreenhouse;
      next.power = clampResource(next.power - powerCost);
      next.lifeSupport = clampResource(next.lifeSupport - lifeSupportCost);
      const readyOnSol = next.sol + harvestDelaySols;
      const cropNames = ['Hydro-Lettuce', 'Dwarf Wheat', 'Space Radishes', 'Martian Kale'];
      const cropName = cropNames[(next.sol + next.greenhouseQueue.length) % cropNames.length];
      next.greenhouseQueue.push({
        id: `crop-${next.sol}-${next.greenhouseQueue.length}`,
        plantedOnSol: next.sol,
        readyOnSol,
        cropName,
      });
      deltas = { power: -powerCost, lifeSupport: -lifeSupportCost };
      summary = `Planted ${cropName} in the bio-dome! Harvest scheduled for Sol ${readyOnSol}.`;
      break;
    }
    case 'improve_shielding': {
      const { powerCost, shelterGain } = GAME_BALANCE.actions.improveShielding;
      const prevShelter = next.shelterProtection;
      next.power = clampResource(next.power - powerCost);
      next.shelterProtection = clampResource(next.shelterProtection + shelterGain);
      deltas = { power: -powerCost, shelterProtection: next.shelterProtection - prevShelter };
      summary = `Added Martian regolith shielding! Shelter Protection is now ${next.shelterProtection}/100.`;
      break;
    }
    case 'clean_solar_panels': {
      const { powerCost, efficiencyRestoredTo, immediatePowerBonus } = GAME_BALANCE.actions.cleanSolarPanels;
      const prevEff = next.solarPanelEfficiency;
      next.power = clampResource(next.power - powerCost + immediatePowerBonus);
      next.solarPanelEfficiency = efficiencyRestoredTo;
      deltas = {
        power: -powerCost + immediatePowerBonus,
        solarPanelEfficiency: efficiencyRestoredTo - prevEff,
      };
      summary = 'Scrubbed solar arrays clean! Panel efficiency restored to 100%.';
      break;
    }
    case 'scientific_expedition': {
      const { powerCost, scienceGain, baseRadiationExposure } = GAME_BALANCE.actions.scientificExpedition;
      next.power = clampResource(next.power - powerCost);
      next.sciencePoints += scienceGain;
      const exposureFactor = Math.max(0.25, 1 - next.shelterProtection / 130);
      const radAdded = Math.round(baseRadiationExposure * exposureFactor);
      next.crew = next.crew.map((c) =>
        updateAstronautStatus({
          ...c,
          radiationExposure: c.radiationExposure + radAdded,
          health: c.health - Math.round(radAdded * 0.3),
        })
      );
      deltas = { power: -powerCost, sciencePoints: scienceGain };
      summary = `Collected Mars soil cores (+${scienceGain} Science). Crew absorbed +${radAdded} radiation units.`;
      break;
    }
    case 'contact_earth': {
      const { powerCost } = GAME_BALANCE.actions.contactEarth;
      next.power = clampResource(next.power - powerCost);
      const topic = next.power <= next.lifeSupport ? 'Power Optimization' : 'Life-Support Diagnostic';
      next.earthComms.pendingReplyOnSol = next.sol + 1;
      next.earthComms.pendingRequestTopic = topic;
      deltas = { power: -powerCost };
      summary = `Sent ${topic} request across ${next.earthComms.oneWayMinutes} light-minutes! Earth reply expected Sol ${next.sol + 1}.`;
      break;
    }
  }

  next.actionPoints -= 1;
  next.lastEducationNote = def.education;
  next.currentSolActions.push({
    actionId,
    label: def.label,
    deltas,
    summary,
    education: def.education,
  });

  return next;
}

function selectDailyEvent(state: GameState): { event: MissionEventDefinition; nextRngState: number } {
  let rng = state.rngState;
  const lastEventId = state.history.length > 0 ? state.history[state.history.length - 1].eventId : null;

  const mustIncludeIds = ['dust_storm', 'solar_particle_event', 'life_support_failure', 'comms_interruption'];
  const unseenSignature = mustIncludeIds.filter((id) => !state.usedEventIds.includes(id));

  let candidates = MISSION_EVENTS.filter((ev) => ev.id !== lastEventId);
  if (unseenSignature.length > 0 && state.sol >= 3 && state.sol <= 10) {
    const roll = nextRandom(rng);
    rng = roll.nextState;
    if (roll.value < 0.65) {
      const filtered = candidates.filter((ev) => unseenSignature.includes(ev.id));
      if (filtered.length > 0) candidates = filtered;
    }
  }

  const pick = nextRandom(rng);
  rng = pick.nextState;
  const index = Math.floor(pick.value * candidates.length);
  return {
    event: candidates[index],
    nextRngState: rng,
  };
}

function finalizeSolResolution(
  state: GameState,
  event: MissionEventDefinition,
  choiceLabel: string | undefined,
  eventOutcome: string,
  dangerScore: number,
  qualityScore: number
): GameState {
  const next: GameState = {
    ...state,
    crew: state.crew.map((c) => ({ ...c })),
    greenhouseQueue: [...state.greenhouseQueue],
    earthComms: { ...state.earthComms },
    usedEventIds: state.usedEventIds.includes(event.id)
      ? state.usedEventIds
      : [...state.usedEventIds, event.id],
    history: [...state.history],
  };

  // 1. Daily power generation & consumption
  const stormMultiplier = next.dustStormActive ? GAME_BALANCE.dailyUpkeep.dustStormSolarMultiplier : 1;
  const solarGen = Math.round(
    GAME_BALANCE.dailyUpkeep.baseSolarGeneration * (next.solarPanelEfficiency / 100) * stormMultiplier
  );
  const netPowerDelta = solarGen - GAME_BALANCE.dailyUpkeep.basePowerDrain;
  next.power = clampResource(next.power + netPowerDelta);

  // 2. Daily life-support consumption
  next.lifeSupport = clampResource(next.lifeSupport - GAME_BALANCE.dailyUpkeep.baseLifeSupportDrain);

  // 3. Dust accumulation on panels
  const dustAdded = next.dustStormActive
    ? GAME_BALANCE.dailyUpkeep.stormDustBuildup
    : GAME_BALANCE.dailyUpkeep.naturalDustBuildupPerSol;
  next.solarPanelEfficiency = Math.max(25, next.solarPanelEfficiency - dustAdded);

  // 4. Process delayed greenhouse harvests ready on this sol
  const readyHarvests = next.greenhouseQueue.filter((crop) => crop.readyOnSol <= next.sol);
  next.greenhouseQueue = next.greenhouseQueue.filter((crop) => crop.readyOnSol > next.sol);
  let harvestSummary: string | null = null;
  if (readyHarvests.length > 0) {
    const lifeGain = readyHarvests.length * GAME_BALANCE.actions.operateGreenhouse.harvestLifeSupportGain;
    const sciGain = readyHarvests.length * GAME_BALANCE.actions.operateGreenhouse.harvestScienceGain;
    next.lifeSupport = clampResource(next.lifeSupport + lifeGain);
    next.sciencePoints += sciGain;
    const cropList = readyHarvests.map((c) => c.cropName).join(', ');
    harvestSummary = `Greenhouse harvest ready (${cropList}): +${lifeGain} Life Support and +${sciGain} Science!`;
  }

  // 5. Process queued Earth communication reply
  let earthReplyDelivered: string | undefined;
  if (next.earthComms.pendingReplyOnSol !== null && next.earthComms.pendingReplyOnSol <= next.sol) {
    if (next.earthComms.blackoutActive) {
      earthReplyDelivered = 'Earth transmission delayed by radio blackout—re-queued for next sol.';
      next.earthComms.pendingReplyOnSol = next.sol + 1;
    } else {
      const topic = next.earthComms.pendingRequestTopic || 'Power Optimization';
      if (topic === 'Power Optimization') {
        next.power = clampResource(next.power + GAME_BALANCE.actions.contactEarth.powerSupportBonus);
        earthReplyDelivered = `Earth Mission Control sent a solar battery optimization patch (+${GAME_BALANCE.actions.contactEarth.powerSupportBonus} Power)!`;
      } else {
        next.lifeSupport = clampResource(
          next.lifeSupport + GAME_BALANCE.actions.contactEarth.lifeSupportSupportBonus
        );
        earthReplyDelivered = `Earth Mission Control sent oxygen valve tuning instructions (+${GAME_BALANCE.actions.contactEarth.lifeSupportSupportBonus} Life Support)!`;
      }
      next.earthComms.pendingReplyOnSol = null;
      next.earthComms.pendingRequestTopic = null;
      next.earthComms.lastReplyMessage = earthReplyDelivered;
    }
  }

  if (event.category !== 'comms_interruption') {
    next.earthComms.blackoutActive = false;
  }

  // 6. Crew health checks from resource emergencies
  if (next.power === 0) {
    next.lifeSupport = clampResource(next.lifeSupport - 12);
    next.crew = next.crew.map((c) => updateAstronautStatus({ ...c, health: c.health - 12 }));
  }

  // 7. Evaluate mission failure or victory conditions
  const aliveCrew = next.crew.filter((c) => c.health > 0);
  if (next.lifeSupport <= 0) {
    next.status = 'lost';
    next.failureReason =
      'Critical Life-Support Failure: Oxygen and water reserves dropped to 0/100, forcing an emergency mission abort.';
  } else if (aliveCrew.length === 0) {
    next.status = 'lost';
    next.failureReason =
      'Crew Safety Failure: Prolonged radiation and power loss overwhelmed the astronauts’ medical limits.';
  } else if (next.sol >= GAME_BALANCE.mission.totalSols) {
    next.status = 'won';
  }

  // 8. Record sol in history
  const logEntry: SolLogEntry = {
    sol: next.sol,
    briefing: next.currentBriefing,
    actions: next.currentSolActions,
    eventId: event.id,
    eventTitle: event.title,
    eventCategory: event.category,
    eventChoiceLabel: choiceLabel,
    eventOutcome,
    harvestsDelivered: readyHarvests.length,
    earthReplyDelivered,
    endResources: {
      power: next.power,
      lifeSupport: next.lifeSupport,
      shelterProtection: next.shelterProtection,
      sciencePoints: next.sciencePoints,
    },
    lesson: event.education,
    dangerScore,
    qualityScore,
  };

  next.history.push(logEntry);
  next.phase = 'consequence';
  next.lastEventOutcome = eventOutcome;
  next.lastEarthReply = earthReplyDelivered ?? null;
  next.lastHarvestSummary = harvestSummary;
  next.lastEducationNote = event.education;

  if (next.status !== 'active') {
    next.report = buildMissionReport(next);
  }

  return next;
}

export function triggerDailyEvent(state: GameState): GameState {
  if (state.status !== 'active' || state.phase !== 'actions') return state;

  const { event, nextRngState } = selectDailyEvent(state);
  const next: GameState = {
    ...state,
    rngState: nextRngState,
    activeEvent: event,
    dustStormActive: event.category === 'dust_storm',
  };

  if (event.choices && event.choices.length > 0) {
    next.phase = 'event';
    return next;
  }

  let outcome = '';
  let quality = 5;
  let danger = 1;

  if (event.category === 'comms_interruption') {
    next.earthComms = { ...next.earthComms, blackoutActive: true };
    outcome =
      'Solar radio noise knocked out Earth communications for this sol. You must rely on onboard systems!';
    danger = 3;
  } else if (event.category === 'clear_sky') {
    next.power = clampResource(next.power + GAME_BALANCE.dailyUpkeep.clearSkiesSolarBonus);
    outcome = `Bright Martian sunshine gave an extra +${GAME_BALANCE.dailyUpkeep.clearSkiesSolarBonus} Power bonus!`;
    quality = 8;
  } else {
    next.solarPanelEfficiency = Math.min(100, next.solarPanelEfficiency + 14);
    next.dustStormActive = false;
    outcome = 'A passing dust devil actually swept +14% efficiency worth of dust off the solar panels!';
    quality = 7;
  }

  return finalizeSolResolution(next, event, undefined, outcome, danger, quality);
}

export function resolveEventChoice(state: GameState, choiceId: string): GameState {
  if (state.status !== 'active' || state.phase !== 'event' || !state.activeEvent) {
    return state;
  }

  const event = state.activeEvent;
  const choice = event.choices?.find((c) => c.id === choiceId);
  if (!choice) return state;

  const next: GameState = {
    ...state,
    crew: state.crew.map((c) => ({ ...c })),
  };
  let outcome = '';
  let danger = 2;
  let quality = 6;

  switch (event.id) {
    case 'dust_storm': {
      if (choiceId === 'seal_vents') {
        next.power = clampResource(next.power - 5);
        outcome =
          'Sealed habitat vents (-5 Power). Air filters stayed clean and Life Support remained protected during the storm.';
        quality = 10;
        danger = 2;
      } else {
        next.sciencePoints += 8;
        next.lifeSupport = clampResource(next.lifeSupport - 6);
        outcome =
          'Gathered storm wind data (+8 Science), but abrasive dust strained air filters (-6 Life Support).';
        quality = 5;
        danger = 6;
      }
      break;
    }

    case 'solar_particle_event': {
      const protectionFactor = Math.max(0.15, 1 - next.shelterProtection / 100);
      if (choiceId === 'shelter_core') {
        const crewDamage = Math.round(
          GAME_BALANCE.radiation.solarEventBaseCrewDamage * protectionFactor
        );
        next.crew = next.crew.map((c) =>
          updateAstronautStatus({
            ...c,
            health: c.health - Math.round(crewDamage * 0.55),
            radiationExposure: c.radiationExposure + crewDamage,
          })
        );
        if (next.shelterProtection >= GAME_BALANCE.radiation.lowShelterThreshold) {
          outcome = `Crew sheltered safely! Strong walls (${next.shelterProtection}/100) limited exposure to only +${crewDamage} radiation.`;
          quality = 14;
          danger = 2;
        } else {
          outcome = `Crew sheltered, but low Shelter Protection (${next.shelterProtection}/100) let +${crewDamage} radiation leak through!`;
          quality = 7;
          danger = 8;
        }
      } else {
        const crewDamage = Math.round(
          (GAME_BALANCE.radiation.solarEventBaseCrewDamage +
            GAME_BALANCE.radiation.evaDuringSolarEventPenalty) *
            protectionFactor
        );
        next.sciencePoints += 14;
        next.crew = next.crew.map((c) =>
          updateAstronautStatus({
            ...c,
            health: c.health - Math.round(crewDamage * 0.8),
            radiationExposure: c.radiationExposure + crewDamage,
          })
        );
        outcome = `Risky EVA gained +14 Science, but solar particles hit the crew hard (+${crewDamage} radiation)!`;
        quality = 2;
        danger = 15;
      }
      break;
    }

    case 'life_support_failure': {
      if (choiceId === 'full_repair') {
        if (next.power >= 12) {
          next.power = clampResource(next.power - 12);
          outcome =
            'Engineers completed a full CO₂ scrubber repair (-12 Power). Life Support remained completely stable!';
          quality = 11;
          danger = 1;
        } else {
          next.power = 0;
          next.lifeSupport = clampResource(next.lifeSupport - 8);
          outcome =
            'Not enough Power for a full repair! Batteries drained to 0 and Life Support dropped by -8.';
          quality = 3;
          danger = 10;
        }
      } else {
        next.lifeSupport = clampResource(next.lifeSupport - 12);
        outcome =
          'Conserved electricity with a temporary patch, losing -12 Life Support.';
        quality = 5;
        danger = 7;
      }
      break;
    }

    case 'subsurface_ice_trace': {
      if (choiceId === 'drill_sample') {
        if (next.power >= 8) {
          next.power = clampResource(next.power - 8);
          next.sciencePoints += 16;
          next.lifeSupport = clampResource(next.lifeSupport + 8);
          outcome =
            'Drilled Martian ice core (-8 Power)! Gained +16 Science and melted +8 Life Support water!';
          quality = 13;
          danger = 2;
        } else {
          next.sciencePoints += 4;
          outcome = 'Not enough Power to run the ice drill—only logged surface radar coordinates (+4 Science).';
          quality = 6;
          danger = 2;
        }
      } else {
        next.sciencePoints += 6;
        next.crew = next.crew.map((c) => updateAstronautStatus({ ...c, health: c.health + 5 }));
        outcome = 'Logged ice coordinates (+6 Science) and let the crew rest (+5 Health).';
        quality = 9;
        danger = 0;
      }
      break;
    }
  }

  return finalizeSolResolution(next, event, choice.label, outcome, danger, quality);
}

export function advanceToNextSol(state: GameState): GameState {
  if (state.phase !== 'consequence') return state;
  if (state.status !== 'active') {
    return state;
  }

  const nextSol = state.sol + 1;
  const next: GameState = {
    ...state,
    sol: nextSol,
    phase: 'briefing',
    actionPoints: GAME_BALANCE.mission.actionsPerSol,
    currentSolActions: [],
    activeEvent: null,
    lastEventOutcome: null,
    lastEarthReply: null,
    lastHarvestSummary: null,
  };
  next.currentBriefing = buildSolBriefing(nextSol, next);
  return next;
}

export function buildMissionReport(state: GameState): MissionReport {
  const survivors = state.crew.filter((c) => c.health > 0).length;
  const avgHealth = Math.round(state.crew.reduce((sum, c) => sum + c.health, 0) / state.crew.length);

  const resourceScore = (state.power + state.lifeSupport) / 2;
  const resourceManagement =
    resourceScore >= 60
      ? 'Strong balance of power generation, water recycling, and greenhouse planning.'
      : resourceScore >= 35
      ? 'Outpost survived on tight margins—future missions could plant greenhouse crops earlier.'
      : 'Critical resource depletion put the habitat under severe stress.';

  const shelterProtection =
    state.shelterProtection >= 65
      ? 'Excellent regolith shielding kept the habitat core well protected against solar particles.'
      : state.shelterProtection >= 45
      ? 'Moderate shielding offered partial protection, though extra regolith layers would help.'
      : 'Low shelter protection left the crew vulnerable during solar radiation warnings.';

  const crewSafety =
    survivors === 4 && avgHealth >= 75
      ? 'All 4 astronauts finished the mission healthy and alert!'
      : survivors === 4
      ? `All 4 astronauts survived, with average health at ${avgHealth}/100.`
      : `Only ${survivors}/4 astronauts survived the mission conditions.`;

  const scienceAchievements =
    state.sciencePoints >= 60
      ? `Outstanding! Earned ${state.sciencePoints} Science Points from expeditions, ice sampling, and bio-dome data.`
      : state.sciencePoints >= 25
      ? `Solid research progress with ${state.sciencePoints} Science Points gathered alongside survival duties.`
      : `Focused mainly on survival (${state.sciencePoints} Science Points). More expeditions could boost discovery.`;

  const totalQuality = state.history.reduce((s, h) => s + h.qualityScore, 0);
  const avgQuality = state.history.length > 0 ? totalQuality / state.history.length : 5;
  const decisionQuality =
    avgQuality >= 8
      ? 'Smart, balanced engineering choices under pressure and Earth radio delays.'
      : 'Mixed decisions—balancing immediate survival with long-term preparation will improve future runs.';

  let bestEntry = state.history[0];
  let worstEntry = state.history[0];
  for (const entry of state.history) {
    if (!bestEntry || entry.qualityScore > bestEntry.qualityScore) bestEntry = entry;
    if (!worstEntry || entry.dangerScore > worstEntry.dangerScore) worstEntry = entry;
  }

  const bestDecision = bestEntry
    ? `Sol ${bestEntry.sol} (${bestEntry.eventTitle}): ${bestEntry.eventOutcome}`
    : 'Maintained steady outpost operations.';

  const mostDangerousDecision =
    worstEntry && worstEntry.dangerScore >= 5
      ? `Sol ${worstEntry.sol} (${worstEntry.eventTitle}): ${worstEntry.eventOutcome}`
      : 'Avoided major reckless risks throughout the campaign!';

  const uniqueLessons: string[] = [];
  for (const entry of state.history) {
    const line = `${entry.lesson.title}: ${entry.lesson.explanation}`;
    if (!uniqueLessons.includes(line)) {
      uniqueLessons.push(line);
    }
    if (uniqueLessons.length === 3) break;
  }
  while (uniqueLessons.length < 3) {
    const fallback = [
      'Closed-Loop Water Recycling: Recycling water is essential because every kilogram shipped to Mars is costly.',
      'Mars-Earth Communication Delay: Astronauts must solve urgent problems independently during 3–22 minute signal delays.',
      'Radiation Protection: Regolith and water walls shield crews from solar particle events on Mars.',
    ][uniqueLessons.length];
    uniqueLessons.push(fallback);
  }

  let overallGrade: MissionReport['overallGrade'] = 'B';
  if (state.status === 'lost') {
    overallGrade = 'D';
  } else {
    const composite =
      resourceScore * 0.25 +
      state.shelterProtection * 0.2 +
      avgHealth * 0.25 +
      Math.min(100, state.sciencePoints) * 0.15 +
      Math.min(100, avgQuality * 8) * 0.15;
    if (composite >= 82) overallGrade = 'S';
    else if (composite >= 70) overallGrade = 'A';
    else if (composite >= 55) overallGrade = 'B';
    else overallGrade = 'C';
  }

  return {
    id: `report-${state.seed}-${Date.now()}`,
    completedAt: new Date().toISOString(),
    seed: state.seed,
    outcome: state.status === 'won' ? 'won' : 'lost',
    failureReason: state.failureReason,
    solsSurvived: state.sol,
    finalResources: {
      power: state.power,
      lifeSupport: state.lifeSupport,
      shelterProtection: state.shelterProtection,
      sciencePoints: state.sciencePoints,
    },
    crewSurvivors: survivors,
    overallGrade,
    assessments: {
      resourceManagement,
      shelterProtection,
      crewSafety,
      scienceAchievements,
      decisionQuality,
    },
    bestDecision,
    mostDangerousDecision,
    lessonsLearned: uniqueLessons,
  };
}
