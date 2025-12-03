
import React, { useState } from 'react';
import { AspectRatio, ThumbnailStyle, ThumbnailRequest } from '../types';
import { generateThumbnail, generateMagicPrompt, suggestThumbnailConcept } from '../services/geminiService';
import ImageUploader from './ImageUploader';
import { Wand2, Download, RefreshCw, AlertCircle, Sparkles, Lightbulb } from 'lucide-react';

interface ThumbnailFormProps {
  apiKey?: string;
  onGenerated?: (imageUrl: string, mainText: string, aspectRatio: AspectRatio) => void;
  t: any;
}

const ThumbnailForm: React.FC<ThumbnailFormProps> = ({ apiKey, onGenerated, t }) => {
  const [mainText, setMainText] = useState('');
  const [subText, setSubText] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.RATIO_16_9);
  const [style, setStyle] = useState<ThumbnailStyle>(ThumbnailStyle.CINEMATIC_3D);
  const [userPrompt, setUserPrompt] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isConceptLoading, setIsConceptLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    const request: ThumbnailRequest = {
      mainText,
      subText,
      aspectRatio,
      style,
      userPrompt,
      referenceImages,
      apiKey,
    };

    try {
      const result = await generateThumbnail(request);
      setGeneratedImage(result);
      
      // Notify parent component to save to history
      if (onGenerated) {
        onGenerated(result, mainText, aspectRatio);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate thumbnail. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicPrompt = async () => {
    if (!userPrompt.trim()) return;
    setIsMagicLoading(true);
    try {
       const improved = await generateMagicPrompt(userPrompt, apiKey);
       setUserPrompt(improved);
    } catch (e) {
       console.error(e);
    } finally {
       setIsMagicLoading(false);
    }
  };

  const handleSuggestConcept = async () => {
    if (!mainText.trim()) return;
    setIsConceptLoading(true);
    try {
      const concept = await suggestThumbnailConcept(mainText, apiKey);
      if (concept) setUserPrompt(concept);
    } catch (e) {
      console.error(e);
    } finally {
      setIsConceptLoading(false);
    }
  };

  const inputClass = "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 sm:py-2 text-slate-900 dark:text-white text-base sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400 dark:placeholder-slate-600 shadow-sm";
  const labelClass = "block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Left Column: Controls */}
      <div className="space-y-4 sm:space-y-6 bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg transition-colors">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Wand2 className="text-blue-500 dark:text-blue-400 w-5 h-5 sm:w-6 sm:h-6" /> {t.config_title}
          </h2>
          
          <div className="space-y-3 sm:space-y-4">
            {/* Main Text */}
            <div className="relative">
              <label className={labelClass}>{t.main_text_label}</label>
              <div className="relative">
                <input
                  type="text"
                  value={mainText}
                  onChange={(e) => setMainText(e.target.value)}
                  className={`${inputClass} pr-10`}
                  placeholder={t.placeholder_main}
                />
                {mainText.trim() && (
                  <button 
                    onClick={handleSuggestConcept}
                    disabled={isConceptLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-500 hover:text-yellow-600 p-1 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                    title="Suggest Concept from Title"
                  >
                    {isConceptLoading ? <RefreshCw size={16} className="animate-spin" /> : <Lightbulb size={16} />}
                  </button>
                )}
              </div>
            </div>

            {/* Sub Text */}
            <div>
              <label className={labelClass}>{t.sub_text_label}</label>
              <input
                type="text"
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
                className={inputClass}
                placeholder={t.placeholder_sub}
              />
            </div>

            {/* Prompt */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={labelClass}>{t.prompt_label}</label>
                {userPrompt.trim() && (
                   <button 
                     onClick={handleMagicPrompt}
                     disabled={isMagicLoading}
                     className="text-xs flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 transition-colors"
                   >
                     {isMagicLoading ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                     Magic Prompt
                   </button>
                )}
              </div>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={4}
                className={inputClass}
                placeholder={t.placeholder_prompt}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Aspect Ratio */}
              <div>
                <label className={labelClass}>{t.ratio_label}</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className={inputClass}
                >
                  {Object.values(AspectRatio).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Style */}
              <div>
                <label className={labelClass}>{t.style_label}</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as ThumbnailStyle)}
                  className={inputClass}
                >
                  {Object.values(ThumbnailStyle).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image Uploader */}
            <ImageUploader images={referenceImages} setImages={setReferenceImages} t={t} />

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-200 p-3 rounded-lg flex items-center gap-2 text-xs sm:text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full py-3 sm:py-3.5 rounded-lg font-bold text-white text-base sm:text-lg shadow-lg transition-all transform active:scale-95 ${
                isLoading 
                  ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-blue-500/20'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="animate-spin" /> {t.generating}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Wand2 /> {t.generate_btn}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="flex flex-col gap-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 h-full min-h-[300px] sm:min-h-[400px] flex flex-col shadow-lg transition-colors">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4">{t.result_preview}</h2>
          
          <div className="flex-grow flex items-center justify-center bg-white dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden relative group">
            {generatedImage ? (
              <>
                <img 
                  src={generatedImage} 
                  alt="Generated Thumbnail" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                   <a 
                    href={generatedImage} 
                    download={`thumbnail-${Date.now()}.png`}
                    className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-lg"
                   >
                     <Download size={18} /> {t.download}
                   </a>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 dark:text-slate-500 p-4">
                <div className="mb-2 flex justify-center">
                  <Wand2 size={40} className="opacity-20 sm:w-12 sm:h-12" />
                </div>
                <p className="text-sm sm:text-base">{t.waiting_image}</p>
                {isLoading && <p className="text-blue-500 dark:text-blue-400 mt-2 animate-pulse text-sm">{t.processing}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailForm;
