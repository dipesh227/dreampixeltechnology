

import React from 'react';
import { ToolType, TemplatePrefillData } from '../types';
import { TEMPLATES } from '../services/templates';
import { HiOutlineXMark, HiOutlineCheck } from 'react-icons/hi2';

interface TemplateBrowserProps {
    tool: ToolType;
    onClose: () => void;
    onSelect: (prefillData: TemplatePrefillData) => void;
}

const TemplateBrowser: React.FC<TemplateBrowserProps> = ({ tool, onClose, onSelect }) => {
    const filteredTemplates = TEMPLATES.filter(t => t.tool === tool);

    const handleSelect = (prefillData: TemplatePrefillData) => {
        onSelect(prefillData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
                    <h2 className="text-lg font-bold text-white">Choose a Template</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">
                        <HiOutlineXMark className="w-6 h-6 icon-hover-effect"/>
                    </button>
                </header>

                <main className="p-6 overflow-y-auto">
                    {filteredTemplates.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredTemplates.map(template => (
                                <div key={template.id} className="group relative cursor-pointer" onClick={() => handleSelect(template.prefill)}>
                                    <img src={template.imageUrl} alt={template.name} className="w-full h-auto object-cover rounded-lg border-2 border-slate-800 group-hover:border-purple-500 transition-all duration-200" />
                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center rounded-lg">
                                        <HiOutlineCheck className="w-10 h-10 text-green-400 mb-2"/>
                                        <p className="font-bold text-white">{template.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-10">No templates available for this tool yet.</p>
                    )}
                </main>
            </div>
        </div>
    );
};

export default TemplateBrowser;