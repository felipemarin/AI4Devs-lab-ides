import { ApplicationStatus } from '@prisma/client';

export interface CreateCandidateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string | Date;
  location?: string;
  resumeUrl?: string;
  resumeFile?: string;
  notes?: string;
  workExperiences?: CreateWorkExperienceDto[];
  education?: CreateEducationDto[];
  skills?: string[];
  languages?: CreateLanguageDto[];
}

export interface CreateWorkExperienceDto {
  company: string;
  position: string;
  startDate: string | Date;
  endDate?: string | Date;
  description?: string;
}

export interface CreateEducationDto {
  institution: string;
  degree: string;
  field: string;
  startDate: string | Date;
  endDate?: string | Date;
  description?: string;
}

export interface CreateLanguageDto {
  name: string;
  level: string;
}

export interface UpdateCandidateDto extends Partial<CreateCandidateDto> {
  status?: ApplicationStatus;
} 