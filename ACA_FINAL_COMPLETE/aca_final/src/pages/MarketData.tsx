import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, Filter, Globe, ArrowUpRight, ArrowDownRight, BarChart3, PieChart, Activity, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import TranslatedText from '../components/TranslatedText';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useLanguage } from '../lib/LanguageContext';

const MarketData: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Commodities');
  const [commodities, setCommodities] = useState([
    { name: 'Wheat', price: 245.50, change: 2.4, trend: 'up', volume: '12.5M', market: 'CBOT' },
    { name: 'Corn', price: 182.20, change: -1.2, trend: 'down', volume: '8.2M', market: 'CBOT' },
    { name: 'Soybeans', price: 412.80, change: 0.8, trend: 'up', volume: '5.1M', market: 'CBOT' },
    { name: 'Coffee (Arabica)', price: 1.92, change: 3.5, trend: 'up', volume: '2.4M', market: 'ICE' },
    { name: 'Cocoa', price: 2840.00, change: -0.5, trend: 'down', volume: '1.1M', market: 'ICE' },
    { name: 'Rice (Rough)', price: 18.45, change: 1.1, trend: 'up', volume: '3.7M', market: 'CBOT' },
  ]);

  const [chartData, setChartData] = useState([
    { time: '09:00', price: 240 },
    { time: '10:00', price: 242 },
    { time: '11:00', price: 241 },
    { time: '12:00', price: 244 },
    { time: '13:00', price: 243 },
    { time: '14:00', price: 245 },
    { time: '15:00', price: 245.5 },
  ]);

  const [isSimulating, setIsSimulating] = useState(true);

  // Simulate real-time data updates
  useEffect(() => {
    if (!isSimulating) return;
    
    const interval = setInterval(() => {
      setCommodities(prev => prev.map(item => {
        const change = (Math.random() - 0.5) * 0.5;
        const newPrice = item.price + change;
        return {
          ...item,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat((item.change + (change / item.price * 100)).toFixed(2)),
          trend: change >= 0 ? 'up' : 'down'
        };
      }));

      setChartData(prev => {
        const lastPrice = prev[prev.length - 1].price;
        const newPrice = lastPrice + (Math.random() - 0.5) * 2;
        const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newData = [...prev.slice(1), { time: newTime, price: parseFloat(newPrice.toFixed(2)) }];
        return newData;
      });
    }, 3000); // Faster updates for real-time feel

    return () => clearInterval(interval);
  }, [isSimulating]);

  const tabs = [t('commodities'), t('localMarkets'), t('globalTrends'), t('futures')];

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white font-display tracking-tight uppercase">{t('marketData')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {t('marketDataDesc')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSimulating(!isSimulating)}
            className={cn(
              "px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 border transition-all shadow-sm active:scale-95",
              isSimulating 
                ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30"
                : "bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700"
            )}
          >
            <Activity size={18} className={cn(isSimulating && "animate-pulse")} />
            {isSimulating ? t('liveSimulation') : t('paused')}
          </button>
          <button className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-500 hover:text-primary-600 transition-all shadow-sm active:scale-95">
            <Globe size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-[48px] p-10 shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white font-display tracking-tight">
                  {t('wheatCbot')}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  {t('priceTrendLast24h')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-gray-900 dark:text-white font-display tracking-tighter">${chartData[chartData.length - 1].price.toFixed(2)}</p>
                <p className="text-sm font-black text-green-600 flex items-center justify-end gap-1">
                  <TrendingUp size={16} />
                  {t('positiveChange')}
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 'bold'}} />
                  <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', padding: '16px' }}
                    itemStyle={{ fontWeight: 'black', color: '#16a34a' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={4} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-[48px] shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-10 border-b border-gray-50 dark:border-gray-700 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex bg-gray-50 dark:bg-gray-900 p-1.5 rounded-2xl overflow-x-auto no-scrollbar w-full md:w-auto">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap",
                      activeTab === tab 
                        ? "bg-white dark:bg-gray-800 text-primary-600 shadow-xl shadow-black/5" 
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder={t('search')}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50">
                    <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                      {t('commodity')}
                    </th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                      {t('price')}
                    </th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                      {t('change')}
                    </th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                      {t('volume')}
                    </th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                      {t('market')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {commodities.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors cursor-pointer group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-gray-500 font-black text-xs shadow-sm">
                            {item.name.charAt(0)}
                          </div>
                          <span className="font-black text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors tracking-tight">
                            {t(item.name.toLowerCase().replace(/ /g, ''))}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6 font-black text-gray-700 dark:text-gray-200">${item.price.toFixed(2)}</td>
                      <td className="px-10 py-6">
                        <span className={cn(
                          "flex items-center gap-1 font-black text-sm",
                          item.trend === 'up' ? "text-green-600" : "text-red-600"
                        )}>
                          {item.trend === 'up' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                          {item.change > 0 ? '+' : ''}{item.change}%
                        </span>
                      </td>
                      <td className="px-10 py-6 text-gray-500 dark:text-gray-400 font-black text-xs">{item.volume}</td>
                      <td className="px-10 py-6">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">
                          {item.market}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-[48px] p-10 shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 font-display tracking-tight uppercase">
              {t('marketSentiment')}
            </h3>
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                      {t('bullish')}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      {t('demandRising')}
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-black text-green-600 font-display">68%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex shadow-inner">
                <div className="h-full bg-green-500 shadow-lg" style={{ width: '68%' }}></div>
                <div className="h-full bg-red-500 shadow-lg" style={{ width: '32%' }}></div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                {t('marketSentimentDesc')}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 rounded-full blur-3xl group-hover:bg-primary-600/40 transition-all" />
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 text-primary-400 shadow-xl">
              <DollarSign size={28} />
            </div>
            <h3 className="text-2xl font-black mb-4 font-display tracking-tight uppercase">
              {t('priceAlerts')}
            </h3>
            <p className="text-gray-400 font-medium leading-relaxed mb-10">
              {t('priceAlertsMarketDesc')}
            </p>
            <button className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[24px] font-black text-sm tracking-widest transition-all active:scale-95 shadow-2xl shadow-primary-600/30">
              {t('configureAlerts')}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-[48px] p-10 shadow-2xl shadow-black/5 border border-gray-100 dark:border-gray-700">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 font-display tracking-tight uppercase">
              {t('topGainers')}
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Sugar #11', change: '+4.2%', price: '22.45' },
                { name: 'Cotton #2', change: '+3.8%', price: '84.12' },
                { name: 'Canola', change: '+2.9%', price: '612.50' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-primary-500 transition-all cursor-pointer group">
                  <div>
                    <p className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight group-hover:text-primary-600 transition-colors">
                      {t(item.name.toLowerCase().replace(/ /g, '').replace('#', ''))}
                    </p>
                    <p className="text-xs text-gray-500 font-black">${item.price}</p>
                  </div>
                  <span className="text-sm font-black text-green-600">{item.change}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketData;
