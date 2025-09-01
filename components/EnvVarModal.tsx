import React from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

const EnvVarModal: React.FC = () => {
    const envFileContent = `VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"`;

    return (
        <div className="min-h-screen animated-bg flex items-center justify-center p-4">
            <div className="bg-slate-900/80 backdrop-blur-lg border border-red-500/50 rounded-2xl shadow-2xl w-full max-w-2xl p-8 text-center animate-fade-in">
                <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-900/50 border-2 border-red-500 rounded-full mb-6">
                    <HiOutlineExclamationTriangle className="w-10 h-10 text-red-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">Configuration Missing</h1>
                <p className="text-slate-400 mb-6 max-w-lg mx-auto">
                    This application requires Supabase credentials to function correctly. The necessary environment variables were not found.
                </p>
                <div className="text-left bg-slate-950 p-6 rounded-lg border border-slate-700">
                    <p className="text-slate-300 font-semibold mb-3">Please create a <code className="bg-slate-700 text-amber-300 px-1.5 py-0.5 rounded">.env</code> file in the project's root directory and add the following variables:</p>
                    <pre className="bg-slate-800 p-4 rounded-md text-slate-400 overflow-x-auto">
                        <code>
                            {envFileContent}
                        </code>
                    </pre>
                    <p className="text-sm text-slate-500 mt-4">
                        You can find these keys in your Supabase project dashboard under <span className="font-semibold text-slate-400">Project Settings &gt; API</span>.
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
