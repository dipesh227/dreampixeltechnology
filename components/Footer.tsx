
import React from 'react';
import { ViewType } from '../types';
import { DreamLogo } from './icons/DreamLogo';
import { useLocalization } from '../hooks/useLocalization';

interface FooterProps {
    onNavigate: (view: ViewType) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    const { t } = useLocalization();

    return (
        <footer className="py-12 px-4 mt-16 bg-slate-900/50 border-t border-slate-800">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col items-center md:items-start">
                    <DreamLogo className="h-12 w-auto mb-2" />
                    <p className="text-sm text-slate-500">{t('landing.title1')} {t('landing.title2')}.</p>
                </div>
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                    <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">{t('footer.about')}</button>
                    <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">{t('footer.contact')}</button>
                    <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">{t('footer.privacy')}</button>
                    <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">{t('footer.terms')}</button>
                </div>
            </div>
            <div className="container mx-auto text-center pt-8 border-t border-slate-800 mt-8">
                <p className="text-sm text-slate-500">
                    {t('footer.copyright', { year: new Date().getFullYear() })}
                </p>
            </div>
        </footer>
    );
};

export default Footer;
