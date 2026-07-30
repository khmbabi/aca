import React from 'react';
import { motion } from 'motion/react';
import { 
  Dog, 
  Cat, 
  Bird, 
  Info, 
  Search, 
  ArrowRight,
  Heart,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import TranslatedText from '../components/TranslatedText';

const AnimalInfo: React.FC = () => {
  const animals = [
    {
      name: "Cattle (Dairy/Beef)",
      category: "Livestock",
      description: "Essential for milk and meat production. Requires significant space and high-quality forage.",
      tips: ["Regular vaccinations", "Balanced nutrition", "Clean water access"],
      image: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&q=80&w=800",
      color: "bg-orange-500"
    },
    {
      name: "Poultry (Chickens/Ducks)",
      category: "Birds",
      description: "Fast-growing and efficient for egg and meat production. Suitable for smaller spaces.",
      tips: ["Predator protection", "Dry bedding", "High-protein feed"],
      image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800",
      color: "bg-yellow-500"
    },
    {
      name: "Sheep & Goats",
      category: "Small Ruminants",
      description: "Versatile animals for wool, milk, and meat. Excellent for grazing on marginal lands.",
      tips: ["Rotational grazing", "Mineral supplements", "Hoof care"],
      image: "https://images.unsplash.com/photo-1484557918186-73442918a611?auto=format&fit=crop&q=80&w=800",
      color: "bg-green-500"
    }
  ];

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white font-display tracking-tight uppercase">
            <TranslatedText>Animal Information</TranslatedText>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            <TranslatedText>Comprehensive guides for raising healthy livestock.</TranslatedText>
          </p>
        </div>
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search animals..." 
            className="w-full pl-12 pr-6 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {animals.map((animal, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white dark:bg-gray-800 rounded-[40px] overflow-hidden shadow-xl shadow-black/5 border border-gray-100 dark:border-gray-700"
          >
            <div className="relative h-64 overflow-hidden">
              <img 
                src={animal.image} 
                alt={animal.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">
                <TranslatedText>{animal.category}</TranslatedText>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white font-display mb-4 uppercase tracking-tight">
                <TranslatedText>{animal.name}</TranslatedText>
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 font-medium">
                <TranslatedText>{animal.description}</TranslatedText>
              </p>
              
              <div className="space-y-3 mb-8">
                {animal.tips.map((tip, j) => (
                  <div key={j} className="flex items-center gap-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                    <ShieldCheck size={16} className="text-primary-600" />
                    <TranslatedText>{tip}</TranslatedText>
                  </div>
                ))}
              </div>

              <button className="w-full py-4 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn">
                <TranslatedText>View Full Guide</TranslatedText>
                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats Section */}
      <div className="bg-primary-600 rounded-[48px] p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <Heart size={40} className="mx-auto mb-6 text-primary-200" />
            <h4 className="text-4xl font-black font-display mb-2">95%</h4>
            <p className="text-xs font-black uppercase tracking-widest text-primary-100">
              <TranslatedText>Health Success Rate</TranslatedText>
            </p>
          </div>
          <div>
            <Zap size={40} className="mx-auto mb-6 text-primary-200" />
            <h4 className="text-4xl font-black font-display mb-2">24/7</h4>
            <p className="text-xs font-black uppercase tracking-widest text-primary-100">
              <TranslatedText>Expert Monitoring</TranslatedText>
            </p>
          </div>
          <div>
            <Info size={40} className="mx-auto mb-6 text-primary-200" />
            <h4 className="text-4xl font-black font-display mb-2">500+</h4>
            <p className="text-xs font-black uppercase tracking-widest text-primary-100">
              <TranslatedText>Animal Species Covered</TranslatedText>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalInfo;
