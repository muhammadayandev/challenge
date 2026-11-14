/**
 * Configurable game-balance constants for OUTPOST 14.
 * All resource numbers are simplified GAMEPLAY VALUES (0-100 scale),
 * NOT real NASA engineering units.
 */
export const GAME_BALANCE = {
  mission: {
    totalSols: 14,
    actionsPerSol: 2,
    crewCount: 4,
    minResource: 0,
    maxResource: 100,
  },
  initial: {
    power: 80,
    lifeSupport: 75,
    shelterProtection: 35,
    solarPanelEfficiency: 100,
    sciencePoints: 0,
  },
  dailyUpkeep: {
    basePowerDrain: 11,
    baseSolarGeneration: 20,
    dustStormSolarMultiplier: 0.35,
    clearSkiesSolarBonus: 8,
    naturalDustBuildupPerSol: 7,
    stormDustBuildup: 20,
    baseLifeSupportDrain: 9,
  },
  actions: {
    recycleWater: {
      powerCost: 8,
      lifeSupportGain: 18,
    },
    operateGreenhouse: {
      powerCost: 8,
      lifeSupportCost: 5,
      harvestDelaySols: 3,
      harvestLifeSupportGain: 24,
      harvestScienceGain: 8,
    },
    improveShielding: {
      powerCost: 10,
      shelterGain: 18,
    },
    cleanSolarPanels: {
      powerCost: 4,
      efficiencyRestoredTo: 100,
      immediatePowerBonus: 4,
    },
    scientificExpedition: {
      powerCost: 10,
      scienceGain: 20,
      baseRadiationExposure: 9,
    },
    contactEarth: {
      powerCost: 5,
      lifeSupportSupportBonus: 16,
      powerSupportBonus: 18,
    },
  },
  radiation: {
    lowShelterThreshold: 50,
    solarEventBaseCrewDamage: 22,
    evaDuringSolarEventPenalty: 18,
  },
} as const;
