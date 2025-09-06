import React, { useState, useCallback, useEffect } from 'react';
import { AdStyle, AspectRatio, UploadedFile, GeneratedConcept, TemplatePrefillData } from '../types';
import { generateAdConcepts, generateAdBanner, editImage } from '../services/aiService';
import { AD_STYLES } from '../services/constants';
import * as historyService from '../services/historyService';
import * as jobService from '../services/jobService';
import { HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowUpTray, HiXMark, HiOutlineDocumentText, HiOutlineChatBubbleLeftRight, HiOutlineTag, HiOutlineArrowPath, HiArrowLeft, HiOutlineDocumentDuplicate, HiCheck, HiOutlineLightBulb, HiOutlineCube, HiOutlineUserCircle, HiOutlineQueueList, HiOutlineWrenchScrewdriver } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from './ErrorMessage';
import TemplateBrowser from './TemplateBrowser';
import StyleSelector from './StyleSelector';
import { resizeImage } from '../utils/cropImage';

type Step = 'input' | 'promptSelection' | 'generating' | 'result';

interface AdBannerGeneratorProps {
    onNavigateHome: () => void;
    onBannerGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
}

export const AdBannerGenerator: React.FC<AdBannerGeneratorProps> = ({ onNavigateHome, onBannerGenerated, onGenerating }) => {
    const { session } = useAuth();
    const [step, setStep] = useState<Step>('input');
    const [productImage, setProductImage] = useState<UploadedFile | null>(null);
    const [modelHeadshot, setModelHeadshot] = useState<UploadedFile | null>(null);
    const [productDescription, setProductDescription] = useState('');
    const [headline, setHeadline] = useState('');
    const [brandDetails, setBrandDetails] = useState('');
    const [selectedStyleId, setSelectedStyleId] = useState<string>(AD_STYLES[Object.keys(AD_STYLES)[0]][0].id);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    
    const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedConcept[]>([]);
    const [finalPrompt, setFinalPrompt] = useState<string>('');
    const [generatedBanner, setGeneratedBanner] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
    const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editPrompt, setEditPrompt] = useState('');

    useEffect(() => {
        onGenerating(isLoading);
    }, [isLoading, onGenerating]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isLoading && step === 'input') {
            const messages = [
                'Analyzing product details...',
                'Brainstorming ad angles...',
                'Crafting creative concepts...',
                'Finalizing suggestions...'
            ];
            let index = 0;
            setLoadingMessage(messages[index]);
            interval = setInterval(() => {
                index = (index + 1) % messages.length;
                setLoadingMessage(messages[index]);
            }, 2000);
        } else if (isLoading && step === 'generating') {
            const messages = [
                'Setting up the ad canvas...',
                'Compositing product and model...',
                'Applying brand styles...',
                'Adding headline text...',
                'Rendering final banner...',
                'Polishing the ad creative...'
            ];
            let index = 0;
            setLoadingMessage(messages[index]);
            interval = setInterval(() => {
                index = (index + 1) % messages.length;
                setLoadingMessage(messages[index]);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isLoading, step]);

    const handleBackToSettings = () => {
        setStep('input');
        setGeneratedPrompts([]);
        setFinalPrompt('');
        setGeneratedBanner(null);
        setError(null);
        setIsSaved(false);
        setIsEditing(false);
        setEditPrompt('');
    };

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'product' | 'model') => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            try {
                const resizedFile = await resizeImage(file, 2048);
                if (fileType === 'product') {
                    setProductImage(resizedFile);
                } else if (fileType === 'model') {
                    setModelHeadshot(resizedFile);
                }
            } catch (error) {
                console.error("Error resizing image:", error);
                setError("Failed to process image. Please try a different file.");
            }
            event.target.value = '';
        }
    }, []);

    const handleGenerateConcepts = async () => {
        if (!productImage) {
            setError('A product image is required.');
            return;
        }
        if (!modelHeadshot) {
            setError('A model headshot is required.');
            return;
        }
        if (!productDescription.trim() || !headline.trim()) {
            setError('Please provide a product description and a headline.');
            return;
        }
        
        if (session) {
            jobService.saveAdBannerJob({
                userId: session.user.id,
                productDescription,
                headline,
                brandDetails,
                styleId: selectedStyleId,
                aspectRatio,
                productImage,
                modelHeadshot
            });
        }
        
        setIsLoading(true);
        setError(null);
        try {
            const allStyles = Object.values(AD_STYLES).flat();
            const selectedStyle = allStyles.find(s => s.id === selectedStyleId);
            if (!selectedStyle) throw new Error("An ad style must be selected.");
            
            const prompts = await generateAdConcepts(productDescription, headline, selectedStyle);
            setGeneratedPrompts(prompts);
            setStep('promptSelection');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate concepts.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateBanner = async (prompt: string) => {
        if (!productImage || !modelHeadshot) {
            setError('A product image and model headshot are required.');
            setStep('input');
            return;
        }
        setIsLoading(true);
        setError(null);
        setFinalPrompt(prompt);
        setStep('generating');
        setIsSaved(false);
        try {
            const bannerResult = await generateAdBanner(prompt, productImage, modelHeadshot, headline, brandDetails, aspectRatio);
            if(bannerResult) {
                setGeneratedBanner(bannerResult);
                setStep('result');
            } else {
                throw new Error("The AI failed to generate an ad banner. Please try again.");
            }
