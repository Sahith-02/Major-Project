import React from 'react';
import './Slider.css';

const Slider = ({ value, onChange, min = 1, max = 10, className = '' }) => {
  return (
    <div className="rating-control">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="range-slider"
      />
      <span className="range-value">{value}</span>
    </div>
  );
};

export default Slider;