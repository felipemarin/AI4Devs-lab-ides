import { Candidate, CreateCandidateDto, UpdateCandidateDto, WorkExperience, Education, Language } from '../types/candidate';

const API_URL = 'http://localhost:3010/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204) {
    return;
  }
  return response.json();
};

export const api = {
  // Candidatos
  async getCandidates(): Promise<Candidate[]> {
    console.log('Fetching candidates...');
    const response = await fetch(`${API_URL}/candidates`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch candidates');
    }
    const data = await response.json();
    console.log('Received candidates:', data);
    return data;
  },

  async getCandidate(id: number): Promise<Candidate> {
    const response = await fetch(`${API_URL}/candidates/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch candidate');
    }
    return response.json();
  },

  async createCandidate(data: CreateCandidateDto | FormData): Promise<Candidate> {
    const headers: HeadersInit = {};
    
    if (data instanceof FormData) {
      // No establecer Content-Type para FormData, el navegador lo establecerá automáticamente
    } else {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}/candidates`, {
      method: 'POST',
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create candidate');
    }
    return response.json();
  },

  async updateCandidate(id: number, data: UpdateCandidateDto | FormData): Promise<Candidate> {
    const headers: HeadersInit = {};
    
    if (data instanceof FormData) {
      // No establecer Content-Type para FormData, el navegador lo establecerá automáticamente
    } else {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}/candidates/${id}`, {
      method: 'PUT',
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update candidate');
    }
    return response.json();
  },

  async deleteCandidate(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/candidates/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete candidate');
    }
  },

  // Experiencia laboral
  async addWorkExperience(candidateId: number, data: WorkExperience): Promise<WorkExperience> {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/work-experiences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add work experience');
    }
    return response.json();
  },

  async updateWorkExperience(candidateId: number, experienceId: number, data: WorkExperience): Promise<WorkExperience> {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/work-experiences/${experienceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update work experience');
    }
    return response.json();
  },

  async deleteWorkExperience(candidateId: number, experienceId: number): Promise<void> {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/work-experiences/${experienceId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete work experience');
    }
  },

  // Educación
  async addEducation(candidateId: number, data: Education): Promise<Education> {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/education`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateEducation(candidateId: number, educationId: number, data: Education): Promise<Education> {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/education/${educationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Habilidades
  async addSkill(candidateId: number, skillName: string): Promise<Candidate> {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skillName }),
    });
    return handleResponse(response);
  },

  async updateSkill(candidateId: number, oldSkillName: string, newSkillName: string): Promise<Candidate> {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/skills/${encodeURIComponent(oldSkillName)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ skillName: newSkillName }),
    });
    return handleResponse(response);
  },

  async deleteSkill(candidateId: number, skillName: string): Promise<void> {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/skills/${skillName}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete skill');
    }
  },

  // Idiomas
  async addLanguage(candidateId: number, data: Language): Promise<Candidate> {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/languages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateLanguage(candidateId: number, languageId: number, data: Language): Promise<Language> {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/languages/${languageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async deleteLanguage(candidateId: number, languageId: number): Promise<void> {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/languages/${languageId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete language');
    }
  },

  async deleteEducation(candidateId: number, educationId: number): Promise<void> {
    const response = await fetch(`${API_URL}/candidates/${candidateId}/education/${educationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete education');
    }
  },
}; 