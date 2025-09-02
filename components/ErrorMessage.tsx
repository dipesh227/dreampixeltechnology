import React from 'react';
import { HiOutlineKey } from 'react-icons/hi2';

interface ErrorMessageProps {
    error: string | null;
    onOpenSettings?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onOpenSettings }) => {
    if (!error) {
        return null;
    }

    const isApiError = 
        /rate limit|quota|api key|invalid key|billing/i.test(error);

    return (
        <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-6 max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <span className="flex-grow">{error}</span>
            {isApiError && onOpenSettings && (
                <button
                    onClick={onOpenSettings}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-red-400 text-slate-900 rounded-md hover:bg-red-300 transition-colors"
                >
                    <HiOutlineKey className="w-4 h-4" />
                    Configure API Key
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;
