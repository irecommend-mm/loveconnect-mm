
export type AppMode = 'friend' | 'date';

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface UserMode {
  currentMode: AppMode;
  friendModeActive: boolean;
  dateModeActive: boolean;
}

export interface CompatibilityScore {
  friendshipScore: number;
  romanceScore: number;
  overallCompatibility: number;
  factors: {
    commonInterests: number;
    lifestyleAlignment: number;
    communicationStyle: number;
    values: number;
    zodiacCompatibility?: number;
  };
}

export interface MeetupFeedback {
  userId: string;
  eventId: string;
  friendVibe: number; // 1-5 stars
  dateVibe: number; // 1-5 stars
  wouldMeetAgain: boolean;
  safetyRating: number;
  comments?: string;
}

export interface SafetyFeatures {
  photoVerified: boolean;
  selfieVerified: boolean;
  liveLocationSharing: boolean;
  safeCheckIn: boolean;
  checkInTime?: Date;
  emergencyContact?: string;
}

export interface GamificationData {
  meetupPoints: number;
  level: number;
  badges: Badge[];
  streakDays: number;
  matchOfTheDay?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'meetup' | 'social' | 'safety' | 'compatibility';
}

export interface UserFilters {
  ageRange: [number, number];
  maxDistance: number;
  relationshipType?: 'serious' | 'casual' | 'friends' | 'unsure';
  showMe: 'men' | 'women' | 'everyone';
  interests?: string[];
  verifiedOnly?: boolean;
  onlineOnly?: boolean;
  hasPhotos?: boolean;
  hasBio?: boolean;
}

export interface ProfileData {
  name: string;
  age: number;
  birthdate: string;
  bio: string;
  location: string;
  job_title: string;
  company_name: string;
  education: string;
  education_level: string;
  height_cm: number;
  zodiac_sign: string;
  relationship_type: string;
  children: string;
  smoking: string;
  drinking: string;
  exercise: string;
  religion: string;
  gender: string;
  orientation: string[];
  show_me: string[];
  love_languages: string[];
  personality_type: string;
  body_type: string;
  languages_spoken: string[];
  dealbreakers: string[];
  lifestyle: {
    interests: string[];
    [key: string]: string | string[] | number | boolean;
  };
  preferences: {
    age_range: [number, number];
    max_distance: number;
    [key: string]: string | string[] | number | boolean | [number, number];
  };
  terms_agreement: boolean;
  video_intro_url: string;
  instagram_username: string;
  spotify_connected: boolean;
  spotify_data: {
    topArtists?: string[];
    topTracks?: string[];
    connectedAt?: string;
    [key: string]: string | string[] | undefined;
  };
  voice_intro_url: string;
  facebook_id: string;
  social_verified: boolean;
}

export interface ExistingProfile {
  id?: string;
  user_id?: string;
  name?: string;
  age?: number;
  birthdate?: string;
  bio?: string;
  location?: string;
  job_title?: string;
  company_name?: string;
  education?: string;
  education_level?: string;
  height_cm?: number;
  zodiac_sign?: string;
  relationship_type?: string;
  children?: string;
  smoking?: string;
  drinking?: string;
  exercise?: string;
  religion?: string;
  gender?: string;
  orientation?: string[];
  show_me?: string[];
  love_languages?: string[];
  personality_type?: string;
  body_type?: string;
  languages_spoken?: string[];
  dealbreakers?: string[];
  lifestyle?: string | object;
  preferences?: string | object;
  terms_agreement?: boolean;
  video_intro_url?: string;
  instagram_username?: string;
  spotify_connected?: boolean;
  spotify_data?: string | object;
  voice_intro_url?: string;
  facebook_id?: string;
  social_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Story Types
export interface Story {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  expires_at: string;
  is_active: boolean;
  view_count: number;
  like_count: number;
  super_like_count: number;
  friend_request_count: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: {
    name: string;
    age: number;
    photos: string[];
    location?: string;
  };
  media?: StoryMedia[];
  user_interaction?: StoryInteraction;
}

export interface StoryMedia {
  id: string;
  story_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  position: number;
  created_at: string;
}

export interface StoryInteraction {
  id: string;
  story_id: string;
  user_id: string;
  interaction_type: 'like' | 'super_like' | 'friend_request';
  status: 'pending' | 'accepted' | 'rejected' | 'ignored';
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface FriendRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'ignored';
  message?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  requester?: {
    name: string;
    age: number;
    photos: string[];
  };
  recipient?: {
    name: string;
    age: number;
    photos: string[];
  };
}

export interface CreateStoryData {
  title: string;
  description?: string;
  media: File[];
}
