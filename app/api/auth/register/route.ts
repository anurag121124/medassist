import { NextRequest, NextResponse } from 'next/server';
import { createUser, generateToken } from '@/lib/auth-utils';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = registerSchema.parse(body);

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const user = await createUser(email, password, fullName);
    
    // Create user profile
    await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: user.id,
        full_name: fullName,
        email: email,
        medical_conditions: [],
        current_medications: [],
        allergies: [],
        family_history: [],
      });

    const token = generateToken(user);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
      token,
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}