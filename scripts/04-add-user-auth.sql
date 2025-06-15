-- Migration: Add user authentication support
-- This script adds the users table and updates existing tables with user_id columns

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  avatar_url TEXT,
  provider VARCHAR(50) NOT NULL DEFAULT 'credentials',
  provider_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider);
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider_id);

-- Add user_id column to activities table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'activities' AND column_name = 'user_id') THEN
        ALTER TABLE activities ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add user_id column to activity_logs table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'activity_logs' AND column_name = 'user_id') THEN
        ALTER TABLE activity_logs ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for user_id columns
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- Create a default user for existing data (optional - you can skip this if you want to start fresh)
-- This creates a demo user and assigns all existing activities to them
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    -- Check if there are any activities without user_id
    IF EXISTS (SELECT 1 FROM activities WHERE user_id IS NULL) THEN
        -- Create a demo user
        INSERT INTO users (email, name, provider) 
        VALUES ('demo@momentum.app', 'Demo User', 'credentials')
        ON CONFLICT (email) DO NOTHING
        RETURNING id INTO demo_user_id;
        
        -- If user already exists, get their ID
        IF demo_user_id IS NULL THEN
            SELECT id INTO demo_user_id FROM users WHERE email = 'demo@momentum.app';
        END IF;
        
        -- Assign all existing activities to the demo user
        UPDATE activities SET user_id = demo_user_id WHERE user_id IS NULL;
        UPDATE activity_logs SET user_id = demo_user_id WHERE user_id IS NULL;
    END IF;
END $$;

-- Make user_id NOT NULL after assigning existing data
ALTER TABLE activities ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE activity_logs ALTER COLUMN user_id SET NOT NULL; 