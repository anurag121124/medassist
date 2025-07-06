import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SymptomAnalysisRequest {
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  age?: number;
  gender?: string;
  medicalHistory?: string[];
  currentMedications?: string[];
}

export interface SymptomAnalysisResponse {
  possibleConditions: Array<{
    condition: string;
    probability: number;
    description: string;
  }>;
  recommendations: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  detailedAnalysis: string;
  redFlags: string[];
  followUpQuestions: string[];
}

export class OpenAIService {
  async analyzeSymptoms(request: SymptomAnalysisRequest): Promise<SymptomAnalysisResponse> {
    const prompt = `
You are a medical AI assistant. Analyze the following symptoms and provide a comprehensive assessment.

Patient Information:
- Symptoms: ${request.symptoms.join(', ')}
- Severity: ${request.severity}
- Duration: ${request.duration}
- Age: ${request.age || 'Not specified'}
- Gender: ${request.gender || 'Not specified'}
- Medical History: ${request.medicalHistory?.join(', ') || 'None provided'}
- Current Medications: ${request.currentMedications?.join(', ') || 'None provided'}

Please provide:
1. Top 3-5 possible conditions with probability percentages
2. Immediate recommendations
3. Urgency level (low/medium/high/emergency)
4. Detailed analysis
5. Red flag symptoms to watch for
6. Follow-up questions to ask

Format your response as JSON with the following structure:
{
  "possibleConditions": [
    {
      "condition": "string",
      "probability": number,
      "description": "string"
    }
  ],
  "recommendations": ["string"],
  "urgencyLevel": "low|medium|high|emergency",
  "detailedAnalysis": "string",
  "redFlags": ["string"],
  "followUpQuestions": ["string"]
}

IMPORTANT: This is for informational purposes only and should not replace professional medical advice.
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a medical AI assistant providing symptom analysis. Always emphasize that this is not a substitute for professional medical care.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const result = response.choices[0].message.content;
      return JSON.parse(result || '{}');
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to analyze symptoms');
    }
  }

  async generateHealthRoadmap(userProfile: any): Promise<any> {
    const prompt = `
Based on the following user profile, create a personalized health roadmap:

User Profile:
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Current conditions: ${userProfile.medicalConditions?.join(', ') || 'None'}
- Current medications: ${userProfile.currentMedications?.join(', ') || 'None'}
- Health goals: ${userProfile.healthGoals?.join(', ') || 'General wellness'}

Create a comprehensive 12-week health roadmap with:
1. Short-term goals (1-4 weeks)
2. Medium-term goals (1-3 months)
3. Long-term goals (3-12 months)
4. Weekly action items
5. Milestones and checkpoints

Format as JSON with the following structure:
{
  "shortTermGoals": [
    {
      "goal": "string",
      "targetDate": "string",
      "actionItems": ["string"],
      "successMetrics": ["string"]
    }
  ],
  "mediumTermGoals": [...],
  "longTermGoals": [...],
  "weeklyPlan": [
    {
      "week": number,
      "focus": "string",
      "tasks": ["string"],
      "checkpoints": ["string"]
    }
  ]
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a health and wellness AI coach creating personalized health roadmaps.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 3000,
      });

      const result = response.choices[0].message.content;
      return JSON.parse(result || '{}');
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate health roadmap');
    }
  }

  async generateDietPlan(preferences: any): Promise<any> {
    const prompt = `
Create a personalized 7-day diet plan based on:

Preferences:
- Diet type: ${preferences.dietType}
- Allergies: ${preferences.allergies?.join(', ') || 'None'}
- Restrictions: ${preferences.restrictions?.join(', ') || 'None'}
- Health conditions: ${preferences.healthConditions?.join(', ') || 'None'}
- Calorie target: ${preferences.calorieTarget}
- Preferred cuisines: ${preferences.cuisines?.join(', ') || 'Any'}

Provide:
1. 7-day meal plan (breakfast, lunch, dinner, 2 snacks)
2. Nutritional breakdown for each meal
3. Shopping list organized by category
4. Preparation tips and time estimates

Format as JSON with the following structure:
{
  "weeklyPlan": {
    "monday": {
      "breakfast": {
        "name": "string",
        "ingredients": ["string"],
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "prepTime": number,
        "instructions": ["string"]
      },
      // ... other meals
    },
    // ... other days
  },
  "shoppingList": {
    "proteins": ["string"],
    "vegetables": ["string"],
    "fruits": ["string"],
    "grains": ["string"],
    "dairy": ["string"],
    "other": ["string"]
  },
  "nutritionalSummary": {
    "dailyAverageCalories": number,
    "dailyAverageProtein": number,
    "dailyAverageCarbs": number,
    "dailyAverageFat": number
  }
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a nutritionist AI creating personalized meal plans based on health conditions and preferences.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 4000,
      });

      const result = response.choices[0].message.content;
      return JSON.parse(result || '{}');
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate diet plan');
    }
  }
}

export const openaiService = new OpenAIService();