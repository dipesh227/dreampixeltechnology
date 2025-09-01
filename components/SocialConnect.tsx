import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';

const SocialConnect: React.FC = () => {
    const socialLinks = [
        { Icon: FaXTwitter, name: 'X' },
        { Icon: FaFacebookF, name: 'Facebook' },
        { Icon: FaInstagram, name: 'Instagram' },
        { Icon: FaLinkedinIn, name: 'LinkedIn' },
    ];
    return (
        <div className="p-8 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl text-center">
            <h3 className="text-xl font-bold text-white mb-2">Connect Your Social Accounts</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">Enable one-click posting by connecting your social media profiles. Secure and easy to set up.</p>
            <div className="flex justify-center items-center gap-4">
                {socialLinks.map(({Icon, name}) => (
                    <button key={name} aria-label={`Connect ${name}`} className="p-3 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                        <Icon className="w-5 h-5" />
                    </button>
                ))}
            </div>
        </div>
    );
}

export default SocialConnect;