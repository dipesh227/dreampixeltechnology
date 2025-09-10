import React from 'react';
import HistorySidebar from './HistorySidebar';

interface ToolContainerProps {
    children: React.ReactNode;
}

const ToolContainer: React.FC<ToolContainerProps> = ({ children }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
            <div className="lg:col-span-2 xl:col-span-3">
                {children}
            </div>
            <aside className="hidden lg:block">
                <div className="sticky top-24">
                    <HistorySidebar />
                </div>
            </aside>
        </div>
    );
};

export default ToolContainer;
