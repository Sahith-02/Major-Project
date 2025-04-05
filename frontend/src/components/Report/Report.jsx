import React from 'react';
import './Report.css';

const Report = () => {
  return (
    <div className="complete-container">
      <h1 className="title">Interview Complete!</h1>
      <div className="completion-message">
        <p>Thank you for completing the interview.</p>
        <p>You've successfully answered questions across different subjects.</p>
        {/* We can add more detailed summary here once we implement the reporting functionality */}
      </div>
    </div>
  );
};

export default Report;