import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../ui/Button/Button';
import './Interview.css';

const Interview = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState(['cpp', 'dbms', 'OS']);
  const [difficultyLevels] = useState(['easy', 'medium', 'hard']);
  const [loading, setLoading] = useState(true);
  const [completedSubjects, setCompletedSubjects] = useState([]);

  // Fetch available subjects and completed subjects on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch available subjects
        const subjectsResponse = await axios.get('http://localhost:5000/available-subjects');
        if (subjectsResponse.data.available_subjects) {
          setAvailableSubjects(subjectsResponse.data.available_subjects);
        }
        
        // Fetch completed subjects (in a real app, this would be a separate API call)
        // For this example, we'll simulate with local storage
        const storedCompletedSubjects = localStorage.getItem('completedSubjects');
        if (storedCompletedSubjects) {
          setCompletedSubjects(JSON.parse(storedCompletedSubjects));
        }
        
        // Check if all subjects are completed
        if (storedCompletedSubjects) {
          const completed = JSON.parse(storedCompletedSubjects);
          // If all three subjects are completed, navigate to completion page
          if (completed.length >= 3) {
            navigate('/interview-completion');
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  // Handle subject and difficulty selection
  const handleSubjectSelection = (selectedSubject) => {
    setSubject(selectedSubject);
  };

  const handleDifficultySelection = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
  };

  const handleSelectionSubmit = () => {
    if (!subject || !difficulty) {
      alert('Please select both a subject and difficulty level');
      return;
    }
    
    navigate('/interview-page', { 
      state: { 
        subject: subject, 
        difficulty: difficulty 
      }
    });
  };

  // Get difficulty color
  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'easy': return '#28a745';
      case 'medium': return '#fd7e14';
      case 'hard': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Get subject icon
  const getSubjectIcon = (subj) => {
    switch(subj.toLowerCase()) {
      case 'cpp': return '💻';
      case 'dbms': return '🗄️';
      case 'os': return '⚙️';
      default: return '📚';
    }
  };

  // Get subject status (completed or available)
  const getSubjectStatus = (subj) => {
    return completedSubjects.includes(subj.toLowerCase()) ? 'completed' : 'available';
  };

  return (
    <div className="interview-container">
      <h1 className="title">Smart Interview System</h1>

      <div className="selection-section">
        <h2>Select Your Interview Topic & Difficulty</h2>
        
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="subject-selection">
              <h3>Choose Subject:</h3>
              <div className="selection-buttons">
                {availableSubjects.map((subj) => {
                  const isCompleted = getSubjectStatus(subj) === 'completed';
                  return (
                    <button
                      key={subj}
                      onClick={() => handleSubjectSelection(subj)}
                      className={`selection-button ${subject === subj ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      disabled={isCompleted}
                    >
                      <span className="subject-icon">{getSubjectIcon(subj)}</span>
                      <span>{subj.toUpperCase()}</span>
                      {isCompleted && <span className="completed-badge">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="difficulty-selection">
              <h3>Select Difficulty:</h3>
              <div className="selection-buttons">
                {difficultyLevels.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleDifficultySelection(diff)}
                    className={`difficulty-button ${difficulty === diff ? 'active' : ''}`}
                    style={{
                      backgroundColor: difficulty === diff ? getDifficultyColor(diff) : '',
                      color: difficulty === diff ? '#fff' : ''
                    }}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={handleSelectionSubmit} 
              className="selection-submit"
              disabled={!subject || !difficulty}
            >
              {subject && difficulty ? `Start ${subject.toUpperCase()} Interview` : 'Begin Interview'}
            </Button>
          </>
        )}
      </div>
      
      <div className="selection-footer">
        <p>Select a subject and difficulty level to begin your interview</p>
        <p className="completion-status">
          <span className="status-number">{completedSubjects.length}</span> of 
          <span className="status-total"> 3</span> subjects completed
        </p>
      </div>
    </div>
  );
};

export default Interview;