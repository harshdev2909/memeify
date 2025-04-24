/*
  # Initial schema setup for MemeGen

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `username` (text, not null)
      - `avatar_url` (text, nullable)
      - `joined_at` (timestamptz, defaults to now())
    - `memes`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `image_url` (text, not null)
      - `tags` (text array, defaults to empty array)
      - `creator_id` (uuid, references profiles.id)
      - `created_at` (timestamptz, defaults to now())
      - `likes_count` (integer, defaults to 0)
    - `likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `meme_id` (uuid, references memes.id)
    - `comments`
      - `id` (uuid, primary key)
      - `meme_id` (uuid, references memes.id)
      - `user_id` (uuid, references profiles.id)
      - `content` (text, not null)
      - `created_at` (timestamptz, defaults to now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read all profiles
      - Update only their own profile
      - Read all memes
      - Create memes (as themselves)
      - Create/delete their own likes
      - Read all comments
      - Create comments (as themselves)
      - Delete their own comments
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create memes table
CREATE TABLE IF NOT EXISTS memes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  likes_count INTEGER DEFAULT 0 NOT NULL
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meme_id UUID NOT NULL REFERENCES memes(id) ON DELETE CASCADE,
  UNIQUE(user_id, meme_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id UUID NOT NULL REFERENCES memes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can read profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Memes policies
CREATE POLICY "Anyone can read memes"
  ON memes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create memes"
  ON memes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own memes"
  ON memes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Likes policies
CREATE POLICY "Anyone can read likes"
  ON likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create likes"
  ON likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can read comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create Supabase storage buckets for memes and avatars
INSERT INTO storage.buckets (id, name) VALUES ('memes', 'memes') ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name) VALUES ('avatars', 'avatars') ON CONFLICT DO NOTHING;

-- Storage policies for memes bucket
CREATE POLICY "Anyone can read meme images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'memes');

CREATE POLICY "Authenticated users can upload meme images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'memes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can read avatar images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);