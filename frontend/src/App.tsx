import React, { useState } from 'react';
import { CandidateList } from './components/CandidateList';
import { CandidateForm } from './components/CandidateForm';
import { Candidate } from './types/candidate';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/components.css';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | undefined>();

  const handleCreateCandidate = () => {
    setSelectedCandidate(undefined);
    setShowForm(true);
  };

  const handleEditCandidate = (candidate: Candidate | undefined) => {
    setSelectedCandidate(candidate);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    const isUpdate = !!selectedCandidate;
    setShowForm(false);
    setSelectedCandidate(undefined);
    if (isUpdate) {
      toast.success('Candidate updated successfully!');
    } else {
      toast.success('Candidate created successfully!');
    }
  };

  const handleFormError = (error: any) => {
    console.error('Form error:', error);
    toast.error(selectedCandidate ? 'Error updating candidate' : 'Error creating candidate');
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setSelectedCandidate(undefined);
  };

  const handleWorkExperienceSuccess = (message: string) => {
    toast.success(message);
  };

  const handleWorkExperienceError = (error: any) => {
    console.error('Work experience error:', error);
    toast.error('Error managing work experience');
  };

  const handleEducationSuccess = (message: string) => {
    toast.success(message);
  };

  const handleEducationError = (error: any) => {
    console.error('Education error:', error);
    toast.error('Error managing education');
  };

  const handleSkillSuccess = (message: string) => {
    toast.success(message);
  };

  const handleSkillError = (error: any) => {
    console.error('Skill error:', error);
    toast.error('Error managing skill');
  };

  const handleLanguageSuccess = (message: string) => {
    toast.success(message);
  };

  const handleLanguageError = (error: any) => {
    console.error('Language error:', error);
    toast.error('Error managing language');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>LTI Candidate Management System</h1>
      </header>

      <main className="app-main">
        {showForm ? (
          <CandidateForm
            candidate={selectedCandidate}
            onSuccess={handleFormSuccess}
            onError={handleFormError}
            onCancel={handleFormCancel}
            onWorkExperienceSuccess={handleWorkExperienceSuccess}
            onWorkExperienceError={handleWorkExperienceError}
            onEducationSuccess={handleEducationSuccess}
            onEducationError={handleEducationError}
            onSkillSuccess={handleSkillSuccess}
            onSkillError={handleSkillError}
            onLanguageSuccess={handleLanguageSuccess}
            onLanguageError={handleLanguageError}
          />
        ) : (
          <CandidateList onEditCandidate={handleEditCandidate} />
        )}
      </main>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
