import { NextRequest, NextResponse } from 'next/server';
import { openaiService } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const dietPlanSchema = z.object({
  preferences: z.object({
    dietType: z.string(),
    allergies: z.array(z.string()),
    restrictions: z.array(z.string()),
    healthConditions: z.array(z.string()),
    calorieTarget: z.number(),
    cuisines: z.array(z.string()).optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { preferences } = dietPlanSchema.parse(body);

    // Get user profile for additional context
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Generate diet plan using OpenAI
    const dietPlanData = await openaiService.generateDietPlan({
      ...preferences,
      age: profile?.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : undefined,
      gender: profile?.gender,
      weight: profile?.weight,
      height: profile?.height,
      medicalConditions: [...(profile?.medical_conditions || []), ...preferences.healthConditions],
      allergies: [...(profile?.allergies || []), ...preferences.allergies],
    });

    // Convert meals to database format
    const weeklyMeals: any = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      if (dietPlanData.weeklyPlan[day]) {
        weeklyMeals[day] = {
          breakfast: Array.isArray(dietPlanData.weeklyPlan[day].breakfast) ? dietPlanData.weeklyPlan[day].breakfast : [dietPlanData.weeklyPlan[day].breakfast],
          lunch: Array.isArray(dietPlanData.weeklyPlan[day].lunch) ? dietPlanData.weeklyPlan[day].lunch : [dietPlanData.weeklyPlan[day].lunch],
          dinner: Array.isArray(dietPlanData.weeklyPlan[day].dinner) ? dietPlanData.weeklyPlan[day].dinner : [dietPlanData.weeklyPlan[day].dinner],
          snacks: dietPlanData.weeklyPlan[day].snacks || [],
        };
      }
    });

    // Flatten shopping list
    const groceryList = Object.values(dietPlanData.shoppingList || {}).flat() as string[];

    // Store the diet plan
    const { data: dietPlan, error } = await supabaseAdmin
      .from('diet_plans')
      .insert({
        user_id: userId,
        preferences,
        weekly_meals: weeklyMeals,
        grocery_list: groceryList,
        nutritional_summary: dietPlanData.nutritionalSummary,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      dietPlanId: dietPlan.id,
      weeklyMeals,
      groceryList,
      nutritionalSummary: dietPlanData.nutritionalSummary,
      shoppingList: dietPlanData.shoppingList,
    });
  } catch (error) {
    console.error('Diet plan generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate diet plan' },
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

    const { data: dietPlans, error } = await supabaseAdmin
      .from('diet_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ dietPlans });
  } catch (error) {
    console.error('Error fetching diet plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch diet plans' },
      { status: 500 }
    );
  }
}