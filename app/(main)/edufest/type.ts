export interface TeamMember {
  name: string;
  student_class: string;
  dob: string;
  institution_name: string;
}

export type CompetitionKey = 'painting' | 'quiz' | 'mathematics' | 'young_innovator';

export interface FormData {
  full_name: string;
  dob: string;
  student_class: string;
  institution_name: string;
  contact_number: string;
  gender: string;
  alternate_contact_number: string;
  address: string;
  father_name: string;
  father_occupation: string;
  competition_category: CompetitionKey[];
  participation_type: 'individual' | 'team';
  team_size: number | null;
  team_members: TeamMember[];
  email: string;
  passport_photo: File | null;
  candidate_signature: File | null;
}

export const COMPETITION_FEES: Record<CompetitionKey, number> = {
  painting: 150,
  quiz: 300,
  mathematics: 200,
  young_innovator: 300,
};

export const COMPETITION_LABELS: Record<CompetitionKey, string> = {
  painting: 'Painting Competition',
  quiz: 'Quiz Competition',
  mathematics: 'Mathematics Championship',
  young_innovator: 'Young Innovators Challenge',
};

export const COMPETITION_DATES: Record<CompetitionKey, string> = {
  painting: '24 May 2026',
  quiz: '24 May 2026',
  mathematics: '26 April 2026',
  young_innovator: '24 May 2026',
};

export const COMPETITION_ELIGIBILITY: Record<CompetitionKey, string> = {
  painting: 'Class 3–8',
  quiz: 'Class 6–10',
  mathematics: 'Class 3–8',
  young_innovator: 'Class 9–12',
};

export function calculateTotalFee(
  categories: CompetitionKey[],
  participationType: 'individual' | 'team',
  teamSize: number | null
): number {
  let total = 0;
  for (const cat of categories) {
    const baseFee = COMPETITION_FEES[cat];
    // For team events, fee is per member (team size includes leader)
    if (participationType === 'team' && teamSize && (cat === 'quiz' || cat === 'young_innovator')) {
      total += baseFee * teamSize;
    } else {
      total += baseFee;
    }
  }
  return total;
}

export const API_BASE = 'https://api.justmateng.info';