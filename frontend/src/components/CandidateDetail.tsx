import React, { useState, useEffect } from 'react';
import { Candidate, WorkExperience, Education, Language, Skill } from '../types/candidate';
import { api } from '../services/api';

interface CandidateDetailProps {
  candidateId: number;
  onClose: () => void;
  onEdit: (candidate: Candidate) => void;
}

export const CandidateDetail: React.FC<CandidateDetailProps> = ({ candidateId, onClose, onEdit }) => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCandidate();
  }, [candidateId]);

  const loadCandidate = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCandidate(candidateId);
      setCandidate(data);
    } catch (err) {
      setError('Failed to load candidate details');
      console.error('Error loading candidate:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading candidate details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!candidate) {
    return <div className="error">Candidate not found</div>;
  }

  return (
    <div className="candidate-detail">
      <div className="candidate-detail-header">
        <h2>Candidate Details</h2>
        <div className="candidate-detail-actions">
          <button onClick={() => onEdit(candidate)}>Edit</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>

      <div className="candidate-detail-content">
        <section className="candidate-info">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{`${candidate.firstName} ${candidate.lastName}`}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{candidate.email}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{candidate.phone || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Birth Date:</label>
              <span>{candidate.birthDate ? new Date(candidate.birthDate).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Location:</label>
              <span>{candidate.location || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className={`status-badge status-${candidate.status}`}>{candidate.status}</span>
            </div>
          </div>
          {candidate.notes && (
            <div className="info-item">
              <label>Notes:</label>
              <p>{candidate.notes}</p>
            </div>
          )}
        </section>

        <section className="candidate-experience">
          <h3>Work Experience</h3>
          {candidate.workExperiences && candidate.workExperiences.length > 0 ? (
            <div className="experience-list">
              {candidate.workExperiences.map((exp: WorkExperience) => (
                <div key={exp.id} className="experience-item">
                  <h4>{exp.position}</h4>
                  <p className="company">{exp.company}</p>
                  <p className="date">
                    {new Date(exp.startDate).toLocaleDateString()} - 
                    {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                  </p>
                  {exp.description && <p className="description">{exp.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p>No work experience recorded</p>
          )}
        </section>

        <section className="candidate-education">
          <h3>Education</h3>
          {candidate.education && candidate.education.length > 0 ? (
            <div className="education-list">
              {candidate.education.map((edu: Education) => (
                <div key={edu.id} className="education-item">
                  <h4>{edu.degree}</h4>
                  <p className="institution">{edu.institution}</p>
                  <p className="field">{edu.field}</p>
                  <p className="date">
                    {new Date(edu.startDate).toLocaleDateString()} - 
                    {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                  </p>
                  {edu.description && <p className="description">{edu.description}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p>No education recorded</p>
          )}
        </section>

        <section className="candidate-skills">
          <h3>Skills</h3>
          {candidate.skills && candidate.skills.length > 0 ? (
            <div className="skills-list">
              {candidate.skills.map((skill: Skill) => (
                <span key={skill.id} className="skill-tag">
                  {skill.name}
                </span>
              ))}
            </div>
          ) : (
            <p>No skills recorded</p>
          )}
        </section>

        <section className="candidate-languages">
          <h3>Languages</h3>
          {candidate.languages && candidate.languages.length > 0 ? (
            <div className="languages-list">
              {candidate.languages.map((lang: Language) => (
                <div key={lang.id} className="language-item">
                  <span className="language-name">{lang.name}</span>
                  <span className="language-level">{lang.level}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No languages recorded</p>
          )}
        </section>
      </div>
    </div>
  );
}; 