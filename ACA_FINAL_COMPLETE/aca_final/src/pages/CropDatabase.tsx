import React, { useState, useEffect } from 'react';
import { Search, Leaf, Droplets, Sun, Wind, X, Info, ChevronRight, Loader2 } from 'lucide-react';
import { Crop } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import TranslatedText from '../components/TranslatedText';
import { useLanguage } from '../lib/LanguageContext';


const CropDatabase: React.FC = () => {
  const { t } = useLanguage();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchCrops = async (pageNum: number, query: string = '') => {
    setIsLoading(true);
    try {
      let url = `/api/crops?path=species-list&page=${pageNum}`;
      if (query) url += `&q=${query}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (pageNum === 1) {
        setCrops(data.data || []);
      } else {
        setCrops(prev => [...prev, ...(data.data || [])]);
      }
    } catch (error) {
      console.error("Error fetching crops:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCropDetails = async (crop: Crop) => {
    setSelectedCrop(crop);
    setIsDetailLoading(true);
    try {
      const response = await fetch(`/api/crops?path=species/details&id=${selectedCrop.id}`);
      const details = await response.json();
      setSelectedCrop(prev => prev ? { ...prev, ...details } : details);
    } catch (error) {
      console.error("Error fetching crop details:", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCrops(1, search);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCrops(nextPage, search);
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display tracking-tight uppercase">
            {t('cropDatabase')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {t('cropDatabaseDesc')}
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={t('searchForCrops')}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {isLoading && page === 1 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="animate-spin text-primary-500" />
          <p className="text-gray-500 font-medium">
            {t('loadingCropData')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {crops.map((crop) => (
            <motion.div
              key={crop.id}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer group"
              onClick={() => fetchCropDetails(crop)}
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={crop.default_image?.thumbnail || 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop'} 
                  alt={crop.common_name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-900/30">
                  {t(crop.cycle?.toLowerCase() || 'annual')}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">
                  {crop.common_name}
                </h3>
                <p className="text-xs italic text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">{crop.scientific_name?.[0]}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Droplets size={14} className="text-blue-400" />
                      {t(crop.watering?.toLowerCase() || 'frequent')}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Sun size={14} className="text-amber-400" />
                      {t(crop.sunlight?.[0]?.toLowerCase().replace(' ', '') || 'fullsun')}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && crops.length > 0 && (
        <div className="flex justify-center pt-8">
          <button 
            onClick={loadMore}
            disabled={isLoading}
            className="px-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {t('loadMoreCrops')}
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCrop && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="relative h-72 shrink-0">
                <img 
                  src={selectedCrop.default_image?.original_url || 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=400&fit=crop'} 
                  alt={selectedCrop.common_name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <button 
                  onClick={() => setSelectedCrop(null)}
                  className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all"
                >
                  <X size={24} />
                </button>
                <div className="absolute bottom-8 left-8 text-white">
                  <h2 className="text-4xl font-bold font-display uppercase tracking-tight">
                    {selectedCrop.common_name}
                  </h2>
                  <p className="text-lg opacity-90 italic">{selectedCrop.scientific_name?.[0]}</p>
                </div>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                {isDetailLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 size={40} className="animate-spin text-primary-500" />
                    <p className="text-gray-500 font-medium">
                      {t('fetchingDetailedInfo')}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                      <section>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-tight">
                          <Info size={20} className="text-primary-500" />
                          {t('description')}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {selectedCrop.description || `${selectedCrop.common_name} is a vital agricultural crop known for its resilience and nutritional value. It thrives in ${selectedCrop.sunlight?.join(' and ')} conditions and requires ${selectedCrop.watering?.toLowerCase()} watering. This ${selectedCrop.cycle?.toLowerCase()} plant is a staple in many sustainable farming systems.`}
                        </p>
                      </section>

                      <section>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-tight">
                          <Leaf size={20} className="text-primary-500" />
                          {t('growingConditions')}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                              {t('growthRate')}
                            </p>
                            <p className="font-bold dark:text-white">
                              {t(selectedCrop.growth_rate?.toLowerCase() || 'medium')}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                              {t('hardiness')}
                            </p>
                            <p className="font-bold dark:text-white">
                              {t('zones')} {selectedCrop.hardiness ? `${selectedCrop.hardiness.min} - ${selectedCrop.hardiness.max}` : '3-11'}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                              {t('soilPreference')}
                            </p>
                            <p className="font-bold dark:text-white">
                              {selectedCrop.soil && selectedCrop.soil.length > 0 ? selectedCrop.soil.join(', ') : t('wellDrainedFertile')}
                            </p>
                          </div>
                          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                              {t('maintenance')}
                            </p>
                            <p className="font-bold dark:text-white">
                              {t('moderate')}
                            </p>
                          </div>
                        </div>
                      </section>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-primary-50 dark:bg-primary-900/20 rounded-[32px] border border-primary-100 dark:border-primary-900/30">
                        <h4 className="font-bold text-primary-800 dark:text-primary-400 mb-4 uppercase tracking-tight">
                          {t('quickFacts')}
                        </h4>
                        <ul className="space-y-4">
                          <li className="flex items-center gap-3 text-sm">
                            <Droplets size={18} className="text-blue-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {t('water')}: 
                            </span>
                            <span className="font-bold dark:text-white">
                              {t(selectedCrop.watering?.toLowerCase() || 'frequent')}
                            </span>
                          </li>
                          <li className="flex items-center gap-3 text-sm">
                            <Sun size={18} className="text-amber-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {t('sun')}: 
                            </span>
                            <span className="font-bold dark:text-white">
                              {selectedCrop.sunlight?.join(', ')}
                            </span>
                          </li>
                          <li className="flex items-center gap-3 text-sm">
                            <Wind size={18} className="text-purple-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {t('cycle')}: 
                            </span>
                            <span className="font-bold dark:text-white">
                              {t(selectedCrop.cycle?.toLowerCase() || 'annual')}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <button className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-600/20 transition-all active:scale-95">
                        {t('addToMyFarm')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CropDatabase;
