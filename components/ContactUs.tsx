import React from 'react';
import { InfoPage } from './InfoPage';

interface ContactUsProps {
    onNavigateHome: () => void;
}

export const ContactUs: React.FC<ContactUsProps> = ({ onNavigateHome }) => {
    return (
        <InfoPage title="Contact Us" onNavigateHome={onNavigateHome}>
            <p>We'd love to hear from you! Whether you have a question about our features, a suggestion for a new tool, or need assistance, we're here to help.</p>
            
            <h2>General Inquiries</h2>
            <p>For general questions, partnerships, or media inquiries, please reach out to us at:</p>
            <p><strong>Email:</strong> <a href="mailto:info@dreampixeltechnology.in">info@dreampixeltechnology.in</a></p>

            <h2>Feedback & Suggestions</h2>
            <p>Your feedback is invaluable in helping us improve DreamPixel. If you have any ideas, feature requests, or comments on your experience, please use the "Share Feedback" button in the header of our application. This is the fastest way to get your thoughts directly to our product team.</p>

            <h2>Technical Support</h2>
            <p>If you're experiencing a technical issue with our service, please contact our support team with a detailed description of the problem, and we'll get back to you as soon as possible.</p>
            <p><strong>Email:</strong> <a href="mailto:support@dreampixeltechnology.in">support@dreampixeltechnology.in</a></p>
            
            <h2>Mailing Address</h2>
            <p>
                DreamPixel Technology<br />
                123 AI Avenue<br />
                Tech City, 560001<br />
                India
            </p>
        </InfoPage>
    );
};

export default ContactUs;
