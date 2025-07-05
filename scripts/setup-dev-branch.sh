#!/bin/bash

# Script to help set up a new development branch with own Supabase database
# Usage: ./scripts/setup-dev-branch.sh <branch-name>

set -e

BRANCH_NAME=${1:-"dev/$(whoami)"}

echo "🚀 Setting up new development branch: $BRANCH_NAME"

# Create and switch to new branch
echo "📝 Creating new git branch..."
git checkout -b "$BRANCH_NAME"

# Create environment file template
echo "📄 Creating environment file template..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from template"
    echo "⚠️  Please update .env.local with your Supabase credentials"
else
    echo "ℹ️  .env.local already exists"
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "✅ Development branch setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a new Supabase project at https://supabase.com"
echo "2. Update .env.local with your project credentials"
echo "3. Run: supabase link --project-ref YOUR_PROJECT_REF"
echo "4. Run: supabase db push"
echo "5. Run: npm run dev"
echo ""
echo "Happy coding! 🎉"