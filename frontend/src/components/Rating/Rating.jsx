import React from 'react';
import { useInterview } from '../../context/InterviewContext';
import Slider from '../ui/Slider/Slider';
import Button  from '../ui/Button/Button';
import './Rating.css';

const Rating = () => {
  const { 
    ratings, 
    setRatings, 
    setCurrentQuestion, 
    setInterviewState, 
    setStep 
  } = useInterview();

  const handleStartInterview = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/start-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratings),
      });

      if (!response.ok) throw new Error('Failed to start interview');

      const data = await response.json();
      setCurrentQuestion(data.question);
      setInterviewState(data.interview_state);
      setStep('interview');
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
    }
  };

  return (
    <div className="rating-container">
      <h1 className="title">Smart Interview System</h1>
      <h2>Rate Your Knowledge (1-10)</h2>

      <div className="rating-item">
        <label>Object-Oriented Programming</label>
        <Slider
          value={ratings.oop_rating}
          onChange={(value) =>
            setRatings((prev) => ({ ...prev, oop_rating: value }))
          }
        />
      </div>

      <div className="rating-item">
        <label>Database Management Systems</label>
        <Slider
          value={ratings.dbms_rating}
          onChange={(value) =>
            setRatings((prev) => ({ ...prev, dbms_rating: value }))
          }
        />
      </div>

      <div className="rating-item">
        <label>Operating Systems</label>
        <Slider
          value={ratings.os_rating}
          onChange={(value) =>
            setRatings((prev) => ({ ...prev, os_rating: value }))
          }
        />
      </div>

      <Button onClick={handleStartInterview} className="start-button">
        Start Interview
      </Button>
    </div>
  );
};

export default Rating;