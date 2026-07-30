import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Tractor, 
  Ruler, 
  Leaf, 
  Camera, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Smartphone, 
  ShieldCheck,
  Building2,
  Trash2,
  ChevronRight,
  UserCheck,
  UserPlus,
  MessageSquare
} from 'lucide-react';
import { auth, db, storage } from '../lib/firebase';
import { doc, updateDoc, getDoc, query, collection, where, limit, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import TranslatedText from '../components/TranslatedText';
import { useLanguage } from '../lib/LanguageContext';

interface ProfileProps {
  user: any | null;
  profile: UserProfile | null;
  targetUserId?: string | null;
  onUpdate: (profile: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, profile: myProfile, targetUserId, onUpdate }) => {
  const { t } = useLanguage();
  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passResetStatus, setPassResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const isOwnProfile = !targetUserId || targetUserId === user?.uid;
  const currentProfile = isOwnProfile ? myProfile : targetProfile;

  useEffect(() => {
    if (isOwnProfile && myProfile) {
      setFormData(myProfile);
    } else if (targetUserId) {
      fetchTargetProfile(targetUserId);
    }
  }, [targetUserId, myProfile]);

  const fetchTargetProfile = async (uid: string) => {
    setIsLoading(true);
    try {
      const docSnap = await getDoc(doc(db, 'profiles', uid));
      if (docSnap.exists()) {
        setTargetProfile({ id: uid, ...docSnap.data() } as UserProfile);
      }
    } catch (error) {
      console.error("Error fetching target profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const docRef = doc(db, 'profiles', user.uid);
      await updateDoc(docRef, formData);
      onUpdate({ ...myProfile, ...formData } as UserProfile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Error updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      alert('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error("Error sending verification:", error);
      alert(error.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setPassResetStatus('sending');
    try {
      await sendPasswordResetEmail(auth, user.email);
      setPassResetStatus('sent');
      setTimeout(() => setPassResetStatus('idle'), 5000);
    } catch (error) {
      console.error("Error resetting password:", error);
      setPassResetStatus('error');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const docRef = doc(db, 'profiles', user.uid);
      await updateDoc(docRef, { avatarUrl: downloadURL });
      
      onUpdate({ ...myProfile, avatarUrl: downloadURL } as UserProfile);
      setFormData(prev => ({ ...prev, avatarUrl: downloadURL }));
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert('Error uploading avatar.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user && isOwnProfile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-20 text-center space-y-4">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
          <UserIcon size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
          {t('pleaseLogInProfile')}
        </h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-20 text-center">
        <Loader2 size={40} className="animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white font-display uppercase tracking-tight">
            {isOwnProfile ? t('myAccount') : `${currentProfile?.firstName}'s Profile`}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            {isOwnProfile 
              ? "Manage your personal information, farm details, and security."
              : `View farming expertise and details about ${currentProfile?.firstName}.`
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isOwnProfile && (
            <button 
              type="submit"
              form="profile-form"
              disabled={isSaving}
              className="flex items-center gap-2 px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {t('saveChanges')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Cards */}
        <div className="lg:col-span-4 space-y-8">
          {/* Avatar Card */}
          <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 p-8 flex flex-col items-center text-center space-y-6">
            <div className="relative group">
              <div className="w-32 h-32 bg-primary-50 dark:bg-primary-950/30 rounded-full flex items-center justify-center text-primary-600 text-4xl font-black overflow-hidden shadow-inner border-4 border-white dark:border-gray-800 shadow-xl group-hover:scale-105 transition-transform">
                {isUploading ? (
                  <Loader2 size={40} className="animate-spin" />
                ) : currentProfile?.avatarUrl ? (
                  <img src={currentProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  currentProfile?.firstName?.charAt(0).toUpperCase()
                )}
              </div>
              {isOwnProfile && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={24} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                </label>
              )}
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {currentProfile?.firstName} {currentProfile?.lastName}
              </h3>
              <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mt-1">
                {currentProfile?.username ? `@${currentProfile.username}` : 'Farmer'}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-gray-50 dark:border-gray-800">
              <div className="text-center">
                <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {currentProfile?.orgType === 'Company' ? 'Org' : 'Indiv'}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {currentProfile?.followersCount || 0}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {currentProfile?.followingCount || 0}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Following</p>
              </div>
            </div>
          </div>

          {/* Security Card - Only if own profile */}
          {isOwnProfile && (
            <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 p-8 space-y-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary-600" />
                {t('accountSecurity')}
              </h3>
              <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Email Status</p>
                  {(user.emailVerified || myProfile?.is_verified) ? (
                    <span className="flex items-center gap-1 text-[10px] font-black text-green-500 uppercase tracking-widest">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                      <AlertCircle size={12} /> Pending
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium truncate">{user.email}</p>
                {!user.emailVerified && (
                  <button 
                    onClick={handleResendVerification}
                    className="mt-3 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 underline underline-offset-4"
                  >
                    Resend Verification Link
                  </button>
                )}
              </div>

              <button 
                onClick={handlePasswordReset}
                disabled={passResetStatus === 'sending'}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-950/20 border border-gray-100 dark:border-gray-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Key size={18} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                  <span className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-tight">{t('changePassword')}</span>
                </div>
                {passResetStatus === 'sending' ? (
                  <Loader2 size={16} className="animate-spin text-primary-600" />
                ) : passResetStatus === 'sent' ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <ChevronRight size={16} className="text-gray-300" />
                )}
              </button>
              {passResetStatus === 'sent' && (
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest text-center">Reset link sent to your email!</p>
              )}
            </div>
          </div>
        )}
      </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          <form id="profile-form" onSubmit={handleSave} className="space-y-8">
            {/* Essential Info */}
            <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 p-8 sm:p-10">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">
                {t('profileInformation')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('firstName')}</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white font-bold"
                      value={formData.firstName || ''}
                      onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('lastName')}</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white font-bold"
                      value={formData.lastName || ''}
                      onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('phoneNumber')}</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input 
                      type="tel" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white font-bold"
                      value={formData.phone || ''}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Community Username</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 font-black transition-colors">@</span>
                    <input 
                      type="text" 
                      className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white font-bold"
                      placeholder="username"
                      value={formData.username || ''}
                      onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Professional Bio</label>
                  <textarea 
                    rows={3}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white font-medium resize-none"
                    placeholder="Tell the farming community about your experience and focus..."
                    value={formData.bio || ''}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Farm & Organization Info */}
            <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-sm border border-gray-100 dark:border-gray-800 p-8 sm:p-10">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-8">
                {t('farmInfo')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4 md:col-span-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Type of Professional</label>
                  <div className="flex gap-4">
                    {[
                      { id: 'Individual Farmer', icon: UserIcon, label: 'Individual Farmer' },
                      { id: 'Company', icon: Building2, label: 'Organization' }
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, orgType: type.id as any })}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all",
                          formData.orgType === type.id 
                            ? "bg-primary-50 dark:bg-primary-950/20 border-primary-600 text-primary-600" 
                            : "bg-gray-50 dark:bg-gray-800 border-transparent text-gray-400 hover:bg-gray-100"
                        )}
                      >
                        <type.icon size={18} />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('farmName')}</label>
                  <div className="relative group">
                    <Tractor className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white font-bold"
                      value={formData.farmName || ''}
                      onChange={e => setFormData({ ...formData, farmName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('farmSize')}</label>
                  <div className="relative group">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input 
                      type="number" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white font-bold"
                      value={formData.farmSize || ''}
                      onChange={e => setFormData({ ...formData, farmSize: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('mainCrop')}</label>
                  <div className="relative group">
                    <Leaf className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <select 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white font-bold appearance-none"
                      value={formData.mainCrop || ''}
                      onChange={e => setFormData({ ...formData, mainCrop: e.target.value })}
                    >
                      <option value="">Select Crop</option>
                      <option value="maize">Maize</option>
                      <option value="wheat">Wheat</option>
                      <option value="coffee">Coffee</option>
                      <option value="teff">Teff</option>
                      <option value="barley">Barley</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Main Husbandry</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">🐄</span>
                    <select 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white font-bold appearance-none"
                      value={formData.mainHusbandry || ''}
                      onChange={e => setFormData({ ...formData, mainHusbandry: e.target.value })}
                    >
                      <option value="">Select Livestock</option>
                      <option value="Cattle">Cattle</option>
                      <option value="Poultry">Poultry</option>
                      <option value="Sheep/Goats">Sheep & Goats</option>
                      <option value="Pigs">Pigs</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('location')}</label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                    <input 
                      type="text" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl focus:ring-4 focus:ring-primary-500/10 outline-none transition-all dark:text-white font-bold"
                      value={formData.farmLocation || ''}
                      onChange={e => setFormData({ ...formData, farmLocation: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Danger Zone - only if own */}
          {isOwnProfile && (
            <div className="bg-red-50/30 dark:bg-red-950/10 rounded-[40px] border border-red-100/50 dark:border-red-900/20 p-8 flex items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h4 className="font-black text-red-600 uppercase tracking-tight">Danger Zone</h4>
                  <p className="text-sm text-gray-500 font-medium">Permanently delete your account and all associated data.</p>
                </div>
              </div>
              <button className="px-6 py-3 bg-white dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all">
                Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
