export type ScreenId =
  | 'landing'
  | 'tutorial'
  | 'mission'
  | 'weather'
  | 'history'
  | 'results';

export type SolPhase = 'briefing' | 'actions' | 'event' | 'consequence';

export type MissionStatus = 'active' | 'won' | 'lost';

export type ActionId =
  | 'recycle_water'
  | 'operate_greenhouse'
  | 'improve_shielding'
  | 'clean_solar_panels'
  | 'scientific_expedition'
  | 'contact_earth';

export interface Astronaut {
  id: string;
  name: string;
  role: string;
  health: number;
  radiationExposure: number;
  status: 'Healthy' | 'Tired' | 'Radiation Alert' | 'Critical';
}

export interface GreenhouseCrop {
  id: string;
  plantedOnSol: number;
  readyOnSol: number;
  cropName: string;
}

export interface EarthCommsState {
  oneWayMinutes: number;
  pendingReplyOnSol: number | null;
  pendingRequestTopic: string | null;
  blackoutActive: boolean;
  lastReplyMessage: string | null;
}

export interface EducationNote {
  title: string;
  explanation: string;
  scienceTerm: string;
  termDefinition: string;
  iconName: 'droplets' | 'sprout' | 'shield' | 'sun' | 'compass' | 'radio' | 'alert';
}

export interface ResourceDelta {
  power?: number;
  lifeSupport?: number;
  shelterProtection?: number;
  sciencePoints?: number;
  solarPanelEfficiency?: number;
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  riskTag: string;
}

export interface MissionEventDefinition {
  id: string;
  title: string;
  category:
    | 'dust_storm'
    | 'solar_particle'
    | 'equipment_failure'
    | 'comms_interruption'
    | 'discovery'
    | 'clear_sky';
  summary: string;
  severity: 'info' | 'warning' | 'danger';
  choices?: EventChoice[];
  education: EducationNote;
}

export interface ActionRecord {
  actionId: ActionId;
  label: string;
  deltas: ResourceDelta;
  summary: string;
  education: EducationNote;
}

export interface SolLogEntry {
  sol: number;
  briefing: string;
  actions: ActionRecord[];
  eventId: string;
  eventTitle: string;
  eventCategory: MissionEventDefinition['category'];
  eventChoiceLabel?: string;
  eventOutcome: string;
  harvestsDelivered: number;
  earthReplyDelivered?: string;
  endResources: {
    power: number;
    lifeSupport: number;
    shelterProtection: number;
    sciencePoints: number;
  };
  lesson: EducationNote;
  dangerScore: number;
  qualityScore: number;
}

export interface MissionReport {
  id: string;
  completedAt: string;
  seed: string;
  outcome: 'won' | 'lost';
  failureReason?: string;
  solsSurvived: number;
  finalResources: {
    power: number;
    lifeSupport: number;
    shelterProtection: number;
    sciencePoints: number;
  };
  crewSurvivors: number;
  overallGrade: 'S' | 'A' | 'B' | 'C' | 'D';
  assessments: {
    resourceManagement: string;
    shelterProtection: string;
    crewSafety: string;
    scienceAchievements: string;
    decisionQuality: string;
  };
  bestDecision: string;
  mostDangerousDecision: string;
  lessonsLearned: string[];
}

export interface GameState {
  seed: string;
  rngState: number;
  sol: number;
  phase: SolPhase;
  status: MissionStatus;
  failureReason?: string;
  actionPoints: number;
  power: number;
  lifeSupport: number;
  shelterProtection: number;
  solarPanelEfficiency: number;
  sciencePoints: number;
  dustStormActive: boolean;
  crew: Astronaut[];
  greenhouseQueue: GreenhouseCrop[];
  earthComms: EarthCommsState;
  currentBriefing: string;
  currentSolActions: ActionRecord[];
  activeEvent: MissionEventDefinition | null;
  lastEventOutcome: string | null;
  lastEarthReply: string | null;
  lastHarvestSummary: string | null;
  lastEducationNote: EducationNote | null;
  usedEventIds: string[];
  history: SolLogEntry[];
  report: MissionReport | null;
}
