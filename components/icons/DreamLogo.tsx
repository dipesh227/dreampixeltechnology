import React from 'react';

export const DreamLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 180 42" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="dream-gradient-gold" x1="0" y1="0" x2="1" y2="1">
                <stop id="gold-stop-1" offset="0%" stopColor="#F5D1A2"/>
                <stop id="gold-stop-2" offset="50%" stopColor="#C89B6C"/>
                <stop id="gold-stop-3" offset="100%" stopColor="#A0764C"/>
            </linearGradient>
        </defs>
        <text 
            x="0" 
            y="28" 
            fontFamily="Inter, sans-serif" 
            fontSize="28" 
            fontWeight="800"
            fill="url(#dream-gradient-gold)"
        >
            Dream
        </text>
         <text 
            x="100" 
            y="28" 
            fontFamily="Inter, sans-serif" 
            fontSize="28" 
            fontWeight="800"
            fill="#a5b4fc" // indigo-300
        >
            Pixel
        </text>
         <text 
            x="101" 
            y="40" 
            fontFamily="Inter, sans-serif" 
            fontSize="9" 
            fontWeight="500"
            fill="#94a3b8" // slate-400
            letterSpacing="0.05em"
        >
            TECHNOLOGY
        </text>
    </svg>
);