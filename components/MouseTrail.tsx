import React, { useState, useEffect } from 'react';

const MouseTrail: React.FC = () => {
    const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPoints(prevPoints => {
                const newPoints = [...prevPoints, { x: e.clientX, y: e.clientY }];
                // Keep the trail at a reasonable length
                if (newPoints.length > 20) {
                    return newPoints.slice(newPoints.length - 20);
                }
                return newPoints;
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <>
            {points.map((point, index) => (
                <div
                    key={index}
                    className="mouse-trail-dot"
                    style={{
                        left: `${point.x}px`,
                        top: `${point.y}px`,
                        width: `${Math.max(2, 10 - (points.length - index) * 0.5)}px`,
                        height: `${Math.max(2, 10 - (points.length - index) * 0.5)}px`,
                        opacity: `${(index / points.length) * 0.5}`,
                    }}
                />
            ))}
        </>
    );
};

export default MouseTrail;