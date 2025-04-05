import React from 'react';
import './SubjectDetailsDialog.css';

const SubjectDetailsDialog = ({ subjectData, onClose }) => {
  if (!subjectData) return null;

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'easy': return '#28a745';
      case 'medium': return '#fd7e14';
      case 'hard': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getSubjectIcon = (subj) => {
    switch(subj?.toLowerCase()) {
      case 'cpp': return '💻';
      case 'dbms': return '🗄️';
      case 'os': return '⚙️';
      default: return '📚';
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <div className="dialog-header" style={{ backgroundColor: getDifficultyColor(subjectData.difficulty) }}>
          <div className="subject-icon">{getSubjectIcon(subjectData.subject)}</div>
          <h2>{subjectData.subject?.toUpperCase() || 'N/A'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="dialog-body">
          <div className="subject-meta">
            <div className="meta-item">
              <span className="meta-label">Difficulty:</span>
              <span className="meta-value" style={{ color: getDifficultyColor(subjectData.difficulty) }}>
                {subjectData.difficulty?.charAt(0)?.toUpperCase() + subjectData.difficulty?.slice(1) || 'N/A'}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Questions Attempted:</span>
              <span className="meta-value">{subjectData.evaluations?.length || 0}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Average Score:</span>
              <span className="meta-value">
                {Math.round(subjectData.evaluations.reduce((sum, evaluation) => {
                  const scoreStr = evaluation?.score || '0';
                  let scoreValue;
                  
                  if (typeof scoreStr === 'string') {
                    if (scoreStr.includes('/')) {
                      const [numerator, denominator] = scoreStr.split('/').map(Number);
                      scoreValue = denominator !== 0 ? (numerator / denominator) * 100 : 0;
                    } else if (scoreStr.includes('%')) {
                      scoreValue = parseFloat(scoreStr) || 0;
                    } else {
                      scoreValue = parseFloat(scoreStr) || 0;
                    }
                  } else if (typeof scoreStr === 'number') {
                    scoreValue = scoreStr;
                  } else {
                    scoreValue = 0;
                  }
                  
                  return sum + scoreValue;
                }, 0) / subjectData.evaluations.length)}%
              </span>
            </div>
          </div>

          <div className="evaluations-section">
            <h3>Question Evaluations</h3>
            <div className="evaluations-list">
                {/* console.log(evaluation); */}
              {subjectData.evaluations?.map((evaluation, index) => (
                <div key={index} className="evaluation-item">
                  <div className="evaluation-question">
                    <strong>Question {index + 1}:</strong> {evaluation.question || 'N/A'}
                  </div>
                  <div className="evaluation-details">
                    <div className="evaluation-score">
                      <span>Score: </span>
                      <span className="score-value">{evaluation.score || 'N/A'}</span>
                    </div>
                    <div className="evaluation-feedback">
                      <strong>Feedback:</strong> {evaluation.feedback || 'No feedback available'}
                    </div>
                    {evaluation.weak_areas?.length > 0 && (
                      <div className="weak-areas">
                        <strong>Areas to Improve:</strong>
                        <ul>
                          {evaluation.weak_areas.map((area, i) => (
                            <li key={i}>{area}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {evaluation.strong_areas?.length > 0 && (
                      <div className="strong-areas">
                        <strong>Strengths:</strong>
                        <ul>
                          {evaluation.strong_areas.map((area, i) => (
                            <li key={i}>{area}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectDetailsDialog;