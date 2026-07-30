export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  farmName?: string;
  farmSize?: number;
  mainCrop?: string;
  mainHusbandry?: string;
  farmLocation?: string;
  orgType?: 'Individual Farmer' | 'Company';
  avatarUrl?: string;
  bio?: string;
  username?: string;
  interests?: string[];
  is_organization?: boolean;
  is_admin?: boolean;
  is_verified?: boolean;
  followersCount?: number;
  followingCount?: number;
  onboarded?: boolean;
  createdAt: any;
}

export interface Follow {
  id: string;
  followerId: string;
  followedId: string;
  createdAt: any;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: any;
}

export interface Post {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: number;
  likedBy: string[];
  createdAt: any;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userDisplayName: string;
  content: string;
  createdAt: any;
}

export interface SensorReading {
  id: string;
  userId: string;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  lightLevel: number;
  timestamp: any;
}

export interface NewsArticle {
  title: string;
  description: string;
  source_id: string;
  pubDate: string;
  image_url: string;
  category: string;
}

export interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  rain?: {
    '1h'?: number;
  };
}

export interface Crop {
  id: number;
  common_name: string;
  scientific_name: string[];
  cycle: string;
  watering: string;
  sunlight: string[];
  default_image?: {
    thumbnail: string;
    original_url: string;
  };
  description?: string;
  growth_rate?: string;
  hardiness?: {
    min: string;
    max: string;
  };
  soil?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  fromUserId?: string;
  title: string;
  message: string;
  type: 'comment' | 'like' | 'follow' | 'message' | 'news' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: any;
}
