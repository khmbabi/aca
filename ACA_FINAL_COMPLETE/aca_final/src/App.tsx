/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from './types';
import { cn } from './lib/utils';
import { useTheme } from './lib/ThemeContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import AuthModal from './components/AuthModal';
import Onboarding from './components/Onboarding';
import Chatbot from './components/Chatbot';
import ToastContainer, { useToast } from './components/Toast';

// Pages
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Dashboard from './pages/Dashboard';
import AgriFeed from './pages/AgriFeed';
import CropDatabase from './pages/CropDatabase';
import AiLab from './pages/AiLab';
import Education from './pages/Education';
import MarketData from './pages/MarketData';
import GlobalAgriculture from './pages/GlobalAgriculture';
import News from './pages/News';
import Weather from './pages/Weather';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Unsubscribe from './pages/Unsubscribe';
import PestEncyclopedia from './pages/PestEncyclopedia';

export type PageId = 'how-it-works' | 'home' | 'dashboard' | 'agri-feed' | 'crop-database' | 'ai-lab' | 'education' | 'market-data' | 'global-agriculture' | 'news' | 'weather' | 'pest-encyclopedia' | 'profile' | 'settings' | 'admin-dashboard' | 'reset-password' | 'verify-email' | 'unsubscribe';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { theme } = useTheme();
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    // Handle manual routing for reset password, verify email, and unsubscribe
    const path = window.location.pathname;
    if (path === '/reset-password') {
      setCurrentPage('reset-password');
    } else if (path === '/verify-email') {
      setCurrentPage('verify-email');
    } else if (path === '/unsubscribe') {
      setCurrentPage('unsubscribe');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.uid);
      } else {
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const path = `profiles/${userId}`;
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        // Create initial profile if it doesn't exist
        const newProfile: UserProfile = {
          id: userId,
          firstName: auth.currentUser?.displayName?.split(' ')[0] || 'User',
          lastName: auth.currentUser?.displayName?.split(' ')[1] || '',
          email: auth.currentUser?.email || '',
          avatarUrl: auth.currentUser?.photoURL || '',
          is_verified: auth.currentUser?.emailVerified || false,
          onboarded: false,
          createdAt: new Date().toISOString(),
        };
        try {
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      addToast("Failed to load user profile. Please check your connection.", "error");
    }
  };

  const handleOnboardingComplete = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  const PAGE_TITLES: Record<string, string> = {
    'home':               'ACA Platform — Smart Farming AI',
    'dashboard':          'Dashboard — ACA Platform',
    'agri-feed':          'AgriFeed — Farming Community',
    'crop-database':      'Crop Database — ACA Platform',
    'ai-lab':             'AI Lab — Crop & Animal Recommendations',
    'education':          'Education Hub — ACA Platform',
    'market-data':        'Market Prices — ACA Platform',
    'global-agriculture': 'Global Agriculture — ACA Platform',
    'news':               'Agricultural News — ACA Platform',
    'weather':            'Weather Forecast — ACA Platform',
    'pest-encyclopedia':  'Pest Encyclopedia — ACA Platform',
    'profile':            'Profile — ACA Platform',
    'settings':           'Settings — ACA Platform',
    'admin-dashboard':    'Admin Dashboard — ACA Platform',
    'how-it-works':       'How It Works — ACA Platform',
  };

  const handlePageChange = (pageId: PageId) => {
    setCurrentPage(pageId);
    window.scrollTo(0, 0);
    // Update browser tab title
    document.title = PAGE_TITLES[pageId] || 'ACA Platform';
    // Update meta description
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      const descs: Record<string, string> = {
        'home':        'ACA Platform — AI-powered crop analysis for farmers worldwide.',
        'agri-feed':   'Connect with farmers globally on ACA AgriFeed.',
        'education':   'Free agricultural courses, videos, books and certificates.',
        'ai-lab':      'AI-powered crop and livestock recommendations.',
        'market-data': 'Live global agricultural commodity prices.',
        'dashboard':   'Your personal farm dashboard and analytics.',
      };
      meta.setAttribute('content', descs[pageId] || 'ACA Platform — Agricultural Crop Analysis AI');
    }
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleNavigation = (pageId: string) => {
    if (pageId === 'profile') setTargetUserId(null);
    setCurrentPage(pageId as PageId);
    window.scrollTo(0, 0);
    handlePageChange(pageId as PageId);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'how-it-works': return <HowItWorks onNavigate={handlePageChange} />;
      case 'home': return <Home onNavigate={handlePageChange} onAuth={openAuth} />;
      case 'dashboard': return <Dashboard />;
      case 'agri-feed': return (
        <AgriFeed 
          user={user} 
          profile={profile} 
          onNavigateToProfile={(uid) => { 
            setTargetUserId(uid);
            setCurrentPage('profile'); 
          }} 
        />
      );
      case 'crop-database': return <CropDatabase />;
      case 'ai-lab': return <AiLab />;
      case 'education': return <Education onNavigate={handlePageChange} />;
      case 'market-data': return <MarketData />;
      case 'global-agriculture': return <GlobalAgriculture />;
      case 'news': return <News />;
      case 'weather': return <Weather />;
      case 'profile': return (
        <Profile 
          user={user} 
          profile={profile} 
          targetUserId={targetUserId}
          onUpdate={(p) => {
            if (!targetUserId || targetUserId === user?.uid) {
              setProfile(p);
            }
          }} 
        />
      );
      case 'settings': return <Settings />;
      case 'reset-password': return <ResetPassword />;
      case 'verify-email': return <VerifyEmail />;
      case 'unsubscribe': return <Unsubscribe />;
      case 'admin-dashboard': return profile?.is_admin ? <AdminDashboard /> : <Home onNavigate={handlePageChange} onAuth={openAuth} />;
      default: return <Home onNavigate={handlePageChange} onAuth={openAuth} />;
    }
  };

  return (
    <div className={cn("min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-500", theme)}>
      <div className="flex flex-1">
        {/* Sidebar - Desktop/Tablet */}
        <div className="hidden md:block h-full">
          <Sidebar 
            currentPage={currentPage} 
            onNavigate={handleNavigation} 
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            user={user}
            profile={profile}
          />
        </div>

        {/* Mobile Navigation */}
        <BottomNav currentPage={currentPage} onNavigate={handleNavigation} />

        <div className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          !isSidebarCollapsed ? "md:ml-72" : "md:ml-20"
        )}>
          <Header 
            user={user} 
            profile={profile} 
            onAuth={openAuth} 
            onNavigate={handleNavigation}
            isSidebarCollapsed={isSidebarCollapsed}
          />
          
          <main className="flex-1 pt-20 pb-32 lg:pb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <Chatbot user={user} />
      
      {user && profile && profile.onboarded === false && (
        <Onboarding 
          user={user} 
          profile={profile} 
          onComplete={handleOnboardingComplete} 
        />
      )}
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode} 
        addToast={addToast}
      />
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
