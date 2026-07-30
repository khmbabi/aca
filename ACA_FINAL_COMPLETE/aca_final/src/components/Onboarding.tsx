import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tractor, Leaf, User as UserIcon, Shield, ChevronRight, ChevronLeft, Check, Smartphone, Building2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';

interface OnboardingProps {
  user: any;
  profile: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ user, profile, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    orgType: 'Individual Farmer',
    mainCrop: '',
    mainHusbandry: '',
    username: profile.username || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  const totalSteps = 3;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'profiles', user.uid);
      const updatedProfile = {
        ...profile,
        ...formData,
        onboarded: true,
      };
      await updateDoc(docRef, {
        ...formData,
        onboarded: true,
      });
      onComplete(updatedProfile as UserProfile);
    } catch (error) {
      console.error("Error saving onboarding data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Who are you?</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Tell us about your agricultural background.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({ ...formData, orgType: 'Individual Farmer' })}
                className={cn(
                  "p-8 rounded-[32px] border-4 transition-all text-left flex flex-col gap-4",
                  formData.orgType === 'Individual Farmer'
                    ? "border-primary-600 bg-primary-50 dark:bg-primary-950/30"
                    : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                  formData.orgType === 'Individual Farmer' ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                )}>
                  <Tractor size={24} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Individual Farmer</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">For independent growers and small-scale farms.</p>
                </div>
                {formData.orgType === 'Individual Farmer' && (
                  <div className="mt-auto flex justify-end">
                    <Check className="text-primary-600" size={24} />
                  </div>
                )}
              </button>
              <button
                onClick={() => setFormData({ ...formData, orgType: 'Company' })}
                className={cn(
                  "p-8 rounded-[32px] border-4 transition-all text-left flex flex-col gap-4",
                  formData.orgType === 'Company'
                    ? "border-primary-600 bg-primary-50 dark:bg-primary-950/30"
                    : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                  formData.orgType === 'Company' ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                )}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Organization</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">For cooperatives, agricultural firms, and enterprises.</p>
                </div>
                {formData.orgType === 'Company' && (
                  <div className="mt-auto flex justify-end">
                    <Check className="text-primary-600" size={24} />
                  </div>
                )}
              </button>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Your Expertise</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">What's the main focus of your farming operations?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Main Crop</label>
                <div className="relative">
                  <Leaf className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600" size={20} />
                  <select
                    value={formData.mainCrop}
                    onChange={(e) => setFormData({ ...formData, mainCrop: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-primary-500/20 outline-none appearance-none font-bold dark:text-white"
                  >
                    <option value="">Select Primary Crop</option>
                    <option value="Maize">Maize</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Teff">Teff</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Main Husbandry</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600">🐄</span>
                  <select
                    value={formData.mainHusbandry}
                    onChange={(e) => setFormData({ ...formData, mainHusbandry: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-primary-500/20 outline-none appearance-none font-bold dark:text-white"
                  >
                    <option value="">Select Main Livestock</option>
                    <option value="Cattle">Cattle</option>
                    <option value="Poultry">Poultry</option>
                    <option value="Sheep/Goats">Sheep & Goats</option>
                    <option value="Pigs">Pigs</option>
                    <option value="Beekeeping">Beekeeping</option>
                    <option value="None">None (Purely Crop)</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Identity</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">How should the agricultural community identify you?</p>
            </div>
            <div className="max-w-md mx-auto space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Community Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-600" size={20} />
                  <input
                    type="text"
                    placeholder="farmer_john"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-primary-500/20 outline-none font-bold dark:text-white"
                  />
                </div>
                <p className="text-[10px] text-gray-400 px-1 font-bold uppercase tracking-widest">Only letters, numbers, and underscores.</p>
              </div>
              
              <div className="p-6 bg-primary-50 dark:bg-primary-950/20 rounded-3xl border border-primary-100 dark:border-primary-900/30">
                <div className="flex gap-4">
                  <Shield className="text-primary-600 shrink-0" size={24} />
                  <p className="text-sm text-primary-900 dark:text-primary-100 font-medium leading-relaxed">
                    Setting a username helps you connect with other farmers in the Agri Feed. This will be your public identity.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-gray-50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  s === step ? "w-8 bg-primary-600" : s < step ? "w-4 bg-primary-200 dark:bg-slate-700" : "w-4 bg-gray-100 dark:bg-slate-800"
                )}
              />
            ))}
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Step {step} of 3</span>
        </div>

        <div className="flex-1 overflow-y-auto p-8 sm:p-12">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        <div className="p-8 border-t border-gray-50 dark:border-slate-800 flex justify-between items-center gap-4">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-8 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-black text-xs uppercase tracking-widest transition-all"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={step === 2 && (!formData.mainCrop || !formData.mainHusbandry)}
              className="flex items-center gap-2 px-10 py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary-600/20 active:scale-95"
            >
              Continue
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!formData.username || isSubmitting}
              className="flex items-center gap-2 px-10 py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary-600/20 active:scale-95"
            >
              {isSubmitting ? 'Starting...' : 'Complete Setup'}
              {!isSubmitting && <Check size={18} />}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
