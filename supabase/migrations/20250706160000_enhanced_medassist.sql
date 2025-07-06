/*
  # Updated Medical Platform Schema - Enhanced Version

  1. Enhanced Tables
     - users: Authentication using Supabase Auth (auth.users)
     - user_profiles: Enhanced with more medical fields
     - symptom_assessments: Improved AI analysis structure
     - health_roadmaps: Enhanced with progress tracking
     - diet_plans: Improved with meal scheduling
     - healthcare_providers: Enhanced with more provider data
     - appointments: Improved booking system
     - user_sessions: For tracking user activity
     - medical_records: For storing medical documents/reports

  2. Enhanced Security
     - Better RLS policies with auth.users integration
     - Improved data validation
     - Enhanced privacy controls

  3. Additional Features
     - Audit trails
     - Better indexing
     - Trigger functions for auto-updates
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "earthdistance";
CREATE EXTENSION IF NOT EXISTS "cube";

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Enhanced user profiles with comprehensive medical information
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  height integer, -- in centimeters
  weight numeric(5,2), -- in kilograms
  blood_type text CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  emergency_contact jsonb DEFAULT '{}',
  medical_conditions text[] DEFAULT '{}',
  current_medications text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  family_history text[] DEFAULT '{}',
  insurance_provider text,
  insurance_policy_number text,
  preferred_language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  notification_preferences jsonb DEFAULT '{"email": true, "sms": false, "push": true}',
  privacy_settings jsonb DEFAULT '{"share_data": false, "anonymous_analytics": true}',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enhanced symptom assessments with better AI structure
CREATE TABLE IF NOT EXISTS symptom_assessments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid DEFAULT uuid_generate_v4(),
  symptoms jsonb NOT NULL, -- Changed to jsonb for better structure
  severity text NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
  duration text NOT NULL,
  additional_notes text,
  ai_assessment jsonb NOT NULL DEFAULT '{}',
  confidence_score numeric(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  recommended_actions text[] DEFAULT '{}',
  urgent_care_needed boolean DEFAULT false,
  follow_up_date date,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced health roadmaps with progress tracking
CREATE TABLE IF NOT EXISTS health_roadmaps (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  goals jsonb NOT NULL DEFAULT '{}',
  weekly_plan jsonb NOT NULL DEFAULT '{}',
  progress_data jsonb DEFAULT '{}',
  target_completion_date date,
  current_week integer DEFAULT 1,
  total_weeks integer DEFAULT 12,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  completion_percentage numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced diet plans with meal scheduling
CREATE TABLE IF NOT EXISTS diet_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  dietary_preferences jsonb NOT NULL DEFAULT '{}',
  restrictions text[] DEFAULT '{}',
  weekly_meals jsonb NOT NULL DEFAULT '{}',
  grocery_list text[] DEFAULT '{}',
  nutritional_summary jsonb NOT NULL DEFAULT '{}',
  calorie_target integer,
  active_from date DEFAULT CURRENT_DATE,
  active_until date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced healthcare providers with comprehensive data
CREATE TABLE IF NOT EXISTS healthcare_providers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  specialty text NOT NULL,
  subspecialty text[],
  credentials text[] DEFAULT '{}',
  languages text[] DEFAULT '{"English"}',
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  country text DEFAULT 'USA',
  latitude numeric(10,8) NOT NULL,
  longitude numeric(11,8) NOT NULL,
  phone text,
  email text,
  website text,
  office_hours jsonb DEFAULT '{}',
  rating numeric(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count integer DEFAULT 0,
  accepted_insurance text[] DEFAULT '{}',
  telemedicine_available boolean DEFAULT false,
  verified boolean DEFAULT false,
  npi_number text,
  license_number text,
  hospital_affiliations text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhanced appointments system
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES healthcare_providers(id) ON DELETE CASCADE,
  appointment_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 30,
  appointment_type text DEFAULT 'in-person' CHECK (appointment_type IN ('in-person', 'telemedicine', 'phone')),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')),
  reason_for_visit text,
  notes text,
  reminder_sent boolean DEFAULT false,
  confirmation_code text DEFAULT encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Medical records for storing documents and reports
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES healthcare_providers(id),
  title text NOT NULL,
  description text,
  record_type text NOT NULL CHECK (record_type IN ('lab_result', 'imaging', 'prescription', 'visit_note', 'vaccination', 'other')),
  file_url text,
  file_type text,
  file_size integer,
  record_date date DEFAULT CURRENT_DATE,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User sessions for tracking activity
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_start timestamptz DEFAULT now(),
  session_end timestamptz,
  ip_address inet,
  user_agent text,
  activities jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own assessments" ON symptom_assessments;
DROP POLICY IF EXISTS "Users can insert own assessments" ON symptom_assessments;
DROP POLICY IF EXISTS "Users can read own roadmaps" ON health_roadmaps;
DROP POLICY IF EXISTS "Users can insert own roadmaps" ON health_roadmaps;
DROP POLICY IF EXISTS "Users can update own roadmaps" ON health_roadmaps;
DROP POLICY IF EXISTS "Users can read own diet plans" ON diet_plans;
DROP POLICY IF EXISTS "Users can insert own diet plans" ON diet_plans;
DROP POLICY IF EXISTS "Users can update own diet plans" ON diet_plans;
DROP POLICY IF EXISTS "Anyone can read providers" ON healthcare_providers;
DROP POLICY IF EXISTS "Users can read own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON appointments;

-- RLS Policies using auth.users
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Enhanced RLS for symptom assessments
CREATE POLICY "Users can read own assessments" ON symptom_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments" ON symptom_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments" ON symptom_assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- Enhanced RLS for health roadmaps
CREATE POLICY "Users can read own roadmaps" ON health_roadmaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmaps" ON health_roadmaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own roadmaps" ON health_roadmaps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own roadmaps" ON health_roadmaps
  FOR DELETE USING (auth.uid() = user_id);

-- Enhanced RLS for diet plans
CREATE POLICY "Users can read own diet plans" ON diet_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diet plans" ON diet_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diet plans" ON diet_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diet plans" ON diet_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Healthcare providers (public read for authenticated users)
CREATE POLICY "Authenticated users can read providers" ON healthcare_providers
  FOR SELECT TO authenticated USING (true);

-- Enhanced RLS for appointments
CREATE POLICY "Users can read own appointments" ON appointments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own appointments" ON appointments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS for medical records
CREATE POLICY "Users can read own medical records" ON medical_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medical records" ON medical_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medical records" ON medical_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medical records" ON medical_records
  FOR DELETE USING (auth.uid() = user_id);

-- RLS for user sessions
CREATE POLICY "Users can read own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_symptom_assessments_updated_at
  BEFORE UPDATE ON symptom_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_roadmaps_updated_at
  BEFORE UPDATE ON health_roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_plans_updated_at
  BEFORE UPDATE ON diet_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_healthcare_providers_updated_at
  BEFORE UPDATE ON healthcare_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enhanced indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_symptom_assessments_user_id ON symptom_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_assessments_created_at ON symptom_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_assessments_status ON symptom_assessments(status);
CREATE INDEX IF NOT EXISTS idx_health_roadmaps_user_id ON health_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_health_roadmaps_status ON health_roadmaps(status);
CREATE INDEX IF NOT EXISTS idx_diet_plans_user_id ON diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_status ON diet_plans(status);
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_specialty ON healthcare_providers(specialty);
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_city ON healthcare_providers(city);
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_verified ON healthcare_providers(verified);
CREATE INDEX IF NOT EXISTS idx_healthcare_providers_location ON healthcare_providers USING GIST (
  ll_to_earth(latitude, longitude)
);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_medical_records_user_id ON medical_records(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_type ON medical_records(record_type);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON medical_records(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start ON user_sessions(session_start DESC);

-- Insert comprehensive sample healthcare providers
INSERT INTO healthcare_providers (
  name, specialty, subspecialty, credentials, languages, address, city, state, zip_code,
  latitude, longitude, phone, email, website, office_hours, rating, reviews_count,
  accepted_insurance, telemedicine_available, verified, npi_number
) VALUES
('City General Hospital', 'General Medicine', ARRAY['Internal Medicine', 'Preventive Care'], 
 ARRAY['MD', 'FACP'], ARRAY['English', 'Spanish'], 
 '123 Main St', 'New York', 'NY', '10001', 
 40.7128, -74.0060, '(555) 123-4567', 'info@citygeneral.com', 'https://citygeneral.com',
 '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00"}',
 4.5, 124, ARRAY['Aetna', 'Blue Cross', 'Cigna', 'United Healthcare'], true, true, '1234567890'),

('Metro Heart Center', 'Cardiology', ARRAY['Interventional Cardiology', 'Heart Surgery'], 
 ARRAY['MD', 'FACC'], ARRAY['English'], 
 '456 Park Ave', 'New York', 'NY', '10016', 
 40.7505, -73.9780, '(555) 234-5678', 'contact@metroheartcenter.com', 'https://metroheartcenter.com',
 '{"monday": "8:00-18:00", "tuesday": "8:00-18:00", "wednesday": "8:00-18:00", "thursday": "8:00-18:00", "friday": "8:00-16:00"}',
 4.8, 89, ARRAY['Blue Cross', 'United Healthcare', 'Aetna'], true, true, '2345678901'),

('Downtown Pediatrics', 'Pediatrics', ARRAY['General Pediatrics', 'Adolescent Medicine'], 
 ARRAY['MD', 'FAAP'], ARRAY['English', 'Spanish', 'French'], 
 '789 Broadway', 'New York', 'NY', '10003', 
 40.7282, -73.9942, '(555) 345-6789', 'info@downtownpediatrics.com', 'https://downtownpediatrics.com',
 '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00", "saturday": "9:00-13:00"}',
 4.6, 156, ARRAY['Aetna', 'Medicaid', 'CHIP', 'Blue Cross'], false, true, '3456789012'),

('East Side Dermatology', 'Dermatology', ARRAY['Cosmetic Dermatology', 'Dermatopathology'], 
 ARRAY['MD', 'FAAD'], ARRAY['English', 'Korean'], 
 '321 East 65th St', 'New York', 'NY', '10065', 
 40.7648, -73.9626, '(555) 456-7890', 'appointments@eastsidedermatology.com', 'https://eastsidedermatology.com',
 '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00"}',
 4.7, 203, ARRAY['Cigna', 'Blue Cross', 'United Healthcare'], true, true, '4567890123'),

('Westside Orthopedics', 'Orthopedics', ARRAY['Sports Medicine', 'Joint Replacement'], 
 ARRAY['MD', 'FAAOS'], ARRAY['English', 'Spanish'], 
 '654 West 42nd St', 'New York', 'NY', '10036', 
 40.7580, -73.9855, '(555) 567-8901', 'info@westsideortho.com', 'https://westsideortho.com',
 '{"monday": "8:00-18:00", "tuesday": "8:00-18:00", "wednesday": "8:00-18:00", "thursday": "8:00-18:00", "friday": "8:00-16:00"}',
 4.4, 97, ARRAY['United Healthcare', 'Aetna', 'Workers Comp'], false, true, '5678901234'),

('Manhattan Mental Health', 'Psychiatry', ARRAY['Adult Psychiatry', 'Anxiety Disorders'], 
 ARRAY['MD', 'FAPA'], ARRAY['English', 'Spanish', 'Portuguese'], 
 '123 West 57th St', 'New York', 'NY', '10019', 
 40.7648, -73.9808, '(555) 678-9012', 'info@manhattanmentalhealth.com', 'https://manhattanmentalhealth.com',
 '{"monday": "9:00-19:00", "tuesday": "9:00-19:00", "wednesday": "9:00-19:00", "thursday": "9:00-19:00", "friday": "9:00-17:00"}',
 4.9, 145, ARRAY['Aetna', 'Blue Cross', 'Cigna', 'United Healthcare'], true, true, '6789012345'),

('Central Park Women''s Health', 'Obstetrics & Gynecology', ARRAY['Maternal-Fetal Medicine', 'Reproductive Endocrinology'], 
 ARRAY['MD', 'FACOG'], ARRAY['English', 'Spanish', 'Italian'], 
 '987 Fifth Ave', 'New York', 'NY', '10028', 
 40.7829, -73.9654, '(555) 789-0123', 'appointments@cpwomenshealth.com', 'https://cpwomenshealth.com',
 '{"monday": "8:00-17:00", "tuesday": "8:00-17:00", "wednesday": "8:00-17:00", "thursday": "8:00-17:00", "friday": "8:00-15:00"}',
 4.8, 178, ARRAY['Blue Cross', 'United Healthcare', 'Aetna', 'Medicaid'], true, true, '7890123456');

-- Create a function to search providers by location
CREATE OR REPLACE FUNCTION search_providers_by_location(
  search_lat numeric,
  search_lng numeric,
  search_radius_miles numeric DEFAULT 10,
  search_specialty text DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  name text,
  specialty text,
  address text,
  city text,
  state text,
  phone text,
  rating numeric,
  reviews_count integer,
  distance_miles numeric,
  telemedicine_available boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.specialty,
    p.address,
    p.city,
    p.state,
    p.phone,
    p.rating,
    p.reviews_count,
    ROUND((earth_distance(ll_to_earth(search_lat, search_lng), ll_to_earth(p.latitude, p.longitude)) / 1609.344)::numeric, 2) as distance_miles,
    p.telemedicine_available
  FROM healthcare_providers p
  WHERE 
    earth_distance(ll_to_earth(search_lat, search_lng), ll_to_earth(p.latitude, p.longitude)) <= (search_radius_miles * 1609.344)
    AND (search_specialty IS NULL OR p.specialty ILIKE '%' || search_specialty || '%')
    AND p.verified = true
  ORDER BY distance_miles ASC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get user health summary
CREATE OR REPLACE FUNCTION get_user_health_summary(user_uuid uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  profile_data jsonb;
  recent_assessments jsonb;
  active_roadmaps jsonb;
  active_diet_plans jsonb;
BEGIN
  -- Get user profile
  SELECT to_jsonb(up) INTO profile_data
  FROM user_profiles up
  WHERE up.user_id = user_uuid;
  
  -- Get recent symptom assessments
  SELECT jsonb_agg(to_jsonb(sa)) INTO recent_assessments
  FROM (
    SELECT * FROM symptom_assessments 
    WHERE user_id = user_uuid 
    ORDER BY created_at DESC 
    LIMIT 5
  ) sa;
  
  -- Get active health roadmaps
  SELECT jsonb_agg(to_jsonb(hr)) INTO active_roadmaps
  FROM health_roadmaps hr
  WHERE hr.user_id = user_uuid AND hr.status = 'active';
  
  -- Get active diet plans
  SELECT jsonb_agg(to_jsonb(dp)) INTO active_diet_plans
  FROM diet_plans dp
  WHERE dp.user_id = user_uuid AND dp.status = 'active';
  
  -- Combine all data
  result := jsonb_build_object(
    'profile', COALESCE(profile_data, '{}'::jsonb),
    'recent_assessments', COALESCE(recent_assessments, '[]'::jsonb),
    'active_roadmaps', COALESCE(active_roadmaps, '[]'::jsonb),
    'active_diet_plans', COALESCE(active_diet_plans, '[]'::jsonb)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
