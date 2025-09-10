import React from 'react';
import { ViewType } from '../types';

interface FooterProps {
    onNavigate: (view: ViewType) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    return (
        <footer className="py-8 px-4 mt-12">
            <div className="container mx-auto flex flex-col items-center gap-6">
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                    <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">About Us</button>
                    <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Contact</button>
                    <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
                    <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">Terms of Service</button>
                </div>
                <div className="w-full text-center pt-6 border-t border-slate-800 mt-6">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} Dream Pixel Technology. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
