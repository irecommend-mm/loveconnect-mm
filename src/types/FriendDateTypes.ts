
export type AppMode = 'friend' | 'date';

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
