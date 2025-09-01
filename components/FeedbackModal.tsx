import React, { useState } from 'react';
import { ChatBubbleLeftEllipsisIcon, XMarkIcon } from './icons/UiIcons';
import { supabase } from '../services/supabaseClient';

interface FeedbackModalProps {
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const { error } = await supabase
                .from('feedback')
                .insert([{ content: feedback.trim() }]);

            if (error) throw error;
            
            setIsSubmitted(true);
            setTimeout(() => {
                onClose();
            }, 2000);

        } catch (err) {
            console.error('Error submitting feedback:', err);
            setError('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-slate-400"/>
                        <h2 className="text-lg font-bold text-white">Share Your Feedback</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white">
                        <XMarkIcon className="w-6 h-6"/>
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
                             {error && <p className="text-sm text-red-400 bg-red-900/30 p-3 rounded-lg">{error}</p>}
                            <div>
                                <label htmlFor="feedback-textarea" className="font-semibold text-slate-300">Your Feedback</label>
                                <p className="text-sm text-slate-500 mb-2">We'd love to hear your thoughts on what's working well and what we can improve.</p>
                                <textarea
                                    id="feedback-textarea"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Tell us about your experience..."
                                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-slate-600 transition text-sm"
                                    rows={5}
                                    required
                                    disabled={isSubmitting}
                                ></textarea>
                            </div>
                        </main>
                        
                        <footer className="flex justify-end gap-3 p-4 bg-slate-900/50 border-t border-slate-800 rounded-b-2xl">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-slate-700/50 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">Cancel</button>
                            <button type="submit" disabled={!feedback.trim() || isSubmitting} className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed">
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