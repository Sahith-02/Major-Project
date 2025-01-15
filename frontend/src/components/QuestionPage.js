// src/components/QuestionsPage.js
import React, { useState, useEffect } from "react";

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [difficulty, setDifficulty] = useState(""); // To manage difficulty

  useEffect(() => {
    // Based on the ratings (you could fetch from an API if needed)
    // Here we just simulate the process based on a condition
    const getQuestions = async () => {
      const subjectRatings = JSON.parse(localStorage.getItem("ratings")) || {}; // Get ratings from local storage

      const adjustedDifficulty =
        Object.values(subjectRatings).reduce((a, b) => a + b, 0) / 3;

      if (adjustedDifficulty >= 7) {
        setDifficulty("Hard");
        // Fetch hard questions or use predefined ones
      } else if (adjustedDifficulty >= 4) {
        setDifficulty("Medium");
        // Fetch medium questions
      } else {
        setDifficulty("Easy");
        // Fetch easy questions
      }

      // Simulate fetching questions based on difficulty
      setQuestions([
        `Question 1 (Difficulty: ${difficulty})`,
        `Question 2 (Difficulty: ${difficulty})`,
        `Question 3 (Difficulty: ${difficulty})`,
      ]);
    };

    getQuestions();
  }, [difficulty]);

  return (
    <div>
      <h2>Questions - {difficulty} Level</h2>
      <ul>
        {questions.map((question, index) => (
          <li key={index}>{question}</li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionsPage;
