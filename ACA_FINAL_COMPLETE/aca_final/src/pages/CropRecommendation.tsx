import React, { useState, useEffect } from 'react';
import { Bot, MapPin, Thermometer, Droplets, Ruler, BarChart, CheckCircle2, Loader2, Sparkles, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getCropRecommendation, generateCropImage } from '../services/aiService';
import Markdown from 'react-markdown';
import TranslatedText from '../components/TranslatedText';

const CropRecommendation: React.FC = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [aiMode, setAiMode] = useState<'instant' | 'thinking'>('instant');
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [recommendationImage, setRecommendationImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    location: '',
    soilPh: '6.5',
    rainfall: '',
    soilType: 'loamy',
    temperature: '',
    farmSize: '',
    waterAvailability: 'moderate',
    marketPreference: 'local'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRecommendationImage(null);
    
    try {
      const result = await getCropRecommendation(formData, aiMode);
      setRecommendation(result);

      // Extract the first crop name from the recommendation to generate an image
      // Simple heuristic: look for bold text or the first word in a list
      const cropMatch = result.match(/\*\*(.*?)\*\*/);
      if (cropMatch && cropMatch[1]) {
        const imageUrl = await generateCropImage(cropMatch[1]);
        setRecommendationImage(imageUrl);
      }

      // Save to Firestore if user is logged in
      if (auth.currentUser) {
        await addDoc(collection(db, 'farm_logs'), {
          userId: auth.currentUser.uid,
          type: 'crop_recommendation',
          data: {
            ...formData,
            recommendation: result
          },
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error getting recommendation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-[32px] flex items-center justify-center text-primary-600 shadow-xl shadow-primary-600/10">
          <Bot size={40} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white font-display tracking-tight uppercase">
            {t('cropRecommendation')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {t('cropRecommendationDesc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-[48px] shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-700 p-10 sticky top-24">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-10 font-display tracking-tight uppercase">
              {t('enterFarmDetails')}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Enter your farm location"
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Soil Type</label>
                <select 
                  value={formData.soilType}
                  onChange={(e) => setFormData({...formData, soilType: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white appearance-none"
                >
                  <option value="">Select Soil Type</option>
                  <option value="loamy">Loamy</option>
                  <option value="clay">Clay</option>
                  <option value="sandy">Sandy</option>
                  <option value="silty">Silty</option>
                  <option value="peaty">Peaty</option>
                  <option value="chalky">Chalky</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Soil pH: {formData.soilPh}</label>
                </div>
                <input 
                  type="range" 
                  min="4.0" 
                  max="9.0" 
                  step="0.1"
                  value={formData.soilPh}
                  onChange={(e) => setFormData({...formData, soilPh: e.target.value})}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-[10px] font-bold text-gray-400 px-1">
                  <span>4.0 (Acidic)</span>
                  <span>6.5</span>
                  <span>9.0 (Alkaline)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Annual Rainfall (mm)</label>
                  <input 
                    type="number" 
                    value={formData.rainfall}
                    onChange={(e) => setFormData({...formData, rainfall: e.target.value})}
                    placeholder="e.g., 800"
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Avg. Temp (°C)</label>
                  <input 
                    type="number" 
                    value={formData.temperature}
                    onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                    placeholder="e.g., 25"
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Farm Size (hectares)</label>
                <input 
                  type="number" 
                  value={formData.farmSize}
                  onChange={(e) => setFormData({...formData, farmSize: e.target.value})}
                  placeholder="e.g., 10"
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Water Availability</label>
                <select 
                  value={formData.waterAvailability}
                  onChange={(e) => setFormData({...formData, waterAvailability: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white appearance-none"
                >
                  <option value="">Select Water Availability</option>
                  <option value="low">Low (Rain-fed only)</option>
                  <option value="moderate">Moderate (Occasional irrigation)</option>
                  <option value="high">High (Full irrigation/River access)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Market Preference</label>
                <select 
                  value={formData.marketPreference}
                  onChange={(e) => setFormData({...formData, marketPreference: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white appearance-none"
                >
                  <option value="local">Local Market</option>
                  <option value="export">Export Market</option>
                  <option value="industrial">Industrial Processing</option>
                </select>
              </div>

              {/* AI Mode Selector */}
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl border border-gray-200 dark:border-gray-800 self-start">
                {[
                  { id: 'instant', label: t('instantLabel') || 'INSTANT' },
                  { id: 'thinking', label: t('thinkingLabel') || 'THINKING' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setAiMode(mode.id as any)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[9px] font-black transition-all tracking-widest",
                      aiMode === mode.id 
                        ? "bg-primary-600 text-white shadow-md" 
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[24px] font-black text-sm tracking-widest shadow-2xl shadow-primary-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                {t('generateRecommendations')}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-40 space-y-8 bg-white dark:bg-gray-800 rounded-[64px] border border-dashed border-gray-200 dark:border-gray-700 shadow-2xl shadow-black/5"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full animate-ping absolute inset-0"></div>
                  <div className="w-24 h-24 bg-primary-500 rounded-[32px] flex items-center justify-center text-white relative z-10 shadow-2xl">
                    <Bot size={48} />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white font-display uppercase tracking-tight">
                    {t('analyzingFarmData')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    {t('analyzingFarmDataDesc')}
                  </p>
                </div>
              </motion.div>
            ) : recommendation ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-[48px] shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-700 p-10"
              >
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-[24px] flex items-center justify-center text-primary-600 shadow-sm">
                    <Sparkles size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight uppercase">
                      {t('aiRecommendation')}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-green-600 font-black uppercase tracking-widest">
                      <CheckCircle2 size={18} />
                      {t('analysisComplete')}
                    </div>
                  </div>
                </div>

                {recommendationImage && (
                  <div className="mb-8 rounded-[32px] overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700">
                    <img 
                      src={recommendationImage} 
                      alt="Recommended Crop" 
                      className="w-full h-64 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                
                <div className="prose dark:prose-invert max-w-none">
                  <Markdown>{recommendation}</Markdown>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 space-y-8 bg-white dark:bg-gray-800 rounded-[64px] border border-dashed border-gray-200 dark:border-gray-700 text-center px-12 shadow-2xl shadow-black/5">
                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900/50 rounded-[32px] flex items-center justify-center text-gray-300 shadow-inner">
                  <BarChart size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white font-display uppercase tracking-tight">
                    {t('readyForAnalysis')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto font-medium">
                    {t('readyForAnalysisDesc')}
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CropRecommendation;
