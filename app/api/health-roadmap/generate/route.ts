import { NextRequest, NextResponse } from 'next/server';
import { openaiService } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const roadmapSchema = z.object({
  healthGoals: z.array(z.string()),
  preferences: z.object({
    activityLevel: z.string(),
    timeCommitment: z.string(),
    focusAreas: z.array(z.string()),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { healthGoals, preferences } = roadmapSchema.parse(body);

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Generate roadmap using OpenAI
    const roadmapData = await openaiService.generateHealthRoadmap({
      age: profile?.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : undefined,
      gender: profile?.gender,
      medicalConditions: profile?.medical_conditions || [],
      currentMedications: profile?.current_medications || [],
      healthGoals,
      preferences,
    });

    // Convert to database format
    const goals = {
      short_term: roadmapData.shortTermGoals.map((goal: any, index: number) => ({
        id: `st_${index + 1}`,
        goal: goal.goal,
        target_date: goal.targetDate,
        completed: false,
        progress_percentage: 0,
      })),
      long_term: roadmapData.longTermGoals.map((goal: any, index: number) => ({
        id: `lt_${index + 1}`,
        goal: goal.goal,
        target_date: goal.targetDate,
        completed: false,
        progress_percentage: 0,
      })),
    };

    const weeklyPlan = roadmapData.weeklyPlan.map((week: any) => ({
      week: week.week,
      focus: week.focus,
      tasks: week.tasks.map((task: string, index: number) => ({
        id: `w${week.week}_t${index + 1}`,
        task,
        completed: false,
        due_date: new Date(Date.now() + week.week * 7 * 24 * 60 * 60 * 1000).toISOString(),
      })),
    }));

    // Store the roadmap
    const { data: roadmap, error } = await supabaseAdmin
      .from('health_roadmaps')
      .insert({
        user_id: userId,
        goals,
        weekly_plan: weeklyPlan,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      roadmapId: roadmap.id,
      goals,
      weeklyPlan,
      recommendations: roadmapData.recommendations || [],
    });
  } catch (error) {
    console.error('Health roadmap generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate health roadmap' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: roadmaps, error } = await supabaseAdmin
      .from('health_roadmaps')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ roadmaps });
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roadmaps' },
      { status: 500 }
    );
  }
}