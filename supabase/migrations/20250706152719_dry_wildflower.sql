/*
  # Initial Medical Platform Schema

  1. Tables
     - users: Authentication and basic user info
     - user_profiles: Detailed medical and personal information
     - symptom_assessments: AI-powered symptom analysis records
     - health_roadmaps: Personalized health plans and goals
     - diet_plans: AI-generated meal plans and nutrition data
     - healthcare_providers: Medical provider directory
     - appointments: Appointment scheduling system

  2. Security
     - Enable RLS on all tables
     - Add policies for authenticated users to access their own data
     - Add policies for healthcare providers to access relevant data

  3. Indexes
     - Add performance indexes for common queries
     - Add spatial indexes for provider location searches
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'provider', 'admin')),
  email_verified boolean DEFAULT false,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User profiles with detailed medical information
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  height integer, -- in centimeters
  weight numeric(5,2), -- in kilograms
  blood_type text,
  emergency_contact jsonb,
  medical_conditions text[] DEFAULT '{}',
  current_medications text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  family_history text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Symptom assessments with AI analysis
CREATE TABLE IF NOT EXISTS symptom_assessments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  symptoms text[] NOT NULL,
  severity text NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  duration text NOT NULL,
  additional_notes text,
  ai_assessment jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Health roadmaps with goals and weekly plans
CREATE TABLE IF NOT EXISTS health_roadmaps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  goals jsonb NOT NULL,
  weekly_plan jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Diet plans with meals and nutrition data
CREATE TABLE IF NOT EXISTS diet_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  preferences jsonb NOT NULL,
  weekly_meals jsonb NOT NULL,
  grocery_list text[] DEFAULT '{}',
  nutritional_summary jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Healthcare providers directory
CREATE TABLE IF NOT EXISTS healthcare_providers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  specialty text NOT NULL,
  address text NOT NULL,
  latitude numeric(10,8) NOT NULL,
  longitude numeric(11,8) NOT NULL,
  phone text,
  email text,
  website text,
  rating numeric(3,2) DEFAULT 0,
  reviews_count integer DEFAULT 0,
  accepted_insurance text[] DEFAULT '{}',
  availability jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Appointments system
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES healthcare_providers(id) ON DELETE CASCADE,
  appointment_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 30,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for symptom_assessments
CREATE POLICY "Users can read own assessments" ON symptom_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments" ON symptom_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for health_roadmaps
CREATE POLICY "Users can read own roadmaps" ON health_roadmaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmaps" ON health_roadmaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmaps" ON health_roadmaps
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for diet_plans
CREATE POLICY "Users can read own diet plans" ON diet_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diet plans" ON diet_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diet plans" ON diet_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for healthcare_providers (public read)
CREATE POLICY "Anyone can read providers" ON healthcare_providers
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for appointments
CREATE POLICY "Users can read own appointments" ON appointments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_assessments_user_id ON symptom_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_assessments_created_at ON symptom_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_roadmaps_user_id ON health_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_user_id ON diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_specialty ON healthcare_providers(specialty);
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_location ON healthcare_providers USING GIST (
  ll_to_earth(latitude, longitude)
);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- Insert sample healthcare providers
INSERT INTO healthcare_providers (name, specialty, address, latitude, longitude, phone, accepted_insurance) VALUES
('City General Hospital', 'General Medicine', '123 Main St, New York, NY 10001', 40.7128, -74.0060, '(555) 123-4567', ARRAY['Aetna', 'Blue Cross', 'Cigna']),
('Metro Heart Center', 'Cardiology', '456 Park Ave, New York, NY 10016', 40.7505, -73.9780, '(555) 234-5678', ARRAY['Blue Cross', 'United Healthcare']),
('Downtown Pediatrics', 'Pediatrics', '789 Broadway, New York, NY 10003', 40.7282, -73.9942, '(555) 345-6789', ARRAY['Aetna', 'Medicaid']),
('East Side Dermatology', 'Dermatology', '321 East 65th St, New York, NY 10065', 40.7648, -73.9626, '(555) 456-7890', ARRAY['Cigna', 'Blue Cross']),
('Westside Orthopedics', 'Orthopedics', '654 West 42nd St, New York, NY 10036', 40.7580, -73.9855, '(555) 567-8901', ARRAY['United Healthcare', 'Aetna']);