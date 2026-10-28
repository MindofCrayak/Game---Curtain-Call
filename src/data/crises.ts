import { TheatricalCrisis } from '../types';

export const THEATRICAL_CRISES: TheatricalCrisis[] = [
  {
    id: 'chandelier_crash',
    title: 'Cardboard Chandelier Collapse!',
    description: 'During the climactic final cue, the suspended cardboard chandelier sheared its tether line and crashed center-stage!',
    quote: '"I thought that nautical knot held fast! It looked so grand in the draft sketches..." — Shop Steward',
    optionA: {
      label: 'Emergency Commercial Chandelier Rental ($250)',
      description: 'Rent a professional brass fixture from the downtown expo center (+15 Scenic, +15 Lighting).',
      cost: 250,
      statBonus: { scenic: 15, lighting: 15 },
    },
    optionB: {
      label: 'Patch with Gaffer Tape & Wire (Free)',
      description: 'Splice the snapped cable with duct tape and safety wire. (Adds 3 Flub bugs to opening night).',
      cost: 0,
      flubsAdded: 3,
    },
  },
  {
    id: 'fog_machine_alarm',
    title: 'The Fog Machine & Fire Alarm Incident!',
    description: 'The rented smoke machine filled the storefront auditorium and triggered the municipal fire department alarm!',
    quote: '"It said theatrical haze, not military smoke screen! The siren is drowning out our monologue!" — Stage Manager',
    optionA: {
      label: 'Hire Certified Atmospheric Tech ($180)',
      description: 'Bring in a professional venue technician to tune dissipation and clear fire marshall permits (+20 Lighting/Atmosphere).',
      cost: 180,
      statBonus: { lighting: 20 },
    },
    optionB: {
      label: 'Wave Cardboard Flats to Disperse Fog (Free)',
      description: 'Crew vigorously waves scrap cardboard flats. (Adds 2 Flub bugs from coughing performers).',
      cost: 0,
      flubsAdded: 2,
    },
  },
  {
    id: 'lead_costume_tear',
    title: 'Velvet Gown Zipper Catastrophe!',
    description: 'The Lead Performer’s period-accurate velvet corset zipper jammed and tore 10 minutes before dress rehearsal curtain!',
    quote: '"I cannot breathe, let alone deliver the Act II ballad! Fix this instant!" — Troupe Diva',
    optionA: {
      label: 'Call Local Bridal Tailor Express ($140)',
      description: 'Fast-track an emergency French seam repair (+20 Costumes & Props).',
      cost: 140,
      statBonus: { costumes: 20 },
    },
    optionB: {
      label: 'Safety Pins & Hot Glue Gun (Free)',
      description: 'Fasten the hem with brass safety pins and prayers. (Adds 3 Flub bugs if the seam parts on stage).',
      cost: 0,
      flubsAdded: 3,
    },
  },
  {
    id: 'dimmer_fuse_blowout',
    title: 'Lighting Pack Dimmer Blowout!',
    description: 'An ancient circuit breaker in Unit 12B popped with a shower of sparks, plunging the downstage area into complete darkness.',
    quote: '"We warned Arthur the wiring in this storefront was installed during the Eisenhower administration!" — Tech Lead',
    optionA: {
      label: 'Overnight Industrial Breaker Pack ($190)',
      description: 'Order heavy-duty circuit protection and surge suppressor (+25 Lighting & Sound).',
      cost: 190,
      statBonus: { lighting: 25 },
    },
    optionB: {
      label: 'Rig Household Desk Lamps on Extension Cords (Free)',
      description: 'Borrow gooseneck lamps from the foyer box office. (Adds 3 Flub bugs from harsh shadows).',
      cost: 0,
      flubsAdded: 3,
    },
  },
  {
    id: 'parody_legal_telegram',
    title: 'Cease & Desist Telegram from Broadway!',
    description: 'A courier arrived with a strongly worded telegram from big-city Broadway attorneys asserting trademark infringement!',
    quote: '"They claim our musical dogs look suspiciously like their musical cats! Preposterous!" — Artistic Director',
    optionA: {
      label: 'Consult Local Trademark Attorney ($160)',
      description: 'Draft a certified parody defense letter protecting the run (+10 Acumen, +10 Acting confidence).',
      cost: 160,
      acumenReward: 10,
      statBonus: { acting: 10 },
    },
    optionB: {
      label: 'Ad-lib Names on the Fly (Free)',
      description: 'Tell actors to cough loudly whenever character names are spoken. (Adds 3 Flub bugs).',
      cost: 0,
      flubsAdded: 3,
    },
  },
  {
    id: 'lead_actor_throat',
    title: 'Lead Performer Sore Throat Scare!',
    description: 'The lead actor woke up rasping after singing in the drafty backstage wing without an electric radiator!',
    quote: '"My vocal coach says I must observe 24 hours of strict vow of silence..." — Lead Vocalist',
    optionA: {
      label: 'Holistic Honey-Echinacea & Vocal Coach Treatment ($110)',
      description: 'Soothe vocal cords and provide professional steaming (+15 Acting & Heart).',
      cost: 110,
      statBonus: { acting: 15 },
    },
    optionB: {
      label: 'Push Understudy to the Forefront (Free)',
      description: 'Rely on the troupe understudy or tea with lemon. (Adds 2 Flub bugs from quick blocking adjustments).',
      cost: 0,
      flubsAdded: 2,
    },
  },
];
