import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { ConnectedAccount, ViewType } from '../types';

interface FooterProps {
    dbStatus: 'connecting' | 'connected' | 'error';
    dbError: string | null;
    connectedAccounts: ConnectedAccount[];
    onNavigate: (view: ViewType) => void;
}

const Footer: React.FC<FooterProps> = ({ dbStatus, dbError, connectedAccounts, onNavigate }) => {
    const statusInfo = {
        connecting: { color: 'bg-yellow-500 neon-yellow-pulse', text: 'Connecting to database...' },
        connected: { color: 'bg-green-500 neon-green', text: 'Database connection stable' },
        error: { color: 'bg-red-500 neon-red', text: dbError || 'Database connection failed' }
    };
    
    const socialLinks = [
        { Icon: FaXTwitter, name: 'X', hoverClass: 'x-hover' },
        { Icon: FaFacebookF, name: 'Facebook', hoverClass: 'facebook-hover' },
        { Icon: FaInstagram, name: 'Instagram', hoverClass: 'instagram-hover' },
        { Icon: FaLinkedinIn, name: 'LinkedIn', hoverClass: 'linkedin-hover' },
    ];

    const isConnected = (platformName: string) => {
        if (platformName === 'X') {
            return connectedAccounts.some(acc => acc.platform === 'X' || acc.platform === 'X-Twitter');
        }
        return connectedAccounts.some(acc => acc.platform === platformName);
    };

    return (
        <footer className="py-8 px-4 border-t border-slate-800/50 mt-12">
            <div className="container mx-auto flex flex-col items-center gap-6">
                <div className="flex items-center gap-6">
                    {socialLinks.map(({ Icon, name, hoverClass }) => (
                        <div
                            key={name}
                            className={`
                                text-slate-500 text-2xl transition-all duration-300
                                ${isConnected(name) ? 'text-green-400 neon-green' : hoverClass}
                            `}
                            data-tooltip={isConnected(name) ? `${name} Connected` : `Connect ${name}`}
                        >
                            <Icon />
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                    <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">About Us</button>
                    <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Contact</button>
                    <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
                    <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">Terms of Service</button>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-between pt-6 border-t border-slate-800/80 mt-6">
                    <p className="text-sm text-slate-500 order-2 sm:order-1">
                        © {new Date().getFullYear()} Dream Pixel Technology. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 order-1 sm:order-2" title={statusInfo[dbStatus].text}>
                        <div className={`w-2.5 h-2.5 rounded-full ${statusInfo[dbStatus].color} transition-colors`}></div>
                        <span className="text-xs text-slate-600">Database Status</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
