import React from 'react';
import { InfoPage } from './InfoPage';

interface AboutUsProps {
    onNavigateHome: () => void;
}

export const AboutUs: React.FC<AboutUsProps> = ({ onNavigateHome }) => {
    return (
        <InfoPage title="About DreamPixel Technology" onNavigateHome={onNavigateHome}>
            <p><strong>Our Vision: Your Vision, Amplified by AI.</strong></p>
            <p>DreamPixel Technology was founded on a simple yet powerful idea: to democratize creativity. In a world where high-quality visual content is crucial for communication, we saw a gap between complex, expensive design software and the everyday needs of creators, marketers, and entrepreneurs. Our mission is to bridge that gap with an intuitive, powerful, and accessible AI-powered content creation suite.</p>
            
            <h2>Who We Are</h2>
            <p>We are a passionate team of engineers, designers, and AI specialists dedicated to building the future of digital content. We believe that state-of-the-art technology, like Google's Gemini AI, should be a tool for empowerment, enabling anyone to bring their creative vision to life without needing a degree in graphic design.</p>

            <h2>What We Do</h2>
            <p>Our platform offers a comprehensive suite of tools designed to handle a wide range of creative tasks, from generating click-worthy YouTube thumbnails to designing professional business cards and running entire social media campaigns. By building our tools on the advanced multimodal capabilities of Google Gemini, we ensure that our users get professional-grade results in a fraction of the time.</p>
            
            <h2>Our Commitment to You</h2>
            <p>Your privacy and security are paramount. We've built our platform with a security-first mindset, employing server-side encryption for your sensitive data and robust authentication to keep your work safe. We are committed to continuous improvement, constantly refining our tools and adding new features based on your feedback.</p>
            <p>Thank you for being a part of the DreamPixel community. We can't wait to see what you create.</p>
        </InfoPage>
    );
};

export default AboutUs;