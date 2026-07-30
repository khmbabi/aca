import React, { useState } from 'react';
import { 
  Search,
  Leaf,
  Menu, 
  Moon, 
  Sun, 
  Globe, 
  User as UserIcon, 
  LogOut, 
  Settings as SettingsIcon,
  ChevronDown,
  Bell,
  MessageSquare,
  Users
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit, 
  updateDoc, 
  doc, 
  writeBatch 
} from 'firebase/firestore';
import { UserProfile, Notification } from '../types';
import { cn, formatDate } from '../lib/utils';
import { PageId } from '../App';
import { useLanguage } from '../lib/LanguageContext';
import { useTheme } from '../lib/ThemeContext';
import { Language } from '../lib/translations';
import Logo from './Logo';
import TranslatedText from './TranslatedText';

interface HeaderProps {
  user: any;
  profile: UserProfile | null;
  onAuth: (mode: 'login' | 'signup') => void;
  onNavigate: (pageId: PageId) => void;
  isSidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  profile, 
  onAuth, 
  onNavigate, 
  isSidebarCollapsed
}) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  React.useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(notifsData);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    
    const batch = writeBatch(db);
    notifications.forEach(notif => {
      if (!notif.isRead) {
        batch.update(doc(db, 'notifications', notif.id), { isRead: true });
      }
    });
    
    try {
      await batch.commit();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const languagesList: { id: Language; label: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'am', label: 'አማርኛ' },
    { id: 'om', label: 'Afaan Oromoo' },
    { id: 'ti', label: 'ትግርኛ' },
    { id: 'sw', label: 'Kiswahili' },
    { id: 'es', label: 'Español' },
    { id: 'fr', label: 'Français' },
    { id: 'it', label: 'Italiano' },
    { id: 'ru', label: 'Русский' },
    { id: 'pt', label: 'Português' },
    { id: 'zh', label: '中文' },
    { id: 'ar', label: 'العربية' },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    onNavigate('home');
  };

  return (
    <header className={cn(
      "fixed top-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-40 border-b border-gray-100 dark:border-slate-800 transition-all duration-300 h-20 flex items-center",
      isSidebarCollapsed ? "left-20" : "left-0 md:left-72"
    )}>
      <div className="w-full px-6 lg:px-10 flex justify-between items-center">
        {/* Mobile Logo */}
        <div className="flex items-center gap-4 cursor-pointer group md:hidden" onClick={() => onNavigate('home')}>
          <Logo size="sm" />
        </div>

        {/* Desktop Navigation - Pro Look */}
        <nav className="hidden lg:flex items-center gap-8">
          {[
            { id: 'home', label: t('home') },
            { id: 'agri-feed', label: t('agriCommunity') },
            { id: 'market-data', label: t('marketData') },
            { id: 'education', label: t('education') },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as PageId)}
              className="text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full" />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4 lg:gap-6">
          {/* Search Bar - Aesthetic & Professional */}
          <div className="hidden md:flex items-center bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl px-4 py-2 w-48 lg:w-64 focus-within:w-80 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all duration-300">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              placeholder={t('search')} 
              className="bg-transparent border-none focus:ring-0 text-xs ml-2 w-full dark:text-white"
            />
          </div>

          <div className="flex items-center gap-1 lg:gap-2">
            {/* Notifications */}
            {user && (
              <div className="relative">
                <button 
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsLangOpen(false);
                    setIsProfileOpen(false);
                  }}
                  className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all relative"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 top-full mt-4 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 py-2 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('notifications')}</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700"
                        >
                          {t('markAllAsRead')}
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-6 py-10 text-center">
                          <Bell size={32} className="mx-auto text-gray-200 dark:text-slate-700 mb-4" />
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('noNotifications')}</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-50 dark:divide-slate-700">
                          {notifications.map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => {
                                markAsRead(notif.id);
                                if (notif.link) onNavigate(notif.link as PageId);
                                setIsNotificationsOpen(false);
                              }}
                              className={cn(
                                "w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors flex gap-3",
                                !notif.isRead && "bg-primary-50/30 dark:bg-primary-950/5"
                              )}
                            >
                              <div className={cn(
                                "w-2 h-2 mt-1.5 rounded-full shrink-0",
                                !notif.isRead ? "bg-primary-600" : "bg-transparent"
                              )} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-gray-900 dark:text-white mb-0.5 truncate uppercase tracking-tight">{notif.title}</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 font-medium mb-1 leading-relaxed">{notif.message}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{formatDate(notif.createdAt)}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="px-4 py-3 border-t border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50">
                      <button 
                        onClick={() => { setIsNotificationsOpen(false); /* Maybe navigate to full notifications page */ }}
                        className="w-full text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary-600"
                      >
                        {t('viewAllNotifications')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <Globe size={18} />
              </button>
              
              {isLangOpen && (
                <div className="absolute right-0 top-full mt-4 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 py-2 z-50">
                  {languagesList.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setLanguage(lang.id);
                        setIsLangOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center justify-between",
                        language === lang.id 
                          ? "text-primary-600 bg-primary-50 dark:bg-primary-950/20" 
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="h-6 w-px bg-gray-100 dark:bg-slate-800 hidden sm:block"></div>

          {/* Auth Buttons / Profile - Corner Placement */}
          {!user ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onAuth('login')}
                className="hidden sm:block px-5 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors"
              >
                {t('login')}
              </button>
              <button 
                onClick={() => onAuth('signup')}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary-600/20"
              >
                {t('signup')}
              </button>
            </div>
          ) : (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
              >
                <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md overflow-hidden">
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile?.firstName?.charAt(0).toUpperCase() || <UserIcon size={16} />
                  )}
                </div>
                <ChevronDown size={12} className={cn("text-gray-400 transition-transform duration-300 hidden sm:block", isProfileOpen && "rotate-180")} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-4 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-700 mb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('signedInAs')}</p>
                    <p className="text-xs font-bold truncate dark:text-white">{user.email}</p>
                  </div>
                  <div className="px-1 space-y-0.5">
                    <button 
                      onClick={() => { onNavigate('profile'); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <UserIcon size={16} className="text-gray-400" />
                      {t('myProfile')}
                    </button>
                    <button 
                      onClick={() => { onNavigate('settings'); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <SettingsIcon size={16} className="text-gray-400" />
                      {t('settings')}
                    </button>
                  </div>
                  <div className="h-px bg-gray-50 dark:bg-slate-700 my-2 mx-3"></div>
                  <div className="px-1">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
                      {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
