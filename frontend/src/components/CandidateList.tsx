import React, { useEffect, useState } from 'react';
import { Candidate } from '../types/candidate';
import { api } from '../services/api';
import { CandidateDetail } from './CandidateDetail';
import { toast } from 'react-toastify';
import { STATIC_URL } from '../config';
import '../styles/components.css';

interface CandidateListProps {
  onEditCandidate: (candidate: Candidate | undefined) => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({ onEditCandidate }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching candidates from API...');
      const data = await api.getCandidates();
      console.log('Received candidates:', data);
      setCandidates(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load candidates';
      setError(`Error: ${errorMessage}`);
      console.error('Error loading candidates:', err);
      toast.error('Error loading candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await api.deleteCandidate(id);
        setCandidates(candidates.filter(c => c.id !== id));
        toast.success('Candidate deleted successfully!');
      } catch (err) {
        console.error('Error deleting candidate:', err);
        toast.error('Error deleting candidate');
      }
    }
  };

  const filteredCandidates = candidates
    .filter(candidate => {
      const searchLower = searchTerm.toLowerCase();
      return (
        candidate.firstName.toLowerCase().includes(searchLower) ||
        candidate.lastName.toLowerCase().includes(searchLower) ||
        candidate.email.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

  if (loading) {
    return <div className="loading">Loading candidates...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={loadCandidates}>Retry</button>
      </div>
    );
  }

  if (selectedCandidateId) {
    return (
      <CandidateDetail
        candidateId={selectedCandidateId}
        onClose={() => setSelectedCandidateId(null)}
        onEdit={onEditCandidate}
      />
    );
  }

  return (
    <div className="candidates-list">
      <div className="candidates-header">
        <h2>Candidates</h2>
        <div className="candidates-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button 
            type="button" 
            className="create"
            onClick={() => onEditCandidate(undefined)}
          >
            Create New Candidate
          </button>
        </div>
      </div>

      {error ? (
        <div className="error-message">
          <p>Error loading candidates: {error}</p>
          <button onClick={loadCandidates}>Retry</button>
        </div>
      ) : loading ? (
        <div className="loading">Loading candidates...</div>
      ) : selectedCandidateId ? (
        <CandidateDetail
          candidateId={selectedCandidateId}
          onClose={() => setSelectedCandidateId(null)}
          onEdit={onEditCandidate}
        />
      ) : (
        <table className="candidates-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Resume</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map(candidate => (
              <tr key={candidate.id}>
                <td>{candidate.firstName} {candidate.lastName}</td>
                <td>{candidate.email}</td>
                <td>{candidate.phone}</td>
                <td>
                  <span className={`candidate-status ${candidate.status}`}>
                    {candidate.status}
                  </span>
                </td>
                <td>
                  {candidate.resumeUrl && (
                    <a 
                      href={candidate.resumeUrl.startsWith('http') 
                        ? candidate.resumeUrl 
                        : `${STATIC_URL}${candidate.resumeUrl}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="resume-icon"
                      title="View Resume"
                    >
                      📄
                    </a>
                  )}
                </td>
                <td>
                  <div className="candidates-actions">
                    <button 
                      type="button" 
                      className="edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCandidate(candidate);
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      type="button" 
                      className="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(candidate.id!);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}; 