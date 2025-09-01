import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="text-center py-6 px-4 border-t border-slate-800/50 mt-12">
            <p className="text-sm text-slate-500">
                &copy; {new Date().getFullYear()} Dream Pixel Technology. All rights reserved.
            </p>
        </footer>
    );
};

export default Footer;
