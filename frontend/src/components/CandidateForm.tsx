import React, { useState, useEffect } from 'react';
import { Candidate, CreateCandidateDto, WorkExperience, Education, Language } from '../types/candidate';
import { api } from '../services/api';
import { API_URL, BASE_URL, STATIC_URL } from '../config';
import { 
  getInstitutionSuggestions, 
  getDegreeSuggestions, 
  getFieldSuggestions,
  getCompanySuggestions,
  getPositionSuggestions,
  getSkillSuggestions
} from '../api';
import '../styles/components.css';

interface CandidateFormProps {
  candidate?: Candidate;
  onSuccess: () => void;
  onError: (error: any) => void;
  onCancel: () => void;
  onWorkExperienceSuccess: (message: string) => void;
  onWorkExperienceError: (error: any) => void;
  onEducationSuccess: (message: string) => void;
  onEducationError: (error: any) => void;
  onSkillSuccess: (message: string) => void;
  onSkillError: (error: any) => void;
  onLanguageSuccess: (message: string) => void;
  onLanguageError: (error: any) => void;
}

export const CandidateForm: React.FC<CandidateFormProps> = ({ 
  candidate, 
  onSuccess, 
  onError, 
  onCancel,
  onWorkExperienceSuccess,
  onWorkExperienceError,
  onEducationSuccess,
  onEducationError,
  onSkillSuccess,
  onSkillError,
  onLanguageSuccess,
  onLanguageError
}) => {
  const formatDateForInput = (date: Date | string): string => {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<CreateCandidateDto>({
    firstName: candidate?.firstName || '',
    lastName: candidate?.lastName || '',
    email: candidate?.email || '',
    phone: candidate?.phone || '',
    birthDate: candidate?.birthDate ? formatDateForInput(candidate.birthDate) : '',
    location: candidate?.location || '',
    resumeUrl: candidate?.resumeUrl || '',
    notes: candidate?.notes || '',
    status: candidate?.status || 'NEW',
  });

  const [workExperience, setWorkExperience] = useState<WorkExperience>({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const [education, setEducation] = useState<Education>({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const [language, setLanguage] = useState<Language>({
    name: '',
    level: '',
  });

  const [skillName, setSkillName] = useState('');
  const [showWorkExperienceForm, setShowWorkExperienceForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showLanguageForm, setShowLanguageForm] = useState(false);
  const [candidateData, setCandidateData] = useState<Candidate | null>(null);
  const [editingWorkExperience, setEditingWorkExperience] = useState<WorkExperience | null>(null);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [institutionSuggestions, setInstitutionSuggestions] = useState<string[]>([]);
  const [degreeSuggestions, setDegreeSuggestions] = useState<string[]>([]);
  const [fieldSuggestions, setFieldSuggestions] = useState<string[]>([]);
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  const [positionSuggestions, setPositionSuggestions] = useState<string[]>([]);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (candidate?.id) {
      loadCandidateData();
    }
  }, [candidate?.id]);

  const loadCandidateData = async () => {
    if (candidate?.id) {
      try {
        const data = await api.getCandidate(candidate.id);
        setCandidateData(data);
        // Formatear la URL del resume si existe y es una ruta relativa
        if (data.resumeUrl) {
          if (data.resumeUrl.startsWith('/uploads/')) {
            data.resumeUrl = `${STATIC_URL}${data.resumeUrl}`;
          } else if (!data.resumeUrl.startsWith('http')) {
            data.resumeUrl = `${STATIC_URL}/uploads/${data.resumeUrl}`;
          }
        }
        setFormData(prev => ({
          ...prev,
          ...data,
          birthDate: data.birthDate ? formatDateForInput(data.birthDate) : '',
        }));
      } catch (error) {
        console.error('Error loading candidate data:', error);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      const fileName = e.target.files[0].name;
      const timestamp = Date.now();
      const fileExtension = fileName.split('.').pop();
      const relativePath = `/uploads/resumeFile-${timestamp}-${Math.floor(Math.random() * 1000000000)}.${fileExtension}`;
      const resumeUrl = `${STATIC_URL}${relativePath}`;
      setFormData(prev => ({ ...prev, resumeUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (resumeFile) {
        const formDataToSend = new FormData();
        // Handle basic fields
        Object.entries(formData).forEach(([key, value]) => {
          if (typeof value === 'string' || value instanceof Blob) {
            formDataToSend.append(key, value);
          } else if (Array.isArray(value)) {
            // Convert arrays to JSON strings
            formDataToSend.append(key, JSON.stringify(value));
          }
        });
        formDataToSend.append('resumeFile', resumeFile);

        if (candidate?.id) {
          await api.updateCandidate(candidate.id, formDataToSend);
        } else {
          await api.createCandidate(formDataToSend);
        }
      } else {
        // Si estamos editando un candidato existente
        if (candidate?.id) {
          // Solo omitir resumeUrl si viene de un archivo existente en /uploads/
          const updatedFormData = {
            ...formData,
            resumeUrl: candidateData?.resumeUrl?.startsWith('/uploads/') 
              ? candidateData.resumeUrl 
              : formData.resumeUrl
          };
          await api.updateCandidate(candidate.id, updatedFormData);
        } else {
          await api.createCandidate(formData);
        }
      }
      onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Error al guardar el candidato');
    }
  };

  const handleAddWorkExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (candidate?.id) {
      try {
        if (editingWorkExperience && editingWorkExperience.id) {
          await api.updateWorkExperience(candidate.id, editingWorkExperience.id, workExperience);
          onWorkExperienceSuccess('Work experience updated successfully!');
        } else {
          await api.addWorkExperience(candidate.id, workExperience);
          onWorkExperienceSuccess('Work experience added successfully!');
        }
        setWorkExperience({
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: '',
        });
        setShowWorkExperienceForm(false);
        setEditingWorkExperience(null);
        loadCandidateData();
      } catch (error) {
        console.error('Error saving work experience:', error);
        onWorkExperienceError(error);
      }
    }
  };

  const handleEditWorkExperience = (experience: WorkExperience) => {
    setEditingWorkExperience(experience);
    setWorkExperience({
      company: experience.company,
      position: experience.position,
      startDate: formatDateForInput(experience.startDate),
      endDate: experience.endDate ? formatDateForInput(experience.endDate) : '',
      description: experience.description || ''
    });
    setShowWorkExperienceForm(true);
  };

  const handleCancelWorkExperience = () => {
    setShowWorkExperienceForm(false);
    setEditingWorkExperience(null);
    setWorkExperience({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    });
  };

  const handleEditEducation = (education: Education) => {
    setEditingEducation(education);
    setEducation({
      institution: education.institution,
      degree: education.degree,
      field: education.field,
      startDate: formatDateForInput(education.startDate),
      endDate: education.endDate ? formatDateForInput(education.endDate) : '',
      description: education.description || ''
    });
    setShowEducationForm(true);
  };

  const handleEditSkill = (skill: string) => {
    setEditingSkill(skill);
    setSkillName(skill);
    setShowSkillForm(true);
  };

  const handleEditLanguage = (language: Language) => {
    setEditingLanguage(language);
    setLanguage({
      name: language.name,
      level: language.level
    });
    setShowLanguageForm(true);
  };

  const handleCancelEducation = () => {
    setShowEducationForm(false);
    setEditingEducation(null);
    setEducation({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  const handleCancelSkill = () => {
    setShowSkillForm(false);
    setEditingSkill(null);
    setSkillName('');
  };

  const handleCancelLanguage = () => {
    setShowLanguageForm(false);
    setEditingLanguage(null);
    setLanguage({
      name: '',
      level: ''
    });
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (candidate?.id) {
      try {
        if (editingEducation && editingEducation.id) {
          await api.updateEducation(candidate.id, editingEducation.id, education);
          onEducationSuccess('Education updated successfully!');
        } else {
          await api.addEducation(candidate.id, education);
          onEducationSuccess('Education added successfully!');
        }
        setEducation({
          institution: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          description: ''
        });
        setShowEducationForm(false);
        setEditingEducation(null);
        loadCandidateData();
      } catch (error) {
        console.error('Error saving education:', error);
        onEducationError(error);
      }
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (candidate?.id && skillName) {
      try {
        if (editingSkill) {
          await api.updateSkill(candidate.id, editingSkill, skillName);
          onSkillSuccess('Skill updated successfully!');
        } else {
          await api.addSkill(candidate.id, skillName);
          onSkillSuccess('Skill added successfully!');
        }
        setSkillName('');
        setShowSkillForm(false);
        setEditingSkill(null);
        loadCandidateData();
      } catch (error) {
        console.error('Error saving skill:', error);
        onSkillError(error);
      }
    }
  };

  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (candidate?.id) {
      try {
        if (editingLanguage && editingLanguage.id) {
          await api.updateLanguage(candidate.id, editingLanguage.id, language);
          onLanguageSuccess('Language updated successfully!');
        } else {
          await api.addLanguage(candidate.id, language);
          onLanguageSuccess('Language added successfully!');
        }
        setLanguage({
          name: '',
          level: ''
        });
        setShowLanguageForm(false);
        setEditingLanguage(null);
        loadCandidateData();
      } catch (error) {
        console.error('Error saving language:', error);
        onLanguageError(error);
      }
    }
  };

  const handleDeleteWorkExperience = async (experienceId: number) => {
    if (candidate?.id && window.confirm('Are you sure you want to delete this work experience?')) {
      try {
        await api.deleteWorkExperience(candidate.id, experienceId);
        onWorkExperienceSuccess('Work experience deleted successfully!');
        loadCandidateData();
      } catch (error) {
        console.error('Error deleting work experience:', error);
        onWorkExperienceError(error);
      }
    }
  };

  const handleDeleteEducation = async (educationId: number) => {
    if (candidate?.id && window.confirm('Are you sure you want to delete this education?')) {
      try {
        await api.deleteEducation(candidate.id, educationId);
        onEducationSuccess('Education deleted successfully!');
        loadCandidateData();
      } catch (error) {
        console.error('Error deleting education:', error);
        onEducationError(error);
      }
    }
  };

  const handleDeleteSkill = async (skillName: string) => {
    if (candidate?.id && window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await api.deleteSkill(candidate.id, skillName);
        onSkillSuccess('Skill deleted successfully!');
        loadCandidateData();
      } catch (error) {
        console.error('Error deleting skill:', error);
        onSkillError(error);
      }
    }
  };

  const handleDeleteLanguage = async (languageId: number) => {
    if (candidate?.id && window.confirm('Are you sure you want to delete this language?')) {
      try {
        await api.deleteLanguage(candidate.id, languageId);
        onLanguageSuccess('Language deleted successfully!');
        loadCandidateData();
      } catch (error) {
        console.error('Error deleting language:', error);
        onLanguageError(error);
      }
    }
  };

  const handleInstitutionChange = async (value: string) => {
    if (value.length >= 2) {
      try {
        const suggestions = await getInstitutionSuggestions(value);
        setInstitutionSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching institution suggestions:', error);
      }
    } else {
      setInstitutionSuggestions([]);
    }
  };

  const handleDegreeChange = async (value: string) => {
    if (value.length >= 2) {
      try {
        const suggestions = await getDegreeSuggestions(value);
        setDegreeSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching degree suggestions:', error);
      }
    } else {
      setDegreeSuggestions([]);
    }
  };

  const handleFieldChange = async (value: string) => {
    if (value.length >= 2) {
      try {
        const suggestions = await getFieldSuggestions(value);
        setFieldSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching field suggestions:', error);
      }
    } else {
      setFieldSuggestions([]);
    }
  };

  const handleCompanyChange = async (value: string) => {
    if (value.length >= 2) {
      try {
        const suggestions = await getCompanySuggestions(value);
        setCompanySuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching company suggestions:', error);
      }
    } else {
      setCompanySuggestions([]);
    }
  };

  const handlePositionChange = async (value: string) => {
    if (value.length >= 2) {
      try {
        const suggestions = await getPositionSuggestions(value);
        setPositionSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching position suggestions:', error);
      }
    } else {
      setPositionSuggestions([]);
    }
  };

  const handleSkillChange = async (value: string) => {
    if (value.length >= 2) {
      try {
        const suggestions = await getSkillSuggestions(value);
        setSkillSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching skill suggestions:', error);
      }
    } else {
      setSkillSuggestions([]);
    }
  };

  return (
    <div className="candidate-form">
      <h2>{candidate ? 'Edit Candidate' : 'New Candidate'}</h2>
      
      <form onSubmit={handleSubmit} className="candidate-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="birthDate">Birth Date</label>
              <input
                type="date"
                id="birthDate"
                value={formData.birthDate}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as Candidate['status'] })}
              >
                <option value="NEW">New</option>
                <option value="REVIEWING">Reviewing</option>
                <option value="IN_PROCESS">In Process</option>
                <option value="REJECTED">Rejected</option>
                <option value="HIRED">Hired</option>
              </select>
            </div>
          </div>
          {candidate?.resumeUrl && (
            <div className="form-row">
              <div className="form-group">
                <label>Current Resume</label>
                <a 
                  href={candidate.resumeUrl.startsWith('http') 
                    ? candidate.resumeUrl 
                    : `${STATIC_URL}${candidate.resumeUrl}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="resume-link"
                >
                  View current resume
                </a>
              </div>
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="resumeFile">Resume File</label>
              <input
                type="file"
                id="resumeFile"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="resumeUrl">Resume URL (optional)</label>
              <input
                type="url"
                id="resumeUrl"
                value={formData.resumeUrl}
                onChange={e => setFormData({ ...formData, resumeUrl: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit">{candidate ? 'Update' : 'Create'}</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>

      {candidate && (
        <>
          <div className="form-section-divider">
            <div className="section-header">
              <h3>Work Experience</h3>
              <button 
                type="button" 
                onClick={() => setShowWorkExperienceForm(!showWorkExperienceForm)}
                className="add-button"
              >
                {showWorkExperienceForm ? 'Cancel' : 'Add Work Experience'}
              </button>
            </div>
            
            {candidateData?.workExperiences && candidateData.workExperiences.length > 0 && (
              <div className="items-list">
                {candidateData.workExperiences.map((exp, index) => (
                  <div key={index} className="experience-item">
                    <div className="experience-content">
                      <h4>{exp.position}</h4>
                      <div className="company">{exp.company}</div>
                      <div className="date">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </div>
                      <div className="description">{exp.description}</div>
                    </div>
                    <div className="experience-actions">
                      <button 
                        type="button" 
                        className="edit-button"
                        onClick={() => handleEditWorkExperience(exp)}
                      >
                        Edit
                      </button>
                      <button 
                        type="button" 
                        className="delete-button"
                        onClick={() => handleDeleteWorkExperience(exp.id!)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showWorkExperienceForm && (
              <form onSubmit={handleAddWorkExperience} className="form-section">
                <h4>{editingWorkExperience ? 'Edit Work Experience' : 'Add Work Experience'}</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Company:</label>
                    <div className="input-group">
                      <input
                        type="text"
                        value={workExperience.company}
                        onChange={e => {
                          setWorkExperience({ ...workExperience, company: e.target.value });
                          handleCompanyChange(e.target.value);
                        }}
                        required
                      />
                      {companySuggestions.length > 0 && (
                        <ul className="suggestions-list">
                          {companySuggestions.map((suggestion, i) => (
                            <li
                              key={i}
                              onClick={() => {
                                setWorkExperience({ ...workExperience, company: suggestion });
                                setCompanySuggestions([]);
                              }}
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Position:</label>
                    <div className="input-group">
                      <input
                        type="text"
                        value={workExperience.position}
                        onChange={e => {
                          setWorkExperience({ ...workExperience, position: e.target.value });
                          handlePositionChange(e.target.value);
                        }}
                        required
                      />
                      {positionSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                          {positionSuggestions.map((suggestion, i) => (
                            <li
                              key={i}
                              onClick={() => {
                                setWorkExperience({ ...workExperience, position: suggestion });
                                setPositionSuggestions([]);
                              }}
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date:</label>
                    <input
                      type="date"
                      value={workExperience.startDate}
                      onChange={e => setWorkExperience({ ...workExperience, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date:</label>
                    <input
                      type="date"
                      value={workExperience.endDate}
                      onChange={e => setWorkExperience({ ...workExperience, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={workExperience.description}
                    onChange={e => setWorkExperience({ ...workExperience, description: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit">{editingWorkExperience ? 'Update' : 'Save'}</button>
                  <button type="button" onClick={handleCancelWorkExperience}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          <div className="form-section-divider">
            <div className="section-header">
              <h3>Education</h3>
              <button 
                type="button" 
                onClick={() => setShowEducationForm(!showEducationForm)}
                className="add-button"
              >
                {showEducationForm ? 'Cancel' : 'Add Education'}
              </button>
            </div>

            {candidateData?.education && candidateData.education.length > 0 && (
              <div className="items-list">
                {candidateData.education.map((edu, index) => (
                  <div key={index} className="education-item">
                    <div className="education-content">
                      <h4>{edu.degree}</h4>
                      <div className="institution">{edu.institution}</div>
                      <div className="field">{edu.field}</div>
                      <div className="date">
                        {edu.startDate} - {edu.endDate || 'Present'}
                      </div>
                      <div className="description">{edu.description}</div>
                    </div>
                    <div className="experience-actions">
                      <button 
                        type="button" 
                        className="edit-button"
                        onClick={() => handleEditEducation(edu)}
                      >
                        Edit
                      </button>
                      <button 
                        type="button" 
                        className="delete-button"
                        onClick={() => handleDeleteEducation(edu.id!)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showEducationForm && (
              <form onSubmit={handleAddEducation} className="form-section">
                <h4>{editingEducation ? 'Edit Education' : 'Add Education'}</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Institution:</label>
                    <div className="input-group">
                      <input
                        type="text"
                        value={education.institution}
                        onChange={e => {
                          setEducation({ ...education, institution: e.target.value });
                          handleInstitutionChange(e.target.value);
                        }}
                        required
                      />
                      {institutionSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                          {institutionSuggestions.map((suggestion, i) => (
                            <li
                              key={i}
                              onClick={() => {
                                setEducation({ ...education, institution: suggestion });
                                setInstitutionSuggestions([]);
                              }}
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Degree:</label>
                    <div className="input-group">
                      <input
                        type="text"
                        value={education.degree}
                        onChange={e => {
                          setEducation({ ...education, degree: e.target.value });
                          handleDegreeChange(e.target.value);
                        }}
                        required
                      />
                      {degreeSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                          {degreeSuggestions.map((suggestion, i) => (
                            <li
                              key={i}
                              onClick={() => {
                                setEducation({ ...education, degree: suggestion });
                                setDegreeSuggestions([]);
                              }}
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>Field:</label>
                  <div className="input-group">
                    <input
                      type="text"
                      value={education.field}
                      onChange={e => {
                        setEducation({ ...education, field: e.target.value });
                        handleFieldChange(e.target.value);
                      }}
                      required
                    />
                    {fieldSuggestions.length > 0 && (
                      <ul className="suggestions-list">
                        {fieldSuggestions.map((suggestion, i) => (
                          <li
                            key={i}
                            onClick={() => {
                              setEducation({ ...education, field: suggestion });
                              setFieldSuggestions([]);
                            }}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date:</label>
                    <input
                      type="date"
                      value={education.startDate}
                      onChange={e => setEducation({ ...education, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date:</label>
                    <input
                      type="date"
                      value={education.endDate}
                      onChange={e => setEducation({ ...education, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={education.description}
                    onChange={e => setEducation({ ...education, description: e.target.value })}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit">{editingEducation ? 'Update' : 'Save'}</button>
                  <button type="button" onClick={handleCancelEducation}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          <div className="form-section-divider">
            <div className="section-header">
              <h3>Skills</h3>
              <button 
                type="button" 
                onClick={() => setShowSkillForm(!showSkillForm)}
                className="add-button"
              >
                {showSkillForm ? 'Cancel' : 'Add Skill'}
              </button>
            </div>

            {candidateData?.skills && candidateData.skills.length > 0 ? (
              <div className="skills-list">
                {candidateData.skills.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <span className="skill-tag">{skill.name}</span>
                    <div className="experience-actions">
                      <button 
                        type="button" 
                        className="edit-button"
                        onClick={() => handleEditSkill(skill.name)}
                      >
                        Edit
                      </button>
                      <button 
                        type="button" 
                        className="delete-button"
                        onClick={() => handleDeleteSkill(skill.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No skills recorded</p>
            )}

            {showSkillForm && (
              <form onSubmit={handleAddSkill} className="form-section">
                <h4>{editingSkill ? 'Edit Skill' : 'Add Skill'}</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Skill Name:</label>
                    <div className="input-group">
                      <input
                        type="text"
                        value={skillName}
                        onChange={e => {
                          setSkillName(e.target.value);
                          handleSkillChange(e.target.value);
                        }}
                        required
                      />
                      {skillSuggestions.length > 0 && (
                        <ul className="suggestions-list">
                          {skillSuggestions.map((suggestion, i) => (
                            <li
                              key={i}
                              onClick={() => {
                                setSkillName(suggestion);
                                setSkillSuggestions([]);
                              }}
                            >
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit">{editingSkill ? 'Update' : 'Save'}</button>
                  <button type="button" onClick={handleCancelSkill}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          <div className="form-section-divider">
            <div className="section-header">
              <h3>Languages</h3>
              <button 
                type="button" 
                onClick={() => setShowLanguageForm(!showLanguageForm)}
                className="add-button"
              >
                {showLanguageForm ? 'Cancel' : 'Add Language'}
              </button>
            </div>

            {candidateData?.languages && candidateData.languages.length > 0 && (
              <div className="items-list">
                <div className="languages-list">
                  {candidateData.languages.map((lang, index) => (
                    <div key={index} className="language-item">
                      <div>
                        <span className="language-name">{lang.name}</span>
                        <span className="language-level">({lang.level})</span>
                      </div>
                      <div className="experience-actions">
                        <button 
                          type="button" 
                          className="edit-button"
                          onClick={() => handleEditLanguage(lang)}
                        >
                          Edit
                        </button>
                        <button 
                          type="button" 
                          className="delete-button"
                          onClick={() => handleDeleteLanguage(lang.id!)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showLanguageForm && (
              <form onSubmit={handleAddLanguage} className="form-section">
                <h4>{editingLanguage ? 'Edit Language' : 'Add Language'}</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Language Name:</label>
                    <input
                      type="text"
                      value={language.name}
                      onChange={e => setLanguage({ ...language, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Level:</label>
                    <select
                      value={language.level}
                      onChange={e => setLanguage({ ...language, level: e.target.value })}
                      required
                    >
                      <option value="">Select Level</option>
                      <option value="A1">A1</option>
                      <option value="A2">A2</option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                      <option value="C2">C2</option>
                      <option value="Native">Native</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit">{editingLanguage ? 'Update' : 'Save'}</button>
                  <button type="button" onClick={handleCancelLanguage}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}; 