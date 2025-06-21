
export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  interests: string[];
  location: string;
  job?: string;
  education?: string;
  height?: string;
  zodiacSign?: string;
  relationshipType?: 'serious' | 'casual' | 'friends' | 'unsure';
  children?: 'have' | 'want' | 'dont_want' | 'unsure';
  smoking?: 'yes' | 'no' | 'sometimes';
  drinking?: 'yes' | 'no' | 'sometimes';
  exercise?: 'often' | 'sometimes' | 'never';
  verified?: boolean;
  lastActive?: Date;
  isOnline?: boolean;
  distance?: number;
  latitude?: number;
  longitude?: number;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read?: boolean;
  type?: 'text' | 'image' | 'gif';
}

export interface Match {
  id: string;
  users: [string, string];
  timestamp: Date;
  lastMessage?: Message;
  isActive: boolean;
}

export interface SwipeAction {
  id: string;
  userId: string;
  targetUserId: string;
  action: 'like' | 'dislike' | 'super_like';
  timestamp: Date;
}

export interface DiscoveryPreferences {
  ageRange: [number, number];
  maxDistance: number;
  relationshipType?: 'serious' | 'casual' | 'friends' | 'unsure';
  showMe: 'men' | 'women' | 'everyone';
}

export interface UserSettings {
  notifications: {
    matches: boolean;
    messages: boolean;
    likes: boolean;
  };
  privacy: {
    showAge: boolean;
    showDistance: boolean;
    incognito: boolean;
  };
  discovery: DiscoveryPreferences;
}
