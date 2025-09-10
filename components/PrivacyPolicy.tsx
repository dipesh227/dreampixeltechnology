

import React from 'react';
import { InfoPage } from './InfoPage';
import { ViewType } from '../types';

interface PrivacyPolicyProps {
    onNavigateHome: () => void;
    onNavigate: (view: ViewType) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigateHome, onNavigate }) => {
    return (
        <InfoPage title="Privacy Policy" onNavigateHome={onNavigateHome}>
            <p><strong>Last updated: October 27, 2023</strong></p>
            <p>DreamPixel Technology ("us", "we", or "our") operates the DreamPixel AI Content Creation Suite (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>
            
            <h2>Information Collection and Use</h2>
            <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
            <h3>Types of Data Collected</h3>
            <ul>
                <li><strong>Personal Data:</strong> While using our Service, specifically when you sign in, we collect the Personal Data provided by our authentication provider (Google). This includes your Email address, Full Name, and Avatar URL.</li>
                <li><strong>Usage Data:</strong> We may also collect information on how the Service is accessed and used ("Usage Data"). This may include your IP address, browser type, and general usage patterns to help us improve the service.</li>
                <li><strong>User-Generated Content:</strong> We store the content you choose to save, such as "Liked Creations," which includes the generated image and the associated prompt. To protect your privacy, all sensitive text data (prompts, feedback) is encrypted at rest in our database using industry-standard `pgsodium` encryption.</li>
            </ul>

            <h2>Use of Data</h2>
            <p>DreamPixel Technology uses the collected data for various purposes:</p>
            <ul>
                <li>To provide and maintain our Service, including personalized features like your creation history.</li>
                <li>To notify you about changes to our Service.</li>
                <li>To gather analysis or valuable information so that we can improve our Service.</li>
                <li>To monitor the usage of our Service to prevent fraud and abuse.</li>
                <li>To detect, prevent and address technical issues.</li>
            </ul>

            <h2>Data Security</h2>
            <p>The security of your data is a top priority. We use server-side encryption for all sensitive user-generated text. While we strive to use commercially acceptable means to protect your Personal Data, no method of transmission over the Internet or method of electronic storage is 100% secure. We cannot guarantee its absolute security.</p>
            
            <h2>Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

            <h2>Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please <button onClick={() => onNavigate('contact')} className="font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-colors">contact us</button>.</p>
        </InfoPage>
    );
};

export default PrivacyPolicy;
