import React, { useState, useEffect } from 'react';
import { HiCheckCircle } from 'react-icons/hi2';

// A generic style type that covers all possible style objects.
interface Style {
    id: string;
    name: string;
    tags: string;
    imageUrl: string;
}

interface StyleSelectorProps {
    title: string;
    tooltip?: string;
    stylesData: { [key: string]: Style[] } | Style[];
    selectedStyleId: string;
    onStyleSelect: (id: string) => void;
}

const StyleCard: React.FC<{ style: Style; isSelected: boolean; onSelect: (id: string) => void; }> = ({ style, isSelected, onSelect }) => {
    return (
        <div
            onClick={() => onSelect(style.id)}
            className={`relative group cursor-pointer bg-slate-800/50 rounded-lg border-2 transition-all duration-200 overflow-hidden ${isSelected ? 'border-purple-500 shadow-lg shadow-purple-900/50' : 'border-slate-800 hover:border-slate-700 hover:-translate-y-1'}`}
        >
            <img src={style.imageUrl} alt={style.name} className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-105" />
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
    const categories = initialCategories.length > 1 ? initialCategories : [];

    const [activeCategory, setActiveCategory] = useState(categories[0] || initialCategories[0] || '');

    const stylesToDisplay = isCategorized ? (stylesData as { [key: string]: Style[] })[activeCategory] : (stylesData as Style[]);

    useEffect(() => {
        // When the selectedStyleId changes from the parent (e.g., from a template),
        // find which category it belongs to and make that category active.
        if (isCategorized) {
            for (const category of initialCategories) {
                if ((stylesData as { [key: string]: Style[] })[category]?.some(style => style.id === selectedStyleId)) {
                    if (activeCategory !== category) {
                        setActiveCategory(category);
                    }
                    break;
                }
            }
        }
    }, [selectedStyleId, isCategorized, initialCategories, stylesData, activeCategory]);
    

    return (
        <div className="p-4 md:p-6 main-content-area rounded-xl" data-tooltip={tooltip}>
            <h2 className="text-xl font-bold text-headings mb-4">{title}</h2>
            {categories.length > 0 && (
                 <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                     {categories.map(category => (
                        <button 
                            key={category} 
                            onClick={() => setActiveCategory(category)} 
                            className={`px-4 py-1.5 text-sm rounded-full transition-colors duration-200 ${activeCategory === category ? 'bg-primary-gradient text-white font-semibold' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-text-secondary dark:text-text-primary'}`}
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