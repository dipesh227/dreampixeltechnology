import React from 'react';

export const DreamLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 240 50" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="logo-grad-1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a855f7" /> 
                <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="logo-grad-2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
        </defs>
        
        {/* Icon */}
        <g>
            <path d="M8 8H24V16H8V8Z" fill="url(#logo-grad-1)"/>
            <path d="M8 16H16V32H8V16Z" fill="url(#logo-grad-1)"/>
            <path d="M8 32H24V40H8V32Z" fill="url(#logo-grad-1)"/>
            <path d="M24 8H32V16H24V8Z" fill="url(#logo-grad-2)"/>
            <path d="M16 32H24V40H16V32Z" fill="url(#logo-grad-2)"/>
            <path d="M24 16H40V32H24V16Z" fill="url(#logo-grad-2)"/>
        </g>

        {/* Text */}
        <text 
            x="52" 
            y="34" 
            fontFamily="'Inter', sans-serif"
            fontSize="28" 
            fontWeight="800"
            fill="#e2e8f0"
        >
            DreamPixel
        </text>
    </svg>
);