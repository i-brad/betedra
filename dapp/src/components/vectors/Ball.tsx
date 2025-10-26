import React from "react";

const Ball = ({ className }: { className?: string }) => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g filter="url(#filter0_i_239_160)">
        <rect
          x="0.765625"
          y="0.659668"
          width="39.1702"
          height="39.1702"
          rx="19.5851"
          fill="#EBFAFF"
        />
        <g filter="url(#filter1_f_239_160)">
          <path
            d="M7.06055 12.5506C9.39771 6.62794 9.76194 6.93482 16.5034 5.55591"
            stroke="#00C6FF"
            strokeWidth="0.699468"
            strokeLinecap="round"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_i_239_160"
          x="0.765625"
          y="-0.739268"
          width="39.1699"
          height="40.5691"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-1.39894" />
          <feGaussianBlur stdDeviation="1.0492" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.579128 0 0 0 0 0.686968 0 0 0 0 0.718013 0 0 0 0.53 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_239_160"
          />
        </filter>
        <filter
          id="filter1_f_239_160"
          x="3.2136"
          y="1.70871"
          width="17.1373"
          height="14.689"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="1.74867"
            result="effect1_foregroundBlur_239_160"
          />
        </filter>
      </defs>
    </svg>
  );
};

export default Ball;
