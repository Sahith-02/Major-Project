import React, { createContext, useContext, useState } from "react";

// Create the context
const InterviewContext = createContext();

// Create a provider component
export function InterviewProvider({ children }) {
  const [step, setStep] = useState("rating");
  const [ratings, setRatings] = useState({
    oop_rating: 5,
    dbms_rating: 5,
    os_rating: 5,
  });
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [followupQuestions, setFollowupQuestions] = useState([]);
  const [currentFollowupIndex, setCurrentFollowupIndex] = useState(0);
  const [interviewState, setInterviewState] = useState(null);

  const value = {
    step,
    setStep,
    ratings,
    setRatings,
    currentQuestion,
    setCurrentQuestion,
    currentAnswer,
    setCurrentAnswer,
    evaluation,
    setEvaluation,
    followupQuestions,
    setFollowupQuestions,
    currentFollowupIndex,
    setCurrentFollowupIndex,
    interviewState,
    setInterviewState,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
}

// Custom hook to use the interview context
export function useInterview() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return context;
}
