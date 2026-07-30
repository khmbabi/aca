import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Thermometer, 
  Wind, 
  Sun, 
  Plug, 
  Unplug, 
  Activity, 
  AlertCircle,
  Cpu,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';
import TranslatedText from '../components/TranslatedText';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [serialPort, setSerialPort] = useState<any>(null);
  const [reader, setReader] = useState<any>(null);
  const [sensorData, setSensorData] = useState({
    soilMoisture: 45,
    temperature: 22,
    humidity: 60,
    lightLevel: 650
  });

  const [history, setHistory] = useState<any[]>([]);
  const [rawData, setRawData] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Generate mock history
    const data = [];
    const now = new Date();
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3600000);
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: 20 + Math.random() * 10,
        moisture: 40 + Math.random() * 20,
        humidity: 50 + Math.random() * 20,
      });
    }
    setHistory(data);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating && !isConnected) {
      interval = setInterval(() => {
        setSensorData(prev => ({
          soilMoisture: Math.max(0, Math.min(100, prev.soilMoisture + (Math.random() - 0.5) * 2)),
          temperature: Math.max(0, Math.min(50, prev.temperature + (Math.random() - 0.5) * 0.5)),
          humidity: Math.max(0, Math.min(100, prev.humidity + (Math.random() - 0.5) * 1)),
          lightLevel: Math.max(0, Math.min(1000, prev.lightLevel + (Math.random() - 0.5) * 20))
        }));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, isConnected]);

  const handleConnect = async () => {
    if (isConnected) {
      if (reader) {
        try {
          await reader.cancel();
        } catch (e) {
          console.error('Error cancelling reader:', e);
        }
        setReader(null);
      }
      if (serialPort) {
        try {
          await serialPort.close();
        } catch (e) {
          console.error('Error closing port:', e);
        }
        setSerialPort(null);
      }
      setIsConnected(false);
      setIsSimulating(false);
      return;
    }

    try {
      if (!('serial' in navigator)) {
        alert('Web Serial API not supported in this browser. Switching to simulation mode.');
        setIsSimulating(true);
        setIsConnected(true);
        return;
      }

      const selectedPort = await (navigator as any).serial.requestPort();
      await selectedPort.open({ baudRate: 9600 });
      setSerialPort(selectedPort);
      setIsConnected(true);
      setIsSimulating(false);

      const textDecoder = new TextDecoderStream();
      selectedPort.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      setReader(reader);

      // Read loop
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        if (value) {
          setRawData(prev => [value, ...prev].slice(0, 50));
          
          // Parse data if it's in a specific format, e.g., "M:45,T:22,H:60,L:650"
          try {
            const parts = value.trim().split(',');
            const newData: any = {};
            parts.forEach((p: string) => {
              const [key, val] = p.split(':');
              if (key === 'M') newData.soilMoisture = parseFloat(val);
              if (key === 'T') newData.temperature = parseFloat(val);
              if (key === 'H') newData.humidity = parseFloat(val);
              if (key === 'L') newData.lightLevel = parseFloat(val);
            });
            if (Object.keys(newData).length > 0) {
              setSensorData(prev => ({ ...prev, ...newData }));
            }
          } catch (err) {
            console.error('Error parsing serial data:', err);
          }
        }
      }
    } catch (e: any) {
      console.error('Serial connection error:', e);
      if (e.name === 'SecurityError') {
        alert('Permission denied: The browser is blocking access to the Serial port. This usually happens in iframes. Try opening the app in a new tab or check your browser settings.');
      } else {
        alert(`Serial connection error: ${e.message}`);
      }
      setIsSimulating(true);
      setIsConnected(true);
    }
  };

  const cards = [
    { 
      id: 'moisture', 
      label: t('soilMoisture'), 
      value: `${sensorData.soilMoisture.toFixed(1)}%`, 
      icon: Droplets, 
      color: 'text-blue-500', 
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      trend: '+2.1%',
      trendIcon: ArrowUp,
      trendColor: 'text-green-500'
    },
    { 
      id: 'temp', 
      label: t('temperature'), 
      value: `${sensorData.temperature.toFixed(1)}°C`, 
      icon: Thermometer, 
      color: 'text-orange-500', 
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      trend: '-0.5°C',
      trendIcon: ArrowDown,
      trendColor: 'text-blue-500'
    },
    { 
      id: 'humidity', 
      label: t('humidity'), 
      value: `${sensorData.humidity.toFixed(1)}%`, 
      icon: Wind, 
      color: 'text-purple-500', 
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      trend: '+1.2%',
      trendIcon: ArrowUp,
      trendColor: 'text-green-500'
    },
    { 
      id: 'light', 
      label: t('lightIntensity'), 
      value: `${sensorData.lightLevel.toFixed(0)} lux`, 
      icon: Sun, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      trend: 'Stable',
      trendIcon: Minus,
      trendColor: 'text-gray-400'
    },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">{t('agriDashboard')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('realTimeMonitoring')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold",
            isConnected ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          )}>
            <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-red-500")}></div>
            {isConnected ? t('arduinoConnected') : t('disconnected')}
          </div>
          <button 
            onClick={isConnected ? () => setIsConnected(false) : handleConnect}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg",
              isConnected 
                ? "bg-white dark:bg-gray-800 text-red-600 border border-red-100 dark:border-red-900/30 hover:bg-red-50" 
                : "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/20"
            )}
          >
            {isConnected ? <Unplug size={18} /> : <Plug size={18} />}
            {isConnected ? t('disconnect') : t('connectArduino')}
          </button>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="data-card group">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl transition-colors", card.bg)}>
                <card.icon className={card.color} size={24} />
              </div>
              <div className={cn("flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-gray-50 dark:bg-gray-700/50", card.trendColor)}>
                <card.trendIcon size={12} />
                {card.trend}
              </div>
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{card.label}</h3>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1 font-display">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display">{t('environmentalTrends')}</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-bold bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-lg">
                {t('24H')}
              </button>
              <button className="px-3 py-1 text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                {t('7D')}
              </button>
              <button className="px-3 py-1 text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                {t('1M')}
              </button>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTemp)" 
                  name={t('temperature')}
                />
                <Area 
                  type="monotone" 
                  dataKey="moisture" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMoisture)" 
                  name={t('soilMoisture')}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-display">{t('systemStatus')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Cpu size={20} className="text-primary-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('processor')}</span>
                </div>
                <span className="text-sm font-bold text-green-500">{t('optimal')}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Activity size={20} className="text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('dataStream')}</span>
                </div>
                <span className="text-sm font-bold text-blue-500">{isConnected ? t('active') : t('idle')}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-amber-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('alerts')}</span>
                </div>
                <span className="text-sm font-bold text-gray-500">{t('none')}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-[32px] shadow-xl p-8 text-white">
            <h3 className="text-xl font-bold mb-4 font-display">{t('agriInsight')}</h3>
            <p className="text-primary-100 text-sm leading-relaxed mb-6">
              {t('agriInsightDesc')}
            </p>
            <button className="w-full py-3 bg-white text-primary-700 rounded-xl font-bold text-sm hover:bg-primary-50 transition-colors">
              {t('viewRecommendations')}
            </button>
          </div>

          {isConnected && (
            <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display">
                  {t('serialMonitor')}
                </h3>
                <button 
                  onClick={() => setShowDebug(!showDebug)}
                  className="text-xs font-bold text-primary-600 hover:underline"
                >
                  {showDebug ? t('hide') : t('show')}
                </button>
              </div>
              {showDebug && (
                <div className="bg-gray-900 rounded-xl p-4 h-40 overflow-y-auto font-mono text-[10px] text-green-400 space-y-1">
                  {rawData.length === 0 ? (
                    <div className="text-gray-500 italic">
                      {t('waitingForData')}
                    </div>
                  ) : (
                    rawData.map((line, i) => (
                      <div key={i} className="border-l border-green-900 pl-2">
                        <span className="text-green-800 mr-2">[{new Date().toLocaleTimeString()}]</span>
                        {line}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
