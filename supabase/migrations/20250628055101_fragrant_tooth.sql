/*
  # Initial Welp Database Schema

  1. New Tables
    - `businesses`
      - `id` (uuid, primary key)
      - `name` (text)
      - `owner_id` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `customer_profiles`
      - `id` (uuid, primary key)
      - `phone_hash` (text, unique) - hashed phone number for privacy
      - `display_id` (text) - anonymized display name like "John D."
      - `overall_score` (decimal)
      - `behavior_score` (decimal)
      - `payment_score` (decimal)
      - `maintenance_score` (decimal)
      - `total_reviews` (integer)
      - `is_flagged` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `customer_reviews`
      - `id` (uuid, primary key)
      - `customer_profile_id` (uuid, references customer_profiles)
      - `business_id` (uuid, references businesses)
      - `reviewer_id` (uuid, references auth.users)
      - `overall_rating` (decimal)
      - `behavior_rating` (decimal)
      - `payment_rating` (decimal)
      - `maintenance_rating` (decimal)
      - `comment` (text)
      - `reviewer_role` (text)
      - `voice_recording_url` (text, optional)
      - `tags` (text array)
      - `is_flagged` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `business_id` (uuid, references businesses)
      - `display_name` (text)
      - `role` (text)
      - `subscription_tier` (text)
      - `lookups_remaining` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for business owners to manage their business data
*/

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customer_profiles table
CREATE TABLE IF NOT EXISTS customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_hash text UNIQUE NOT NULL,
  display_id text NOT NULL,
  overall_score decimal(3,2) DEFAULT 0.0,
  behavior_score decimal(3,2) DEFAULT 0.0,
  payment_score decimal(3,2) DEFAULT 0.0,
  maintenance_score decimal(3,2) DEFAULT 0.0,
  total_reviews integer DEFAULT 0,
  is_flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customer_reviews table
CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_profile_id uuid REFERENCES customer_profiles(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_rating decimal(3,2) NOT NULL CHECK (overall_rating >= 0 AND overall_rating <= 5),
  behavior_rating decimal(3,2) NOT NULL CHECK (behavior_rating >= 0 AND behavior_rating <= 5),
  payment_rating decimal(3,2) NOT NULL CHECK (payment_rating >= 0 AND payment_rating <= 5),
  maintenance_rating decimal(3,2) NOT NULL CHECK (maintenance_rating >= 0 AND maintenance_rating <= 5),
  comment text DEFAULT '',
  reviewer_role text NOT NULL,
  voice_recording_url text,
  tags text[] DEFAULT '{}',
  is_flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  role text DEFAULT 'owner',
  subscription_tier text DEFAULT 'free',
  lookups_remaining integer DEFAULT 3,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for businesses table
CREATE POLICY "Users can read own business"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own business"
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own business"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Policies for customer_profiles table
CREATE POLICY "Authenticated users can read customer profiles"
  ON customer_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create customer profiles"
  ON customer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update customer profiles"
  ON customer_profiles
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policies for customer_reviews table
CREATE POLICY "Users can read reviews for their business"
  ON customer_reviews
  FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    ) OR reviewer_id = auth.uid()
  );

CREATE POLICY "Users can create reviews for their business"
  ON customer_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    ) AND reviewer_id = auth.uid()
  );

CREATE POLICY "Users can update their own reviews"
  ON customer_reviews
  FOR UPDATE
  TO authenticated
  USING (reviewer_id = auth.uid());

CREATE POLICY "Users can delete their own reviews"
  ON customer_reviews
  FOR DELETE
  TO authenticated
  USING (reviewer_id = auth.uid());

-- Policies for user_profiles table
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone_hash ON customer_profiles(phone_hash);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_customer_profile_id ON customer_reviews(customer_profile_id);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_business_id ON customer_reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_reviewer_id ON customer_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_business_id ON user_profiles(business_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_reviews_updated_at BEFORE UPDATE ON customer_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();