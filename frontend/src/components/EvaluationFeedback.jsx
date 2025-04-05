import React from 'react';
import './EvaluationFeedback.css';

const EvaluationFeedback = ({ evaluation, difficulty }) => {
  if (!evaluation) return null;

  return (
    <div className="evaluation-feedback">
      <h3>Evaluation</h3>
      <div className="difficulty">
        <strong>Difficulty:</strong> {difficulty}
      </div>
      <div className="score">
        <strong>Score:</strong> {evaluation.score}
      </div>
      <div className="feedback">
        <strong>Feedback:</strong> {evaluation.feedback}
      </div>
    </div>
  );
};

export default EvaluationFeedback;