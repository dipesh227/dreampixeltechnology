import React from 'react';

export const PhotoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
  </svg>
);

// FIX: Corrected truncated SVG path data.
export const MegaphoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 15c0 0-4.5 3-5.5 3-.356 0-.67-.223-.832-.534a.984.984 0 0 1 .246-1.171c1.55-1.29 3.012-2.583 4-3.5.348-.32.682-.66.974-1.002.292-.341.536-.714.72-1.124.184-.409.286-.86.286-1.33 0-1.22-.656-2.31-1.688-2.92C5.642 8.92 5.392 8.508 5.392 8.055V4.5c0-.414.336-.75.75-.75.351 0 .67.223.826.533 1.58 3.036 3.012 5.92 4.418 8.497.472.855.714 1.83.714 2.822 0 .928-.225 1.83-.674 2.628-.448.798-1.07 1.51-1.858 2.06-.788.55-1.722.86-2.73.86-.598 0-1.17-.1-1.59-.288" />
  </svg>
);

// FIX: Added missing ShareIcon component.
export const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.75 15.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.25 8.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.25 9.75-4.5 3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 12.75-3-1.5" />
    </svg>
);

// FIX: Added missing UserGroupIcon component.
export const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-4.663M15 12.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);
