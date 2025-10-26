import React from "react";

const TimeIcon = () => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.5 9C1.5 13.1421 4.85786 16.5 9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5"
        stroke="#667085"
        strokeLinecap="round"
      />
      <path
        d="M9 6.75V9.75H12"
        stroke="#667085"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="9"
        cy="9"
        r="7.5"
        stroke="#667085"
        strokeLinecap="round"
        strokeDasharray="0.5 3.5"
      />
    </svg>
  );
};

export default TimeIcon;
