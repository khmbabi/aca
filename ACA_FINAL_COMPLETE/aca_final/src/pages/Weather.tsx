import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Thermometer, 
  Search, 
  MapPin, 
  Calendar,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Loader2,
  Sun
} from 'lucide-react';
import { WeatherData } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import TranslatedText from '../components/TranslatedText';
import { useLanguage } from '../lib/LanguageContext';


const Weather: React.FC = () => {
  const { t } = useLanguage();
  const [location, setLocation] = useState('Addis Ababa');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWeather = async (loc: string) => {
    setIsLoading(true);
    try {
      // Current Weather
      const res = await fetch(`/api/weather?q=${encodeURIComponent(loc)}&type=current`);
      const data = await res.json();
      
      if (data.cod === 200) {
        setWeather(data);
        
        // Forecast
        const forecastRes = await fetch(`/api/weather?q=${encodeURIComponent(loc)}&type=forecast`);
        const forecastData = await forecastRes.json();
        
        if (forecastData.cod === "200") {
          // Filter to get one reading per day (at 12:00)
          const daily = forecastData.list.filter((item: any) => item.dt_txt.includes("12:00:00"));
          setForecast(daily);
        }
      } else {
        console.error("Weather error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather(location);
  };

  const getAgriImpact = () => {
    if (!weather) return null;
    const temp = weather.main.temp;
    const humidity = weather.main.humidity;
    const rain = weather.rain?.['1h'] || 0;

    let soilMoisture = t('optimal');
    if (rain > 5) soilMoisture = t('high');
    else if (temp > 30 && rain < 1) soilMoisture = t('low');

    let irrigationNeed = t('low');
    if (soilMoisture === t('low')) irrigationNeed = t('high');
    else if (soilMoisture === t('optimal')) irrigationNeed = t('moderate');

    let pestRisk = t('low');
    if (humidity > 80 && temp > 20) pestRisk = t('high');
    else if (humidity > 60) pestRisk = t('medium');

    return { soilMoisture, irrigationNeed, pestRisk };
  };

  const impact = getAgriImpact();

  const getWeatherAlerts = () => {
    if (!weather) return [];
    const alerts = [];
    const temp = weather.main.temp;
    const wind = weather.wind.speed;
    const condition = weather.weather[0].main.toLowerCase();
    const description = weather.weather[0].description.toLowerCase();

    if (wind > 50) {
      alerts.push({
        type: t('highWindWarning'),
        message: `${t('dangerousWindSpeeds')} ${wind} km/h ${t('detectedSecureLoose')}`,
        severity: 'critical'
      });
    }

    if (temp > 38) {
      alerts.push({
        type: t('extremeHeatAlert'),
        message: `${t('criticalTemperatureOf')} ${Math.round(temp)}°C. ${t('immediateIrrigationRequired')}`,
        severity: 'critical'
      });
    } else if (temp < 2) {
      alerts.push({
        type: t('frostWarning'),
        message: `${t('freezingTemperatures')} (${Math.round(temp)}°C) ${t('detectedProtectSensitive')}`,
        severity: 'critical'
      });
    }

    if (condition.includes('thunderstorm') || description.includes('heavy intensity rain') || description.includes('extreme rain')) {
      alerts.push({
        type: t('severeStormWarning'),
        message: t('heavyStormsDetected'),
        severity: 'critical'
      });
    }

    if (description.includes('hail')) {
      alerts.push({
        type: t('hailWarning'),
        message: t('hailDetectedRisk'),
        severity: 'critical'
      });
    }

    return alerts;
  };

  const alerts = getWeatherAlerts();

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display tracking-tight uppercase">
            {t('weatherForecast')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {t('weatherForecastDesc')}
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={t('enterFarmLocation')}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </form>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={40} className="animate-spin text-primary-500" />
          <p className="text-gray-500 font-medium">
            {t('updatingWeatherData')}
          </p>
        </div>
      ) : weather ? (
        <div className="space-y-8">
          {/* Severe Weather Alerts Banner */}
          {alerts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {alerts.map((alert, i) => (
                <div 
                  key={i} 
                  className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-2xl flex items-start gap-4 shadow-sm"
                >
                  <div className="p-2 bg-red-500 text-white rounded-xl shrink-0">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-red-900 dark:text-red-400 uppercase tracking-tight leading-none mb-2">
                      {alert.type}
                    </h3>
                    <p className="text-red-700 dark:text-red-300 font-medium">
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Current Weather Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-500 rounded-[40px] p-10 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <CloudSun size={200} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-8 opacity-80">
                  <MapPin size={18} />
                  <span className="font-bold uppercase tracking-widest text-sm">{weather.name}</span>
                </div>
                
                <div className="flex items-end gap-6 mb-10">
                  <div className="text-8xl font-bold font-display">{Math.round(weather.main.temp)}°</div>
                  <div className="pb-4">
                    <div className="text-2xl font-bold capitalize">
                      {weather.weather[0].description}
                    </div>
                    <div className="text-blue-100">
                      {t('feelsLike')} {Math.round(weather.main.feels_like)}°C
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-white/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-100 text-sm">
                      <Wind size={16} /> {t('wind')}
                    </div>
                    <div className="text-xl font-bold">{weather.wind.speed} km/h</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-100 text-sm">
                      <Droplets size={16} /> {t('humidity')}
                    </div>
                    <div className="text-xl font-bold">{weather.main.humidity}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-100 text-sm">
                      <Thermometer size={16} /> {t('pressure')}
                    </div>
                    <div className="text-xl font-bold">{weather.main.pressure} hPa</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-100 text-sm">
                      <Calendar size={16} /> {t('today')}
                    </div>
                    <div className="text-xl font-bold">
                      {new Date().toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Agricultural Impact Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-display uppercase tracking-tight">
                {t('agriImpact')}
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 text-white rounded-lg">
                      <Droplets size={18} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {t('soilMoisture')}
                    </span>
                  </div>
                  <span className={cn(
                    "text-sm font-bold px-3 py-1 rounded-full",
                    impact?.soilMoisture === t('optimal') ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {impact?.soilMoisture}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500 text-white rounded-lg">
                      <Sun size={18} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {t('irrigationNeed')}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-orange-700">
                    {impact?.irrigationNeed}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500 text-white rounded-lg">
                      <AlertTriangle size={18} />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {t('pestRisk')}
                    </span>
                  </div>
                  <span className={cn(
                    "text-sm font-bold px-3 py-1 rounded-full",
                    impact?.pestRisk === t('high') ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  )}>
                    {impact?.pestRisk}
                  </span>
                </div>
              </div>

              <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-3xl border border-primary-100 dark:border-primary-900/30">
                <h4 className="font-bold text-primary-800 dark:text-primary-400 mb-2 uppercase tracking-tight">
                  {t('expertTip')}
                </h4>
                <p className="text-sm text-primary-700 dark:text-primary-300 leading-relaxed">
                  {t('expertTipWeather')}
                </p>
              </div>
            </motion.div>
          </div>

          {/* 5-Day Forecast */}
          <div className="bg-white dark:bg-gray-800 rounded-[40px] p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 font-display uppercase tracking-tight">
              {t('fiveDayForecast')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {forecast.map((day, i) => (
                <div key={i} className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl group hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <span className="text-sm font-bold text-gray-400 group-hover:text-primary-600 transition-colors mb-4">
                    {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <div className="w-16 h-16 flex items-center justify-center mb-4">
                    <img 
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`} 
                      alt={day.weather[0].main}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{Math.round(day.main.temp)}°</div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {day.weather[0].description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-700">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('locationNotFound')}
          </h3>
          <p className="text-gray-500 mt-2">
            {t('locationNotFoundDesc')} "{location}". {t('tryAnotherCity')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Weather;
