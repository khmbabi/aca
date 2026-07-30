/**
 * Education.tsx — ACA Platform Education Hub
 * Features: Articles, Videos (Cloudinary), PDFs (Cloudinary/Firebase),
 * Learning Paths, Books, FAQ, Community posts.
 * All media uploads go through /api/education/upload → Cloudinary.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Play, Clock, Search, ChevronRight, GraduationCap,
  Award, Globe, Leaf, X, CheckCircle2, ArrowRight, TrendingUp,
  Users, Sprout, Sparkles, ShieldCheck, Upload, Download, Video,
  FileText, Image as ImageIcon, Plus, Loader2, Heart, Send,
  ChevronDown, ChevronUp, BadgeCheck, Lock, MessageSquare,
  Eye, Star, Trash2, AlertCircle, RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { db, auth, storage } from '../lib/firebase';
import {
  collection, addDoc, onSnapshot, query, orderBy,
  serverTimestamp, updateDoc, doc, increment, getDoc, limit, where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface EducationProps { onNavigate: (page: any) => void; }

// ── Static articles ───────────────────────────────────────────────────────────
const ARTICLES = [
  {
    id: 'soil-health', category: 'soil', readTime: '8 min', level: 'Beginner', icon: '🌍',
    title: 'Understanding Soil Health & Fertility',
    description: 'Master essential soil health indicators and improve productivity using organic and scientific methods.',
    tags: ['NPK', 'pH', 'Compost', 'Microbiome'],
    content: `## What Is Soil Health?\n\nSoil health is the foundation of farming. Healthy soil supports plant growth, recycles nutrients, filters water, and hosts billions of microorganisms.\n\n## Key Indicators\n\n**Soil pH (ideal: 6.0–7.0)**\n- Too acidic → aluminum & manganese become toxic\n- Too alkaline → iron, zinc become unavailable\n\n**Organic Matter (target: 3–5%)**\n- Improves water retention by up to 20%\n- Feeds beneficial soil microbes\n- Slowly releases nutrients\n\n**NPK — The Three Pillars**\n- N (Nitrogen): leafy growth — deficiency = yellow lower leaves\n- P (Phosphorus): roots & flowering — deficiency = purple-tinged leaves\n- K (Potassium): water regulation — deficiency = brown leaf edges\n\n## Practical Improvements\n\n✅ Add 2–4 inches of compost annually\n✅ Plant legume cover crops (fix 50–200 kg N/ha/year)\n✅ Reduce tillage — preserves earthworms & fungi\n✅ Mulch to reduce moisture loss by 25–50%\n✅ Rotate crops to balance nutrient draw`,
  },
  {
    id: 'ipm', category: 'pests', readTime: '10 min', level: 'Intermediate', icon: '🐛',
    title: 'Integrated Pest Management (IPM)',
    description: 'A science-based approach combining biological, cultural, and targeted chemical controls.',
    tags: ['Biological Control', 'Monitoring', 'Thresholds', 'Pesticide Safety'],
    content: `## What Is IPM?\n\nIPM uses multiple strategies to control pests while minimizing risks to people and the environment.\n\n## The 4 Core Principles\n\n**1. Prevention** — Select resistant varieties, rotate crops, maintain healthy soil\n**2. Monitoring** — Scout fields 2× per week. Correctly identify pests before acting.\n**3. Action Thresholds** — Not every pest needs treatment. Weigh cost vs damage.\n**4. Control (in order):**\n- 🟢 Biological: ladybugs for aphids, parasitic wasps for caterpillars\n- 🟡 Cultural: adjust planting dates, remove debris\n- 🟠 Mechanical: traps, barriers, hand-picking\n- 🔴 Chemical: targeted, low-toxicity (last resort)\n\n## Pesticide Safety\n- Always read the full label\n- Wear PPE: gloves, mask, goggles\n- Apply at dawn/dusk to protect pollinators\n- Respect pre-harvest intervals`,
  },
  {
    id: 'irrigation', category: 'water', readTime: '7 min', level: 'Beginner', icon: '💧',
    title: 'Efficient Irrigation & Water Conservation',
    description: 'Reduce water use by 50% while improving yields through smart irrigation strategies.',
    tags: ['Drip', 'Mulching', 'Rainwater', 'Timing'],
    content: `## Irrigation Methods\n\n| Method | Efficiency | Best Use |\n|--------|-----------|----------|\n| Flood | 40–50% | Rice, flat fields |\n| Sprinkler | 60–75% | Vegetables |\n| Drip | 85–95% | Orchards, vegetables |\n\n## The Finger Test\n- Push finger 5cm into soil near roots\n- Wet → wait | Moist → perfect | Dry → water now\n\n## Quick Wins\n✅ Mulch to cut evaporation by 25–50%\n✅ Water at dawn (less evaporation, less disease)\n✅ Fix all leaks (dripping tap = 20,000 L/year wasted)`,
  },
  {
    id: 'climate-smart', category: 'climate', readTime: '12 min', level: 'Advanced', icon: '🌡️',
    title: 'Climate-Smart Agriculture',
    description: 'Adapt your farming to changing climate and build long-term resilience.',
    tags: ['Carbon', 'Resilience', 'Agroforestry', 'Adaptation'],
    content: `## The 3 Pillars\n\n1. **Productivity** — Sustainably increase yields\n2. **Adaptation** — Reduce vulnerability to climate shocks\n3. **Mitigation** — Reduce greenhouse gas emissions\n\n## Practical Strategies\n\n**Crop Diversification**\n- Grow 3–5 different crops to spread risk\n- Include drought-tolerant varieties\n\n**Agroforestry**\n- Trees cool microclimate by 2–5°C\n- Can increase farm income 20–40%\n\n**Soil Carbon**\n- Each 1% increase in SOM → soil holds 20,000 more liters of water per hectare`,
  },
  {
    id: 'precision-ag', category: 'tech', readTime: '9 min', level: 'Advanced', icon: '🛰️',
    title: 'Precision Agriculture & Digital Tools',
    description: 'Use drones, sensors, AI, and satellite data to optimize farm inputs.',
    tags: ['Drones', 'IoT', 'AI', 'Satellite'],
    content: `## What Is Precision Agriculture?\n\nUsing data and technology to manage farm variability — delivering the right input, at the right place, at the right time.\n\n## Key Technologies\n\n**GPS & GIS Mapping** — Map soil variability and identify yield zones\n**Remote Sensing** — NDVI from Sentinel-2 (free, 10m, every 5 days)\n**IoT Soil Sensors** — Monitor moisture and temperature in real time\n**AI Disease Detection** — Upload photo → diagnosis in seconds (ACA Platform)\n\n## Getting Started (Low Budget)\n1. Use smartphone camera + ACA disease detection (free)\n2. Join a weather alert service (free options available)\n3. Keep digital farm records`,
  },
  {
    id: 'organic', category: 'organic', readTime: '11 min', level: 'Intermediate', icon: '🌿',
    title: 'Organic Farming: Principles & Practice',
    description: 'Build a profitable organic farm using natural inputs and biological processes.',
    tags: ['Certification', 'Natural Inputs', 'Composting', 'Premium'],
    content: `## The 4 Principles\n\n1. **Health** — Sustain soil, plant, animal, and human health\n2. **Ecology** — Work with natural systems\n3. **Fairness** — Equity for all living beings\n4. **Care** — Manage responsibly\n\n## Natural Pest Control\n- Neem oil: broad-spectrum, safe for bees when dry\n- Pyrethrin: from chrysanthemum, degrades in sunlight\n- Bacillus thuringiensis (Bt): kills caterpillars only\n- Trichoderma: soil fungus that fights root diseases\n\n## Certification Steps\n1. Choose certification body\n2. 3-year transition period (no synthetics)\n3. Annual farm inspections\n4. Premium: typically 20–80% above conventional`,
  },
  {
    id: 'business', category: 'business', readTime: '14 min', level: 'Intermediate', icon: '📊',
    title: 'Farm Business Planning',
    description: 'Turn your farm into a profitable business with budgeting and market strategies.',
    tags: ['Budgeting', 'Records', 'Market Access', 'Value Addition'],
    content: `## The Simple Farm Budget\n\n**Variable Costs:** Seeds, fertilizer, pesticides, hired labor\n**Fixed Costs:** Land rent, equipment depreciation\n**Gross Margin = Revenue - Variable Costs**\n**Net Income = Gross Margin - Fixed Costs**\n\n## Market Access\n- Direct sales: farm gate, farmers markets, WhatsApp orders\n- Cooperatives: pool produce for bulk pricing\n- Value addition: dried tomatoes vs fresh = 5–10× price difference\n\n## Cash Flow\n- Map income months vs expense months\n- Build 3-month operating reserve\n- Explore agricultural credit`,
  },
  {
    id: 'rotation', category: 'crops', readTime: '6 min', level: 'Beginner', icon: '🔄',
    title: 'Crop Rotation & Intercropping',
    description: 'Design rotation systems to build soil health, reduce pests, and stabilize income.',
    tags: ['Rotation', 'Companion Planting', 'N-Fixation', 'Stability'],
    content: `## Why Rotate?\n\n✅ Breaks pest and disease cycles\n✅ Balances soil nutrients\n✅ Reduces input costs 15–30%\n\n## Simple 4-Year Rotation\n\nPlot A: Maize → Legumes → Brassica → Roots → repeat\n\n**Key rule:** Never follow a crop with the same family next season.\n\n## Companion Planting\n- Maize + Beans: beans fix nitrogen for maize (save 40–60 kg N/ha)\n- Tomatoes + Basil: basil repels aphids and whiteflies\n- The Three Sisters: Maize + Beans + Squash — classic companion trio`,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: Globe },
  { id: 'soil', label: 'Soil Science', icon: Leaf },
  { id: 'pests', label: 'Pest & Disease', icon: Sparkles },
  { id: 'water', label: 'Water & Irrigation', icon: Sprout },
  { id: 'crops', label: 'Crop Management', icon: GraduationCap },
  { id: 'climate', label: 'Climate & Weather', icon: TrendingUp },
  { id: 'tech', label: 'Agri Technology', icon: Award },
  { id: 'business', label: 'Farm Business', icon: Users },
  { id: 'organic', label: 'Organic Farming', icon: CheckCircle2 },
];

const LEARNING_PATHS = [
  { id: 'beginner', title: 'Foundation Farmer', level: 'Beginner', emoji: '🌱',
    description: 'Essential knowledge for anyone starting or improving their farm.',
    lessons: ['soil-health', 'irrigation', 'rotation'],
    color: 'from-green-400 to-emerald-600', hours: 3, certificate: true },
  { id: 'intermediate', title: 'Smart Crop Manager', level: 'Intermediate', emoji: '🚀',
    description: 'Advanced pest management, organic practices, and business planning.',
    lessons: ['ipm', 'organic', 'business'],
    color: 'from-blue-400 to-violet-600', hours: 5, certificate: true },
  { id: 'advanced', title: 'Future Farmer Pro', level: 'Advanced', emoji: '🏆',
    description: 'Climate-smart agriculture and precision farming technologies.',
    lessons: ['climate-smart', 'precision-ag', 'business'],
    color: 'from-amber-400 to-orange-600', hours: 7, certificate: true },
];

const FAQS = [
  { q: 'What causes yellow leaves?', a: 'Yellow leaves usually mean nitrogen deficiency (bottom leaves first), overwatering, underwatering, or iron deficiency in alkaline soils. Use ACA\'s disease scanner for instant diagnosis.' },
  { q: 'How do I improve sandy soil?', a: 'Add large amounts of compost (5+ tonnes/ha), plant legume cover crops, apply clay or biochar, and mulch heavily. Results take 2–3 seasons but are lasting.' },
  { q: 'Best natural fertilizer?', a: 'Compost is the gold standard — balanced nutrients, feeds soil biology, improves water retention. For nitrogen boosts, use well-aged manure. For phosphorus, bone meal or rock phosphate.' },
  { q: 'How to control pests without chemicals?', a: 'Use IPM: identify the pest first, tolerate low populations, use biological controls (beneficial insects, Bt bacteria), try physical barriers, then botanical sprays before synthetics.' },
  { q: 'Best time to plant?', a: 'Plant after last frost for sensitive crops, align with rainy seasons for rain-fed farming. Check with your local agricultural extension for region-specific planting calendars.' },
  { q: 'How do I know if my farm is profitable?', a: 'Track: Total Revenue, Total Costs (inputs + labor + transport), Net Profit = Revenue minus Costs. Many farms improve by reducing post-harvest losses or accessing better markets.' },
  { q: 'Best crops for beginners?', a: 'Start with beans, cowpeas, leafy greens (harvest in 30–40 days), or tomatoes (high demand). Avoid complex crops like coffee until you have cash flow established.' },
  { q: 'Is organic farming more profitable?', a: 'Organic earns 20–80% price premiums but transition costs are high. Start with one field to test before converting your whole farm.' },
];

const Education: React.FC<EducationProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const user = auth.currentUser;

  const [activeTab, setActiveTab] = useState<'library' | 'paths' | 'videos' | 'books' | 'faq' | 'community'>('library');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<typeof ARTICLES[0] | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Cloudinary / Firebase media
  const [videos, setVideos]   = useState<any[]>([]);
  const [books, setBooks]     = useState<any[]>([]);
  const [community, setCommunity] = useState<any[]>([]);
  const [communityInput, setCommunityInput] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState<'video' | 'pdf' | 'image'>('video');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadMeta, setUploadMeta] = useState({ title: '', description: '', category: 'soil' });
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'checking' | 'uploading' | 'done' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load media from Firestore
  useEffect(() => {
    const vq = query(collection(db, 'education_videos'), orderBy('createdAt', 'desc'), limit(20));
    const unsub1 = onSnapshot(vq, s => setVideos(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const bq = query(collection(db, 'education_books'), where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
    const unsub2 = onSnapshot(bq, s => setBooks(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const cq = query(collection(db, 'education_community'), orderBy('createdAt', 'desc'), limit(30));
    const unsub3 = onSnapshot(cq, s => setCommunity(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  // Load user progress
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'education_progress', user.uid)).then(snap => {
      if (snap.exists()) setCompletedLessons(snap.data().completed || []);
    });
  }, [user]);

  const markComplete = async (id: string) => {
    if (!user || completedLessons.includes(id)) return;
    const next = [...completedLessons, id];
    setCompletedLessons(next);
    try {
      await updateDoc(doc(db, 'education_progress', user.uid), { completed: next, updatedAt: serverTimestamp() });
    } catch {
      await addDoc(collection(db, 'education_progress'), { userId: user.uid, completed: next, createdAt: serverTimestamp() });
    }
  };

  // ── Cloudinary upload ──────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!user || !uploadFile || !uploadMeta.title.trim()) return;
    setUploadStatus('checking');
    setUploadError('');
    setUploadProgress(0);

    // AI moderation check
    try {
      const modRes = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'moderateContent',
          data: { text: `Title: ${uploadMeta.title}. Description: ${uploadMeta.description}. Is this related to agriculture, farming, food, or rural development?` },
        }),
      });
      const mod = await modRes.json();
      if (!mod.safe) {
        setUploadStatus('error');
        setUploadError(`Content rejected: ${mod.reason || 'Does not appear to be agriculture-related.'}`);
        return;
      }
    } catch { /* allow through if AI unavailable */ }

    setUploadStatus('uploading');
    setUploadProgress(10);

    try {
      // Try Cloudinary first via server proxy
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('type', uploadType);
      formData.append('title', uploadMeta.title);
      formData.append('folder', 'aca/education');

      const res = await fetch('/api/education/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(80);
      const data = await res.json();

      let mediaUrl = '';
      let publicId = '';

      if (res.ok && data.url) {
        // Cloudinary success
        mediaUrl = data.url;
        publicId = data.publicId;
      } else {
        // Fallback: Firebase Storage
        console.warn('Cloudinary unavailable, falling back to Firebase Storage:', data.error);
        const ext = uploadFile.name.split('.').pop();
        const storageRef = ref(storage, `education/${uploadType}s/${Date.now()}.${ext}`);
        await uploadBytes(storageRef, uploadFile);
        mediaUrl = await getDownloadURL(storageRef);
      }

      setUploadProgress(90);

      // Save to Firestore
      const collectionName = uploadType === 'pdf' ? 'education_books'
        : uploadType === 'video' ? 'education_videos'
        : 'education_images';

      await addDoc(collection(db, collectionName), {
        title:       uploadMeta.title,
        description: uploadMeta.description,
        category:    uploadMeta.category,
        url:         mediaUrl,
        publicId:    publicId || '',
        type:        uploadType,
        fileSize:    uploadFile.size,
        fileName:    uploadFile.name,
        uploadedBy:  user.uid,
        uploaderName: user.displayName || 'ACA Farmer',
        status:      'approved',
        views:       0,
        downloads:   0,
        createdAt:   serverTimestamp(),
      });

      setUploadProgress(100);
      setUploadStatus('done');
      setUploadMeta({ title: '', description: '', category: 'soil' });
      setUploadFile(null);
      setTimeout(() => { setShowUpload(false); setUploadStatus('idle'); setUploadProgress(0); }, 2000);
    } catch (err: any) {
      setUploadStatus('error');
      setUploadError('Upload failed: ' + err.message);
    }
  };

  // ── Community post ─────────────────────────────────────────────────────────
  const handleCommunityPost = async () => {
    if (!user || !communityInput.trim()) return;
    setIsPosting(true);
    try {
      const modRes = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'moderateContent', data: { text: communityInput } }),
      });
      const mod = await modRes.json();
      if (!mod.safe) { alert('Post blocked: ' + mod.reason); return; }
      await addDoc(collection(db, 'education_community'), {
        content: communityInput, userId: user.uid,
        userName: user.displayName || 'ACA Farmer',
        userPhoto: user.photoURL || null,
        likes: 0, likedBy: [], createdAt: serverTimestamp(),
      });
      setCommunityInput('');
    } finally { setIsPosting(false); }
  };

  const likePost = async (postId: string, likedBy: string[]) => {
    if (!user) return;
    const liked = likedBy.includes(user.uid);
    await updateDoc(doc(db, 'education_community', postId), {
      likes: increment(liked ? -1 : 1),
      likedBy: liked ? likedBy.filter((id: string) => id !== user.uid) : [...likedBy, user.uid],
    });
  };

  const filteredArticles = ARTICLES.filter(a => {
    const matchCat = selectedCategory === 'all' || a.category === selectedCategory;
    const matchSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase())
      || a.tags.some(tg => tg.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const TABS = [
    { id: 'library',   label: '📚 Library' },
    { id: 'paths',     label: '🎯 Learning Paths' },
    { id: 'videos',    label: '▶️ Videos' },
    { id: 'books',     label: '📖 Books & PDFs' },
    { id: 'faq',       label: '❓ FAQ' },
    { id: 'community', label: '💬 Community' },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-green-800 to-slate-900 px-6 lg:px-10 pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px,rgba(255,255,255,0.3) 1px,transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10 max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              <GraduationCap size={14} /> Education Hub
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.05] mb-4">
              Grow smarter,<br /><span className="text-emerald-400">learn deeper.</span>
            </h1>
            <p className="text-emerald-200 font-medium text-lg max-w-xl leading-relaxed">
              World-class agricultural knowledge — free for every farmer. Articles, videos, books, courses, and a community of learners.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['12,400+', 'Active Learners'], ['50+', 'Articles'], ['30+', 'Videos'], ['40+', 'Countries']].map(([v, l]) => (
              <div key={l} className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-white">{v}</p>
                <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-100 dark:border-gray-800 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto flex gap-1 overflow-x-auto py-3">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={cn('px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              )}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 space-y-8">

        {/* ── LIBRARY ── */}
        {activeTab === 'library' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, tags..."
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-white font-medium" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                  className={cn('flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border',
                    selectedCategory === cat.id
                      ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                      : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  )}>
                  <cat.icon size={12} /> {cat.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.map((article, i) => (
                <motion.button key={article.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedArticle(article)}
                  className="text-left bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-6 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{article.icon}</div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn('text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border',
                        article.level === 'Beginner' ? 'bg-green-50 text-green-600 border-green-200' :
                        article.level === 'Intermediate' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-amber-50 text-amber-600 border-amber-200')}>{article.level}</span>
                      <span className="text-[9px] text-gray-400 font-bold flex items-center gap-1"><Clock size={10} />{article.readTime}</span>
                    </div>
                  </div>
                  <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2 group-hover:text-primary-600 transition-colors leading-tight">{article.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-4">{article.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {article.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-bold px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-lg uppercase tracking-wider">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    {completedLessons.includes(article.id)
                      ? <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-widest"><CheckCircle2 size={12} /> Completed</span>
                      : <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{article.category}</span>}
                    <span className="flex items-center gap-1 text-xs font-black text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">Read <ChevronRight size={14} /></span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ── PATHS ── */}
        {activeTab === 'paths' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">Structured Learning Paths</h2>
              <p className="text-gray-500 font-medium">Complete all lessons to earn your certificate</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {LEARNING_PATHS.map(path => {
                const done = path.lessons.filter(id => completedLessons.includes(id)).length;
                const pct  = Math.round((done / path.lessons.length) * 100);
                return (
                  <div key={path.id} className="bg-white dark:bg-gray-900 rounded-[36px] border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-2xl transition-all">
                    <div className={`bg-gradient-to-br ${path.color} p-8 text-center`}>
                      <div className="text-6xl mb-3">{path.emoji}</div>
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white/20 text-white rounded-full">{path.level}</span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xl mb-1">{path.title}</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">{path.description}</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                          <span>{done}/{path.lessons.length} lessons</span><span>{pct}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${path.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        {path.lessons.map(lessonId => {
                          const article = ARTICLES.find(a => a.id === lessonId);
                          const isDone  = completedLessons.includes(lessonId);
                          return article ? (
                            <button key={lessonId} onClick={() => { setSelectedArticle(article); setActiveTab('library'); }}
                              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-left">
                              <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0', isDone ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700')}>
                                {isDone ? <CheckCircle2 size={14} className="text-white" /> : <span className="text-[9px] font-black text-gray-500">{path.lessons.indexOf(lessonId) + 1}</span>}
                              </div>
                              <span className={cn('text-sm font-bold truncate', isDone ? 'text-green-600 line-through' : 'text-gray-700 dark:text-gray-300')}>{article.title}</span>
                            </button>
                          ) : null;
                        })}
                      </div>
                      {pct === 100 && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                          <Award size={16} className="text-amber-600" />
                          <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Certificate earned! 🎉</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-400 text-xs font-bold">
                        <Clock size={12} />{path.hours}h estimated
                        {path.certificate && <><BadgeCheck size={12} className="ml-2 text-amber-500" /> Certificate</>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── VIDEOS ── */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Video Library</h2>
                <p className="text-gray-500 font-medium text-sm mt-1">Community-uploaded farming videos — AI-verified for relevance</p>
              </div>
              {user && (
                <button onClick={() => { setShowUpload(true); setUploadType('video'); }}
                  className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg">
                  <Plus size={16} /> Upload Video
                </button>
              )}
            </div>
            {videos.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800">
                <Video size={48} className="text-gray-200 mx-auto mb-4" />
                <h3 className="font-black text-gray-900 dark:text-white uppercase text-xl mb-2">No videos yet</h3>
                <p className="text-gray-500 font-medium">Upload the first farming video and help the community learn!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {videos.map(video => (
                  <button key={video.id} onClick={() => setSelectedVideo(video)}
                    className="text-left bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all group">
                    <div className="h-36 bg-gradient-to-br from-gray-900 to-gray-800 relative flex items-center justify-center">
                      <Video size={40} className="text-gray-600" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                          <Play size={20} className="text-white ml-1" fill="white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-black text-gray-900 dark:text-white text-sm leading-tight mb-1 group-hover:text-primary-600 transition-colors">{video.title}</h4>
                      <p className="text-xs text-gray-500 font-medium">{video.uploaderName}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BOOKS & PDFs ── */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Books & PDFs</h2>
                <p className="text-gray-500 font-medium text-sm mt-1">AI-verified agricultural books, guides, and research papers</p>
              </div>
              {user && (
                <button onClick={() => { setShowUpload(true); setUploadType('pdf'); }}
                  className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg">
                  <Plus size={16} /> Share Book
                </button>
              )}
            </div>
            {books.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800">
                <BookOpen size={48} className="text-gray-200 mx-auto mb-4" />
                <p className="font-black text-gray-500 uppercase text-xl mb-2">No books yet</p>
                <p className="text-gray-400 font-medium">Be the first to share an agricultural book!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {books.map(book => (
                  <div key={book.id} className="bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-14 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={22} className="text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-gray-900 dark:text-white leading-tight mb-0.5">{book.title}</h4>
                        <p className="text-xs text-gray-500 font-bold">{book.uploaderName}</p>
                      </div>
                    </div>
                    {book.description && <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{book.description}</p>}
                    <a href={book.url} target="_blank" rel="noopener noreferrer"
                      className="mt-auto flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">
                      <Download size={14} /> Download PDF
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── FAQ ── */}
        {activeTab === 'faq' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3">Frequently Asked Questions</h2>
              <p className="text-gray-500 font-medium">Quick practical answers to the questions farmers ask most</p>
            </div>
            {FAQS.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <span className="font-black text-gray-900 dark:text-white text-sm">{faq.q}</span>
                  <div className="shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                    {openFaq === i ? <ChevronUp size={16} className="text-primary-600" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6">
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── COMMUNITY ── */}
        {activeTab === 'community' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Farmer Learning Community</h2>
              <p className="text-gray-500 font-medium">Ask questions, share discoveries, learn from farmers worldwide</p>
            </div>
            {user ? (
              <div className="bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-gray-800 p-6">
                <textarea value={communityInput} onChange={e => setCommunityInput(e.target.value)}
                  placeholder="Ask a farming question or share what you learned..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20 resize-none" rows={3} />
                <div className="flex justify-end mt-3">
                  <button onClick={handleCommunityPost} disabled={isPosting || !communityInput.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50">
                    {isPosting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Post
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-gray-800">
                <Lock size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="font-black text-gray-700 dark:text-gray-300 mb-1">Sign in to join the conversation</p>
              </div>
            )}
            <div className="space-y-4">
              {community.map((post: any) => (
                <div key={post.id} className="bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center font-black text-primary-600 text-sm overflow-hidden">
                      {post.userPhoto ? <img src={post.userPhoto} className="w-full h-full object-cover" alt="" /> : post.userName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 dark:text-white">{post.userName}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : ''}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-3">{post.content}</p>
                  <button onClick={() => likePost(post.id, post.likedBy || [])}
                    className={cn('flex items-center gap-1.5 text-xs font-black uppercase tracking-widest transition-colors',
                      user && post.likedBy?.includes(user.uid) ? 'text-red-500' : 'text-gray-400 hover:text-red-500')}>
                    <Heart size={14} fill={user && post.likedBy?.includes(user.uid) ? 'currentColor' : 'none'} />
                    {post.likes || 0}
                  </button>
                </div>
              ))}
              {community.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No posts yet — be the first!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── UPLOAD MODAL ── */}
      <AnimatePresence>
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowUpload(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl z-10 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-xl">
                  Upload {uploadType === 'video' ? 'Video' : uploadType === 'pdf' ? 'PDF / Book' : 'Image'}
                </h3>
                <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Type selector */}
              <div className="flex gap-2 mb-6">
                {[
                  { t: 'video' as const, icon: Video,     label: 'Video' },
                  { t: 'pdf'   as const, icon: FileText,  label: 'PDF' },
                  { t: 'image' as const, icon: ImageIcon, label: 'Image' },
                ].map(({ t: type, icon: Icon, label }) => (
                  <button key={type} onClick={() => setUploadType(type)}
                    className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border',
                      uploadType === type ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-primary-300')}>
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Title *</label>
                  <input type="text" placeholder="Enter a descriptive title..."
                    className="mt-1 w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20"
                    value={uploadMeta.title} onChange={e => setUploadMeta(p => ({ ...p, title: e.target.value }))} />
                </div>
                {/* Description */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                  <textarea rows={2} placeholder="Brief description of the content..."
                    className="mt-1 w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                    value={uploadMeta.description} onChange={e => setUploadMeta(p => ({ ...p, description: e.target.value }))} />
                </div>
                {/* Category */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                  <select className="mt-1 w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl font-medium dark:text-white outline-none"
                    value={uploadMeta.category} onChange={e => setUploadMeta(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                {/* File picker */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">File *</label>
                  <label className="mt-1 flex items-center gap-3 px-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:border-primary-400 transition-colors">
                    <Upload size={20} className="text-gray-400 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {uploadFile ? uploadFile.name : `Click to choose ${uploadType === 'video' ? 'video (MP4, MOV, AVI)' : uploadType === 'pdf' ? 'PDF file' : 'image (JPG, PNG)'}`}
                      </p>
                      {uploadFile && <p className="text-xs text-gray-400">{(uploadFile.size / 1024 / 1024).toFixed(1)} MB</p>}
                    </div>
                    <input ref={fileRef} type="file" className="hidden"
                      accept={uploadType === 'video' ? 'video/*' : uploadType === 'pdf' ? '.pdf,.doc,.docx,.epub' : 'image/*'}
                      onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                {/* AI notice */}
                <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                  <Sparkles size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    AI checks all uploads for agricultural relevance before publishing. Only farming, food, and rural development content is accepted.
                  </p>
                </div>

                {/* Progress */}
                {uploadStatus === 'uploading' && (
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                      <span>Uploading to Cloudinary…</span><span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Status messages */}
                {uploadStatus === 'done' && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                    <CheckCircle2 size={16} className="text-green-600" />
                    <p className="text-sm font-black text-green-700 dark:text-green-400">Upload successful! Published to Education Hub. ✅</p>
                  </div>
                )}
                {uploadStatus === 'error' && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                    <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
                    <p className="text-sm font-bold text-red-600">{uploadError}</p>
                  </div>
                )}

                <button onClick={handleUpload}
                  disabled={!uploadFile || !uploadMeta.title.trim() || uploadStatus === 'checking' || uploadStatus === 'uploading'}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50">
                  {uploadStatus === 'checking' ? <><Loader2 size={16} className="animate-spin" /> AI Checking…</>
                   : uploadStatus === 'uploading' ? <><Loader2 size={16} className="animate-spin" /> Uploading…</>
                   : <><Upload size={16} /> Upload to Education Hub</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ARTICLE MODAL ── */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl overflow-hidden z-10">
              <div className="bg-gradient-to-br from-emerald-900 to-slate-900 p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-5xl mb-4">{selectedArticle.icon}</div>
                    <h2 className="text-2xl font-black text-white mb-2 leading-tight">{selectedArticle.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white/20 text-white rounded-full">{selectedArticle.level}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white/20 text-white rounded-full flex items-center gap-1"><Clock size={9} />{selectedArticle.readTime}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedArticle(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"><X size={20} /></button>
                </div>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  {selectedArticle.content.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-black text-gray-900 dark:text-white mt-6 mb-3">{line.slice(3)}</h2>;
                    if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-black text-gray-900 dark:text-white">{line.slice(2, -2)}</p>;
                    if (line.trim() === '') return <br key={i} />;
                    return <p key={i} className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{line}</p>;
                  })}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-6">
                  {selectedArticle.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-bold px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-lg uppercase tracking-wider">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <button onClick={() => setSelectedArticle(null)} className="text-sm text-gray-500 font-bold hover:text-gray-700 dark:hover:text-gray-300">Close</button>
                {!completedLessons.includes(selectedArticle.id) ? (
                  <button onClick={() => { markComplete(selectedArticle.id); setSelectedArticle(null); }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg">
                    <CheckCircle2 size={14} /> Mark Complete
                  </button>
                ) : (
                  <span className="flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest"><CheckCircle2 size={14} /> Completed!</span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── VIDEO MODAL ── */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedVideo(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-3xl z-10">
              <button onClick={() => setSelectedVideo(null)} className="absolute -top-10 right-0 p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors"><X size={20} /></button>
              <div className="rounded-[32px] overflow-hidden aspect-video shadow-2xl bg-black">
                <video src={selectedVideo.url} controls autoPlay className="w-full h-full" />
              </div>
              <div className="mt-4 text-center">
                <p className="font-black text-white text-lg">{selectedVideo.title}</p>
                <p className="text-gray-400 font-medium text-sm">{selectedVideo.uploaderName}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Education;
