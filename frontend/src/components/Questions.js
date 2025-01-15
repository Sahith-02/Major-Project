// src/components/Questions.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Questions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sortedSubjects } = location.state;

  const questions = {
    oop: [
      "What is polymorphism in OOP?",
      "Explain the concept of inheritance in OOP.",
      "What is encapsulation in OOP?",
    ],
    dbms: [
      "What is normalization in DBMS?",
      "Explain the difference between primary and foreign keys.",
      "What is a relational database model?",
    ],
    os: [
      "What is virtual memory?",
      "Explain the difference between process and thread.",
      "What is deadlock in operating systems?",
    ],
  };

  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [questionsAnswered, setQuestionsAnswered] = useState([]);

  useEffect(() => {
    setCurrentQuestionIndex(0); // Start from the first question of the highest-rated subject
  }, [currentSubjectIndex]);

  const handleNextQuestion = () => {
    setQuestionsAnswered([
      ...questionsAnswered,
      { subject: sortedSubjects[currentSubjectIndex], answer },
    ]);
    setAnswer("");

    if (
      currentQuestionIndex <
      questions[sortedSubjects[currentSubjectIndex]].length - 1
    ) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSubjectIndex < sortedSubjects.length - 1) {
      setCurrentSubjectIndex(currentSubjectIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      navigate("/thank-you"); // Redirect to a thank you page after all questions are answered
    }
  };

  return (
    <div>
      <h1>Answer Questions</h1>
      <h2>{sortedSubjects[currentSubjectIndex].toUpperCase()}</h2>
      <p>
        {questions[sortedSubjects[currentSubjectIndex]][currentQuestionIndex]}
      </p>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Enter your answer"
      ></textarea>

      <button onClick={handleNextQuestion}>Next Question</button>
    </div>
  );
};

export default Questions;
