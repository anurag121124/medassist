import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ensureSupabaseAdmin } from '@/lib/admin-client';
import { z } from 'zod';

const profileSchema = z.object({
  fullName: z.string().min(2),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  bloodType: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
  medicalConditions: z.array(z.string()),
  currentMedications: z.array(z.string()),
  allergies: z.array(z.string()),
  familyHistory: z.array(z.string()),
});

export async function GET(request: NextRequest) {
  try {
    const admin = ensureSupabaseAdmin();
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error } = await admin
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = ensureSupabaseAdmin();
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const profileData = profileSchema.parse(body);

    const { data: profile, error } = await admin
      .from('user_profiles')
      .update({
        full_name: profileData.fullName,
        date_of_birth: profileData.dateOfBirth,
        gender: profileData.gender,
        height: profileData.height,
        weight: profileData.weight,
        blood_type: profileData.bloodType,
        emergency_contact: profileData.emergencyContact,
        medical_conditions: profileData.medicalConditions,
        current_medications: profileData.currentMedications,
        allergies: profileData.allergies,
        family_history: profileData.familyHistory,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}