import { BoardMember } from '../types/theater';

export const BOARD_MEMBERS: BoardMember[] = [
  {
    id: 'board_arthur',
    name: 'Arthur Sterling',
    role: 'Board President & Commercial Benefactor',
    personality: 'TRADITIONALIST',
    approvalRating: 82,
    annualEndowment: 1800,
    agendaDescription: 'Sponsors our theater building lease. Strongly favors crowd-pleasing Musical Comedies and Farces; balks at bizarre avant-garde experiments.',
    preferredGenre: 'Musical Comedy',
    dislikedGenre: 'Experimental'
  },
  {
    id: 'board_elena',
    name: 'Councilwoman Elena Cruz',
    role: 'Municipal Liaison & Civic Trustee',
    personality: 'CIVIC_BOOSTER',
    approvalRating: 78,
    annualEndowment: 1400,
    agendaDescription: 'Secures town cultural grants. Advocates for local historical pageants, robust volunteer engagement, and youth theater attendance.',
    preferredGenre: 'Historical Pageant'
  },
  {
    id: 'board_beatrice',
    name: 'Beatrice Van Horn',
    role: 'Arts Patron & Heritage Chair',
    personality: 'MEDDLING_PATRON',
    approvalRating: 75,
    annualEndowment: 1200,
    agendaDescription: 'Endows our costume and scenic fabrications fund. Expects lavish wardrobe presentation and insists on classic dramatic dignity.',
    preferredGenre: 'Tragic Drama'
  }
];
