
import React, { useState, useEffect } from 'react';
import ThumbnailForm from './components/ThumbnailForm';
import HistoryGallery from './components/HistoryGallery';
import { validateApiKey } from './services/geminiService';
import { Youtube, Key, AlertCircle, CheckCircle, Loader2, Moon, Sun, Globe, Settings, Eye, EyeOff } from 'lucide-react';
import { HistoryItem, AspectRatio, Language, Theme } from './types';
import { TRANSLATIONS } from './constants';

const HISTORY_STORAGE_KEY = 'thumbgen_history';
const MAX_HISTORY_ITEMS = 8;
const SETTINGS_STORAGE_KEY = 'thumbgen_settings';

const App: React.FC = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [manualKey, setManualKey] = useState('');
  const [showKey, setShowKey] = useState(false); // State for toggling key visibility
  const [isAiStudioAvailable, setIsAiStudioAvailable] = useState(false);
  
  // Validation states
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Settings State
  const [lang, setLang] = useState<Language>('vi');
  const [theme, setTheme] = useState<Theme>('dark');
  const [showSettings, setShowSettings] = useState(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Load Settings
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const { lang, theme } = JSON.parse(savedSettings);
        if (lang) setLang(lang);
        if (theme) setTheme(theme);
      }
    } catch (e) {
      console.error("Failed to load settings");
    }

    const checkApiKey = async () => {
      if ((window as any).aistudio) {
        setIsAiStudioAvailable(true);
        if ((window as any).aistudio.hasSelectedApiKey) {
           const hasKey = await (window as any).aistudio.hasSelectedApiKey();
           if (hasKey) {
             setHasApiKey(true);
           }
        }
      } 
    };
    checkApiKey();

    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Persist Settings
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ lang, theme }));
  }, [lang, theme]);

  const saveHistoryToStorage = (newHistory: HistoryItem[]) => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
      if (newHistory.length > 1) {
        saveHistoryToStorage(newHistory.slice(0, newHistory.length - 1));
      }
    }
  };

  const handleThumbnailGenerated = (imageUrl: string, mainText: string, aspectRatio: AspectRatio) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      imageUrl,
      mainText,
      aspectRatio,
      timestamp: Date.now(),
    };

    const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
    setHistory(updatedHistory);
    saveHistoryToStorage(updatedHistory);
  };

  const deleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    saveHistoryToStorage(updatedHistory);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

  const handleSelectKey = async () => {
    if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
      setManualKey('');
    }
  };

  const handleManualKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualKey.trim().length > 0) {
      setHasApiKey(true);
    }
  };

  const handleTestKey = async () => {
    if (!manualKey.trim()) return;
    setTestStatus('testing');
    const isValid = await validateApiKey(manualKey);
    setTestStatus(isValid ? 'success' : 'error');
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLang(prev => prev === 'vi' ? 'en' : 'vi');

  return (
    <div className={`${theme} min-h-screen flex flex-col transition-colors duration-300`}>
      <div className="flex-grow flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-red-600 p-1.5 sm:p-2 rounded-lg shadow-sm">
                <Youtube size={20} className="text-white sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent leading-tight">
                  {t.app_name}
                </h1>
                <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">{t.professional_tool}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
               {/* Settings Dropdown/Toggle */}
               <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={toggleLang}
                    className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
                    title={t.settings_language}
                  >
                    <span className="text-xs font-bold">{lang.toUpperCase()}</span>
                  </button>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                  <button 
                    onClick={toggleTheme}
                    className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400"
                    title={t.settings_theme}
                  >
                    {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                  </button>
               </div>

               <div className="text-[10px] sm:text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-yellow-600 dark:text-yellow-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                  <span className="hidden sm:inline">{t.model_label}:</span> Banana
               </div>
               
               {manualKey && hasApiKey && (
                 <button 
                    onClick={() => {
                      setHasApiKey(false);
                      setTestStatus('idle');
                      setManualKey('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700 sm:border-transparent px-2 py-1 rounded bg-slate-100 dark:bg-slate-800/50 sm:bg-transparent"
                 >
                   Key
                 </button>
               )}
            </div>
          </div>
        </header>

        {/* API Key Screen */}
        {!hasApiKey ? (
          <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 text-center">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
              <div className="bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Key size={32} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-slate-900 dark:text-white">{t.setup_api_key}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                 {t.api_key_desc}
              </p>
              
              {isAiStudioAvailable && (
                <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                   <button
                    onClick={handleSelectKey}
                    className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
                  >
                    <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" alt="Gemini" className="w-5 h-5" />
                    {t.select_google}
                  </button>
                  <p className="text-xs text-slate-500 mt-2">{t.recommended_cloud}</p>
                </div>
              )}

              <form onSubmit={handleManualKeySubmit}>
                <div className="text-left mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.or_enter_manual}</label>
                  
                  <div className="flex gap-2 mb-2">
                    <div className="relative flex-grow">
                      <input
                        type={showKey ? "text" : "password"}
                        value={manualKey}
                        onChange={(e) => {
                          setManualKey(e.target.value);
                          setTestStatus('idle');
                        }}
                        placeholder="AIzaSy..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 pr-10 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400 dark:placeholder-slate-600 text-base"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleTestKey}
                      disabled={manualKey.trim().length === 0 || testStatus === 'testing'}
                      className={`px-4 rounded-lg font-bold transition-all border border-slate-300 dark:border-slate-700 flex items-center justify-center ${
                        testStatus === 'testing' 
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400' 
                          : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {testStatus === 'testing' ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        t.check
                      )}
                    </button>
                  </div>

                  {testStatus === 'success' && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs mb-2 bg-green-100 dark:bg-green-900/20 p-2 rounded">
                      <CheckCircle size={14} /> {t.valid_key}
                    </div>
                  )}
                  {testStatus === 'error' && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs mb-2 bg-red-100 dark:bg-red-900/20 p-2 rounded">
                      <AlertCircle size={14} /> {t.invalid_key}
                    </div>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={manualKey.trim().length === 0}
                  className={`w-full py-3 px-6 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                    manualKey.trim().length > 0 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {t.start_app}
                </button>
              </form>
              
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center justify-center gap-1 transition-colors"
                >
                  {t.get_key_link} <AlertCircle size={12} />
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Main App Content */
          <main className="flex-grow pb-8 sm:pb-12">
            <div className="text-center pt-6 sm:pt-10 pb-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 px-4 text-slate-900 dark:text-white">
                {t.main_title} <span className="text-blue-600 dark:text-blue-500">{t.auto}</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto px-4">
                {t.main_desc}
              </p>
            </div>
            
            <ThumbnailForm 
              apiKey={manualKey} 
              onGenerated={handleThumbnailGenerated} 
              t={t}
            />
            
            <HistoryGallery 
              history={history} 
              onDelete={deleteHistoryItem}
              onClear={clearHistory}
              t={t}
            />
          </main>
        )}

        {/* Footer */}
        <footer className="py-6 sm:py-8 text-center text-slate-500 dark:text-slate-600 text-xs sm:text-sm border-t border-slate-200 dark:border-slate-900 mt-4 sm:mt-8 bg-slate-50 dark:bg-slate-950 transition-colors">
          <p>&copy; {new Date().getFullYear()} {t.app_name}. {t.footer_text}</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
