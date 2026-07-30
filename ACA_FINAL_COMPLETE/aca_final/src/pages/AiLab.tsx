import React, { useState } from 'react';
import { 
  Bot, 
  Search, 
  Sparkles, 
  Leaf, 
  Dog, 
  Camera, 
  Upload, 
  Loader2, 
  Save, 
  Info, 
  ChevronRight,
  Tractor,
  Thermometer,
  Droplets,
  Wind,
  MapPin,
  AlertCircle,
  Image as ImageIcon,
  Maximize2,
  Mountain,
  ShoppingCart,
  Bluetooth,
  BluetoothConnected,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { analyzeCropDisease, getCropRecommendation, getAnimalRecommendation, generateCropImage } from '../services/aiService';
import Markdown from 'react-markdown';
import TranslatedText from '../components/TranslatedText';
import { useLanguage } from '../lib/LanguageContext';

type TabId = 'crop-recommendation' | 'disease-detection' | 'animal-recommendation';

const AiLab: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>('crop-recommendation');
  const [aiMode, setAiMode] = useState<'instant' | 'thinking'>('instant');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Crop Recommendation State
  const [soilData, setSoilData] = useState({
    soilType: 'loamy',
    phLevel: '6.5',
    location: '',
    climate: 'tropical',
    altitude: '',
    rainfall: '',
    temperature: '',
    marketPreference: '',
    description: ''
  });

  // Disease Detection State
  const [image, setImage] = useState<string | null>(null);
  const [plantType, setPlantType] = useState('tomato');
  const [symptoms, setSymptoms] = useState('');
  const [isBluetoothConnecting, setIsBluetoothConnecting] = useState(false);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  // Animal Recommendation State
  const [farmData, setFarmData] = useState({
    location: '',
    climate: 'temperate',
    availableSpace: '',
    primaryGoal: 'meat',
    budget: 'medium',
    altitude: '',
    rainfall: '',
    temperature: '',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateNumeric = (value: string, min?: number, max?: number) => {
    if (!value) return t('required');
    const num = parseFloat(value);
    if (isNaN(num)) return t('mustBeNumber');
    if (min !== undefined && num < min) return `${t('min')} ${min}`;
    if (max !== undefined && num > max) return `${t('max')} ${max}`;
    return null;
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setResult(null);
    setIsLoading(false);
    setErrors({});
  };

  const handleCropRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    const phErr = validateNumeric(soilData.phLevel, 0, 14);
    if (phErr) newErrors.phLevel = phErr;
    
    const altErr = validateNumeric(soilData.altitude, 0);
    if (altErr) newErrors.altitude = altErr;

    const rainErr = validateNumeric(soilData.rainfall, 0);
    if (rainErr) newErrors.rainfall = rainErr;

    const tempErr = validateNumeric(soilData.temperature, -50, 60);
    if (tempErr) newErrors.temperature = tempErr;

    if (!soilData.location.trim()) newErrors.location = t('required');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    setResult(null);
    setAiError(null);
    try {
      const recommendation = await getCropRecommendation(soilData, aiMode);
      setResult(recommendation);
    } catch (error) {
      console.error("Error getting crop recommendation:", error);
      setAiError(t('chatbot.connection_error') || "Sorry, I'm having trouble connecting right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiseaseDetection = async () => {
    if (!image) {
      setErrors({ image: t('pleaseUploadImage') });
      return;
    }
    setErrors({ });
    setIsLoading(true);
    setResult(null);
    setAiError(null);
    try {
      const analysis = await analyzeCropDisease(image, aiMode, symptoms);
      setResult(analysis);
    } catch (error) {
      console.error("Error analyzing disease:", error);
      setAiError(t('chatbot.connection_error') || "Sorry, I'm having trouble connecting right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnimalRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const altErr = validateNumeric(farmData.altitude, 0);
    if (altErr) newErrors.altitude = altErr;

    const spaceErr = validateNumeric(farmData.availableSpace, 0);
    if (spaceErr) newErrors.availableSpace = spaceErr;

    const rainErr = validateNumeric(farmData.rainfall, 0);
    if (rainErr) newErrors.rainfall = rainErr;

    const tempErr = validateNumeric(farmData.temperature, -50, 60);
    if (tempErr) newErrors.temperature = tempErr;

    if (!farmData.location.trim()) newErrors.location = t('required');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    setResult(null);
    setAiError(null);
    try {
      const recommendation = await getAnimalRecommendation(farmData, aiMode);
      setResult(recommendation);
    } catch (error) {
      console.error("Error getting animal recommendation:", error);
      setAiError(t('chatbot.connection_error') || "Sorry, I'm having trouble connecting right now. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBluetoothConnect = () => {
    setShowQrCode(true);
    setIsBluetoothConnecting(true);
    
    // Simulate Bluetooth pairing after QR scan
    setTimeout(() => {
      setIsBluetoothConnecting(false);
      setIsBluetoothConnected(true);
      setShowQrCode(false);
    }, 5000);
  };

  const handleSaveToLog = async () => {
    if (!result) return;
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'farm_logs'), {
        userId: auth.currentUser.uid,
        type: activeTab,
        data: {
          result: result,
          input: activeTab === 'crop-recommendation' ? soilData : 
                 activeTab === 'disease-detection' ? { plantType, image: 'Image Data', symptoms } : 
                 farmData
        },
        createdAt: serverTimestamp()
      });
      // Use console log for now, maybe add toast later
      console.log(t('resultSaved'));
    } catch (error) {
      console.error('Error saving to log:', error);
      console.error(t('saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
      {/* New: Bluetooth Pairing Modal */}
      <AnimatePresence>
        {showQrCode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-white dark:bg-gray-800 rounded-[48px] p-10 max-w-md w-full text-center shadow-2xl border border-white/10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white font-display tracking-tight">
                  {t('pairDevice') || 'Pair External Camera'}
                </h3>
                <button onClick={() => setShowQrCode(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                  <X size={24} className="text-gray-500" />
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-[32px] inline-block mb-8 shadow-inner">
                {/* Simplified QR Code placeholder if qrcode.react is not available or just for visual */}
                <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center border-4 border-gray-50">
                  <Bot size={100} className="text-gray-300" />
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-8">
                {t('scanQrCodeToPair') || 'Scan QR code on your hardware device to pair via Bluetooth'}
              </p>
              
              <div className="flex items-center justify-center gap-3 text-primary-600 font-bold">
                <Loader2 size={20} className="animate-spin" />
                <span>
                  {t('waitingForConnection') || 'Waiting for pairing...'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white font-display tracking-tight uppercase">
            {t('aiLabTitle')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {t('aiLabSubtitle')}
          </p>
        </div>
        
        <div className="flex flex-wrap bg-gray-100 dark:bg-gray-800 p-1.5 rounded-[24px] border border-gray-200 dark:border-gray-700">
          {[
            { id: 'crop-recommendation', icon: Bot, label: t('crops') },
            { id: 'disease-detection', icon: Search, label: t('disease') },
            { id: 'animal-recommendation', icon: Dog, label: t('animals') }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabId)}
              className={cn(
                "flex items-center gap-2 px-4 sm:px-6 py-3 rounded-[20px] text-sm font-black transition-all",
                activeTab === tab.id 
                  ? "bg-white dark:bg-gray-700 text-primary-600 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* AI Mode Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-[24px] border border-gray-200 dark:border-gray-700">
          {[
            { id: 'instant', label: t('instantLabel') || 'INSTANT' },
            { id: 'thinking', label: t('thinkingLabel') || 'THINKING' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setAiMode(mode.id as any)}
              className={cn(
                "px-6 py-2.5 rounded-[20px] text-[10px] font-black transition-all tracking-widest",
                aiMode === mode.id 
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-[48px] shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-700 p-10">
            {activeTab === 'crop-recommendation' && (
              <form onSubmit={handleCropRecommendation} className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-[20px] flex items-center justify-center text-primary-600">
                    <Leaf size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white font-display tracking-tight">
                    {t('cropAdvisor')}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                        {t('soilType')}
                      </label>
                      <select 
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-[24px] font-bold dark:text-white"
                        value={soilData.soilType}
                        onChange={e => setSoilData({...soilData, soilType: e.target.value})}
                      >
                        <option value="loamy">{t('loamy')}</option>
                        <option value="sandy">{t('sandy')}</option>
                        <option value="clay">{t('clay')}</option>
                        <option value="silty">{t('silty')}</option>
                        <option value="peaty">{t('peaty')}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                        {t('phLevel')}
                      </label>
                      <input 
                        type="number" 
                        step="0.1"
                        className={cn(
                          "w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border rounded-[24px] font-bold dark:text-white transition-all",
                          errors.phLevel ? "border-red-500" : "border-gray-100 dark:border-gray-700"
                        )}
                        placeholder="e.g. 6.5"
                        value={soilData.phLevel}
                        onChange={e => setSoilData({...soilData, phLevel: e.target.value})}
                      />
                      {errors.phLevel && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.phLevel}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                        {t('altitude')}
                      </label>
                      <div className="relative">
                        <Mountain className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="number" 
                          className={cn(
                            "w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-900 border rounded-[24px] font-bold dark:text-white transition-all",
                            errors.altitude ? "border-red-500" : "border-gray-100 dark:border-gray-700"
                          )}
                          placeholder="e.g. 1500"
                          value={soilData.altitude}
                          onChange={e => setSoilData({...soilData, altitude: e.target.value})}
                        />
                      </div>
                      {errors.altitude && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.altitude}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                        {t('rainfallLabel')}
                      </label>
                      <div className="relative">
                        <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="number" 
                          className={cn(
                            "w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-900 border rounded-[24px] font-bold dark:text-white transition-all",
                            errors.rainfall ? "border-red-500" : "border-gray-100 dark:border-gray-700"
                          )}
                          placeholder="e.g. 1200"
                          value={soilData.rainfall}
                          onChange={e => setSoilData({...soilData, rainfall: e.target.value})}
                        />
                      </div>
                      {errors.rainfall && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.rainfall}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                        {t('temperatureLabel')}
                      </label>
                      <div className="relative">
                        <Thermometer className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="number" 
                          className={cn(
                            "w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-900 border rounded-[24px] font-bold dark:text-white transition-all",
                            errors.temperature ? "border-red-500" : "border-gray-100 dark:border-gray-700"
                          )}
                          placeholder="e.g. 25"
                          value={soilData.temperature}
                          onChange={e => setSoilData({...soilData, temperature: e.target.value})}
                        />
                      </div>
                      {errors.temperature && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.temperature}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                        {t('locationLabel')}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          className={cn(
                            "w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-900 border rounded-[24px] font-bold dark:text-white transition-all",
                            errors.location ? "border-red-500" : "border-gray-100 dark:border-gray-700"
                          )}
                          placeholder="City, Region"
                          value={soilData.location}
                          onChange={e => setSoilData({...soilData, location: e.target.value})}
                        />
                      </div>
                      {errors.location && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.location}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                      {t('marketPreference')}
                    </label>
                    <div className="relative">
                      <ShoppingCart className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-[24px] font-bold dark:text-white"
                        placeholder={t('marketPlaceholder')}
                        value={soilData.marketPreference}
                        onChange={e => setSoilData({...soilData, marketPreference: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                      {t('additionalContext')}
                    </label>
                    <textarea 
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-[24px] font-bold dark:text-white h-24 resize-none"
                      placeholder={t('additionalContextPlaceholder')}
                      value={soilData.description}
                      onChange={e => setSoilData({...soilData, description: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-primary-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                  {t('getRecommendationBtn')}
                </button>
              </form>
            )}

            {activeTab === 'disease-detection' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-[20px] flex items-center justify-center text-red-600">
                      <Search size={28} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white font-display tracking-tight">
                      {t('scanCrop') || 'Scan Crop'}
                    </h3>
                  </div>

                  <button 
                    onClick={handleBluetoothConnect}
                    disabled={isBluetoothConnected}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-2xl font-bold transition-all active:scale-95 shadow-sm text-xs",
                      isBluetoothConnected 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                  >
                    {isBluetoothConnecting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : isBluetoothConnected ? (
                      <BluetoothConnected size={16} />
                    ) : (
                      <Bluetooth size={16} />
                    )}
                    <span className="hidden sm:inline">
                      {isBluetoothConnected ? 'Connected' : 'Camera'}
                    </span>
                  </button>
                </div>

                {!image ? (
                  <label className={cn(
                    "flex flex-col items-center justify-center h-80 border-4 border-dashed rounded-[40px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all group",
                    errors.image ? "border-red-500 bg-red-50/50 dark:bg-red-900/10" : "border-gray-100 dark:border-gray-700"
                  )}>
                    <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-[24px] flex items-center justify-center text-primary-600 mb-4 group-hover:scale-110 transition-transform">
                      <Camera size={32} />
                    </div>
                    <p className="text-lg font-black text-gray-900 dark:text-white">
                      {t('uploadImage')}
                    </p>
                    {errors.image && <p className="text-sm text-red-500 font-bold mt-2">{errors.image}</p>}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                ) : (
                  <div className="relative rounded-[40px] overflow-hidden group shadow-2xl">
                    <img src={image} alt="Upload" className="w-full h-80 object-cover" />
                    
                    {/* Scanning Animation Overlay */}
                    <AnimatePresence>
                      {isLoading && (
                        <motion.div 
                          initial={{ top: '0%' }}
                          animate={{ top: '100%' }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-1 bg-primary-500 shadow-[0_0_15px_rgba(76,175,80,0.8)] z-10"
                        />
                      )}
                    </AnimatePresence>

                    <button 
                      onClick={() => setImage(null)}
                      className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-white transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                        {t('plantType')}
                      </label>
                      <select 
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-[24px] font-bold dark:text-white"
                        value={plantType}
                        onChange={e => setPlantType(e.target.value)}
                      >
                        <option value="tomato">{t('tomato')}</option>
                        <option value="potato">{t('potato')}</option>
                        <option value="corn">{t('corn')}</option>
                        <option value="wheat">{t('wheat')}</option>
                        <option value="coffee">{t('coffee')}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                        {t('symptomsDescription') || 'Symptoms'}
                      </label>
                      <input 
                        type="text"
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-[24px] font-bold dark:text-white"
                        placeholder={t('symptomsPlaceholder') || 'Describe visual signs...'}
                        value={symptoms}
                        onChange={e => setSymptoms(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleDiseaseDetection}
                    disabled={!image || isLoading}
                    className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-primary-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
                    {t('analyzeHealthBtn')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'animal-recommendation' && (
              <form onSubmit={handleAnimalRecommendation} className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-[20px] flex items-center justify-center text-amber-600">
                    <Dog size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white font-display tracking-tight">
                    {t('livestockPlanner')}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                        {t('locationLabel')}
                      </label>
                      <input 
                        type="text" 
                        className={cn(
                          "w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border rounded-[24px] font-bold dark:text-white transition-all",
                          errors.location ? "border-red-500" : "border-gray-100 dark:border-gray-700"
                        )}
                        placeholder="e.g. Highland, Kenya"
                        value={farmData.location}
                        onChange={e => setFarmData({...farmData, location: e.target.value})}
                      />
                      {errors.location && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.location}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                        {t('altitude')}
                      </label>
                      <input 
                        type="number" 
                        className={cn(
                          "w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border rounded-[24px] font-bold dark:text-white transition-all",
                          errors.altitude ? "border-red-500" : "border-gray-100 dark:border-gray-700"
                        )}
                        placeholder="e.g. 1500"
                        value={farmData.altitude}
                        onChange={e => setFarmData({...farmData, altitude: e.target.value})}
                      />
                      {errors.altitude && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.altitude}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                        {t('rainfallLabel')}
                      </label>
                      <input 
                        type="number" 
                        className={cn(
                          "w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border rounded-[24px] font-bold dark:text-white transition-all",
                          errors.rainfall ? "border-red-500" : "border-gray-100 dark:border-gray-700"
                        )}
                        placeholder="e.g. 1200"
                        value={farmData.rainfall}
                        onChange={e => setFarmData({...farmData, rainfall: e.target.value})}
                      />
                      {errors.rainfall && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.rainfall}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                        {t('temperatureLabel')}
                      </label>
                      <input 
                        type="number" 
                        className={cn(
                          "w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border rounded-[24px] font-bold dark:text-white transition-all",
                          errors.temperature ? "border-red-500" : "border-gray-100 dark:border-gray-700"
                        )}
                        placeholder="e.g. 25"
                        value={farmData.temperature}
                        onChange={e => setFarmData({...farmData, temperature: e.target.value})}
                      />
                      {errors.temperature && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.temperature}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                        {t('spaceAcres')}
                      </label>
                      <input 
                        type="number" 
                        className={cn(
                          "w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border rounded-[24px] font-bold dark:text-white transition-all",
                          errors.availableSpace ? "border-red-500" : "border-gray-100 dark:border-gray-700"
                        )}
                        placeholder="e.g. 5"
                        value={farmData.availableSpace}
                        onChange={e => setFarmData({...farmData, availableSpace: e.target.value})}
                      />
                      {errors.availableSpace && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.availableSpace}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                        {t('animalGoals')}
                      </label>
                      <select 
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-[24px] font-bold dark:text-white"
                        value={farmData.primaryGoal}
                        onChange={e => setFarmData({...farmData, primaryGoal: e.target.value})}
                      >
                        <option value="meat">{t('meatProduction')}</option>
                        <option value="dairy">{t('dairyProduction')}</option>
                        <option value="eggs">{t('eggProduction')}</option>
                        <option value="wool">{t('woolFiber')}</option>
                        <option value="breeding">{t('breeding')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                      {t('additionalContext')}
                    </label>
                    <textarea 
                      className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-[24px] font-bold dark:text-white h-24 resize-none"
                      placeholder="Describe your farm's unique conditions, challenges, or specific goals..."
                      value={farmData.description}
                      onChange={e => setFarmData({...farmData, description: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-primary-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                  {t('getAnimalPlanBtn')}
                </button>
              </form>
            )}
          </div>

          <div className="bg-primary-900 rounded-[48px] p-10 text-white shadow-2xl">
            <h4 className="text-xl font-black mb-6 flex items-center gap-3 font-display tracking-tight">
              <Info size={24} />
              {activeTab === 'disease-detection' ? t('photoGuidelines') || 'Photo Guidelines' : t('aiCapabilities')}
            </h4>
            <div className="space-y-4">
              {activeTab === 'disease-detection' ? (
                [
                  t('guideLeafFocus') || 'Focus on affected leaves',
                  t('guideNaturalLighting') || 'Use natural lighting',
                  t('guideCaptureSides') || 'Capture both sides',
                  t('guideHighRes') || 'High resolution photo'
                ].map((guide, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                    <span className="text-sm font-bold text-primary-100">{guide}</span>
                  </div>
                ))
              ) : (
                [
                  t('thinkingMode'),
                  t('googleSearchGrounding'),
                  t('multimodalAnalysis')
                ].map((cap, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                    <span className="text-sm font-bold text-primary-100">{cap}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-40 space-y-8 bg-white dark:bg-gray-800 rounded-[48px] border-4 border-dashed border-gray-100 dark:border-gray-700 shadow-2xl shadow-black/5"
              >
                <div className="relative">
                  <div className="w-32 h-32 bg-primary-100 dark:bg-primary-900/30 rounded-full animate-ping absolute inset-0"></div>
                  <div className="w-32 h-32 bg-primary-600 rounded-full flex items-center justify-center text-white relative z-10 shadow-2xl shadow-primary-600/40">
                    <Bot size={56} />
                  </div>
                </div>
                <div className="text-center px-10">
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight uppercase">
                    {t('thinking')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    {t('aiThinkingDesc')}
                  </p>
                </div>
              </motion.div>
            ) : aiError ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-40 space-y-6 bg-white dark:bg-gray-800 rounded-[48px] border-4 border-dashed border-red-100 dark:border-red-900/50 text-center px-12 shadow-2xl"
              >
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600">
                  <AlertCircle size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white font-display tracking-tight uppercase">
                    Analysis Failed
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium max-w-md mx-auto">
                    {aiError}
                  </p>
                  <button 
                    onClick={() => {
                      if (activeTab === 'crop-recommendation') handleCropRecommendation({ preventDefault: () => {} } as any);
                      else if (activeTab === 'disease-detection') handleDiseaseDetection();
                      else if (activeTab === 'animal-recommendation') handleAnimalRecommendation({ preventDefault: () => {} } as any);
                    }}
                    className="mt-6 px-8 py-3 bg-primary-600 text-white rounded-full font-black text-sm hover:bg-primary-700 transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-gray-800 rounded-[48px] shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-700 p-10">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight uppercase">
                      {t('aiOutput')}
                    </h3>
                    <div className="px-6 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm font-black border border-primary-100 dark:border-primary-900/30 flex items-center gap-2">
                      <Sparkles size={16} />
                      {t('verified')}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="prose dark:prose-invert max-w-none">
                      <Markdown>{result}</Markdown>
                    </div>

                    <div className="mt-12 pt-10 border-t border-gray-50 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={handleSaveToLog}
                        disabled={isSaving}
                        className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[20px] font-black text-sm transition-all active:scale-95 shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2"
                      >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {isSaving ? t('saving') : t('saveToFarmLog')}
                      </button>
                      <button className="flex-1 py-4 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-[20px] font-black text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-all active:scale-95">
                        {t('downloadPdfBtn')}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 space-y-8 bg-white dark:bg-gray-800 rounded-[48px] border-4 border-dashed border-gray-100 dark:border-gray-700 text-center px-12 shadow-2xl shadow-black/5">
                <div className="w-32 h-32 bg-gray-50 dark:bg-gray-900/50 rounded-full flex items-center justify-center text-gray-200">
                  <Bot size={64} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight uppercase">
                    {t('readyForAnalysis')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium max-w-md mx-auto">
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

export default AiLab;
