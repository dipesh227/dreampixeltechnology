import React from 'react';

interface FooterProps {
    dbStatus: 'connecting' | 'connected' | 'error';
    dbError: string | null;
}

const Footer: React.FC<FooterProps> = ({ dbStatus, dbError }) => {
    const statusInfo = {
        connecting: { color: 'bg-yellow-500 animate-pulse', text: 'Connecting to database...' },
        connected: { color: 'bg-green-500', text: 'Database connection stable' },
        error: { color: 'bg-red-500', text: dbError || 'Database connection failed' }
    };

    return (
        <footer className="py-6 px-4 border-t border-slate-800/50 mt-12">
            <div className="container mx-auto flex flex-col sm:flex-row justify-center items-center gap-4">
                <p className="text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} Dream Pixel Technology. All rights reserved.
                </p>
                <div className="flex items-center gap-2" title={statusInfo[dbStatus].text}>
                    <div className={`w-2.5 h-2.5 rounded-full ${statusInfo[dbStatus].color} transition-colors`}></div>
                    <span className="text-xs text-slate-600 hidden sm:inline">Database Status</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;