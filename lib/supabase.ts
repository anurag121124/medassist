import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Only create admin client if service role key is available
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Enhanced Database Types
export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height?: number;
  weight?: number;
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
    email?: string;
  };
  medical_conditions: string[];
  current_medications: string[];
  allergies: string[];
  family_history: string[];
  insurance_provider?: string;
  insurance_policy_number?: string;
  preferred_language: string;
  timezone: string;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy_settings: {
    share_data: boolean;
    anonymous_analytics: boolean;
  };
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SymptomAssessment {
  id: string;
  user_id: string;
  session_id: string;
  symptoms: {
    [key: string]: {
      severity: 'mild' | 'moderate' | 'severe';
      duration: string;
      description?: string;
    };
  };
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  duration: string;
  additional_notes?: string;
  ai_assessment: {
    possible_conditions: string[];
    recommendations: string[];
    urgency_level: 'low' | 'medium' | 'high' | 'emergency';
    detailed_analysis: string;
    differential_diagnosis?: string[];
  };
  confidence_score: number;
  recommended_actions: string[];
  urgent_care_needed: boolean;
  follow_up_date?: string;
  status: 'pending' | 'reviewed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface HealthRoadmap {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  goals: {
    short_term: Array<{
      id: string;
      goal: string;
      target_date: string;
      completed: boolean;
      progress_percentage: number;
    }>;
    long_term: Array<{
      id: string;
      goal: string;
      target_date: string;
      completed: boolean;
      progress_percentage: number;
    }>;
  };
  weekly_plan: Array<{
    week: number;
    tasks: Array<{
      id: string;
      task: string;
      completed: boolean;
      due_date: string;
      priority?: 'low' | 'medium' | 'high';
    }>;
  }>;
  progress_data: {
    completed_tasks: number;
    total_tasks: number;
    current_week: number;
    streak_days: number;
  };
  target_completion_date?: string;
  current_week: number;
  total_weeks: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface DietPlan {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  dietary_preferences: {
    diet_type: string;
    allergies: string[];
    restrictions: string[];
    health_conditions: string[];
    calorie_target: number;
    preferred_cuisines: string[];
  };
  restrictions: string[];
  weekly_meals: {
    [key: string]: {
      breakfast: MealItem[];
      lunch: MealItem[];
      dinner: MealItem[];
      snacks: MealItem[];
    };
  };
  grocery_list: string[];
  nutritional_summary: {
    daily_calories: number;
    daily_protein: number;
    daily_carbs: number;
    daily_fat: number;
    daily_fiber: number;
    daily_sugar: number;
  };
  calorie_target?: number;
  active_from: string;
  active_until?: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface MealItem {
  id: string;
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  preparation_time: number;
  cooking_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  recipe_url?: string;
  image_url?: string;
  tags: string[];
}

export interface HealthcareProvider {
  id: string;
  name: string;
  specialty: string;
  subspecialty: string[];
  credentials: string[];
  languages: string[];
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  website?: string;
  office_hours: {
    [key: string]: string;
  };
  rating: number;
  reviews_count: number;
  accepted_insurance: string[];
  telemedicine_available: boolean;
  verified: boolean;
  npi_number?: string;
  license_number?: string;
  hospital_affiliations: string[];
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  provider_id: string;
  appointment_date: string;
  duration_minutes: number;
  appointment_type: 'in-person' | 'telemedicine' | 'phone';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  reason_for_visit?: string;
  notes?: string;
  reminder_sent: boolean;
  confirmation_code: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  user_id: string;
  provider_id?: string;
  title: string;
  description?: string;
  record_type: 'lab_result' | 'imaging' | 'prescription' | 'visit_note' | 'vaccination' | 'other';
  file_url?: string;
  file_type?: string;
  file_size?: number;
  record_date: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_start: string;
  session_end?: string;
  ip_address?: string;
  user_agent?: string;
  activities: {
    [key: string]: any;
  };
  created_at: string;
}

// Helper functions for database operations
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
  
  return data;
};

export const createSymptomAssessment = async (assessment: Omit<SymptomAssessment, 'id' | 'created_at' | 'updated_at'>): Promise<SymptomAssessment | null> => {
  const { data, error } = await supabase
    .from('symptom_assessments')
    .insert(assessment)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating symptom assessment:', error);
    return null;
  }
  
  return data;
};

export const getUserSymptomAssessments = async (userId: string, limit: number = 10): Promise<SymptomAssessment[]> => {
  const { data, error } = await supabase
    .from('symptom_assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching symptom assessments:', error);
    return [];
  }
  
  return data || [];
};

export const searchProviders = async (
  latitude: number,
  longitude: number,
  radius: number = 10,
  specialty?: string
): Promise<HealthcareProvider[]> => {
  const { data, error } = await supabase
    .rpc('search_providers_by_location', {
      search_lat: latitude,
      search_lng: longitude,
      search_radius_miles: radius,
      search_specialty: specialty
    });
  
  if (error) {
    console.error('Error searching providers:', error);
    return [];
  }
  
  return data || [];
};

export const getUserHealthSummary = async (userId: string): Promise<any> => {
  const { data, error } = await supabase
    .rpc('get_user_health_summary', {
      user_uuid: userId
    });
  
  if (error) {
    console.error('Error fetching health summary:', error);
    return null;
  }
  
  return data;
};