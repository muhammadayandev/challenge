import { MissionEventDefinition } from './types';

export const MISSION_EVENTS: MissionEventDefinition[] = [
  {
    id: 'dust_storm',
    title: 'Martian Dust Storm Rolling In!',
    category: 'dust_storm',
    summary:
      'Towering rust-colored dust clouds sweep across Jezero Crater! Sunlight drops sharply and red dust coats the solar arrays.',
    severity: 'warning',
    choices: [
      {
        id: 'seal_vents',
        label: 'Seal Habitat Vents & Conserve Power',
        description: 'Shuts external vents to protect air filters (-5 Power now, keeps Life Support safe).',
        riskTag: 'Safe & Steady',
      },
      {
        id: 'keep_rovers_charging',
        label: 'Keep Science Chargers Running',
        description: 'Gains +8 Science from storm wind sensors, but dust clogs filters (-6 Life Support).',
        riskTag: 'Resource Risk',
      },
    ],
    education: {
      title: 'How Martian Dust Storms Affect Spacecraft',
      explanation:
        'Mars dust storms can cover a continent—or even the whole planet! Thick dust blocks sunlight from reaching solar panels and forces rovers to sleep.',
      scienceTerm: 'Global Dust Storm',
      termDefinition:
        'A giant dust event on Mars that reduces solar energy for days or weeks, like the 2018 storm that ended NASA’s Opportunity rover mission.',
      iconName: 'sun',
    },
  },
  {
    id: 'solar_particle_event',
    title: 'Solar Particle Event Warning!',
    category: 'solar_particle',
    summary:
      'Space sensors detect high-speed protons racing away from the Sun! Radiation outside the habitat will spike sharply today.',
    severity: 'danger',
    choices: [
      {
        id: 'shelter_core',
        label: 'Order Crew Into Shielded Core',
        description: 'Protects astronauts inside thick walls. Stronger Shelter Protection reduces harm!',
        riskTag: 'Crew Safety First',
      },
      {
        id: 'continue_eva',
        label: 'Continue Outside Sensor Calibration',
        description: 'Earns +14 Science Points, but exposes astronauts to heavy solar particle radiation!',
        riskTag: 'High Radiation Risk',
      },
    ],
    education: {
      title: 'Solar Particle Events (SEPs)',
      explanation:
        'When the Sun erupts, fast-moving protons race through space. Because Mars lacks a global magnetic field, habitats rely on thick walls to protect crews.',
      scienceTerm: 'Solar Energetic Particles (SEP)',
      termDefinition:
        'High-energy particles accelerated by solar flares and coronal mass ejections—tracked in real life by NASA’s DONKI database.',
      iconName: 'alert',
    },
  },
  {
    id: 'life_support_failure',
    title: 'Life-Support Scrubber Glitch!',
    category: 'equipment_failure',
    summary:
      'An alarm chirps in the life-support bay! The CO₂ scrubber pump is sputtering and needs an immediate engineering decision.',
    severity: 'danger',
    choices: [
      {
        id: 'full_repair',
        label: 'Spend Power for Full Repair',
        description: 'Uses -12 Power to replace the seal cleanly and avoid Life Support loss.',
        riskTag: 'Costs Power',
      },
      {
        id: 'patch_and_conserve',
        label: 'Patch & Conserve Electricity',
        description: 'Saves Power, but slower scrubbing drops Life Support by -12.',
        riskTag: 'Costs Life Support',
      },
    ],
    education: {
      title: 'Why Redundancy Saves Astronauts',
      explanation:
        'On Mars, there is no hardware store down the street. Engineers design backup systems and carry spare power so broken air or water pumps can be repaired immediately.',
      scienceTerm: 'CO₂ Scrubber',
      termDefinition:
        'A machine that removes carbon dioxide astronauts breathe out so cabin air stays safe and breathable.',
      iconName: 'droplets',
    },
  },
  {
    id: 'comms_interruption',
    title: 'Earth Communication Interruption',
    category: 'comms_interruption',
    summary:
      'Solar radio interference scrambles the deep-space antenna! Earth Mission Control cannot be reached until next sol.',
    severity: 'warning',
    education: {
      title: 'Why Mars Crews Must Think Independently',
      explanation:
        'Even at the best of times, Mars signals take 3–22 minutes one-way. When the Sun gets in the way or interference hits, astronauts must solve problems on their own.',
      scienceTerm: 'Solar Conjunction',
      termDefinition:
        'When Earth and Mars are on opposite sides of the Sun, blocking or scrambling radio signals between the two planets.',
      iconName: 'radio',
    },
  },
  {
    id: 'clear_skies',
    title: 'Crystal-Clear Martian Afternoon',
    category: 'clear_sky',
    summary:
      'High winds sweep away airborne haze, leaving bright sunlight pouring onto the solar arrays and boosting crew morale!',
    severity: 'info',
    education: {
      title: 'Martian Weather Shifts',
      explanation:
        'After dusty days clear up, Martian sunlight bounces back—though Mars still receives less than half as much sunlight as Earth because it orbits farther from the Sun.',
      scienceTerm: 'Astronomical Unit (AU)',
      termDefinition:
        'The average distance from Earth to the Sun (1 AU). Mars orbits at about 1.52 AU, so sunlight there is dimmer.',
      iconName: 'sun',
    },
  },
  {
    id: 'subsurface_ice_trace',
    title: 'Subsurface Water-Ice Signature!',
    category: 'discovery',
    summary:
      'Ground-penetrating radar spots a shiny layer of buried water ice just 300 meters from Outpost 14!',
    severity: 'info',
    choices: [
      {
        id: 'drill_sample',
        label: 'Send Core Drill Team',
        description: 'Uses -8 Power, gains +16 Science Points and melts +8 Life Support water!',
        riskTag: 'High Reward',
      },
      {
        id: 'log_coordinates',
        label: 'Log Coordinates & Rest Crew',
        description: 'Zero power cost. Gains +6 Science Points and keeps crew rested.',
        riskTag: 'Conserve Energy',
      },
    ],
    education: {
      title: 'Living Off the Land on Mars',
      explanation:
        'Finding buried ice on Mars is huge! Future astronauts could melt Martian ice for drinking water, breathable oxygen, and even rocket fuel.',
      scienceTerm: 'ISRU (In-Situ Resource Utilization)',
      termDefinition:
        'Using local materials found on Mars or the Moon—like ice and soil—instead of hauling everything from Earth.',
      iconName: 'compass',
    },
  },
  {
    id: 'dust_devil_pass',
    title: 'Whirling Dust Devil Passes Outpost',
    category: 'dust_storm',
    summary:
      'A tall spinning whirlwind dances past the solar farm—sweeping some old dust off one wing while peppering the other!',
    severity: 'info',
    education: {
      title: 'Mars Dust Devils: Friend or Foe?',
      explanation:
        'NASA’s Spirit and Opportunity rovers actually got surprise power boosts when friendly Martian dust devils blew dust off their solar panels!',
      scienceTerm: 'Convective Vortex (Dust Devil)',
      termDefinition:
        'A spinning column of warm air lifting fine red dust across sunlit Martian plains.',
      iconName: 'sun',
    },
  },
];
