// src/components/SubjectRating.js
import React from "react";
import Rating from "./Rating";

const SubjectRating = ({ onSubmitRating }) => {
  return (
    <div>
      <h2>Rate Your Understanding</h2>
      <Rating subject="OOPs" onSubmitRating={onSubmitRating} />
      <Rating subject="DBMS" onSubmitRating={onSubmitRating} />
      <Rating subject="Operating Systems" onSubmitRating={onSubmitRating} />
    </div>
  );
};

export default SubjectRating;
