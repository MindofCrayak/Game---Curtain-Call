import { CastMember, StaffMember } from '../types/theater';

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff_director',
    name: 'Julian Vance',
    role: 'DIRECTOR',
    title: 'Artistic Director',
    skillLevel: 56,
    stamina: 85,
    weeklySalary: 120,
    acumenTrainingCost: 25,
    specialization: 'Ensemble Pacing & Emotional Arc',
    description: 'A passionate local theater veteran known for grand gestures and dramatic script coaching.'
  },
  {
    id: 'staff_stage_manager',
    name: 'Clara Higgins',
    role: 'STAGE_MANAGER',
    title: 'Production Stage Manager',
    skillLevel: 68,
    stamina: 95,
    weeklySalary: 100,
    acumenTrainingCost: 20,
    specialization: 'Flub Remediation & Cue Calling (2.5x speed)',
    description: 'Armed with a clipboard, headset, and colored highlighters. Keeps chaotic rehearsals from collapsing.'
  },
  {
    id: 'staff_shop_steward',
    name: 'Gus Kowalski',
    role: 'SHOP_STEWARD',
    title: 'Master Carpenter',
    skillLevel: 62,
    stamina: 80,
    weeklySalary: 95,
    acumenTrainingCost: 20,
    specialization: 'Scenic Framing & Flat Rigging',
    description: 'Can build a castle wall out of scrap 2x4s and dry wall plaster before lunch.'
  },
  {
    id: 'staff_costume_master',
    name: 'Evelyn Thorne',
    role: 'COSTUME_MASTER',
    title: 'Wardrobe Coordinator',
    skillLevel: 58,
    stamina: 82,
    weeklySalary: 85,
    acumenTrainingCost: 20,
    specialization: 'Period Stitching & Quick Transformations',
    description: 'Magically turns thrift store curtains and velvet scraps into 19th-century ballgowns.'
  },
  {
    id: 'staff_lighting_director',
    name: 'Milo Sparks',
    role: 'LIGHTING_DIRECTOR',
    title: 'Master Electrician',
    skillLevel: 54,
    stamina: 78,
    weeklySalary: 90,
    acumenTrainingCost: 20,
    specialization: 'Atmospheric Gels & Audio Equalization',
    description: 'Lives on black coffee and dimmer boards. Knows every temperamental fuse in the building.'
  }
];

export const INITIAL_CAST: CastMember[] = [
  {
    id: 'actor_brendan',
    name: 'Brendan Gallagher',
    assignedRole: 'UNASSIGNED',
    talent: 78,
    memorization: 45, // Low memorization -> generates occasional flubs!
    chemistry: 72,
    stamina: 80,
    morale: 85,
    conflictRisk: 0.15,
    bio: 'Local high school English teacher with booming vocal projection and a bad habit of improvising his rhymes.',
    clothingColor: '#38bdf8',
    hairColor: '#78350f'
  },
  {
    id: 'actor_hannah',
    name: 'Hannah Wu',
    assignedRole: 'UNASSIGNED',
    talent: 74,
    memorization: 90, // Excellent line retention
    chemistry: 84,
    stamina: 85,
    morale: 90,
    conflictRisk: 0.05,
    bio: 'Diligent pre-law student who colors her script by character beats and never drops a stage cue.',
    clothingColor: '#ec4899',
    hairColor: '#171717'
  },
  {
    id: 'actor_darren',
    name: 'Darren Fletcher',
    assignedRole: 'UNASSIGNED',
    talent: 62,
    memorization: 58,
    chemistry: 65,
    stamina: 75,
    morale: 80,
    conflictRisk: 0.22,
    bio: 'Pre-owned car dealership manager who joined theater for public speaking and stayed for the camaraderie.',
    clothingColor: '#eab308',
    hairColor: '#52525b'
  },
  {
    id: 'actor_penelope',
    name: 'Penelope Scott',
    assignedRole: 'UNASSIGNED',
    talent: 84,
    memorization: 82,
    chemistry: 78,
    stamina: 62, // Older performer with high skill but moderate stamina
    morale: 88,
    conflictRisk: 0.08,
    bio: 'Retired church organist and soprano soloist with razor-sharp diction and four decades of stage experience.',
    clothingColor: '#a855f7',
    hairColor: '#d4d4d8'
  },
  {
    id: 'actor_toby',
    name: 'Toby Miller',
    assignedRole: 'UNASSIGNED',
    talent: 66,
    memorization: 68,
    chemistry: 88, // Great chemistry booster
    stamina: 92,
    morale: 95,
    conflictRisk: 0.10,
    bio: 'Neighborhood barista with infectious enthusiasm who learns dance choreography in ten minutes.',
    clothingColor: '#10b981',
    hairColor: '#b45309'
  },
  {
    id: 'actor_samantha',
    name: 'Samantha Reed',
    assignedRole: 'UNASSIGNED',
    talent: 80,
    memorization: 86,
    chemistry: 54, // Perfectionist, slightly aloof with ensemble
    stamina: 78,
    morale: 76,
    conflictRisk: 0.12,
    bio: 'Former conservatory student who demands professional standards and gives quiet notes to castmates.',
    clothingColor: '#f43f5e',
    hairColor: '#ca8a04'
  },
  {
    id: 'actor_clyde',
    name: 'Clyde Baxter',
    assignedRole: 'UNASSIGNED',
    talent: 58,
    memorization: 64,
    chemistry: 90,
    stamina: 90,
    morale: 92,
    conflictRisk: 0.04,
    bio: 'Postal carrier and community fixture who loves ensemble crowd scenes and brings homemade brownies.',
    clothingColor: '#0284c7',
    hairColor: '#4b5563'
  },
  {
    id: 'actor_fiona',
    name: 'Fiona Kelly',
    assignedRole: 'UNASSIGNED',
    talent: 76,
    memorization: 70,
    chemistry: 80,
    stamina: 82,
    morale: 84,
    conflictRisk: 0.18,
    bio: 'Veterinary technician with effortless physical slapstick timing and expressive facial expressions.',
    clothingColor: '#14b8a6',
    hairColor: '#991b1b'
  }
];
