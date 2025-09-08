import React from 'react';
import { InfoPage } from './InfoPage';

interface TermsOfServiceProps {
    onNavigateHome: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onNavigateHome }) => {
    return (
        <InfoPage title="Terms of Service" onNavigateHome={onNavigateHome}>
            <p><strong>Last updated: October 27, 2023</strong></p>
            <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the DreamPixel AI Content Creation Suite (the "Service") operated by DreamPixel Technology ("us", "we", or "our").</p>
            <p>Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who wish to access or use the Service.</p>

            <h2>Accounts</h2>
            <p>When you create an account with us, you guarantee that you are above the age of 13, and that the information you provide us is accurate, complete, and current at all times. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>
            
            <h2>Content</h2>
            <p>Our Service allows you to create, post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you create on the Service, including its legality, reliability, and appropriateness.</p>
            <p>By using this Service, you understand that you are interacting with an AI model. You agree not to knowingly use the Service to create content that is harmful, illegal, or violates the safety policies of Google's Gemini models.</p>
            
            <h2>Intellectual Property</h2>
            <p>You retain any and all of your rights to any Content you create or make available on or through the Service. We claim no ownership rights over your Content. The Service itself and its original content (excluding Content created by users), features, and functionality are and will remain the exclusive property of DreamPixel Technology.</p>

            <h2>Termination</h2>
            <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</p>

            <h2>Changes</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
            
            <h2>Contact Us</h2>
            <p>If you have any questions about these Terms, please <a href="/#contact">contact us</a>.</p>
        </InfoPage>
    );
};

export default TermsOfService;
