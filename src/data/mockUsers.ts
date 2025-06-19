
import { User } from '../types/User';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Emma',
    age: 26,
    bio: 'Adventure seeker 🌟 Love hiking, photography, and trying new cuisines. Looking for someone who shares my passion for exploring the world! Currently learning Spanish and planning my next backpacking trip.',
    photos: [
      'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
    ],
    interests: ['Hiking', 'Photography', 'Travel', 'Cooking', 'Spanish', 'Yoga'],
    location: 'San Francisco, CA',
    job: 'Product Designer at Meta',
    education: 'Stanford University',
    height: '5\'6"',
    zodiacSign: 'Gemini',
    relationshipType: 'serious',
    children: 'want',
    smoking: 'no',
    drinking: 'sometimes',
    exercise: 'often',
    verified: true,
    lastActive: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: '2',
    name: 'Marcus',
    age: 29,
    bio: 'Tech enthusiast and coffee connoisseur ☕ Building the future one line of code at a time. Always up for a good conversation about AI, startups, or the best coffee spots in the city!',
    photos: [
      'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400'
    ],
    interests: ['Technology', 'Coffee',<- 'Reading', 'Gaming', 'Startups', 'AI'],
    location: 'Palo Alto, CA',
    job: 'Senior Software Engineer at Google',
    education: 'UC Berkeley',
    height: '6\'1"',
    zodiacSign: 'Virgo',
    relationshipType: 'serious',
    children: 'unsure',
    smoking: 'no',
    drinking: 'yes',
    exercise: 'sometimes',
    verified: true,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: '3',
    name: 'Sophia',
    age: 24,
    bio: 'Yoga instructor and wellness enthusiast 🧘‍♀️ Spreading positive vibes and helping others find their inner peace. Love sunrise yoga sessions and healthy smoothie bowls!',
    photos: [
      'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400'
    ],
    interests: ['Yoga', 'Meditation', 'Wellness', 'Nature', 'Smoothies', 'Mindfulness'],
    location: 'San Jose, CA',
    job: 'Yoga Instructor & Wellness Coach',
    education: 'UC Santa Barbara',
    height: '5\'4"',
    zodiacSign: 'Pisces',
    relationshipType: 'serious',
    children: 'want',
    smoking: 'no',
    drinking: 'no',
    exercise: 'often',
    verified: false,
    lastActive: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
  },
  {
    id: '4',
    name: 'Jake',
    age: 31,
    bio: 'Chef and foodie 👨‍🍳 Creating culinary masterpieces and always searching for the perfect recipe. Life is too short for bad food! Let\'s explore the food scene together.',
    photos: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
    ],
    interests: ['Cooking', 'Food', 'Wine', 'Travel', 'Restaurants', 'Mixology'],
    location: 'Oakland, CA',
    job: 'Executive Chef at Michelin Star Restaurant',
    education: 'Culinary Institute of America',
    height: '5\'10"',
    zodiacSign: 'Taurus',
    relationshipType: 'casual',
    children: 'dont_want',
    smoking: 'no',
    drinking: 'yes',
    exercise: 'sometimes',
    verified: true,
    lastActive: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
  },
  {
    id: '5',
    name: 'Isabella',
    age: 27,
    bio: 'Artist and dreamer 🎨 Painting my way through life and finding beauty in everyday moments. Currently working on my first gallery exhibition. Let\'s create something beautiful together!',
    photos: [
      'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400'
    ],
    interests: ['Art', 'Painting', 'Museums', 'Music', 'Poetry', 'Exhibitions'],
    location: 'San Francisco, CA',
    job: 'Visual Artist & Gallery Curator',
    education: 'Art Institute of California',
    height: '5\'7"',
    zodiacSign: 'Aquarius',
    relationshipType: 'serious',
    children: 'unsure',
    smoking: 'sometimes',
    drinking: 'sometimes',
    exercise: 'never',
    verified: false,
    lastActive: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
  },
  {
    id: '6',
    name: 'Ryan',
    age: 28,
    bio: 'Fitness trainer and outdoor enthusiast 💪 Helping people achieve their fitness goals while exploring the great outdoors. Rock climbing is my passion - let\'s reach new heights together!',
    photos: [
      'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400'
    ],
    interests: ['Fitness', 'Rock Climbing', 'Hiking', 'Nutrition', 'Outdoor Sports', 'Health'],
    location: 'Mountain View, CA',
    job: 'Personal Trainer & Nutritionist',
    education: 'San Jose State University',
    height: '6\'0"',
    zodiacSign: 'Aries',
    relationshipType: 'casual',
    children: 'want',
    smoking: 'no',
    drinking: 'sometimes',
    exercise: 'often',
    verified: true,
    lastActive: new Date(Date.now() - 1000 * 60 * 20) // 20 minutes ago
  },
  {
    id: '7',
    name: 'Maya',
    age: 25,
    bio: 'Marketing strategist by day, salsa dancer by night 💃 Love connecting with people and exploring different cultures. Always planning the next adventure or dance class!',
    photos: [
      'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400'
    ],
    interests: ['Dancing', 'Marketing', 'Travel', 'Salsa', 'Culture', 'Languages'],
    location: 'San Francisco, CA',
    job: 'Marketing Manager at Airbnb',
    education: 'UCLA',
    height: '5\'5"',
    zodiacSign: 'Leo',
    relationshipType: 'friends',
    children: 'dont_want',
    smoking: 'no',
    drinking: 'yes',
    exercise: 'often',
    verified: true,
    lastActive: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
  },
  {
    id: '8',
    name: 'David',
    age: 33,
    bio: 'Musician and music producer 🎵 Creating beats and melodies that touch the soul. When I\'m not in the studio, you\'ll find me at live concerts or discovering new artists.',
    photos: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
    ],
    interests: ['Music', 'Production', 'Concerts', 'Guitar', 'Vinyl Records', 'Sound Design'],
    location: 'San Francisco, CA',
    job: 'Music Producer & Sound Engineer',
    education: 'Berklee College of Music',
    height: '5\'9"',
    zodiacSign: 'Scorpio',
    relationshipType: 'serious',
    children: 'have',
    smoking: 'sometimes',
    drinking: 'yes',
    exercise: 'never',
    verified: false,
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 3) // 3 hours ago
  }
];
