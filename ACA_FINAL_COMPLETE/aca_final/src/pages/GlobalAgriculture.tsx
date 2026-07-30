import React, { useState } from 'react';
import { Globe, Map, Users, Leaf, BarChart3, Info, ExternalLink, ArrowRight, Layers, Database, MapPin, Tractor, ShoppingBag, Info as InfoIcon, Ruler, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import TranslatedText from '../components/TranslatedText';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { countriesAgriData, CountryAgriData } from '../data/countries';
import { useLanguage } from '../lib/LanguageContext';

const geoUrl = "https://raw.githubusercontent.com/lotusms/world-map-data/main/world.json";

const GlobalAgriculture: React.FC = () => {
  const { t } = useLanguage();
  const [activeRegion, setActiveRegion] = useState('Global');
  const [tooltipContent, setTooltipContent] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryAgriData | null>(null);

  const regions = ['Global', 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

  const regionConfigs: Record<string, { center: [number, number], zoom: number }> = {
    'Global': { center: [0, 0], zoom: 1 },
    'Africa': { center: [20, 0], zoom: 2 },
    'Asia': { center: [100, 30], zoom: 2 },
    'Europe': { center: [15, 50], zoom: 3 },
    'North America': { center: [-100, 45], zoom: 2 },
    'South America': { center: [-60, -20], zoom: 2 },
    'Oceania': { center: [140, -25], zoom: 3 },
  };

  const stats = [
    { label: 'Arable Land', value: selectedCountry?.arableLand || '1.4B ha', icon: Map, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Agri Workers', value: selectedCountry ? 'Varies' : '866M', icon: Users, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Organic Share', value: selectedCountry ? 'N/A' : '1.6%', icon: Leaf, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'GDP Contribution', value: selectedCountry?.gdpContribution || '4.3%', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  const reports = [
    {
      title: 'State of Food Security 2025',
      source: 'FAO',
      date: 'Jan 2025',
      description: 'Comprehensive analysis of global hunger, malnutrition, and food availability patterns.',
      tags: ['Food Security', 'Policy']
    },
    {
      title: 'Climate Impact on Grain Yields',
      source: 'IPCC',
      date: 'Dec 2024',
      description: 'Scientific assessment of how rising temperatures are affecting major crop production zones.',
      tags: ['Climate', 'Research']
    },
    {
      title: 'Digital Transformation in Smallholder Farming',
      source: 'World Bank',
      date: 'Feb 2025',
      description: 'Evaluating the adoption of mobile technology and data analytics among small-scale farmers.',
      tags: ['Technology', 'Development']
    }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white font-display tracking-tight uppercase">
            {t('globalAgriculture')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {t('globalAgricultureDesc')}
          </p>
        </div>
        <div className="flex bg-white dark:bg-gray-800 p-2 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl shadow-black/5 overflow-x-auto no-scrollbar">
          {regions.map(region => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={cn(
                "px-6 py-2.5 rounded-2xl text-sm font-black transition-all whitespace-nowrap",
                activeRegion === region 
                  ? "bg-primary-600 text-white shadow-xl shadow-primary-600/20" 
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900/50"
              )}
            >
              {t(region.toLowerCase().replace(' ', ''))}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-700 group hover:scale-105 transition-transform"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg", stat.bg, stat.color)}>
              <stat.icon size={28} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
              {t(stat.label.toLowerCase().replace(' ', ''))}
            </p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white font-display">
              {stat.value}
            </h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-[48px] shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-10 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white font-display tracking-tight uppercase">
                  {t('interactiveWorldMap')}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  {t('visualizingGlobalAg')}
                </p>
              </div>
              <button className="p-4 bg-gray-50 dark:bg-gray-900 text-primary-600 rounded-2xl hover:bg-primary-50 transition-all">
                <Layers size={24} />
              </button>
            </div>
            <div className="aspect-video bg-gray-50 dark:bg-gray-900 relative">
              <ComposableMap projectionConfig={{ scale: 140 }}>
                <ZoomableGroup 
                  center={regionConfigs[activeRegion].center} 
                  zoom={regionConfigs[activeRegion].zoom}
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => {
                            setTooltipContent(`${geo.properties.name}`);
                          }}
                          onMouseLeave={() => {
                            setTooltipContent("");
                          }}
                          onClick={() => {
                            const countryId = geo.id || geo.properties.ISO_A3;
                            if (countriesAgriData[countryId]) {
                              setSelectedCountry(countriesAgriData[countryId]);
                            } else {
                              setSelectedCountry(null);
                            }
                          }}
                          style={{
                            default: {
                              fill: countriesAgriData[geo.id || geo.properties.ISO_A3] ? "#16a34a" : "#D6D6DA",
                              outline: "none"
                            },
                            hover: {
                              fill: "#15803d",
                              outline: "none",
                              cursor: "pointer"
                            },
                            pressed: {
                              fill: "#14532d",
                              outline: "none"
                            }
                          }}
                        />
                      ))
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
              
              {tooltipContent && (
                <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 font-black text-sm animate-in fade-in zoom-in-95">
                  {tooltipContent}
                </div>
              )}
            </div>
            <div className="p-10 grid grid-cols-3 gap-10">
              <div className="text-center">
                <p className="text-3xl font-black text-gray-900 dark:text-white font-display">195</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  {t('countriesTracked')}
                </p>
              </div>
              <div className="text-center border-x border-gray-50 dark:border-gray-700">
                <p className="text-3xl font-black text-gray-900 dark:text-white font-display">1,200+</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  {t('dataPoints')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-primary-600 font-display">
                  {t('live')}
                </p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  {t('updateStatus')}
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedCountry && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-[48px] shadow-2xl shadow-black/5 border border-primary-500/30 p-10"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-[24px] flex items-center justify-center text-primary-600 shadow-xl shadow-primary-600/10">
                      <MapPin size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight uppercase">
                        {selectedCountry.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        {t('latitude')}: {selectedCountry.latitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCountry(null)}
                    className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-colors text-gray-400"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                        <Tractor size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                          {t('mainCrops')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCountry.mainCrops.map(crop => (
                            <span key={crop} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold">
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                          {t('mainExports')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCountry.mainExports.map(exp => (
                            <span key={exp} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold">
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                        <Leaf size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                          {t('mainCattle')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCountry.mainCattle.map(cat => (
                            <span key={cat} className="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg text-xs font-bold">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                        <Layers size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                          {t('farmingMethods')}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                          {selectedCountry.farmingMethods}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center text-gray-600 shrink-0">
                        <InfoIcon size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                          {t('overallInfo')}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                          {selectedCountry.overallInfo}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white font-display px-4 tracking-tight uppercase">
              {t('researchAndReports')}
            </h3>
            {reports.map((report, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-[40px] p-10 shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-700 group hover:border-primary-500 transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-4 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {report.source}
                      </span>
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        {report.date}
                      </span>
                    </div>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors font-display tracking-tight">
                      {report.title}
                    </h4>
                  </div>
                  <button className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all self-start shadow-sm">
                    <ExternalLink size={24} />
                  </button>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
                  {report.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.tags.map(tag => (
                    <span key={tag} className="px-4 py-1.5 bg-gray-50 dark:bg-gray-900 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-[48px] p-10 shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 font-display tracking-tight uppercase">
              {t('regionalInsights')}
            </h3>
            <div className="space-y-10">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                  <Info size={24} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 dark:text-white text-sm mb-1 uppercase tracking-tight">
                    {t('topExportingRegion')}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {t('topExportingRegionDesc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600 shrink-0 shadow-sm">
                  <Leaf size={24} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 dark:text-white text-sm mb-1 uppercase tracking-tight">
                    {t('organicMarket')}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {t('organicMarketDesc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600 shrink-0 shadow-sm">
                  <Database size={24} />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 dark:text-white text-sm mb-1 uppercase tracking-tight">
                    {t('agriTechHub')}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {t('agriTechHubDesc')}
                  </p>
                </div>
              </div>
            </div>
            <button className="w-full mt-12 py-5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-[24px] font-black text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-3 active:scale-95">
              {t('exploreAllData')}
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="bg-primary-600 rounded-[48px] p-10 text-white shadow-2xl shadow-primary-600/30">
            <h3 className="text-2xl font-black mb-6 font-display tracking-tight uppercase">
              {t('contributeData')}
            </h3>
            <p className="text-primary-100 font-medium leading-relaxed mb-10">
              {t('contributeDataDesc')}
            </p>
            <button className="w-full py-5 bg-white text-primary-600 rounded-[24px] font-black text-sm hover:bg-primary-50 transition-all active:scale-95 shadow-xl">
              {t('partnerWithUs')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalAgriculture;
