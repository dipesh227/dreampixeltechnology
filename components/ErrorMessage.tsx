import React from 'react';

interface ErrorMessageProps {
    error: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
    if (!error) {
        return null;
    }

    return (
        <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-6 max-w-4xl mx-auto flex items-center justify-center gap-4 animate-fade-in">
            <span>{error}</span>
        </div>
    );
};

export default ErrorMessage;