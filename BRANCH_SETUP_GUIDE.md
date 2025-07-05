# Setting Up a New Branch with Your Own Supabase Database

## Step 1: Create a New Git Branch

First, create and switch to a new branch for your feature development:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b dev/your-name
```

## Step 2: Set Up Your Own Supabase Project

1. **Create a New Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name (e.g., "heartspark-dev-yourname")
   - Set a strong database password
   - Choose a region close to you
   - Click "Create new project"

2. **Wait for Setup:**
   - The project will take a few minutes to set up
   - You'll get a project URL and API keys once ready

## Step 3: Update Environment Configuration

You'll need to update the Supabase client configuration with your new project details:

### Option A: Environment Variables (Recommended)
Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=your_new_project_url
VITE_SUPABASE_ANON_KEY=your_new_anon_key
```

### Option B: Direct Configuration Update
Update the client configuration file with your new credentials.

## Step 4: Run Database Migrations

Your new Supabase project will be empty, so you need to run the existing migrations:

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Initialize Supabase in your project:**
   ```bash
   supabase init
   ```

3. **Link to your new project:**
   ```bash
   supabase link --project-ref your_project_ref
   ```

4. **Push existing migrations:**
   ```bash
   supabase db push
   ```

## Step 5: Set Up Storage Buckets

The migrations should create the storage bucket, but if needed, you can manually create it:

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Create a bucket named "profile-images"
4. Make it public
5. Set up the storage policies (these should be in the migrations)

## Step 6: Test Your Setup

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test the connection:**
   - Try signing up with a new account
   - Upload a profile photo
   - Create a profile

## Step 7: Seed Test Data (Optional)

You can create some test profiles and data in your new database for development purposes.

## Important Notes

- **Keep your credentials secure:** Never commit your actual Supabase credentials to git
- **Use environment variables:** This allows different developers to use their own databases
- **Database isolation:** Each developer can have their own isolated database for testing
- **Migration consistency:** Always use the existing migrations to ensure schema consistency

## Troubleshooting

### Common Issues:

1. **Migration errors:** Make sure your Supabase CLI is up to date
2. **Connection issues:** Verify your project URL and API keys
3. **Storage issues:** Check that the profile-images bucket exists and is public
4. **RLS policies:** Ensure Row Level Security policies are properly applied

### Getting Help:

- Check Supabase documentation: [docs.supabase.com](https://docs.supabase.com)
- Review the existing migration files for schema reference
- Test with the demo account first to ensure everything works

## Next Steps

Once your branch is set up with your own database:

1. You can safely test new features without affecting the main database
2. Create new migration files for any schema changes
3. Test thoroughly before merging back to main
4. Document any new environment variables or setup steps needed

Happy coding! 🚀