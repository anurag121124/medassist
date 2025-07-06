import { NextRequest, NextResponse } from 'next/server';
import { openaiService } from '@/lib/openai';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const symptomSchema = z.object({
  symptoms: z.array(z.string()),
  severity: z.enum(['mild', 'moderate', 'severe']),
  duration: z.string(),
  additionalNotes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { symptoms, severity, duration, additionalNotes } = symptomSchema.parse(body);

    // Get user profile for better analysis
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Analyze symptoms using OpenAI
    const analysis = await openaiService.analyzeSymptoms({
      symptoms,
      severity,
      duration,
      age: profile?.date_of_birth ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : undefined,
      gender: profile?.gender,
      medicalHistory: profile?.medical_conditions || [],
      currentMedications: profile?.current_medications || [],
    });

    // Store the assessment
    const { data: assessment, error } = await supabaseAdmin
      .from('symptom_assessments')
      .insert({
        user_id: userId,
        symptoms,
        severity,
        duration,
        additional_notes: additionalNotes,
        ai_assessment: {
          possible_conditions: analysis.possibleConditions,
          recommendations: analysis.recommendations,
          urgency_level: analysis.urgencyLevel,
          detailed_analysis: analysis.detailedAnalysis,
          red_flags: analysis.redFlags,
          follow_up_questions: analysis.followUpQuestions,
        },
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      assessmentId: assessment.id,
      analysis,
      disclaimer: 'This assessment is for informational purposes only and should not replace professional medical advice. Please consult with a healthcare provider for proper diagnosis and treatment.',
    });
  } catch (error) {
    console.error('Symptom analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze symptoms' },
      { status: 500 }
    );
  }
}