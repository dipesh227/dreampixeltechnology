import React, { useState, useCallback, useEffect } from 'react';
import { AdStyle, AspectRatio, UploadedFile, GeneratedConcept } from '../types';
import { generateAdConcepts, generateAdBanner } from '../services/aiService';
import { AD_STYLES } from '../services/constants';
import * as historyService from '../services/historyService';
// FIX: 'HiOutlineDownload' and 'HiOutlineUpload' are not exported members of 'react-icons/hi2'. Replaced them with 'HiArrowDownTray' and 'HiArrowUpTray'.
import { HiArrowDownTray, HiOutlineHeart, HiOutlineSparkles, HiArrowUpTray, HiXMark, HiOutlineDocumentText, HiOutlineChatBubbleLeftRight, HiOutlineTag, HiOutlineArrowPath, HiArrowLeft, HiOutlineDocumentDuplicate, HiCheck, HiOutlineLightBulb, HiOutlineCube, HiOutlineUserCircle } from 'react-icons/hi2';

type Step = 'input' | 'promptSelection' | 'generating' | 'result';

interface AdBannerGeneratorProps {
    onNavigateHome: () => void;
    onBannerGenerated: () => void;
    onGenerating: (isGenerating: boolean) => void;
}

// FIX: Corrected component structure. The closing brace for the component was misplaced, causing all logic to be outside its scope.
const AdBannerGenerator: React.FC<AdBannerGeneratorProps> = ({ onNavigateHome, onBannerGenerated, onGenerating }) => {
    const [step, setStep] = useState<Step>('input');
    const [productImage, setProductImage] = useState<UploadedFile | null>(null);
    const [modelHeadshot, setModelHeadshot] = useState<UploadedFile | null>(null);
    const [productDescription, setProductDescription] = useState('');
    const [headline, setHeadline] = useState('');
    const [brandDetails, setBrandDetails] = useState('');
    const [activeCategory, setActiveCategory] = useState(Object.keys(AD_STYLES)[0]);
    const [selectedStyleId, setSelectedStyleId] = useState<string>(AD_STYLES[Object.keys(AD_STYLES)[0]][0].id);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    
    const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedConcept[]>([]);
    const [finalPrompt, setFinalPrompt] = useState<string>('');
    const [generatedBanner, setGeneratedBanner] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

    useEffect(() => {
        onGenerating(isLoading);
    }, [isLoading, onGenerating]);

    const handleBackToSettings = () => {
        setStep('input');
        setGeneratedPrompts([]);
        setFinalPrompt('');
        setGeneratedBanner(null);
        setError(null);
        setIsSaved(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'product' | 'model') => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1];
                const uploadedFile = { base64, mimeType: file.type, name: file.name };
                if (fileType === 'product') {
                    setProductImage(uploadedFile);
                } else {
                    setModelHeadshot(uploadedFile);
                }
            };
            reader.onerror = error => setError("There was an error reading your file.");
            reader.readAsDataURL(file);
        }
    };

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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate banner.');
            setStep('promptSelection');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCreation = async () => {
        if (generatedBanner && !isSaved) {
            const newEntry = {
                id: '', // ID will be generated by Supabase
                prompt: finalPrompt,
                imageUrl: `data:image/png;base64,${generatedBanner}`,
                timestamp: Date.now()
            };
            try {
                await historyService.saveCreation(newEntry);
                setIsSaved(true);
                onBannerGenerated();
            } catch (error) {
                setError("Failed to save creation. Please try again.");
            }
        }
    };

    const handleCopyPrompt = (prompt: string) => {
        navigator.clipboard.writeText(prompt);
        setCopiedPrompt(prompt);
        setTimeout(() => setCopiedPrompt(null), 2000);
    };

    const renderInputStep = () => (
        <div className="space-y-8">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl space-y-4">
                     <div>
                        <h2 className="text-xl font-bold text-white mb-1">1. Upload Assets</h2>
                        <p className="text-sm text-slate-400">Provide your product image and model headshot.</p>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Product Image Upload */}
                        <div className="text-center">
                             <div className="p-4 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50 hover:border-slate-600 transition h-40 flex flex-col justify-center">
                                 <input type="file" id="product-upload" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, 'product')} />
                                 <label htmlFor="product-upload" className="cursor-pointer">
                                    <HiOutlineCube className="w-8 h-8 mx-auto text-slate-500 mb-2"/>
                                    <p className="text-slate-300 font-semibold text-sm">Upload Product Image</p>
                                 </label>
                             </div>
                             {productImage && <div className="relative group w-20 h-20 mx-auto mt-2">
                                <img src={`data:${productImage.mimeType};base64,${productImage.base64}`} alt="Product" className="rounded-lg object-cover w-full h-full"/>
                                <button onClick={() => setProductImage(null)} className="absolute -top-1 -right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500"><HiXMark className="w-3 h-3" /></button>
                             </div>}
                        </div>
                        {/* Model Headshot Upload */}
                         <div className="text-center">
                             <div className="p-4 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50 hover:border-slate-600 transition h-40 flex flex-col justify-center">
                                 <input type="file" id="model-upload" className="hidden" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, 'model')} />
                                 <label htmlFor="model-upload" className="cursor-pointer">
                                    <HiOutlineUserCircle className="w-8 h-8 mx-auto text-slate-500 mb-2"/>
                                    <p className="text-slate-300 font-semibold text-sm">Upload Model Headshot</p>
                                 </label>
                             </div>
                             {modelHeadshot && <div className="relative group w-20 h-20 mx-auto mt-2">
                                <img src={`data:${modelHeadshot.mimeType};base64,${modelHeadshot.base64}`} alt="Model" className="rounded-lg object-cover w-full h-full"/>
                                <button onClick={() => setModelHeadshot(null)} className="absolute -top-1 -right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500"><HiXMark className="w-3 h-3" /></button>
                             </div>}
                        </div>
                     </div>
                </div>
                <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl space-y-4">
                    <h2 className="text-xl font-bold text-white mb-1">2. Describe Your Campaign</h2>
                    <div className="flex items-start gap-3">
                        <HiOutlineDocumentText className="w-5 h-5 mt-1 text-slate-400"/>
                        <div>
                           <h3 className="text-md font-bold text-white">Product Description</h3>
                           <p className="text-sm text-slate-400 mb-2">Describe the product, audience, and goals.</p>
                        </div>
                    </div>
                    <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="e.g., 'A new line of eco-friendly sneakers for young, urban professionals...'" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm" rows={2}></textarea>
                    
                     <div className="flex items-start gap-3">
                        <HiOutlineChatBubbleLeftRight className="w-5 h-5 mt-1 text-slate-400"/>
                        <div>
                           <h3 className="text-md font-bold text-white">Headline</h3>
                           <p className="text-sm text-slate-400 mb-2">The main text for the ad. Keep it punchy!</p>
                        </div>
                    </div>
                    <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g., 'Step Into the Future'" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm" />

                    <div className="flex items-start gap-3">
                        <HiOutlineTag className="w-5 h-5 mt-1 text-slate-400"/>
                        <div>
                           <h3 className="text-md font-bold text-white">Brand Name <span className="text-slate-400 font-normal">(Optional)</span></h3>
                           <p className="text-sm text-slate-400 mb-2">The brand name to feature in the ad.</p>
                        </div>
                    </div>
                    <input type="text" value={brandDetails} onChange={e => setBrandDetails(e.target.value)} placeholder="e.g., 'EcoStride'" className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-sm" />
                </div>
            </div>

            <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl">
                 <h2 className="text-xl font-bold text-white mb-4">3. Choose an Ad Style</h2>
                 <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-800 pb-4">
                     {Object.keys(AD_STYLES).map(category => (
                        <button key={category} onClick={() => setActiveCategory(category)} className={`px-4 py-1.5 text-sm rounded-full transition-colors duration-200 ${activeCategory === category ? 'bg-primary-gradient text-white font-semibold' : 'bg-slate-800 hover:bg-slate-700'}`}>
                           {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </button>
                     ))}
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {AD_STYLES[activeCategory].map(style => (
                        <button key={style.id} onClick={() => setSelectedStyleId(style.id)} className={`p-4 rounded-lg border-2 text-left transition-colors duration-200 text-sm ${selectedStyleId === style.id ? 'border-purple-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                            <p className="font-bold text-white">{style.name}</p>
                            <p className="text-xs text-slate-400">{style.tags}</p>
                        </button>
                    ))}
                 </div>
            </div>

            <div className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-4">4. Choose Aspect Ratio</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <button onClick={() => setAspectRatio('1:1')} className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors duration-200 ${aspectRatio === '1:1' ? 'border-purple-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                        <p className="font-bold text-lg text-white">1:1</p><p className="text-sm text-slate-400">Instagram Post</p>
                    </button>
                    <button onClick={() => setAspectRatio('4:5')} className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors duration-200 ${aspectRatio === '4:5' ? 'border-purple-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                        <p className="font-bold text-lg text-white">4:5</p><p className="text-sm text-slate-400">Social Portrait</p>
                    </button>
                    <button onClick={() => setAspectRatio('1.91:1')} className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors duration-200 ${aspectRatio === '1.91:1' ? 'border-purple-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                        <p className="font-bold text-lg text-white">1.91:1</p><p className="text-sm text-slate-400">Facebook Ad</p>
                    </button>
                    <button onClick={() => setAspectRatio('9:16')} className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors duration-200 ${aspectRatio === '9:16' ? 'border-purple-500 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
                        <p className="font-bold text-lg text-white">9:16</p><p className="text-sm text-slate-400">Story Ad</p>
                    </button>
                </div>
            </div>
            
             <div className="flex justify-center pt-4">
                <button onClick={handleGenerateConcepts} disabled={isLoading} className="flex items-center gap-3 px-8 py-4 bg-primary-gradient text-white font-bold text-lg rounded-lg hover:opacity-90 transition-all duration-300 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transform hover:scale-105">
                    {isLoading ? <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <HiOutlineSparkles className="w-6 h-6"/>}
                    {isLoading ? 'Generating Concepts...' : 'Generate Ad Concepts'}
                </button>
            </div>
        </div>
    );

    const renderPromptSelectionStep = () => (
         <div className="max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-2 text-white">Choose Your Ad Creative</h2>
            <p className="text-slate-400 text-center mb-10">Select a concept below to generate your ad banner.</p>
            <div className="grid md:grid-cols-3 gap-6">
                {generatedPrompts.map((concept, index) => (
                    <div key={index} onClick={() => handleGenerateBanner(concept.prompt)} className={`relative p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${concept.isRecommended ? 'border-amber-400 bg-slate-800/50' : 'border-slate-800 bg-slate-900 hover:border-slate-700 hover:-translate-y-1'}`}>
                        <div>
                            {concept.isRecommended && (<div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2"><span className="px-3 py-1 text-xs font-semibold tracking-wider text-slate-900 uppercase bg-amber-400 rounded-full">Recommended</span></div>)}
                            <h3 className="font-bold text-white mb-3 mt-3">Concept {index + 1}</h3>
                            <p className="text-slate-300 text-sm mb-4">{concept.prompt}</p>
                            {concept.isRecommended && concept.reason && (<div className="mt-4 pt-4 border-t border-slate-700/50"><p className="text-xs text-amber-300/80 italic"><span className="font-bold not-italic">Reason:</span> {concept.reason}</p></div>)}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={(e) => { e.stopPropagation(); handleCopyPrompt(concept.prompt); }} className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors">
                                {copiedPrompt === concept.prompt ? <HiCheck className="w-4 h-4 text-green-400" /> : <HiOutlineDocumentDuplicate className="w-4 h-4" />}
                                {copiedPrompt === concept.prompt ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center mt-10"><button onClick={() => setStep('input')} className="flex items-center gap-2 px-6 py-2 text-slate-400 hover:text-slate-300 bg-slate-800/50 border border-slate-700 rounded-lg transition-colors"><HiArrowLeft className="w-5 h-5" /> Back</button></div>
        </div>
    );

    const renderGeneratingStep = () => (
        <div className="text-center py-20 animate-fade-in">
            <div className="relative w-24 h-24 mx-auto"><div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div><div className="absolute inset-0 border-4 border-t-purple-400 rounded-full animate-spin"></div></div>
            <h2 className="text-3xl font-bold mt-8 text-white">Creating Your Ad Banner...</h2>
            <p className="text-slate-400 mt-2">This can take up to a minute. Please wait.</p>
        </div>
    );
    
    const renderResultStep = () => (
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
             <h2 className="text-3xl font-bold text-center mb-8 text-white">Your Ad Banner is Ready!</h2>
             {generatedBanner && <img src={`data:image/png;base64,${generatedBanner}`} alt="Generated Ad Banner" className="rounded-xl mx-auto shadow-2xl shadow-black/30 mb-8 border-2 border-slate-700/50" style={{ aspectRatio: aspectRatio.replace(':', ' / ') }} />}
             <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center items-center gap-4">
                 <button onClick={handleBackToSettings} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700"><HiArrowLeft className="w-5 h-5"/> Back to Settings</button>
                 <button onClick={() => setStep('promptSelection')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700"><HiOutlineLightBulb className="w-5 h-5"/> Back to Concepts</button>
                 <button onClick={() => handleGenerateBanner(finalPrompt)} disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"><HiOutlineArrowPath className="w-5 h-5"/> Regenerate</button>
                 <button onClick={handleSaveCreation} disabled={isSaved} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"><HiOutlineHeart className={`w-5 h-5 ${isSaved ? 'text-pink-500' : ''}`} /> {isSaved ? 'Saved!' : 'Like & Save Banner'}</button>
                 <a href={`data:image/png;base64,${generatedBanner}`} download="dreampixel-banner.png" className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-gradient text-white font-bold rounded-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105">
                    {/* FIX: Replaced 'HiOutlineDownload' with 'HiArrowDownTray' */}
                    <HiArrowDownTray className="w-5 h-5"/> Download
                 </a>
             </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            {error && <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-6 max-w-4xl mx-auto">{error}</div>}
            
            {step === 'input' && renderInputStep()}
            {(step === 'promptSelection' || step === 'generating' || step === 'result') && (
                <div className="p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg">
                    {step === 'promptSelection' && renderPromptSelectionStep()}
                    {step === 'generating' && renderGeneratingStep()}
                    {step === 'result' && renderResultStep()}
                </div>
            )}
        </div>
    );
};

export default AdBannerGenerator;