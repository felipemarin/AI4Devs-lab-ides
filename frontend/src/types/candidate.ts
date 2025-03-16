export interface WorkExperience {
  id?: number;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Education {
  id?: number;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Language {
  id?: number;
  name: string;
  level: string;
}

export interface Skill {
  id?: number;
  name: string;
}

export interface Candidate {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  location?: string;
  status: 'NEW' | 'REVIEWING' | 'IN_PROCESS' | 'REJECTED' | 'HIRED';
  resumeUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  workExperiences?: WorkExperience[];
  education?: Education[];
  skills?: Skill[];
  languages?: Language[];
}

export type CreateCandidateDto = Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCandidateDto = Partial<CreateCandidateDto>; 