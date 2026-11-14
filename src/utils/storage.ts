import { GameState, MissionReport } from '../game/types';

const ACTIVE_GAME_KEY = 'outpost14_active_game_v1';
const REPORTS_KEY = 'outpost14_past_reports_v1';
const SOUND_MUTED_KEY = 'outpost14_sound_muted_v1';

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(ACTIVE_GAME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed || typeof parsed.sol !== 'number' || !Array.isArray(parsed.crew)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearActiveGameState(): void {
  try {
    localStorage.removeItem(ACTIVE_GAME_KEY);
  } catch {
    // Ignore
  }
}

export function saveMissionReport(report: MissionReport): void {
  try {
    const existing = loadMissionReports();
    if (existing.some((r) => r.id === report.id)) return;
    const updated = [report, ...existing].slice(0, 15);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
}

export function loadMissionReports(): MissionReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as MissionReport[]) : [];
  } catch {
    return [];
  }
}

export function loadSoundMuted(): boolean {
  try {
    return localStorage.getItem(SOUND_MUTED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(SOUND_MUTED_KEY, muted ? 'true' : 'false');
  } catch {
    // Ignore
  }
}
