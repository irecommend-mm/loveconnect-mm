# Database Setup Instructions

Your Supabase client has been configured, but you need to create the database tables. Here's how to set up your new Supabase database:

## Quick Setup (Recommended)

1. **Go to your Supabase Dashboard:**
   - Visit [supabase.com](https://supabase.com)
   - Open your "Love Connect Bolt" project

2. **Open the SQL Editor:**
   - In the left sidebar, click on "SQL Editor"
   - Click "New query"

3. **Run the Setup Script:**
   - Copy the entire contents of `setup-database.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

4. **Verify Setup:**
   - Go to "Table Editor" in the sidebar
   - You should see all the tables: profiles, photos, interests, swipes, matches, messages, notifications, group_events, event_attendees

## What This Creates

The setup script creates:

### Tables:
- **profiles** - User profile information
- **photos** - Profile photos
- **interests** - User interests/hobbies
- **swipes** - Like/dislike actions
- **matches** - Mutual likes between users
- **messages** - Chat messages between matches
- **notifications** - App notifications
- **group_events** - Social events
- **event_attendees** - Event participation

### Security:
- Row Level Security (RLS) policies for all tables
- Storage bucket for profile images
- Proper access controls

### Demo Data:
- Demo user account: `demo@loveconnect.com` / `demo123456`
- Sample profile with photos and interests

## Testing Your Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the demo account:**
   - Go to the login page
   - Use: `demo@loveconnect.com` / `demo123456`
   - You should be able to access the app

3. **Create a new account:**
   - Try signing up with a new email
   - Complete the profile setup
   - Upload photos and add interests

## Troubleshooting

### If you get connection errors:
- Check that your `.env.local` file has the correct credentials
- Verify the project URL and API key in your Supabase dashboard

### If tables don't appear:
- Make sure you ran the entire `setup-database.sql` script
- Check for any error messages in the SQL Editor

### If authentication doesn't work:
- Verify that email confirmation is disabled in your Supabase Auth settings
- Check that the demo user was created successfully

## Next Steps

Once your database is set up:

1. **Create a new git branch** for your development:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Start developing** your new features with confidence that you have your own isolated database

3. **Add new migrations** if you need to modify the database schema

Your development environment is now ready! 🚀