import React, { useState, useRef } from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Rss, 
  Leaf, 
  Bot, 
  Search, 
  BookOpen, 
  BarChart3, 
  Globe, 
  Newspaper, 
  CloudSun, 
  User, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Dog,
  Sparkles,
  Calendar,
  Camera,
  ShieldCheck,
  MessageSquare,
  Users
  HelpCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PageId } from '../App';
import Logo from './Logo';
import { useLanguage } from '../lib/LanguageContext';
import { UserProfile } from '../types';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (pageId: PageId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  user: any;
  profile: UserProfile | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isCollapsed, onToggleCollapse, user, profile }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useLanguage();

  const navItems = [
    { id: 'how-it-works', label: 'How It Works', icon: HelpCircle },
    { id: 'home', label: t('home'), icon: Home },
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'agri-feed', label: t('agriFeed'), icon: Rss },
    { id: 'crop-database', label: t('cropDatabase'), icon: Leaf },
    { id: 'ai-lab', label: t('aiLab'), icon: Bot },
    { id: 'education', label: t('education'), icon: BookOpen },
    { id: 'market-data', label: t('marketData'), icon: BarChart3 },
    { id: 'global-agriculture', label: t('globalAgri'), icon: Globe },
    { id: 'news', label: t('news'), icon: Newspaper },
    { id: 'weather', label: t('weather'), icon: CloudSun },
  ];

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  // The sidebar is visually expanded if either it's not collapsed OR it's being hovered
  const isExpanded = !isCollapsed || isHovered;

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-primary-900 dark:bg-slate-950 text-white z-30 shadow-2xl transition-all duration-300 ease-in-out border-r border-white/5",
        isExpanded ? "w-72" : "w-20"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-4 flex justify-between items-center h-20">
        {isExpanded ? (
          <Logo className="px-2" size="md" />
        ) : (
          <Logo showText={false} size="sm" className="mx-auto" />
        )}
        <button 
          onClick={onToggleCollapse}
          className={cn(
            "p-2 hover:bg-white/10 rounded-lg transition-all duration-300",
            !isExpanded && "mx-auto"
          )}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="p-3 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar flex flex-col">
        <div className="space-y-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as PageId)}
              className={cn(
                "flex items-center w-full px-3 py-3 rounded-xl transition-all duration-200 group",
                currentPage === item.id 
                  ? "bg-white/20 text-white shadow-sm" 
                  : "text-primary-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon 
                className={cn(
                  "shrink-0 transition-all duration-300",
                  isExpanded ? "mr-3" : "mx-auto"
                )} 
                size={22} 
              />
              <span className={cn(
                "whitespace-nowrap transition-all duration-300 overflow-hidden",
                isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
              )}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {user && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
            {profile?.is_admin && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={cn(
                  "flex items-center w-full px-3 py-3 rounded-xl transition-all duration-200 text-primary-100 hover:bg-white/10 hover:text-white group bg-primary-800/50 mb-2 border border-white/5",
                  currentPage === 'admin-dashboard' && "bg-white/20 text-white"
                )}
              >
                <ShieldCheck 
                  className={cn(
                    "shrink-0 transition-all duration-300 text-amber-400",
                    isExpanded ? "mr-3" : "mx-auto"
                  )} 
                  size={22} 
                />
                <span className={cn(
                  "whitespace-nowrap transition-all duration-300 overflow-hidden font-bold",
                  isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                )}>
                  Admin Panel
                </span>
              </button>
            )}
            <button
              onClick={() => onNavigate('profile')}
              className={cn(
                "flex items-center w-full px-3 py-3 rounded-xl transition-all duration-200 text-primary-100 hover:bg-white/10 hover:text-white group",
                currentPage === 'profile' && "bg-white/20 text-white"
              )}
            >
              <User 
                className={cn(
                  "shrink-0 transition-all duration-300",
                  isExpanded ? "mr-3" : "mx-auto"
                )} 
                size={22} 
              />
              <span className={cn(
                "whitespace-nowrap transition-all duration-300 overflow-hidden",
                isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
              )}>
                {t('myAccount')}
              </span>
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className={cn(
                "flex items-center w-full px-3 py-3 rounded-xl transition-all duration-200 text-primary-100 hover:bg-white/10 hover:text-white group",
                currentPage === 'settings' && "bg-white/20 text-white"
              )}
            >
              <Settings 
                className={cn(
                  "shrink-0 transition-all duration-300",
                  isExpanded ? "mr-3" : "mx-auto"
                )} 
                size={22} 
              />
              <span className={cn(
                "whitespace-nowrap transition-all duration-300 overflow-hidden",
                isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
              )}>
                {t('settings')}
              </span>
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
