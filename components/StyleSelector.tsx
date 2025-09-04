import React, { useState, useEffect } from 'react';
import { HiCheckCircle } from 'react-icons/hi2';

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

const StyleCard: React.FC<{ style: Style; isSelected: boolean; onSelect: (id: string) => void; }> = ({ style, isSelected, onSelect }) => {
    // Generate a simple hash for a color to make placeholders visually distinct
    const getBgColor = (name: string) => {
        let hash = 0;
        if (name.length === 0) return '808080';
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash; // Convert to 32bit integer
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return "00000".substring(0, 6 - c.length) + c;
    };

    const bgColor = getBgColor(style.name);
    const placeholderUrl = `https://placehold.co/300x200/${bgColor}/FFFFFF?text=${encodeURIComponent(style.name)}&font=inter`;

    return (
        <div
            onClick={() => onSelect(style.id)}
            className={`relative group cursor-pointer bg-slate-800/50 rounded-lg border-2 transition-all duration-200 overflow-hidden ${isSelected ? 'border-purple-500 shadow-lg shadow-purple-900/50' : 'border-slate-800 hover:border-slate-700 hover:-translate-y-1'}`}
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
    const isCategorized = !Array.isArray(stylesData);
    const initialCategories = isCategorized ? Object.keys(stylesData) : [];
    // Special case for logo styles which has one category "general" - don't show tabs for it.
    const categories = initialCategories.length > 1 ? initialCategories : [];

    const [activeCategory, setActiveCategory] = useState(categories[0] || initialCategories[0] || '');

    const stylesToDisplay = isCategorized ? (stylesData as { [key: string]: Style[] })[activeCategory] : (stylesData as Style[]);

    useEffect(() => {
        // When the selectedStyleId changes from the parent (e.g., from a template),
        // find which category it belongs to and make that category active.
        if (isCategorized) {
            for (const category of initialCategories) {
                if ((stylesData as { [key: string]: Style[] })[category]?.some(style => style.id === selectedStyleId)) {
                    setActiveCategory(category);
                    break;
                }
            }
        }
    }, [selectedStyleId, isCategorized, initialCategories, stylesData]);
    

    return (
        <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl" data-tooltip={tooltip}>
            <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
            {categories.length > 0 && (
                 <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-800 pb-4">
                     {categories.map(category => (
                        <button 
                            key={category} 
                            onClick={() => setActiveCategory(category)} 
                            className={`px-4 py-1.5 text-sm rounded-full transition-colors duration-200 ${activeCategory === category ? 'bg-primary-gradient text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700'}`}
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
