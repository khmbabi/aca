import React, { useState } from 'react';
import { 
  ArrowRight, 
  Leaf, 
  Zap, 
  Globe, 
  TrendingUp, 
  Users, 
  Database,
  CheckCircle2,
  Sparkles,
  Bot,
  LayoutDashboard,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { PageId } from '../App';
import Logo from '../components/Logo';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';
import TranslatedText from '../components/TranslatedText';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface HomeProps {
  onNavigate: (pageId: PageId) => void;
  onAuth: (mode: 'login' | 'signup') => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate, onAuth }) => {
  const { t } = useLanguage();
  const [statsType, setStatsType] = useState<'personal' | 'org'>('personal');
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubscribing(true);
    setSubscribeStatus('idle');
    setErrorMessage('');

    try {
      // Send confirmation email via our server route (which also handles Firestore storage)
      const res = await fetch('/api/send-subscription-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSubscribeStatus('success');
        setEmail('');
      } else {
        setSubscribeStatus('error');
        setErrorMessage(data.error || t('failedToSubscribe'));
      }
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      setSubscribeStatus('error');
      setErrorMessage(t('failedToSubscribe'));
    } finally {
      setIsSubscribing(false);
    }
  };

  const features = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, desc: t('dashboardHomeDesc') },
    { id: 'agri-feed', label: t('agri-feed'), icon: Users, desc: t('agrifeedHomeDesc') },
    { id: 'crop-database', label: t('crop-database'), icon: Database, desc: t('cropDatabaseHomeDesc') },
    { id: 'ai-lab', label: t('ai-lab'), icon: Bot, desc: t('aiLabHomeDesc') },
    { id: 'education', label: t('education'), icon: BookOpen, desc: t('educationHomeDesc') },
    { id: 'market-data', label: t('market-data'), icon: TrendingUp, desc: t('marketDataHomeDesc') },
    { id: 'global-agriculture', label: t('global-agriculture'), icon: Globe, desc: t('globalAgHomeDesc') },
    { id: 'news', label: t('news'), icon: Zap, desc: t('newsHomeDesc') },
    { id: 'weather', label: t('weather'), icon: Sparkles, desc: t('weatherHomeDesc') },
  ];

  const stats = {
    personal: [
      { label: t('countries'), value: '50+' },
      { label: t('farmers'), value: '10K+' },
      { label: t('acresMonitored'), value: '100K+' },
      { label: t('avgYieldIncrease'), value: '30%' },
    ],
    org: [
      { label: t('countries'), value: '30+' },
      { label: t('organizations'), value: '500+' },
      { label: t('acresManaged'), value: '500K+' },
      { label: t('avgEfficiencyGain'), value: '25%' },
    ]
  };

  return (
    <div className="bg-white dark:bg-gray-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-8 bg-gradient-to-b from-primary-50/50 to-white dark:from-primary-950/20 dark:to-gray-950">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 text-[10px] font-black text-primary-600 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6 uppercase tracking-widest">
              {t('nowInPublicBeta')}
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white font-display leading-[1.1] mb-6 tracking-tighter uppercase">
              {t('smartFarming')}<br />
              <span className="text-primary-600">{t('greaterYields')}</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 font-medium">
              {t('heroDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => onNavigate('dashboard')}
                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-sm tracking-widest transition-all shadow-xl shadow-primary-600/20 active:scale-95"
              >
                {t('dashboard')}
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('features');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-2xl font-black text-sm tracking-widest transition-all active:scale-95"
              >
                {t('exploreFeatures')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose ACA? */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white font-display mb-8 tracking-tighter uppercase leading-none">
              {t('whyChooseAca')} <span className="text-primary-600">ACA?</span>
            </h2>
            <div className="space-y-6">
              {[
                { title: t('precisionAgriculture'), desc: t('precisionAgDesc') },
                { title: t('diseaseDetectionAca'), desc: t('diseaseDetectionDescAca') },
                { title: t('marketIntelligence'), desc: t('marketIntelligenceDesc') },
                { title: t('communityDriven'), desc: t('communityDrivenDesc') },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1 bg-primary-100 dark:bg-primary-900/30 p-1 rounded-lg shrink-0">
                    <CheckCircle2 size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square bg-primary-600 rounded-[64px] overflow-hidden shadow-2xl rotate-3">
              <img 
                src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=1000&auto=format&fit=crop" 
                alt="Modern Farming" 
                className="w-full h-full object-cover opacity-80 mix-blend-overlay -rotate-3 scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-[200px]">
              <div className="text-2xl font-black text-primary-600 mb-1">98%</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {t('accuracyInDiseaseDetection')}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-24 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#16a34a_0%,transparent_50%)]" />
        </div>
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <h2 className="text-sm font-black text-primary-500 uppercase tracking-[0.3em] mb-8">
            {t('ourMission')}
          </h2>
          <p className="text-2xl md:text-4xl font-black font-display leading-tight tracking-tight mb-12">
            {t('missionStatement')}
          </p>
          <div className="w-20 h-1 bg-primary-600 mx-auto rounded-full" />
        </div>
      </section>

      {/* Key Technologies */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white font-display mb-4 tracking-tight uppercase">
            {t('poweredByInnovation')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {t('innovationSubtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: t('computerVision'), desc: t('computerVisionDesc'), icon: Bot },
            { title: t('iotIntegration'), desc: t('iotIntegrationDesc'), icon: Database },
            { title: t('predictiveAnalytics'), desc: t('predictiveAnalyticsDesc'), icon: TrendingUp },
            { title: t('cloudComputing'), desc: t('cloudComputingDesc'), icon: Database },
          ].map((tech, i) => (
            <div key={i} className="p-8 rounded-[40px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-600 mb-6">
                <tech.icon size={24} />
              </div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">
                {tech.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                {tech.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white font-display mb-4 tracking-tight uppercase">
            {t('everythingYouNeed')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto">
            {t('featuresSubtitle')}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => onNavigate(feature.id as PageId)}
                className="flex flex-col items-center text-center p-6 rounded-[32px] bg-gray-50 dark:bg-gray-900 border border-transparent hover:border-primary-500/30 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group"
              >
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-primary-600 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {feature.label}
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-bold uppercase tracking-widest">
                  {feature.desc}
                </p>
              </button>
            ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex justify-center mb-12">
            <div className="bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 inline-flex">
              <button 
                onClick={() => setStatsType('personal')}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  statsType === 'personal' ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                {t('personalFarmers')}
              </button>
              <button 
                onClick={() => setStatsType('org')}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  statsType === 'org' ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                {t('organizations')}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats[statsType].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-black text-primary-600 font-display mb-2 tracking-tighter">{stat.value}</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white font-display mb-4 tracking-tight uppercase">
            {t('whatFarmersSay')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {t('joinThousands')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Tewodros J.', role: t('coffeeFarmerEthiopia'), text: t('testimonial1'), img: 'https://i.pravatar.cc/150?u=1' },
            { name: 'Amina M.', role: t('vegetableFarmerKenya'), text: t('testimonial2'), img: 'https://i.pravatar.cc/150?u=2' },
            { name: 'Samuel M.', role: t('maizeFarmerSouthAfrica'), text: t('testimonial3'), img: 'https://i.pravatar.cc/150?u=3' },
          ].map((t, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full grayscale" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{t.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {t.role}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic font-medium">
                "{t.text}"
              </p>
              <div className="mt-6 text-amber-500 flex gap-1">
                {[...Array(5)].map((_, i) => <Sparkles key={i} size={12} fill="currentColor" />)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white font-display mb-4 tracking-tight uppercase">
              {t('howAcaWorks')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {t('howItWorksSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '1', title: t('connect'), text: t('connectStep') },
              { step: '2', title: t('analyze'), text: t('analyzeStep') },
              { step: '3', title: t('act'), text: t('actStep') },
            ].map((s, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 bg-primary-600 text-white rounded-[32px] flex items-center justify-center text-3xl font-black font-display mx-auto mb-6 shadow-xl shadow-primary-600/20 group-hover:scale-110 transition-transform">
                  {s.step}
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">
                  {s.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white text-center px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black font-display mb-6 tracking-tighter uppercase leading-none">
            {t('readyToTransform')}
          </h2>
          <p className="text-lg text-primary-100 mb-10 font-medium">
            {t('transformationSubtitle')}
          </p>
          <button 
            onClick={() => onAuth('signup')}
            className="px-10 py-5 bg-white text-primary-600 hover:bg-gray-50 rounded-2xl font-black text-sm tracking-widest transition-all active:scale-95 shadow-2xl"
          >
            {t('startFreeTrial')}
          </button>
          <p className="mt-6 text-[10px] font-black text-primary-200 uppercase tracking-[0.2em]">
            {t('noCreditCard')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100 dark:border-gray-800 px-8 bg-gray-50/50 dark:bg-gray-900/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <button 
              onClick={() => onNavigate('home')}
              className="bg-transparent border-none p-0 cursor-pointer text-left block"
            >
              <Logo size="md" />
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              {t('footerDescription')}
            </p>
            <div className="flex gap-4">
              {['facebook', 'twitter', 'linkedin', 'instagram'].map(social => (
                <a 
                  key={social} 
                  href={social === 'instagram' ? "https://www.instagram.com/aca.platform/?utm_source=ig_web_button_share_sheet" : "#"} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-600 transition-all shadow-sm"
                >
                  <span className="sr-only">
                    {social}
                  </span>
                  <div className="w-5 h-5 bg-current mask-icon" style={{ WebkitMaskImage: `url(https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${social}.svg)`, maskImage: `url(https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${social}.svg)` }} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">
              {t('contactUs')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">
                <MapPin size={18} className="text-primary-600 shrink-0" />
                <span>{t('addisAbabaEthiopia')}</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">
                <Phone size={18} className="text-primary-600 shrink-0" />
                <span>+251 938451440</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">
                <Mail size={18} className="text-primary-600 shrink-0" />
                <a href="mailto:officialagroanylsis@gmail.com" className="hover:text-primary-600 transition-colors">officialagroanylsis@gmail.com</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Dashboard', id: 'dashboard' },
                { label: 'Crop Database', id: 'crop-database' },
                { label: 'Education', id: 'education' },
                { label: 'Market Data', id: 'market-data' }
              ].map(item => (
                <li key={item.id}>
                  <button 
                    onClick={() => onNavigate(item.id as PageId)}
                    className="text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors bg-transparent border-none p-0 cursor-pointer text-left"
                  >
                    {t(item.label.toLowerCase().replace(' ', ''))}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">
              {t('newsletter')}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">
              {t('newsletterSubtitle')}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex gap-2">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailAddress')} 
                  required
                  disabled={isSubscribing}
                  className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={isSubscribing}
                  className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20 disabled:opacity-50"
                >
                  {isSubscribing ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                </button>
              </div>
              {subscribeStatus === 'success' && (
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">
                  {t('subscribedSuccessfully')}
                </p>
              )}
              {subscribeStatus === 'error' && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
                  {errorMessage}
                </p>
              )}
            </form>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {t('allRightsReserved')}
          </p>
          <div className="flex gap-8">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <a key={item} href="#" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-colors">
                {t(item.toLowerCase().replace(/ /g, ''))}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
