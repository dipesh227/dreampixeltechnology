import React from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { areSupabaseKeysSet } from '../services/supabaseClient';
import { isDefaultApiKeySet } from '../services/apiConfigService';

const EnvVarModal: React.FC = () => {
    const isSupabaseSet = areSupabaseKeysSet();
    const isGeminiSet = isDefaultApiKeySet();

    const missingVars: string[] = [];
    if (!isGeminiSet) {
        missingVars.push('# Get a free key from Google AI Studio: https://aistudio.google.com/app/apikey');
        missingVars.push('VITE_API_KEY="YOUR_GEMINI_API_KEY"');
    }
    if (!isSupabaseSet) {
        if(missingVars.length > 0) missingVars.push(''); // Add a newline for separation
        missingVars.push('# Get these from your Supabase project dashboard -> Settings -> API');
        missingVars.push('VITE_SUPABASE_URL="YOUR_SUPABASE_URL"');
        missingVars.push('VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"');
    }

    const envFileContent = missingVars.join('\n');

    return (
        <div className="min-h-screen animated-bg flex items-center justify-center p-4">
            <div className="bg-slate-900/80 backdrop-blur-lg border border-red-500/50 rounded-2xl shadow-2xl w-full max-w-2xl p-8 text-center animate-fade-in">
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-900/50 border-2 border-red-500 rounded-full mb-6">
                    <HiOutlineExclamationTriangle className="w-10 h-10 text-red-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">Configuration Required</h1>
                <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                    The application is missing one or more required API keys. Please create a <code className="bg-slate-700 text-amber-300 px-1.5 py-0.5 rounded">.env</code> file in the project root and add the following content.
                </p>
                <div className="text-left bg-slate-950 p-6 rounded-lg border border-slate-700">
                    <pre className="bg-slate-800 p-4 rounded-md text-slate-400 overflow-x-auto">
                        <code>
                            {envFileContent}
                        </code>
                    </pre>
                    <p className="text-sm text-slate-500 mt-4">
                        Refer to the README for detailed links and instructions on where to find these keys.
                    </p>
                </div>
                 <p className="text-slate-400 mt-8">
                    After creating or updating the <code className="bg-slate-700 text-amber-300 px-1.5 py-0.5 rounded">.env</code> file, you must <span className="font-bold text-white">restart the development server</span> for the changes to take effect.
                </p>
            </div>
        </div>
    );
};

export default EnvVarModal;
