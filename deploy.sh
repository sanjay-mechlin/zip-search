#!/bin/bash

# Supabase Deployment Script for Local Service MVP
echo "🚀 Starting deployment process..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Check if user is logged in
if ! supabase status &> /dev/null; then
    echo "🔐 Please login to Supabase CLI first:"
    echo "   supabase login"
    exit 1
fi

# Build the project
echo "📦 Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

# Deploy to Supabase
echo "🚀 Deploying to Supabase..."
supabase functions deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app is now live on Supabase"
    echo "📝 Don't forget to:"
    echo "   1. Set up your environment variables"
    echo "   2. Configure CORS settings"
    echo "   3. Update authentication URLs"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
