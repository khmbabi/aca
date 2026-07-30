import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  MapPin, 
  Cloud, 
  Maximize, 
  Users, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getAnimalRecommendation } from '../services/aiService';
import Markdown from 'react-markdown';
import TranslatedText from '../components/TranslatedText';
import { useLanguage } from '../lib/LanguageContext';

const AnimalRecommendation: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [aiMode, setAiMode] = useState<'instant' | 'thinking'>('instant');
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    location: '',
    climate: '',
    space: '',
    resources: '',
    goal: 'Profit'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await getAnimalRecommendation(formData, aiMode);
      setRecommendation(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white font-display tracking-tight uppercase">
          <TranslatedText>AI Animal Recommendation</TranslatedText>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
          <TranslatedText>Get personalized livestock suggestions based on your farm's unique environment.</TranslatedText>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 p-10 rounded-[48px] shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-700"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600" size={18} />
                  <input 
                    type="text" 
                    placeholder="e.g. Nairobi, Kenya"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold"
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Climate</label>
                <div className="relative">
                  <Cloud className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600" size={18} />
                  <input 
                    type="text" 
                    placeholder="e.g. Tropical, Arid"
                    value={formData.climate}
                    onChange={(e) => setFormData({...formData, climate: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Available Space</label>
                <div className="relative">
                  <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600" size={18} />
                  <input 
                    type="text" 
                    placeholder="e.g. 5 Acres"
                    value={formData.space}
                    onChange={(e) => setFormData({...formData, space: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold"
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Goal</label>
                <select 
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold appearance-none"
                >
                  <option>Profit</option>
                  <option>Sustainability</option>
                  <option>Subsistence</option>
                  <option>Education</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Available Resources (Water, Feed, Labor)</label>
              <textarea 
                placeholder="Describe your available resources..."
                value={formData.resources}
                onChange={(e) => setFormData({...formData, resources: e.target.value})}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-bold min-h-[120px]"
                required
              />
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
              disabled={loading}
              className="w-full py-6 bg-primary-600 text-white rounded-[24px] font-black text-sm tracking-widest hover:bg-primary-700 transition-all active:scale-95 shadow-2xl shadow-primary-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  GENERATING RECOMMENDATION...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  GET AI RECOMMENDATION
                </>
              )}
            </button>
          </form>
        </motion.div>

        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {recommendation ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 p-10 rounded-[48px] shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-700 h-full overflow-y-auto"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    <TranslatedText>AI Analysis Complete</TranslatedText>
                  </h3>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <TranslatedText>
                    <Markdown>{recommendation}</Markdown>
                  </TranslatedText>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[48px] flex flex-col items-center justify-center p-12 text-center h-full"
              >
                <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex items-center justify-center text-gray-400 mb-6">
                  <Sparkles size={40} />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
                  <TranslatedText>Ready to Analyze</TranslatedText>
                </h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">
                  <TranslatedText>Fill out the form and let our AI suggest the perfect animals for your farm.</TranslatedText>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AnimalRecommendation;
