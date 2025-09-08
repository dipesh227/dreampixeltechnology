
import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import { HiCheck } from 'react-icons/hi2';
import { ConnectedAccount } from '../types';

interface SocialConnectProps {
    connectedAccounts: ConnectedAccount[];
    onToggleConnect: (platform: string) => void;
}

const SocialConnect: React.FC<SocialConnectProps> = ({ connectedAccounts, onToggleConnect }) => {
    const socialLinks = [
        { Icon: FaXTwitter, name: 'X', hoverClass: 'x-hover' },
        { Icon: FaFacebookF, name: 'Facebook', hoverClass: 'facebook-hover' },
        { Icon: FaInstagram, name: 'Instagram', hoverClass: 'instagram-hover' },
        { Icon: FaLinkedinIn, name: 'LinkedIn', hoverClass: 'linkedin-hover' },
    ];

    const hasConnections = connectedAccounts.length > 0;

    return (
        <div className="p-8 main-content-area rounded-xl text-center">
            <h3 className="text-xl font-bold text-headings mb-2">
                {hasConnections ? "You're Connected!" : "Connect Your Social Accounts"}
            </h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
                {hasConnections 
                    ? `You have connected ${connectedAccounts.length} account(s). You can now leverage one-click posting in the Social Media Post Generator.`
                    : "Enable one-click posting by connecting your social media profiles. Secure and easy to set up."
                }
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4">
                {socialLinks.map(({Icon, name, hoverClass}) => {
                    const isConnected = connectedAccounts.some(acc => acc.platform === name);
                    return (
                        <button 
                            key={name} 
                            aria-label={`${isConnected ? 'Disconnect' : 'Connect'} ${name}`} 
                            onClick={() => onToggleConnect(name)}
                            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-300
                                ${isConnected 
                                    ? 'bg-green-500/10 border-green-500/50 text-green-500 dark:text-green-400' 
                                    : `bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 ${hoverClass}`
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{name}</span>
                            {isConnected && <HiCheck className="w-5 h-5" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default SocialConnect;