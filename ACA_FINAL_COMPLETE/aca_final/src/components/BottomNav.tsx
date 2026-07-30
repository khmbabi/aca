import React from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Bot, 
  Search, 
  Globe,
  Camera,
  Users,
  MessageSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PageId } from '../App';
import { useLanguage } from '../lib/LanguageContext';

interface BottomNavProps {
  currentPage: PageId;
  onNavigate: (pageId: PageId) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const { t } = useLanguage();

  const primaryItems = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'ai-lab', icon: Bot, label: t('aiLab') },
    { id: 'global-agriculture', icon: Globe, label: t('globalAgri') },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
      <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-gray-100 dark:border-white/10 rounded-[32px] p-2 shadow-2xl flex items-center justify-between">
        {primaryItems.slice(0, 2).map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as PageId)}
            className={cn(
              "flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all duration-300",
              currentPage === item.id 
                ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30" 
                : "text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
            )}
          >
            <item.icon size={22} className={currentPage === item.id ? "scale-110" : ""} />
          </button>
        ))}

        {/* Floating Action Button for Scan - Mobile Only Spotlight */}
        <div className="relative -mt-10">
          <div className="absolute inset-0 bg-primary-600 blur-xl opacity-20 scale-125 animate-pulse pointer-events-none" />
          <button
            onClick={() => onNavigate('ai-lab')}
            className="relative bg-primary-600 h-14 w-14 rounded-full shadow-[0_10px_20px_-5px_rgba(76,175,80,0.4)] flex items-center justify-center text-white transform hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-slate-900"
          >
            <Camera size={28} strokeWidth={2.5} />
          </button>
        </div>

        {primaryItems.slice(2, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as PageId)}
            className={cn(
              "flex flex-col items-center justify-center py-3 px-4 rounded-2xl transition-all duration-300",
              currentPage === item.id 
                ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30" 
                : "text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5"
            )}
          >
            <item.icon size={22} className={currentPage === item.id ? "scale-110" : ""} />
          </button>
        ))}
      </nav>
    </div>
  );
};

export default BottomNav;
