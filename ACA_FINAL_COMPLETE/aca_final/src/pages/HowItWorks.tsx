import React, { useState, useEffect } from 'react';
import { Camera, Cpu, TrendingUp, BookOpen, Users, Leaf, CheckCircle2,
  ArrowRight, Play, X, Sprout, CloudSun, BarChart3, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { PageId } from '../App';

interface HowItWorksProps { onNavigate: (page: PageId) => void; }

const STEPS = [
  { num: '1', icon: Camera, color: 'bg-emerald-500', emoji: '📸',
    title: 'Take a Photo', desc: 'Point your phone at any plant, leaf, or soil. Any crop. Any country. Any disease.' },
  { num: '2', icon: Cpu, color: 'bg-blue-500', emoji: '🤖',
    title: 'AI Analyses', desc: 'Gemini 1.5 Pro reads your image, checks global disease databases, and identifies issues in seconds.' },
  { num: '3', icon: TrendingUp, color: 'bg-amber-500', emoji: '✅',
    title: 'Get Your Plan', desc: 'Receive treatment advice, market prices, and next steps — all in your language.' },
];

const FEATURES = [
  { icon: Leaf,     color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', title: 'Crop Disease Scanner',  desc: 'AI diagnosis for any crop worldwide.', page: 'disease-detection' as PageId },
  { icon: Sparkles, color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20',       title: 'AI Lab',               desc: 'Crop & livestock recommendations.', page: 'ai-lab' as PageId },
  { icon: CloudSun, color: 'text-sky-500',     bg: 'bg-sky-50 dark:bg-sky-900/20',         title: 'Weather Forecast',     desc: 'Hyperlocal 7-day farming forecast.', page: 'weather' as PageId },
  { icon: BarChart3,color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-900/20',   title: 'Market Prices',        desc: 'Live global commodity prices.', page: 'market-data' as PageId },
  { icon: BookOpen, color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-900/20',   title: 'Education Hub',        desc: 'Free courses, videos, certificates.', page: 'education' as PageId },
  { icon: Users,    color: 'text-pink-500',    bg: 'bg-pink-50 dark:bg-pink-900/20',       title: 'AgriFeed Community',   desc: 'Connect with farmers worldwide.', page: 'agri-feed' as PageId },
];

const PROBLEMS = [
  { emoji: '😰', q: 'My leaves are turning yellow — what is wrong?', a: 'AI identifies nutrient deficiency in seconds' },
  { emoji: '🌧️', q: 'Is it safe to plant this week?',               a: 'Real-time weather + 7-day forecast for your farm' },
  { emoji: '💸', q: 'Am I selling at the right price?',              a: 'Live global market prices in your local currency' },
  { emoji: '🐛', q: 'These insects are destroying my crop!',         a: 'Pest encyclopedia with treatment guides' },
];

const CYCLE = [
  { emoji: '🌱', label: 'Plant' }, { emoji: '💧', label: 'Water' },
  { emoji: '☀️', label: 'Sun' },   { emoji: '🌿', label: 'Grow' },
  { emoji: '🔍', label: 'Scan' },  { emoji: '🌾', label: 'Harvest' },
  { emoji: '💰', label: 'Sell' },
];

const HowItWorks: React.FC<HowItWorksProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [activeProblem, setActiveProblem] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setActiveProblem(i => (i + 1) % PROBLEMS.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="overflow-hidden pb-20">
      {/* Hero */}
      <section className="relative py-16 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block px-5 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-black uppercase tracking-widest mb-6">
            🌱 How ACA Works
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[1.05] mb-6 tracking-tighter">
            Farming made simple<br /><span className="text-emerald-600">with AI.</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            ACA puts powerful technology in the hands of every farmer — no tech background needed.
          </p>
          <button onClick={() => setVideoOpen(true)}
            className="group inline-flex items-center gap-4 px-8 py-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 hover:shadow-2xl hover:border-emerald-200 transition-all">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg">
              <Play size={22} fill="currentColor" />
            </div>
            <span className="font-black text-gray-900 dark:text-white">Watch a farmer story</span>
            <ArrowRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* Problems panel */}
      <section className="px-6 mb-16">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[40px] border border-gray-100 dark:border-slate-800 shadow-2xl p-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight text-center mb-2">Real problems. Instant answers.</h2>
          <p className="text-gray-500 text-center font-medium mb-8">Tap a problem to see how ACA solves it</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROBLEMS.map((item, i) => (
              <motion.div key={i} onClick={() => setActiveProblem(i)} whileTap={{ scale: 0.98 }}
                className={cn('p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2',
                  activeProblem === i
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400'
                    : 'bg-gray-50 dark:bg-slate-800 border-transparent hover:border-gray-200')}>
                <div className="text-3xl mb-2">{item.emoji}</div>
                <p className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-2">❓ {item.q}</p>
                <AnimatePresence>
                  {activeProblem === i && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-emerald-700 dark:text-emerald-400 font-black text-sm">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {PROBLEMS.map((_, i) => (
              <button key={i} onClick={() => setActiveProblem(i)}
                className={cn('h-2 rounded-full transition-all', activeProblem === i ? 'w-8 bg-emerald-600' : 'w-2 bg-gray-300 dark:bg-gray-600')} />
            ))}
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="px-6 mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black font-display text-gray-900 dark:text-white mb-4">Three simple steps</h2>
            <p className="text-gray-500 font-medium">From photo to action in under a minute</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            {STEPS.map((step, i) => (
              <motion.div key={step.num} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6, type: 'spring', bounce: 0.3 }}
                className="flex flex-col items-center text-center group">
                <div className={cn('relative w-28 h-28 rounded-[40%] flex items-center justify-center mb-8 shadow-2xl z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3', step.color)}>
                  <span className="absolute -top-4 -right-4 text-2xl">{step.emoji}</span>
                  <step.icon size={52} className="text-white drop-shadow-lg" />
                  <div className="absolute -bottom-3 -left-3 w-9 h-9 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center font-black text-sm shadow-lg border-2 border-gray-100 dark:border-slate-700">
                    <span className="text-gray-800">{step.num}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Everything your farm needs</h2>
            <p className="text-gray-500 font-medium">Six powerful tools. One platform.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.button key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }} onClick={() => onNavigate(f.page)}
                className="p-8 bg-white dark:bg-slate-900 rounded-[32px] border border-gray-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-xl transition-all group text-left">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110', f.bg)}>
                  <f.icon size={28} className={f.color} />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-3 group-hover:text-emerald-600 transition-colors">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium">{f.desc}</p>
                <div className="flex items-center gap-2 mt-6 text-emerald-600 font-black text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  Open tool <ArrowRight size={14} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Crop Cycle */}
      <section className="px-6 mb-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-[48px] p-10 md:p-16 text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Your crop, from seed to sale</h2>
              <p className="text-emerald-300 mb-12 font-medium">ACA supports every stage of your agricultural journey.</p>
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                {CYCLE.map((stage, i) => (
                  <React.Fragment key={i}>
                    <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                      transition={{ delay: i * 0.12, type: 'spring', bounce: 0.5 }} className="flex flex-col items-center gap-2">
                      <motion.div animate={{ y: [0, -6, 0] }} transition={{ delay: i * 0.2, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl backdrop-blur border border-white/10">
                        {stage.emoji}
                      </motion.div>
                      <span className="text-xs font-bold text-emerald-300 text-center max-w-[64px] leading-tight">{stage.label}</span>
                    </motion.div>
                    {i < CYCLE.length - 1 && (
                      <div className="w-4 md:w-8 h-0.5 bg-white/20 flex-shrink-0">
                        <motion.div animate={{ scaleX: [0, 1, 0] }} transition={{ delay: i * 0.15 + 0.5, duration: 1.5, repeat: Infinity }}
                          className="h-full bg-emerald-400 origin-left" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-12 flex flex-wrap gap-4">
                <button onClick={() => onNavigate('ai-lab')}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black transition-all shadow-xl active:scale-95">
                  🔍 Scan My Crop
                </button>
                <button onClick={() => onNavigate('education')}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-black transition-all active:scale-95">
                  📚 Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="text-6xl mb-6">🌍</div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">Ready to grow smarter?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg font-medium">Join thousands of farmers already using ACA across 40+ countries.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => onNavigate('dashboard')}
              className="px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/25 active:scale-95 transition-all">
              Go to Dashboard
            </button>
            <button onClick={() => onNavigate('home')}
              className="px-10 py-5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-2xl font-black text-lg transition-all active:scale-95">
              Back to Home
            </button>
          </div>
        </motion.div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {videoOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setVideoOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="relative w-full max-w-3xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl z-10">
              <button onClick={() => setVideoOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white z-20 transition-colors">
                <X size={20} />
              </button>
              <iframe src="https://www.youtube.com/embed/Pjov9tivBdk?autoplay=1"
                allow="autoplay; fullscreen" className="w-full h-full" title="How ACA Works" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HowItWorks;
