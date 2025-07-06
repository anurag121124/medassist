import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';
import { ensureSupabaseAdmin } from './admin-client';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'patient' | 'provider' | 'admin';
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function createUser(email: string, password: string, fullName: string): Promise<AuthUser> {
  const admin = ensureSupabaseAdmin();
  
  // Use Supabase Auth to create user
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      full_name: fullName,
      role: 'patient'
    }
  });

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  // Create user profile after successful auth user creation
  const { data: profileData, error: profileError } = await admin
    .from('user_profiles')
    .insert({
      user_id: data.user.id,
      full_name: fullName,
      email: email,
      onboarding_completed: false
    })
    .select()
    .single();

  if (profileError) {
    console.error('Profile creation error:', profileError);
    // Don't throw error here, just log it - the user was created successfully
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    full_name: fullName,
    role: 'patient'
  };
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const admin = ensureSupabaseAdmin();
  
  // Use Supabase Auth to authenticate user
  const { data, error } = await admin.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    return null;
  }

  // Get user profile from our profiles table
  const { data: profileData, error: profileError } = await admin
    .from('user_profiles')
    .select('*')
    .eq('user_id', data.user.id)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError);
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    full_name: profileData?.full_name || data.user.user_metadata?.full_name || '',
    role: data.user.user_metadata?.role || 'patient'
  };
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  const admin = ensureSupabaseAdmin();
  
  // Get user from Supabase Auth
  const { data, error } = await admin.auth.admin.getUserById(userId);

  if (error || !data.user) {
    return null;
  }

  // Get user profile from our profiles table
  const { data: profileData, error: profileError } = await admin
    .from('user_profiles')
    .select('*')
    .eq('user_id', data.user.id)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError);
  }

  return {
    id: data.user.id,
    email: data.user.email!,
    full_name: profileData?.full_name || data.user.user_metadata?.full_name || '',
    role: data.user.user_metadata?.role || 'patient'
  };
}