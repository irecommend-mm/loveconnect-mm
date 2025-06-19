
import { User } from '../types/User';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Emma',
    age: 26,
    bio: 'Adventure seeker 🌟 Love hiking, photography, and trying new cuisines. Looking for someone who shares my passion for exploring the world!',
    photos: [
      'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
    ],
    interests: ['Hiking', 'Photography', 'Travel', 'Cooking'],
    location: 'San Francisco, CA',
    job: 'Product Designer',
    education: 'Stanford University'
  },
  {
    id: '2',
    name: 'Alex',
    age: 29,
    bio: 'Tech enthusiast and coffee connoisseur ☕ Building the future one line of code at a time. Always up for a good conversation!',
    photos: [
      'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400'
    ],
    interests: ['Technology', 'Coffee', 'Reading', 'Gaming'],
    location: 'Palo Alto, CA',
    job: 'Software Engineer',
    education: 'UC Berkeley'
  },
  {
    id: '3',
    name: 'Sophia',
    age: 24,
    bio: 'Yoga instructor and wellness enthusiast 🧘‍♀️ Spreading positive vibes and helping others find their inner peace.',
    photos: [
      'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400'
    ],
    interests: ['Yoga', 'Meditation', 'Wellness', 'Nature'],
    location: 'San Jose, CA',
    job: 'Yoga Instructor',
    education: 'UC Santa Barbara'
  },
  {
    id: '4',
    name: 'Marcus',
    age: 31,
    bio: 'Chef and foodie 👨‍🍳 Creating culinary masterpieces and always searching for the perfect recipe. Life is too short for bad food!',
    photos: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400'
    ],
    interests: ['Cooking', 'Food', 'Wine', 'Travel'],
    location: 'Oakland, CA',
    job: 'Executive Chef',
    education: 'Culinary Institute of America'
  },
  {
    id: '5',
    name: 'Isabella',
    age: 27,
    bio: 'Artist and dreamer 🎨 Painting my way through life and finding beauty in everyday moments. Let\'s create something beautiful together!',
    photos: [
      'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400'
    ],
    interests: ['Art', 'Painting', 'Museums', 'Music'],
    location: 'San Francisco, CA',
    job: 'Visual Artist',
    education: 'Art Institute of California'
  }
];
