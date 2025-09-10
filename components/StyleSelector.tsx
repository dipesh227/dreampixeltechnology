import React, { useState, useEffect } from 'react';
import { HiCheckCircle } from 'react-icons/hi2';
import { useLocalization } from '../hooks/useLocalization';

// A generic style type that covers all possible style objects.
interface Style {
    id: string;
    name: string;
    tags: string;
}

interface StyleSelectorProps {
    title: string;
    tooltip?: string;
    stylesData: { [key: string]: Style[] } | Style[];
    selectedStyleId: string;
    onStyleSelect: (id: string) => void;
}

// Generates a unique, abstract SVG placeholder for each style card
const generateSvgPlaceholder = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c1 = (hash & 0x00FFFFFF).toString(16).padStart(6, '0');
    const c2 = ((hash >> 8) & 0x00FFFFFF).toString(16).padStart(6, '0');
    const angle = hash % 360;
    const svg = `<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad-${c1}" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle})">
                <stop offset="0%" style="stop-color:#${c1}" />
                <stop offset="100%" style="stop-color:#${c2}" />
            </linearGradient>
            <filter id="blur">
                <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="3" result="turb" />
                <feComposite operator="in" in="turb" in2="SourceGraphic" result="comp" />
                <feColorMatrix in="comp" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 20 -10" />
            </filter>
        </defs>
        <rect width="300" height="200" fill="url(#grad-${c1})" />
        <rect width="300" height="200" fill="transparent" filter="url(#blur)" opacity="0.5" />
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const StyleCard: React.FC<{ style: Style; isSelected: boolean; onSelect: (id: string) => void; }> = ({ style, isSelected, onSelect }) => {
    const placeholderUrl = generateSvgPlaceholder(style.name);

    return (
        <div
            onClick={() => onSelect(style.id)}
            className={`relative group cursor-pointer bg-slate-800/50 rounded-lg border-2 transition-all duration-200 overflow-hidden ${isSelected ? 'border-purple-500 shadow-lg shadow-purple-900/30' : 'border-slate-800 hover:border-slate-700 hover:-translate-y-1'}`}
        >
            <img src={placeholderUrl} alt={style.name} className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="p-3">
                <p className="font-bold text-white text-sm truncate">{style.name}</p>
                <p className="text-xs text-slate-400 truncate">{style.tags}</p>
            </div>
            {isSelected && (
                <div className="absolute top-2 right-2 text-purple-400 bg-slate-900 rounded-full">
                    <HiCheckCircle className="w-6 h-6" />
                </div>
            )}
        </div>
    );
};


const StyleSelector: React.FC<StyleSelectorProps> = ({ title, tooltip, stylesData, selectedStyleId, onStyleSelect }) => {
    const { t } = useLocalization();
    const isCategorized = !Array.isArray(stylesData);
    const initialCategories = isCategorized ? Object.keys(stylesData) : [];
    const categories = initialCategories.length > 1 && initialCategories[0] !== 'general' ? initialCategories : [];

    const [activeCategory, setActiveCategory] = useState(categories[0] || initialCategories[0] || '');

    const stylesToDisplay = isCategorized ? (stylesData as { [key: string]: Style[] })[activeCategory] : (stylesData as Style[]);

    useEffect(() => {
        if (isCategorized) {
            for (const category of initialCategories) {
                if ((stylesData as { [key: string]: Style[] })[category]?.some(style => style.id === selectedStyleId)) {
                    if (category !== activeCategory) {
                        setActiveCategory(category);
                    }
                    break;
                }
            }
        }
    }, [selectedStyleId, isCategorized, initialCategories, stylesData, activeCategory]);
    
    const handleCategoryClick = (category: string) => {
        setActiveCategory(category);
        const newStyles = (stylesData as { [key: string]: Style[] })[category];
        if (newStyles && newStyles.length > 0) {
            onStyleSelect(newStyles[0].id);
        }
    };

    return (
        <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-800 rounded-xl" data-tooltip={tooltip}>
            <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
            {categories.length > 0 && (
                 <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-800 pb-4">
                     {categories.map(category => (
                        <button 
                            key={category} 
                            onClick={() => handleCategoryClick(category)} 
                            className={`px-4 py-1.5 text-sm rounded-full transition-colors duration-200 ${activeCategory === category ? 'bg-purple-600 text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                        >
                           {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </button>
                     ))}
                 </div>
            )}
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {stylesToDisplay && stylesToDisplay.map(style => (
                    <StyleCard 
                        key={style.id} 
                        style={style} 
                        isSelected={selectedStyleId === style.id} 
                        onSelect={onStyleSelect} 
                    />
                ))}
             </div>
        </div>
    );
};

export default StyleSelector;
