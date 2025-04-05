import React from 'react';
import './Input.css';

const Input = ({ multiline, rows = 4, className = '', ...props }) => {
  if (multiline) {
    return (
      <textarea
        className={`input multiline ${className}`}
        rows={rows}
        {...props}
      />
    );
  }
  return <input className={`input ${className}`} {...props} />;
};

export default Input;