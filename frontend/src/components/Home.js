// src/components/Home.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState({ oop: 0, dbms: 0, os: 0 });

  const handleRatingChange = (subject, value) => {
    setRating({ ...rating, [subject]: value });
  };

  const handleSubmit = () => {
    const sortedSubjects = Object.entries(rating)
      .sort(([, a], [, b]) => b - a)
      .map(([subject]) => subject);

    navigate("/questions", { state: { sortedSubjects, rating } });
  };

  return (
    <div>
      <h1>Rate Your Understanding</h1>
      <div>
        <h2>OOP</h2>
        <input
          type="number"
          value={rating.oop}
          onChange={(e) => handleRatingChange("oop", e.target.value)}
          min="0"
          max="10"
        />
      </div>
      <div>
        <h2>DBMS</h2>
        <input
          type="number"
          value={rating.dbms}
          onChange={(e) => handleRatingChange("dbms", e.target.value)}
          min="0"
          max="10"
        />
      </div>
      <div>
        <h2>Operating Systems</h2>
        <input
          type="number"
          value={rating.os}
          onChange={(e) => handleRatingChange("os", e.target.value)}
          min="0"
          max="10"
        />
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default Home;
