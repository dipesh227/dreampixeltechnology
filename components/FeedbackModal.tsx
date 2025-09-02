import React, { useState } from 'react';
import { HiOutlineChatBubbleLeftEllipsis, HiOutlineXMark } from 'react-icons/hi2';
import * as feedbackService from '../services/feedbackService';
import { useAuth } from '../context/AuthContext';

interface FeedbackModalProps {
    onClose: () => void;
}

const MAX_FEEDBACK_LENGTH = 2000;

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
    const { session } = useAuth();
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newFeedback = e.target.value;
        // Prevent user from typing past the max length
        if (newFeedback.length <= MAX_FEEDBACK_LENGTH) {
            setFeedback(newFeedback);
        }
        
        // Clear validation error as user types
        if (validationError) {
            setValidationError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const trimmedFeedback = feedback.trim();

        if (trimmedFeedback.length < 10) {
            setValidationError('Please provide at least 10 characters of feedback.');
            return;
        }

        if (trimmedFeedback.length > MAX_FEEDBACK_LENGTH) {
            setValidationError(`Feedback cannot exceed ${MAX_FEEDBACK_LENGTH} characters.`);
            return;
        }

        setIsSubmitting(true);
        setApiError(null);
        setValidationError(null);

        try {
            await feedbackService.submitFeedback(
                trimmedFeedback,
                session?.user?.id || null
            );
            
            setIsSubmitted(true);
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err) {
            console.error('Error submitting feedback:', err);
            setApiError(err instanceof Error ? err.message : 'Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <HiOutlineChatBubbleLeftEllipsis className="w-6 h-6 text-pink-400"/>
                        <h2 className="text-lg font-bold text-white">Share Your Feedback</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">
                        <HiOutlineXMark className="w-6 h-6 icon-hover-effect"/>
                    </button>
                </header>

                {isSubmitted ? (
                    <div className="p-10 text-center">
                        <h3 className="text-xl font-bold text-white">Thank you!</h3>
                        <p className="text-slate-400 mt-2">Your feedback has been received.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <main className="p-6 space-y-4">
                             {apiError && <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-lg">{apiError}</p>}
                            <div>
                                <label htmlFor="feedback-textarea" className="font-semibold text-slate-300">Your Feedback</label>
                                <p className="text-sm text-slate-500 mb-2">We'd love to hear your thoughts on what's working well and what we can improve.</p>
                                <textarea
                                    id="feedback-textarea"
                                    value={feedback}
                                    onChange={handleFeedbackChange}
                                    placeholder="Tell us about your experience..."
                                    className={`w-full p-3 bg-slate-800 border rounded-lg focus:ring-2 focus:border-purple-500 transition text-sm ${validationError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-purple-500'}`}
                                    rows={5}
                                    required
                                    disabled={isSubmitting}
                                    aria-invalid={!!validationError}
                                    aria-describedby="feedback-error feedback-char-count"
                                ></textarea>
                                <div className="flex justify-between items-start mt-1 text-xs">
                                    {validationError && (
                                        <p id="feedback-error" className="text-red-400" role="alert">
                                            {validationError}
                                        </p>
                                    )}
                                    <p id="feedback-char-count" className={`ml-auto ${feedback.length > MAX_FEEDBACK_LENGTH ? 'text-red-400' : 'text-slate-500'}`}>
                                        {feedback.length}/{MAX_FEEDBACK_LENGTH}
                                    </p>
                                </div>
                            </div>
                        </main>
                        
                        <footer className="flex justify-end gap-3 p-4 bg-slate-950/30 border-t border-slate-800 rounded-b-2xl">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold bg-primary-gradient text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed">
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </footer>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;