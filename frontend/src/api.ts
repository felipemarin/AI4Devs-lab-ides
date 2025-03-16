import { API_URL } from './config';

export const getInstitutionSuggestions = async (query: string): Promise<string[]> => {
  const response = await fetch(`${API_URL}/api/candidates/suggestions/institutions?query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Error fetching institution suggestions');
  }
  return response.json();
};

export const getDegreeSuggestions = async (query: string): Promise<string[]> => {
  const response = await fetch(`${API_URL}/api/candidates/suggestions/degrees?query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Error fetching degree suggestions');
  }
  return response.json();
};

export const getFieldSuggestions = async (query: string): Promise<string[]> => {
  const response = await fetch(`${API_URL}/api/candidates/suggestions/fields?query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Error fetching field suggestions');
  }
  return response.json();
};

export const getCompanySuggestions = async (query: string): Promise<string[]> => {
  const response = await fetch(`${API_URL}/api/candidates/suggestions/companies?query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Error fetching company suggestions');
  }
  return response.json();
};

export const getPositionSuggestions = async (query: string): Promise<string[]> => {
  const response = await fetch(`${API_URL}/api/candidates/suggestions/positions?query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Error fetching position suggestions');
  }
  return response.json();
};

export const getSkillSuggestions = async (query: string): Promise<string[]> => {
  const response = await fetch(`${API_URL}/api/candidates/suggestions/skills?query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Error fetching skill suggestions');
  }
  return response.json();
}; 