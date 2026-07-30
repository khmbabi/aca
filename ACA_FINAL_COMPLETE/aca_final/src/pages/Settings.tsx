import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Eye, 
  Globe, 
  Moon, 
  Sun, 
  Smartphone, 
  Mail, 
  Trash2, 
  LogOut, 
  ChevronRight, 
  Check,
  Palette,
  BellRing,
  Lock,
  User as UserIcon,
  Key,
  ShieldCheck,
  CreditCard,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import TranslatedText from '../components/TranslatedText';
import { useLanguage } from '../lib/LanguageContext';
import { useTheme } from '../lib/ThemeContext';
import { auth } from '../lib/firebase';
import { signOut, sendPasswordResetEmail } from 'firebase/auth';

const Settings: React.FC = () => {
  const { language, setLanguage, languages, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('General');
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [passResetStatus, setPassResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResettingData, setIsResettingData] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const user = auth.currentUser;

  const sections = [
    { id: 'General', icon: SettingsIcon, label: t('general'), description: 'Account status and fundamental preferences' },
    { id: 'Notifications', icon: BellRing, label: t('notifications'), description: 'Manage how you receive alerts and updates' },
    { id: 'Privacy & Security', icon: ShieldCheck, label: t('privacy'), description: 'Control your data and visibility settings' },
    { id: 'Appearance', icon: Palette, label: t('appearance'), description: 'Customize the look and feel of your workspace' },
    { id: 'Language', icon: Globe, label: t('language'), description: 'Select your preferred local language' }
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setPassResetStatus('sending');
    try {
      // Use our custom server-side password reset trigger (sends email)
      const res = await fetch('/api/send-custom-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      if (res.ok) {
        setPassResetStatus('sent');
        setTimeout(() => setPassResetStatus('idle'), 5000);
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setPassResetStatus('error');
    }
  };

  const handleDirectPasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newPassword.length < 6) return;

    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, newPassword })
      });
      if (res.ok) {
        setPassResetStatus('sent');
        setShowPasswordForm(false);
        setNewPassword('');
        setTimeout(() => setPassResetStatus('idle'), 5000);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setPassResetStatus('error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        await signOut(auth);
        window.location.href = '/';
      } else {
        alert(data.error || "Failed to delete account. Please try again later.");
      }
    } catch (error) {
      console.error("Delete account error:", error);
      alert("A connection error occurred. Your account might not have been fully deleted.");
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleResetData = async () => {
    if (!user) return;
    setIsResettingData(true);
    try {
      const res = await fetch('/api/reset-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      
      if (res.ok) {
        alert("Your farming data has been reset successfully.");
        setIsResetModalOpen(false);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to reset data.");
      }
    } catch (error) {
      console.error("Reset data error:", error);
      alert("A connection error occurred.");
    } finally {
      setIsResettingData(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white font-display uppercase tracking-tight">
            {t('settings')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            {t('settingsDesc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-gray-900 rounded-[40px] p-4 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
            <div className="space-y-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-5 rounded-[32px] transition-all group relative overflow-hidden",
                    activeSection === section.id 
                      ? "bg-primary-600 text-white shadow-xl shadow-primary-600/20" 
                      : "text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <section.icon size={22} className={cn("shrink-0 transition-transform", activeSection === section.id ? "scale-110" : "group-hover:translate-x-1")} />
                  <div className="text-left">
                    <p className="font-black text-sm uppercase tracking-widest">{section.label}</p>
                    {activeSection === section.id && (
                      <motion.p layoutId="desc" className="text-[10px] text-white/70 font-bold uppercase tracking-tight truncate max-w-[180px]">
                        {section.description}
                      </motion.p>
                    )}
                  </div>
                  {activeSection === section.id && (
                    <div className="absolute right-6">
                      <ChevronRight size={18} />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800">
              <button 
                onClick={() => setIsSignOutModalOpen(true)}
                className="w-full flex items-center justify-between px-6 py-5 rounded-[32px] font-black text-xs uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <LogOut size={22} />
                  <span>{t('signOut')}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-[48px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="p-10 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight font-display mb-1">
                    {sections.find(s => s.id === activeSection)?.label}
                  </h3>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {sections.find(s => s.id === activeSection)?.description}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/20 rounded-2xl flex items-center justify-center text-primary-600 shadow-inner">
                  {activeSection === 'General' && <SettingsIcon size={24} />}
                  {activeSection === 'Notifications' && <BellRing size={24} />}
                  {activeSection === 'Privacy & Security' && <Lock size={24} />}
                  {activeSection === 'Appearance' && <Palette size={24} />}
                  {activeSection === 'Language' && <Globe size={24} />}
                </div>
              </div>

              <div className="p-10">
                {activeSection === 'General' && (
                  <div className="space-y-12">
                    <div className="flex items-center justify-between gap-10">
                      <div className="space-y-1">
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">
                          {t('profileVisibility')}
                        </h4>
                        <p className="text-sm text-gray-500 font-medium">
                          {t('profileVisibilityDesc')}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between gap-10">
                      <div className="space-y-1">
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">
                          {t('dataSync')}
                        </h4>
                        <p className="text-sm text-gray-500 font-medium">
                          {t('dataSyncDesc')}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                      </label>
                    </div>

                    <div className="pt-10 border-t border-gray-50 dark:border-gray-800 space-y-8">
                      <div>
                        <h4 className="font-black text-amber-600 uppercase tracking-tight mb-4">
                          Reset Environment
                        </h4>
                        <p className="text-sm text-gray-500 font-medium mb-6">Want to start fresh? This will wipe all your crop scans and history but keep your account active.</p>
                        <button 
                          onClick={() => setIsResetModalOpen(true)}
                          className="flex items-center gap-3 px-8 py-4 bg-amber-50 dark:bg-amber-900/10 text-amber-600 rounded-[28px] font-black text-xs uppercase tracking-widest hover:bg-amber-100 transition-all shadow-sm"
                        >
                          Reset All Farming Data
                        </button>
                      </div>

                      <div className="pt-8 border-t border-gray-50 dark:border-gray-800">
                        <h4 className="font-black text-red-500 uppercase tracking-tight mb-4">
                          {t('dangerZone')}
                        </h4>
                        <p className="text-sm text-gray-500 font-medium mb-6">Deleting your account is permanent. All farm logs, AI sensor data, and community contributions will be irreversibly removed.</p>
                        <button 
                          onClick={() => setIsDeleteModalOpen(true)}
                          className="flex items-center gap-3 px-8 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-[28px] font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
                          {t('deleteAccount')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'Notifications' && (
                  <div className="space-y-12">
                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        {t('alertChannels')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { id: 'Push', icon: Smartphone, enabled: true, label: 'Push' },
                          { id: 'Email', icon: Mail, enabled: true, label: 'Email' },
                          { id: 'SMS', icon: Bell, enabled: false, label: 'SMS' }
                        ].map(channel => (
                          <button 
                            key={channel.id}
                            className={cn(
                              "flex flex-col items-center justify-center p-8 rounded-[40px] border-4 transition-all gap-4",
                              channel.enabled 
                                ? "bg-primary-50 dark:bg-primary-950/20 border-primary-100 dark:border-primary-900/30 text-primary-600 shadow-sm" 
                                : "bg-white dark:bg-gray-800/20 border-gray-50 dark:border-gray-800 text-gray-400 opacity-60"
                            )}
                          >
                            <channel.icon size={28} />
                            <span className="font-black text-xs uppercase tracking-widest">
                              {channel.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-8 pt-10 border-t border-gray-50 dark:border-gray-800">
                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        {t('notificationTypes')}
                      </h4>
                      <div className="grid grid-cols-1 gap-6">
                        {[
                          { title: t('weatherAlerts'), desc: t('weatherAlertsDesc') },
                          { title: t('marketUpdates'), desc: t('marketUpdatesDesc') },
                          { title: t('communityActivity'), desc: t('communityActivityDesc') },
                          { title: t('systemStatus'), desc: t('systemStatusDesc') }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-slate-800/30 rounded-3xl border border-gray-100/50 dark:border-slate-800/50">
                            <div className="space-y-1">
                              <h5 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">
                                {item.title}
                              </h5>
                              <p className="text-xs text-gray-500 font-medium">
                                {item.desc}
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'Privacy & Security' && (
                  <div className="space-y-12">
                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        {t('accountSecurity')}
                      </h4>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="p-8 bg-gray-50 dark:bg-slate-800/30 rounded-[40px] border border-gray-100 dark:border-slate-800/50 space-y-6">
                          <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-6", showPasswordForm && "pb-6 border-b border-gray-100 dark:border-slate-800")}>
                            <div className="flex gap-6 items-center">
                              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center text-primary-600 shadow-xl">
                                <Key size={32} />
                              </div>
                              <div>
                                <h5 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-lg leading-none mb-2">
                                  {t('changePassword')}
                                </h5>
                                <p className="text-sm text-gray-500 font-medium">
                                  Keep your farm's data safe by updating your credentials.
                                </p>
                                {passResetStatus === 'sent' && (
                                  <motion.p 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-xs font-black text-green-500 uppercase tracking-widest mt-2"
                                  >
                                    Password updated successfully!
                                  </motion.p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <button 
                                onClick={handlePasswordReset}
                                disabled={passResetStatus === 'sending'}
                                className="px-6 py-4 border border-primary-200 dark:border-primary-900 text-primary-600 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all hover:bg-primary-50 dark:hover:bg-primary-900/10 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                              >
                                {passResetStatus === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                                Send Reset Link
                              </button>
                              <button 
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[24px] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary-600/20 active:scale-95 flex items-center gap-2"
                              >
                                <Lock size={16} />
                                Direct Update
                              </button>
                            </div>
                          </div>

                          {showPasswordForm && (
                            <motion.form 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              onSubmit={handleDirectPasswordUpdate}
                              className="pt-6 space-y-4"
                            >
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">New Secure Password</label>
                                <input 
                                  type="password"
                                  required
                                  minLength={6}
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
                                  placeholder="••••••••"
                                />
                              </div>
                              <div className="flex justify-end gap-3">
                                <button 
                                  type="button"
                                  onClick={() => setShowPasswordForm(false)}
                                  className="px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-500"
                                >
                                  Cancel
                                </button>
                                <button 
                                  type="submit"
                                  disabled={isUpdatingPassword}
                                  className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                                >
                                  {isUpdatingPassword ? <Loader2 className="animate-spin" size={16} /> : "Update Now"}
                                </button>
                              </div>
                            </motion.form>
                          )}
                        </div>

                        <div className="p-8 bg-gray-50 dark:bg-slate-800/30 rounded-[40px] border border-gray-100 dark:border-slate-800/50 flex items-center justify-between gap-6">
                          <div className="flex gap-6 items-center">
                            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center text-amber-600 shadow-xl">
                              <Shield size={32} />
                            </div>
                            <div>
                              <h5 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-lg leading-none mb-2">
                                Two-Factor Auth
                              </h5>
                              <p className="text-sm text-gray-500 font-medium">
                                Add an extra layer of security to your farm account.
                              </p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 pt-10 border-t border-gray-50 dark:border-gray-800">
                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        {t('dataPrivacy')}
                      </h4>
                      <div className="p-8 bg-blue-50/30 dark:bg-blue-900/10 rounded-[40px] border border-blue-100/50 dark:border-blue-900/20 space-y-6">
                        <div className="flex gap-5">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                            <Eye size={24} />
                          </div>
                          <div>
                            <h5 className="font-black text-blue-900 dark:text-blue-100 uppercase tracking-tight">Public Visibility</h5>
                            <p className="text-sm text-gray-500 font-medium">Control who can see your farm's productivity metrics and expert rank in the Agri Feed.</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {['Everyone', 'Trusted Only', 'Private'].map(option => (
                            <button 
                              key={option}
                              className={cn(
                                "px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all",
                                option === 'Trusted Only' 
                                  ? "bg-blue-600 text-white border-blue-600 shadow-lg" 
                                  : "bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-slate-800"
                              )}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'Appearance' && (
                  <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <button 
                        onClick={() => setTheme('light')}
                        className={cn(
                          "flex flex-col items-center gap-6 p-10 rounded-[48px] border-4 transition-all relative overflow-hidden group",
                          theme === 'light' 
                            ? "border-primary-600 bg-primary-50 dark:bg-primary-950/20 text-primary-600 shadow-xl shadow-primary-600/10" 
                            : "border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-gray-400 hover:border-primary-100"
                        )}
                      >
                        <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-3xl shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Sun size={40} />
                        </div>
                        <span className="font-black uppercase tracking-[0.2em] text-xs">
                          {t('lightMode')}
                        </span>
                        {theme === 'light' && (
                          <div className="absolute top-6 right-6 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg">
                            <Check size={18} />
                          </div>
                        )}
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={cn(
                          "flex flex-col items-center gap-6 p-10 rounded-[48px] border-4 transition-all relative overflow-hidden group",
                          theme === 'dark' 
                            ? "border-primary-600 bg-primary-50 dark:bg-primary-950/20 text-primary-600 shadow-xl shadow-primary-600/10" 
                            : "border-gray-50 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-gray-400 hover:border-primary-100"
                        )}
                      >
                        <div className="w-20 h-20 bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <Moon size={40} />
                        </div>
                        <span className="font-black uppercase tracking-[0.2em] text-xs">
                          {t('darkMode')}
                        </span>
                        {theme === 'dark' && (
                          <div className="absolute top-6 right-6 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg">
                            <Check size={18} />
                          </div>
                        )}
                      </button>
                    </div>

                    <div className="space-y-6 pt-10 border-t border-gray-50 dark:border-gray-800">
                      <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        {t('accentColor')}
                      </h4>
                      <div className="flex flex-wrap gap-5">
                        {['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'].map(color => (
                          <button 
                            key={color}
                            className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 shadow-lg shadow-black/5 transition-all hover:scale-110 active:scale-90"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'Language' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {languages.map(lang => (
                      <button 
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={cn(
                          "w-full flex items-center justify-between p-8 rounded-[40px] border-4 transition-all relative overflow-hidden group",
                          language === lang.code 
                            ? "bg-primary-50 dark:bg-primary-950/20 border-primary-600 shadow-sm" 
                            : "bg-white dark:bg-slate-900/50 border-gray-50 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/80"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-colors",
                            language === lang.code ? "bg-primary-600 text-white shadow-lg" : "bg-gray-100 dark:bg-slate-800 text-gray-500"
                          )}>
                            {lang.code.toUpperCase()}
                          </div>
                          <div className="text-left">
                            <p className={cn(
                              "font-black uppercase tracking-tight text-sm",
                              language === lang.code ? "text-primary-900 dark:text-primary-100" : "text-gray-900 dark:text-white"
                            )}>{lang.name}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang.nativeName}</p>
                          </div>
                        </div>
                        {language === lang.code && (
                          <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-md">
                            <Check size={14} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-10 bg-gray-50/50 dark:bg-slate-950/20 border-t border-gray-50 dark:border-gray-800 flex justify-end gap-6 items-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:block">Configuration will be saved automatically</p>
                <div className="flex gap-4">
                  <button className="px-10 py-4 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-3xl font-black text-xs uppercase tracking-widest border border-gray-100 dark:border-slate-700 hover:bg-gray-50 transition-all active:scale-95">
                    {t('cancel')}
                  </button>
                  <button className="px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary-600/20 active:scale-95">
                    {t('saveChanges')}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {isSignOutModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl p-10 border border-gray-100 dark:border-slate-800 space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 rounded-[32px] flex items-center justify-center text-red-600 mx-auto shadow-inner">
                <LogOut size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Confirm Sign Out</h3>
              <p className="text-gray-500 font-medium leading-relaxed">Are you sure you want to end your session? You'll need to sign back in to access your farm intelligence.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setIsSignOutModalOpen(false)}
                className="px-6 py-4 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-3xl font-black text-xs uppercase tracking-widest transition-all hover:bg-gray-100"
              >
                No, Stay
              </button>
              <button 
                onClick={handleSignOut}
                className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-600/20"
              >
                Yes, Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reset Data Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl p-10 border border-gray-100 dark:border-slate-800 space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/20 rounded-[32px] flex items-center justify-center text-amber-600 mx-auto shadow-inner">
                <Bell size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Reset Data?</h3>
              <p className="text-gray-500 font-medium leading-relaxed">This will clear your crop scans and history. Your profile and settings will remain untouched.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setIsResetModalOpen(false)}
                className="px-6 py-4 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-3xl font-black text-xs uppercase tracking-widest transition-all hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={handleResetData}
                disabled={isResettingData}
                className="px-6 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isResettingData ? <Loader2 size={16} className="animate-spin" /> : "Reset Now"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl p-10 border border-gray-100 dark:border-slate-800 space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 rounded-[32px] flex items-center justify-center text-red-600 mx-auto shadow-inner">
                <Trash2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Delete Account?</h3>
              <p className="text-gray-500 font-medium leading-relaxed">This action is irreversible. All your data will be permanently wiped from the ACA Platform.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-6 py-4 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded-3xl font-black text-xs uppercase tracking-widest transition-all hover:bg-gray-100"
              >
                No, Keep it
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeletingAccount ? <Loader2 size={16} className="animate-spin" /> : "Delete Forever"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Settings;
