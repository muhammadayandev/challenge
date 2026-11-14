import { ActionId, EducationNote } from './types';

export const ACTION_EDUCATION: Record<ActionId, EducationNote> = {
  recycle_water: {
    title: 'Closed-Loop Water Recycling',
    explanation:
      'There are no rivers or liquid rain on Mars! Astronauts purify wastewater, sweat, and even breath moisture so almost every drop can be reused.',
    scienceTerm: 'ECLSS (Environmental Control & Life Support System)',
    termDefinition:
      'Life-support hardware that recycles air and water inside a spacecraft or Mars habitat—like on the International Space Station, which recovers about 98% of its water.',
    iconName: 'droplets',
  },
  operate_greenhouse: {
    title: 'Farming on the Red Planet',
    explanation:
      'Space crops take time to sprout and grow. Investing water and power today creates fresh food and extra oxygen three sols later!',
    scienceTerm: 'Hydroponics',
    termDefinition:
      'Growing plants in nutrient-rich water instead of regular soil—ideal on Mars because Martian dirt contains harsh salts called perchlorates.',
    iconName: 'sprout',
  },
  improve_shielding: {
    title: 'Blocking Space Radiation',
    explanation:
      'Mars lacks a thick atmosphere and global magnetic field like Earth has. Packing Martian dirt and water tanks around the habitat absorbs dangerous space rays.',
    scienceTerm: 'Regolith',
    termDefinition:
      'The loose layer of dust and broken rock covering Mars. Future builders can stack regolith bags over habitats as heavy radiation shields.',
    iconName: 'shield',
  },
  clean_solar_panels: {
    title: 'Battling Martian Dust',
    explanation:
      'Fine red dust floats across Mars and settles on solar arrays, blocking sunlight. Cleaning panels keeps daily electricity flowing smoothly.',
    scienceTerm: 'Solar Array Efficiency',
    termDefinition:
      'How much sunlight a solar panel turns into electricity. NASA’s InSight lander lost power on Mars after thick dust covered its panels.',
    iconName: 'sun',
  },
  scientific_expedition: {
    title: 'Science vs. Safety Trade-Off',
    explanation:
      'Exploring outside the shelter discovers ancient water clues and boosts mission science—but astronauts face extra radiation outside thick walls.',
    scienceTerm: 'EVA (Extravehicular Activity)',
    termDefinition:
      'Any work an astronaut does outside a habitat or spacecraft while wearing a pressurized spacesuit.',
    iconName: 'compass',
  },
  contact_earth: {
    title: 'The Interplanetary Light-Speed Delay',
    explanation:
      'Radio waves travel at the speed of light, yet Mars is so far away that messages take 3 to 22 minutes just to go one way! Commanders cannot wait for Earth during emergencies.',
    scienceTerm: 'One-Way Light Time',
    termDefinition:
      'The time it takes a radio signal moving at light speed (about 300,000 km/s) to cross the changing distance between Earth and Mars.',
    iconName: 'radio',
  },
};
