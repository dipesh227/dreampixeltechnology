
import React from 'react';

export const DreamLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 480 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="icon-grad-blue" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#0ea5e9"/>
        <stop offset="100%" stopColor="#2563eb"/>
      </linearGradient>
      <linearGradient id="icon-grad-yellow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#facc15"/>
        <stop offset="100%" stopColor="#fbbf24"/>
      </linearGradient>
    </defs>
    
    <g>
      <path d="M48 0H12C5.373 0 0 5.373 0 12V88C0 94.627 5.373 100 12 100H48V0Z" fill="url(#icon-grad-blue)"/>
      <path d="M48 0H80C96.569 0 110 13.431 110 30V70C110 86.569 96.569 100 80 100H48V0ZM80 20C85.523 20 90 24.477 90 30V70C90 75.523 85.523 80 80 80H68V20H80Z" fill="url(#icon-grad-yellow)"/>
      <circle cx="24" cy="20" r="4" fill="#60a5fa"/>
      <path d="M24 24V40H36" stroke="#60a5fa" strokeWidth="3" fill="none"/>
      <circle cx="36" cy="40" r="4" fill="#60a5fa"/>
      <circle cx="24" cy="80" r="4" fill="#60a5fa"/>
      <path d="M24 76V60H36" stroke="#60a5fa" strokeWidth="3" fill="none"/>
      <circle cx="36" cy="60" r="4" fill="#60a5fa"/>
      <circle cx="79" cy="35" r="4" fill="#fde047"/>
      <circle cx="79" cy="65" r="4" fill="#fde047"/>
    </g>

    <g transform="translate(135, 0)">
      <text x="0" y="60" fontFamily="Inter, sans-serif" fontSize="42" fontWeight="800" className="fill-text-headings">
        DreamPixel
      </text>
      <text x="0" y="88" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="500" className="fill-text-secondary" letterSpacing="2">
        TECHNOLOGY
      </text>
    </g>
  </svg>
);