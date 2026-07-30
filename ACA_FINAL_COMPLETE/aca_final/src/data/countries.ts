export interface CountryAgriData {
  id: string;
  name: string;
  mainCrops: string[];
  mainExports: string[];
  mainCattle: string[];
  farmingMethods: string;
  latitude: number;
  overallInfo: string;
  gdpContribution: string;
  arableLand: string;
}

export const countriesAgriData: Record<string, CountryAgriData> = {
  "USA": {
    id: "USA",
    name: "United States",
    mainCrops: ["Corn", "Soybeans", "Wheat", "Cotton"],
    mainExports: ["Soybeans", "Corn", "Wheat", "Tree Nuts"],
    mainCattle: ["Beef Cattle", "Dairy Cows", "Hogs"],
    farmingMethods: "Highly mechanized, precision agriculture, large-scale industrial farming.",
    latitude: 37.0902,
    overallInfo: "The US is a global leader in agricultural technology and exports, with a diverse range of climates supporting various crops.",
    gdpContribution: "1.2%",
    arableLand: "157M ha"
  },
  "CHN": {
    id: "CHN",
    name: "China",
    mainCrops: ["Rice", "Wheat", "Corn", "Potatoes"],
    mainExports: ["Tea", "Processed Vegetables", "Fruit", "Fish"],
    mainCattle: ["Pigs", "Sheep", "Goats", "Cattle"],
    farmingMethods: "Mix of smallholder intensive farming and rapidly growing large-scale mechanized operations.",
    latitude: 35.8617,
    overallInfo: "China is the world's largest producer of rice and a major player in global agricultural markets, focusing on food security.",
    gdpContribution: "7.3%",
    arableLand: "119M ha"
  },
  "BRA": {
    id: "BRA",
    name: "Brazil",
    mainCrops: ["Soybeans", "Sugar Cane", "Coffee", "Corn"],
    mainExports: ["Soybeans", "Beef", "Sugar", "Coffee"],
    mainCattle: ["Beef Cattle", "Poultry"],
    farmingMethods: "Large-scale commercial farming, significant use of tropical agriculture techniques.",
    latitude: -14.2350,
    overallInfo: "Brazil is an agricultural powerhouse, particularly in soybeans and beef, with vast areas of arable land.",
    gdpContribution: "4.4%",
    arableLand: "66M ha"
  },
  "IND": {
    id: "IND",
    name: "India",
    mainCrops: ["Rice", "Wheat", "Cotton", "Sugarcane"],
    mainExports: ["Rice", "Spices", "Cotton", "Buffalo Meat"],
    mainCattle: ["Buffalo", "Cattle", "Goats"],
    farmingMethods: "Primarily smallholder farming, labor-intensive, increasing use of irrigation and green revolution tech.",
    latitude: 20.5937,
    overallInfo: "India has the world's largest area under cultivation for several crops and is a major global producer of milk and pulses.",
    gdpContribution: "18.3%",
    arableLand: "156M ha"
  },
  "ETH": {
    id: "ETH",
    name: "Ethiopia",
    mainCrops: ["Coffee", "Teff", "Maize", "Wheat"],
    mainExports: ["Coffee", "Oilseeds", "Pulses", "Flowers"],
    mainCattle: ["Cattle", "Sheep", "Goats", "Camels"],
    farmingMethods: "Traditional rain-fed subsistence farming, increasing focus on irrigation and commercial clusters.",
    latitude: 9.1450,
    overallInfo: "Agriculture is the backbone of Ethiopia's economy, with coffee being the primary export earner.",
    gdpContribution: "37.6%",
    arableLand: "15M ha"
  },
  "RUS": {
    id: "RUS",
    name: "Russia",
    mainCrops: ["Wheat", "Barley", "Sunflower Seeds", "Sugar Beets"],
    mainExports: ["Wheat", "Vegetable Oils", "Fish"],
    mainCattle: ["Cattle", "Pigs", "Poultry"],
    farmingMethods: "Large-scale industrial farming, significant focus on grain production in the Black Earth region.",
    latitude: 61.5240,
    overallInfo: "Russia has become the world's top wheat exporter, leveraging its vast fertile plains.",
    gdpContribution: "4.0%",
    arableLand: "121M ha"
  },
  "AUS": {
    id: "AUS",
    name: "Australia",
    mainCrops: ["Wheat", "Barley", "Canola", "Cotton"],
    mainExports: ["Beef", "Wheat", "Wine", "Wool"],
    mainCattle: ["Beef Cattle", "Sheep (Wool)"],
    farmingMethods: "Extensive dryland farming, highly mechanized, advanced water management systems.",
    latitude: -25.2744,
    overallInfo: "Australia is a major exporter of high-quality beef and grains, despite challenging arid conditions.",
    gdpContribution: "2.2%",
    arableLand: "31M ha"
  },
  "FRA": {
    id: "FRA",
    name: "France",
    mainCrops: ["Wheat", "Corn", "Barley", "Wine Grapes"],
    mainExports: ["Wine", "Wheat", "Cheese", "Dairy Products"],
    mainCattle: ["Dairy Cows", "Beef Cattle"],
    farmingMethods: "Highly productive, mechanized, strong focus on quality labels and sustainable practices.",
    latitude: 46.2276,
    overallInfo: "France is the EU's largest agricultural producer, famous for its high-value wine and dairy exports.",
    gdpContribution: "1.6%",
    arableLand: "18M ha"
  },
  "CAN": {
    id: "CAN",
    name: "Canada",
    mainCrops: ["Wheat", "Canola", "Barley", "Pulses"],
    mainExports: ["Wheat", "Canola", "Potash", "Pulses"],
    mainCattle: ["Beef Cattle", "Hogs"],
    farmingMethods: "Large-scale mechanized farming, advanced cold-climate agricultural research.",
    latitude: 56.1304,
    overallInfo: "Canada is a leading producer of canola and pulses, with a strong export-oriented agricultural sector.",
    gdpContribution: "1.7%",
    arableLand: "43M ha"
  },
  "ARG": {
    id: "ARG",
    name: "Argentina",
    mainCrops: ["Soybeans", "Corn", "Wheat", "Sunflower Seeds"],
    mainExports: ["Soybean Meal", "Corn", "Wheat", "Beef"],
    mainCattle: ["Beef Cattle"],
    farmingMethods: "Extensive farming on the Pampas, highly efficient no-till systems.",
    latitude: -38.4161,
    overallInfo: "Argentina is a top exporter of soybean products and is world-renowned for its high-quality beef.",
    gdpContribution: "6.4%",
    arableLand: "39M ha"
  }
};
