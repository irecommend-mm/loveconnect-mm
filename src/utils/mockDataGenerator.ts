
import { supabase } from '@/integrations/supabase/client';
import { mockUsers } from '@/data/mockUsers';

export const populateMockData = async () => {
  try {
    console.log('Starting to populate mock data...');

    // First, let's create some mock profiles
    const mockProfiles = mockUsers.map(user => ({
      user_id: user.id,
      name: user.name,
      age: user.age,
      bio: user.bio,
      location: user.location,
      job: user.job,
      education: user.education,
      height: user.height,
      zodiac_sign: user.zodiacSign,
      relationship_type: user.relationshipType,
      children: user.children,
      smoking: user.smoking,
      drinking: user.drinking,
      exercise: user.exercise,
      verified: user.verified,
      latitude: 37.7749 + (Math.random() - 0.5) * 0.1, // San Francisco area
      longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
      last_active: user.lastActive?.toISOString() || new Date().toISOString()
    }));

    // Insert profiles
    const { error: profilesError } = await supabase
      .from('profiles')
      .upsert(mockProfiles, { onConflict: 'user_id' });

    if (profilesError) {
      console.error('Error inserting profiles:', profilesError);
      return;
    }

    // Insert photos for each user
    for (const user of mockUsers) {
      const photos = user.photos.map((photo, index) => ({
        user_id: user.id,
        url: photo,
        position: index,
        is_primary: index === 0
      }));

      const { error: photosError } = await supabase
        .from('photos')
        .upsert(photos, { onConflict: 'user_id,position' });

      if (photosError) {
        console.error(`Error inserting photos for user ${user.id}:`, photosError);
      }

      // Insert interests for each user
      const interests = user.interests.map(interest => ({
        user_id: user.id,
        interest
      }));

      const { error: interestsError } = await supabase
        .from('interests')
        .upsert(interests, { onConflict: 'user_id,interest' });

      if (interestsError) {
        console.error(`Error inserting interests for user ${user.id}:`, interestsError);
      }
    }

    // Create some mock group events
    const mockEvents = [
      {
        creator_id: mockUsers[0].id,
        title: 'Coffee & Chat Meetup',
        description: 'Casual coffee meetup for singles in the city. Great way to meet new people in a relaxed environment!',
        event_type: 'group',
        location: 'Blue Bottle Coffee, Mission District',
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        max_attendees: 15
      },
      {
        creator_id: mockUsers[1].id,
        title: 'Hiking Adventure',
        description: 'Join us for a scenic hike in Marin Headlands. Perfect for nature lovers and fitness enthusiasts!',
        event_type: 'group',
        location: 'Marin Headlands, Sausalito',
        event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        max_attendees: 20
      },
      {
        creator_id: mockUsers[2].id,
        title: 'Yoga & Mindfulness Session',
        description: 'Start your weekend with a peaceful yoga session followed by meditation and healthy snacks.',
        event_type: 'group',
        location: 'Golden Gate Park',
        event_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        max_attendees: 12
      },
      {
        creator_id: mockUsers[3].id,
        title: 'Cooking Class Date',
        description: 'Learn to cook authentic Italian cuisine together. Perfect for foodies looking for a fun date idea!',
        event_type: 'individual',
        location: 'Cooking Studio, North Beach',
        event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
        max_attendees: 8
      },
      {
        creator_id: mockUsers[4].id,
        title: 'Art Gallery Opening',
        description: 'Join me for the opening of my latest art exhibition. Wine, art, and great conversations!',
        event_type: 'group',
        location: 'SOMA Gallery, Downtown',
        event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks from now
        max_attendees: 25
      }
    ];

    const { error: eventsError } = await supabase
      .from('group_events')
      .upsert(mockEvents);

    if (eventsError) {
      console.error('Error inserting events:', eventsError);
      return;
    }

    // Create some mock swipes and matches
    const mockSwipes = [
      { swiper_id: mockUsers[0].id, swiped_id: mockUsers[1].id, action: 'like' },
      { swiper_id: mockUsers[1].id, swiped_id: mockUsers[0].id, action: 'like' }, // Match!
      { swiper_id: mockUsers[0].id, swiped_id: mockUsers[2].id, action: 'like' },
      { swiper_id: mockUsers[2].id, swiped_id: mockUsers[0].id, action: 'like' }, // Match!
      { swiper_id: mockUsers[1].id, swiped_id: mockUsers[3].id, action: 'super_like' },
      { swiper_id: mockUsers[3].id, swiped_id: mockUsers[1].id, action: 'like' }, // Match!
      { swiper_id: mockUsers[2].id, swiped_id: mockUsers[4].id, action: 'like' },
      { swiper_id: mockUsers[4].id, swiped_id: mockUsers[2].id, action: 'like' }, // Match!
    ];

    const { error: swipesError } = await supabase
      .from('swipes')
      .upsert(mockSwipes, { onConflict: 'swiper_id,swiped_id' });

    if (swipesError) {
      console.error('Error inserting swipes:', swipesError);
      return;
    }

    // The matches should be created automatically by the database trigger
    // But let's verify they exist
    const { data: existingMatches } = await supabase
      .from('matches')
      .select('*');

    console.log('Existing matches:', existingMatches);

    console.log('Mock data populated successfully!');
    return true;
  } catch (error) {
    console.error('Error populating mock data:', error);
    return false;
  }
};
