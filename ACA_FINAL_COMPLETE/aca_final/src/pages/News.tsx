import React, { useState, useEffect } from 'react';
import { Newspaper, Calendar, ArrowRight, Loader2, Search, ExternalLink } from 'lucide-react';
import { NewsArticle } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import TranslatedText from '../components/TranslatedText';
import { useLanguage } from '../lib/LanguageContext';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';

const News: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [category, setCategory] = useState('agriculture');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { t } = useLanguage();

  const categories = [
    { id: 'agriculture', label: 'Agriculture' },
    { id: 'technology', label: 'Technology' },
    { id: 'business', label: 'Market' },
    { id: 'science', label: 'Research' },
    { id: 'environment', label: 'Sustainability' },
  ];

  const fetchNews = async (cat: string, pageNum: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/news?q=${encodeURIComponent(cat)}&page=${pageNum}`);
      const data = await response.json();
      
      if (data.status === 'success' && data.results) {
        const formatted = data.results.map((item: any) => ({
          title: item.title ? item.title.charAt(0).toUpperCase() + item.title.slice(1) : '',
          description: item.description || item.content?.substring(0, 200) || 'No description available',
          source_id: item.source_id,
          pubDate: item.pubDate,
          image_url: item.image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
          category: cat,
          link: item.link || item.source_url || '#'
        }));
        
        if (pageNum === 1) {
          setArticles(formatted);
          
          // Trigger notification for latest news if we have results and a user is logged in
          if (formatted.length > 0 && auth.currentUser) {
            const latestArticle = formatted[0];
            
            // Avoid duplicate notifications for the same news in a short time
            // In a real app we'd track last notified article ID
            const sessionKey = `last_notified_news_${cat}`;
            const lastNotified = sessionStorage.getItem(sessionKey);
            
            if (lastNotified !== latestArticle.title) {
              await addDoc(collection(db, 'notifications'), {
                userId: auth.currentUser.uid,
                title: t('latestNews'),
                message: latestArticle.title,
                type: 'news',
                link: 'news',
                isRead: false,
                createdAt: serverTimestamp()
              });
              sessionStorage.setItem(sessionKey, latestArticle.title);
            }
          }
        } else {
          setArticles(prev => [...prev, ...formatted]);
        }
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(category, 1);
  }, [category]);

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">
            {t('agriculturalNews')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t('latestUpdatesNews')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                setPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95",
                category === cat.id 
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" 
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700 hover:bg-gray-50"
              )}
            >
              {t(cat.id)}
            </button>
          ))}
        </div>
      </div>

      {isLoading && articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="animate-spin text-primary-500" />
          <p className="text-gray-500 font-medium">
            {t('fetchingNews')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col group"
            >
              <div className="h-56 overflow-hidden relative">
                <img 
                  src={article.image_url} 
                  alt={article.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400">
                  {article.source_id}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <Calendar size={14} />
                  {new Date(article.pubDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors leading-tight">
                  <TranslatedText text={article.title} />
                </h3>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6">
                  <TranslatedText text={article.description} />
                </p>
                
                <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center">
                  <a href={(article as any).link || '#'} target="_blank" rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                    {t('readArticle')} <ArrowRight size={16} />
                  </a>
                  <a href={(article as any).link || '#'} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={16} className="text-gray-300 hover:text-primary-400 transition-colors" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {articles.length > 0 && (
        <div className="flex justify-center pt-8">
          <button 
            onClick={() => {
              const nextPage = page + 1;
              setPage(nextPage);
              fetchNews(category, nextPage);
            }}
            disabled={isLoading}
            className="px-10 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-xl shadow-primary-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {t('loadMoreNews')}
          </button>
        </div>
      )}
    </div>
  );
};

export default News;
