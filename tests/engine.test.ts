import { describe, expect, it } from 'vitest';
import { canPerformAction } from '../src/game/actions';
import { GAME_BALANCE } from '../src/game/balance';
import {
  advanceToNextSol,
  clampResource,
  createInitialState,
  performAction,
  resolveEventChoice,
  startSolOperations,
  triggerDailyEvent,
} from '../src/game/engine';

describe('OUTPOST 14 Game Engine', () => {
  it('initializes with required starting gameplay values', () => {
    const state = createInitialState('JEZERO-101');
    expect(state.power).toBe(80);
    expect(state.lifeSupport).toBe(75);
    expect(state.shelterProtection).toBe(35);
    expect(state.crew).toHaveLength(4);
    expect(state.sol).toBe(1);
    expect(state.actionPoints).toBe(2);
    expect(state.earthComms.oneWayMinutes).toBeGreaterThanOrEqual(3);
    expect(state.earthComms.oneWayMinutes).toBeLessThanOrEqual(22);
  });

  it('clamps resources strictly between 0 and 100', () => {
    expect(clampResource(150)).toBe(100);
    expect(clampResource(-25)).toBe(0);
    expect(clampResource(64.6)).toBe(65);
  });

  it('prevents performing more than 2 actions per sol and blocks unavailable actions', () => {
    let state = startSolOperations(createInitialState('TEST-ACTIONS'));
    state = performAction(state, 'improve_shielding');
    state = performAction(state, 'recycle_water');

    expect(state.actionPoints).toBe(0);
    const thirdCheck = canPerformAction(state, 'scientific_expedition');
    expect(thirdCheck.allowed).toBe(false);
    expect(thirdCheck.reason).toMatch(/No Action Points left/i);
  });

  it('processes delayed greenhouse production exactly 3 sols later', () => {
    let state = startSolOperations(createInitialState('GREENHOUSE-SEED'));
    const lifeBeforePlant = state.lifeSupport;
    state = performAction(state, 'operate_greenhouse');
    expect(state.lifeSupport).toBe(
      lifeBeforePlant - GAME_BALANCE.actions.operateGreenhouse.lifeSupportCost
    );
    expect(state.greenhouseQueue).toHaveLength(1);
    expect(state.greenhouseQueue[0].readyOnSol).toBe(4);

    for (let sol = 1; sol <= 3; sol++) {
      state = triggerDailyEvent(state);
      if (state.phase === 'event' && state.activeEvent?.choices) {
        state = resolveEventChoice(state, state.activeEvent.choices[0].id);
      }
      expect(state.history[sol - 1].harvestsDelivered).toBe(0);
      state = advanceToNextSol(state);
      state = startSolOperations(state);
    }

    state = triggerDailyEvent(state);
    if (state.phase === 'event' && state.activeEvent?.choices) {
      state = resolveEventChoice(state, state.activeEvent.choices[0].id);
    }
    expect(state.history[3].harvestsDelivered).toBe(1);
    expect(state.greenhouseQueue).toHaveLength(0);
  });

  it('queues Contact Earth communication and delivers support on the following sol unless blacked out', () => {
    let state = startSolOperations(createInitialState('EARTH-COMMS-SEED'));
    state = performAction(state, 'contact_earth');

    expect(state.earthComms.pendingReplyOnSol).toBe(2);
    const duplicateCheck = canPerformAction(state, 'contact_earth');
    expect(duplicateCheck.allowed).toBe(false);
    expect(duplicateCheck.reason).toMatch(/Already waiting/i);

    // Finish Sol 1
    state = triggerDailyEvent(state);
    if (state.phase === 'event' && state.activeEvent?.choices) {
      state = resolveEventChoice(state, state.activeEvent.choices[0].id);
    }
    state = advanceToNextSol(state);
    state = startSolOperations(state);

    // Finish Sol 2 -> Earth reply should either deliver or be delayed if Sol 2 rolled comms_interruption
    state = triggerDailyEvent(state);
    if (state.phase === 'event' && state.activeEvent?.choices) {
      state = resolveEventChoice(state, state.activeEvent.choices[0].id);
    }
    const sol2Log = state.history[1];
    expect(sol2Log.earthReplyDelivered).toBeTruthy();
  });

  it('completes a full 14-sol playable mission and produces a comprehensive mission report', () => {
    let state = createInitialState('OLYMPUS-777');

    for (let sol = 1; sol <= 14; sol++) {
      expect(state.status).toBe('active');
      state = startSolOperations(state);

      const priority: Array<
        | 'improve_shielding'
        | 'operate_greenhouse'
        | 'recycle_water'
        | 'clean_solar_panels'
        | 'contact_earth'
        | 'scientific_expedition'
      > = [
        ...(state.lifeSupport < 50 ? (['recycle_water'] as const) : []),
        ...(state.shelterProtection < 60 ? (['improve_shielding'] as const) : []),
        ...(state.solarPanelEfficiency < 75 ? (['clean_solar_panels'] as const) : []),
        'operate_greenhouse',
        'recycle_water',
        'contact_earth',
        'scientific_expedition',
      ];

      for (const actionId of priority) {
        if (state.actionPoints === 0) break;
        if (canPerformAction(state, actionId).allowed) {
          state = performAction(state, actionId);
        }
      }

      state = triggerDailyEvent(state);
      if (state.phase === 'event' && state.activeEvent?.choices) {
        state = resolveEventChoice(state, state.activeEvent.choices[0].id);
      }

      if (sol < 14 && state.status === 'active') {
        state = advanceToNextSol(state);
      }
    }

    expect(state.status).toBe('won');
    expect(state.history).toHaveLength(14);
    expect(state.report).not.toBeNull();
    expect(state.report?.solsSurvived).toBe(14);
    expect(state.report?.lessonsLearned).toHaveLength(3);
  });

  it('triggers mission failure when Life Support drops to 0', () => {
    let state = startSolOperations(createInitialState('FAILURE-TEST'));
    // Force critical life-support depletion by skipping all recovery actions
    for (let sol = 1; sol <= 14 && state.status === 'active'; sol++) {
      state = triggerDailyEvent(state);
      if (state.phase === 'event' && state.activeEvent?.choices) {
        const lastChoice = state.activeEvent.choices[state.activeEvent.choices.length - 1];
        state = resolveEventChoice(state, lastChoice.id);
      }
      if (state.status === 'active') {
        state = advanceToNextSol(state);
        state = startSolOperations(state);
      }
    }

    expect(state.status).toBe('lost');
    expect(state.failureReason).toMatch(/Life-Support|Crew Safety/i);
    expect(state.report?.outcome).toBe('lost');
  });

  it('produces identical seeded event sequences for identical seeds', () => {
    const run1 = startSolOperations(createInitialState('ARES-555'));
    const run2 = startSolOperations(createInitialState('ARES-555'));

    const ev1 = triggerDailyEvent(run1);
    const ev2 = triggerDailyEvent(run2);
    expect(ev1.activeEvent?.id).toBe(ev2.activeEvent?.id);
    expect(ev1.earthComms.oneWayMinutes).toBe(ev2.earthComms.oneWayMinutes);
  });
});
