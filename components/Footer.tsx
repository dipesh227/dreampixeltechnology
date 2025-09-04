import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { ConnectedAccount } from '../types';

interface FooterProps {
    dbStatus: 'connecting' | 'connected' | 'error';
    dbError: string | null;
    connectedAccounts: ConnectedAccount[];
}

const Footer: React.FC<FooterProps> = ({ dbStatus, dbError, connectedAccounts }) => {
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
        // Handle 'X' and 'X-Twitter' as the same platform for connection status
        if (platformName === 'X') {
            return connectedAccounts.some(acc => acc.platform === 'X' || acc.platform === 'X-Twitter');
        }
        return connectedAccounts.some(acc => acc.platform === platformName);
    };

    return (
        <footer className="py-6 px-4 border-t border-slate-800/50 mt-12">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
                <p className="text-sm text-slate-500 order-3 sm:order-1">
                    © {new Date().getFullYear()} Dream Pixel Technology. All rights reserved.
                </p>
                <div className="flex items-center gap-6 order-2 sm:order-2">
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
                <div className="flex items-center gap-2 order-1 sm:order-3" title={statusInfo[dbStatus].text}>
                    <div className={`w-2.5 h-2.5 rounded-full ${statusInfo[dbStatus].color} transition-colors`}></div>
                    <span className="text-xs text-slate-600">Database Status</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;