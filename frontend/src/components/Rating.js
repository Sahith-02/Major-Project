// src/components/Rating.js
import React, { useState } from "react";

const Rating = ({ subject, onSubmitRating }) => {
  const [rating, setRating] = useState(0);

  const handleRatingChange = (e) => {
    setRating(e.target.value);
  };

  const handleSubmit = () => {
    onSubmitRating(subject, rating); // Pass the subject and rating to the parent
  };

  return (
    <div>
      <h3>{subject}</h3>
      <input
        type="number"
        value={rating}
        onChange={handleRatingChange}
        min="1"
        max="10"
        placeholder="Rate from 1 to 10"
      />
      <button onClick={handleSubmit}>Submit Rating</button>
    </div>
  );
};

export default Rating;
