import { VolunteerActor, EgoLevel } from '../types';

interface CandidateTemplate {
  name: string;
  job: string;
  quirk: string;
  ego: EgoLevel;
  basePresence: number;
  baseMemorization: number;
  skinColor: string;
  clothesColor: string;
  pantsColor: string;
}

const TEMPLATES: CandidateTemplate[] = [
  {
    name: 'Barnaby Finch',
    job: 'Antique Clockmaker',
    quirk: 'Obsessed with mechanical timing; hits every entrance cue with Swiss precision.',
    ego: 'Low',
    basePresence: 6,
    baseMemorization: 9,
    skinColor: '#fed7aa',
    clothesColor: '#64748b',
    pantsColor: '#1e293b',
  },
  {
    name: 'Seraphina DuBois',
    job: 'Classical Harpist & Vocalist',
    quirk: 'Possesses four-octave operatic range; expects star dressing room lighting.',
    ego: 'High',
    basePresence: 10,
    baseMemorization: 8,
    skinColor: '#fcd34d',
    clothesColor: '#9333ea',
    pantsColor: '#3b0764',
  },
  {
    name: 'Felix Chen',
    job: 'Shy Bookstore Archivist',
    quirk: 'Whispers off-stage, but explodes with fierce emotional resonance during monologues.',
    ego: 'Low',
    basePresence: 9,
    baseMemorization: 9,
    skinColor: '#fed7aa',
    clothesColor: '#059669',
    pantsColor: '#111827',
  },
  {
    name: 'Constance Vance',
    job: 'Town Socialite & Philanthropist',
    quirk: 'Has donated chandeliers; expects a lead role or will complain to the Board.',
    ego: 'High',
    basePresence: 7,
    baseMemorization: 5,
    skinColor: '#fde047',
    clothesColor: '#e11d48',
    pantsColor: '#4c0519',
  },
  {
    name: 'Dexter Kowalski',
    job: 'Automotive Mechanic',
    quirk: 'Can build props with one hand and deliver Shakespearean verse with the other.',
    ego: 'Low',
    basePresence: 7,
    baseMemorization: 7,
    skinColor: '#fbcfe8',
    clothesColor: '#d97706',
    pantsColor: '#1f2937',
  },
  {
    name: 'Gretchen Bauer',
    job: 'High School Drama Coach',
    quirk: 'Understudy specialist; can step into any role on 20 minutes notice with zero flubs.',
    ego: 'Medium',
    basePresence: 8,
    baseMemorization: 10,
    skinColor: '#fed7aa',
    clothesColor: '#2563eb',
    pantsColor: '#0f172a',
  },
  {
    name: 'Oliver Thorne',
    job: 'Coffee Roaster & Poet',
    quirk: 'Fast comedic improviser; ad-libs witty physical comedy during awkward pauses.',
    ego: 'Medium',
    basePresence: 8,
    baseMemorization: 7,
    skinColor: '#fed7aa',
    clothesColor: '#ea580c',
    pantsColor: '#1e293b',
  },
  {
    name: 'Penelope Cruz-Wood',
    job: 'Aerobics Instructor',
    quirk: 'High stamina tap dancer; excels in high-energy musical chorus numbers.',
    ego: 'Low',
    basePresence: 8,
    baseMemorization: 8,
    skinColor: '#fcd34d',
    clothesColor: '#db2777',
    pantsColor: '#1e1b4b',
  },
];

export function generateAuditionCandidates(count = 3): VolunteerActor[] {
  const shuffled = [...TEMPLATES].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((tpl) => {
    // Add small random variation to stats
    const presenceVariance = Math.floor(Math.random() * 3) - 1;
    const memoVariance = Math.floor(Math.random() * 3) - 1;
    const presence = Math.max(4, Math.min(10, tpl.basePresence + presenceVariance));
    const memo = Math.max(4, Math.min(10, tpl.baseMemorization + memoVariance));

    return {
      id: `vol_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      name: tpl.name,
      job: tpl.job,
      stagePresence: presence,
      memorization: memo,
      ego: tpl.ego,
      stamina: 85 + Math.floor(Math.random() * 15),
      morale: 85 + Math.floor(Math.random() * 15),
      assignedRole: 'None',
      auditioned: true,
      quirk: tpl.quirk,
      skinColor: tpl.skinColor,
      clothesColor: tpl.clothesColor,
      pantsColor: tpl.pantsColor,
    };
  });
}
