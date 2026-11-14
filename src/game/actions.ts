import { GAME_BALANCE } from './balance';
import { ACTION_EDUCATION } from './education';
import { ActionId, EducationNote, GameState } from './types';

export interface ActionDefinition {
  id: ActionId;
  label: string;
  shortBenefit: string;
  costText: string;
  consequenceText: string;
  education: EducationNote;
}

export const ACTION_DEFINITIONS: ActionDefinition[] = [
  {
    id: 'recycle_water',
    label: 'Recycle Water',
    shortBenefit: `+${GAME_BALANCE.actions.recycleWater.lifeSupportGain} Life Support`,
    costText: `-${GAME_BALANCE.actions.recycleWater.powerCost} Power · 1 Action`,
    consequenceText: 'Purifies greywater and cabin moisture to refill oxygen and water reserves.',
    education: ACTION_EDUCATION.recycle_water,
  },
  {
    id: 'operate_greenhouse',
    label: 'Operate Greenhouse',
    shortBenefit: `+${GAME_BALANCE.actions.operateGreenhouse.harvestLifeSupportGain} Life Support in 3 Sols`,
    costText: `-${GAME_BALANCE.actions.operateGreenhouse.powerCost} Power · -${GAME_BALANCE.actions.operateGreenhouse.lifeSupportCost} Life Support · 1 Action`,
    consequenceText: 'Plants fast-growing lettuce & dwarf wheat. Harvest arrives 3 sols from now!',
    education: ACTION_EDUCATION.operate_greenhouse,
  },
  {
    id: 'improve_shielding',
    label: 'Improve Radiation Shielding',
    shortBenefit: `+${GAME_BALANCE.actions.improveShielding.shelterGain} Shelter Protection`,
    costText: `-${GAME_BALANCE.actions.improveShielding.powerCost} Power · 1 Action`,
    consequenceText: 'Packs Martian regolith & water bladders onto habitat walls to block radiation.',
    education: ACTION_EDUCATION.improve_shielding,
  },
  {
    id: 'clean_solar_panels',
    label: 'Clean Solar Panels',
    shortBenefit: '100% Solar Efficiency + Future Power',
    costText: `-${GAME_BALANCE.actions.cleanSolarPanels.powerCost} Power · 1 Action`,
    consequenceText: 'Brushes off Martian dust so solar arrays generate maximum energy each sol.',
    education: ACTION_EDUCATION.clean_solar_panels,
  },
  {
    id: 'scientific_expedition',
    label: 'Scientific Expedition',
    shortBenefit: `+${GAME_BALANCE.actions.scientificExpedition.scienceGain} Science Points`,
    costText: `-${GAME_BALANCE.actions.scientificExpedition.powerCost} Power · 1 Action`,
    consequenceText: 'Sends crew outside to collect rock cores, adding mild radiation exposure risk.',
    education: ACTION_EDUCATION.scientific_expedition,
  },
  {
    id: 'contact_earth',
    label: 'Contact Earth',
    shortBenefit: 'Queued Supply & Diagnostic Support',
    costText: `-${GAME_BALANCE.actions.contactEarth.powerCost} Power · 1 Action`,
    consequenceText: 'Transmits telemetry across space. Delayed Earth guidance arrives next sol.',
    education: ACTION_EDUCATION.contact_earth,
  },
];

export function canPerformAction(
  state: GameState,
  actionId: ActionId
): { allowed: boolean; reason?: string } {
  if (state.status !== 'active') {
    return { allowed: false, reason: 'Mission has already ended.' };
  }
  if (state.phase !== 'actions') {
    return { allowed: false, reason: 'Actions can only be chosen during the Operations phase.' };
  }
  if (state.actionPoints <= 0) {
    return { allowed: false, reason: 'No Action Points left this sol. Proceed to Events.' };
  }

  switch (actionId) {
    case 'recycle_water': {
      const { powerCost } = GAME_BALANCE.actions.recycleWater;
      if (state.power < powerCost) {
        return { allowed: false, reason: `Needs ${powerCost} Power (you only have ${state.power}).` };
      }
      if (state.lifeSupport >= GAME_BALANCE.mission.maxResource) {
        return { allowed: false, reason: 'Life Support reserves are already at 100/100!' };
      }
      return { allowed: true };
    }
    case 'operate_greenhouse': {
      const { powerCost, lifeSupportCost } = GAME_BALANCE.actions.operateGreenhouse;
      if (state.power < powerCost) {
        return { allowed: false, reason: `Needs ${powerCost} Power (you only have ${state.power}).` };
      }
      if (state.lifeSupport <= lifeSupportCost + 5) {
        return {
          allowed: false,
          reason: `Too risky! Needs >${lifeSupportCost + 5} Life Support to spare water for crops.`,
        };
      }
      return { allowed: true };
    }
    case 'improve_shielding': {
      const { powerCost } = GAME_BALANCE.actions.improveShielding;
      if (state.power < powerCost) {
        return { allowed: false, reason: `Needs ${powerCost} Power (you only have ${state.power}).` };
      }
      if (state.shelterProtection >= GAME_BALANCE.mission.maxResource) {
        return { allowed: false, reason: 'Shelter Protection is already maxed at 100/100!' };
      }
      return { allowed: true };
    }
    case 'clean_solar_panels': {
      const { powerCost } = GAME_BALANCE.actions.cleanSolarPanels;
      if (state.power < powerCost) {
        return { allowed: false, reason: `Needs ${powerCost} Power (you only have ${state.power}).` };
      }
      if (state.solarPanelEfficiency >= 98) {
        return { allowed: false, reason: 'Solar panels are already clean (98–100% efficiency).' };
      }
      return { allowed: true };
    }
    case 'scientific_expedition': {
      const { powerCost } = GAME_BALANCE.actions.scientificExpedition;
      if (state.power < powerCost) {
        return { allowed: false, reason: `Needs ${powerCost} Power (you only have ${state.power}).` };
      }
      return { allowed: true };
    }
    case 'contact_earth': {
      const { powerCost } = GAME_BALANCE.actions.contactEarth;
      if (state.earthComms.blackoutActive) {
        return {
          allowed: false,
          reason: 'Communication Interruption active! Radio link to Earth is temporarily blocked.',
        };
      }
      if (state.earthComms.pendingReplyOnSol !== null) {
        return {
          allowed: false,
          reason: `Already waiting for Earth's reply (arriving Sol ${state.earthComms.pendingReplyOnSol}).`,
        };
      }
      if (state.power < powerCost) {
        return { allowed: false, reason: `Needs ${powerCost} Power (you only have ${state.power}).` };
      }
      return { allowed: true };
    }
  }
}
