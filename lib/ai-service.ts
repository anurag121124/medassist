export interface SymptomAssessment {
  possibleConditions: string[];
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  aiResponse: string;
  disclaimer: string;
}

export interface HealthGoals {
  short: string[];
  medium: string[];
  long: string[];
}

export interface DietRecommendation {
  meals: {
    breakfast: any[];
    lunch: any[];
    dinner: any[];
    snacks: any[];
  };
  nutritionalAnalysis: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  groceryList: string[];
}

// Mock AI service - In production, integrate with OpenAI GPT-4 or similar
export class AIService {
  private static instance: AIService;
  
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async assessSymptoms(symptoms: string[], severity: string, duration: string, userProfile?: any): Promise<SymptomAssessment> {
    // Mock implementation - replace with actual AI API call
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
    
    const urgencyMap = {
      'severe': 'high',
      'moderate': 'medium',
      'mild': 'low'
    };

    const mockConditions = [
      'Common cold',
      'Seasonal allergies',
      'Stress-related symptoms',
      'Viral infection'
    ];

    const mockRecommendations = [
      'Rest and stay hydrated',
      'Monitor symptoms for 24-48 hours',
      'Consider over-the-counter medications',
      'Consult healthcare provider if symptoms worsen'
    ];

    return {
      possibleConditions: mockConditions,
      recommendations: mockRecommendations,
      urgency: urgencyMap[severity as keyof typeof urgencyMap] as any,
      aiResponse: `Based on your symptoms of ${symptoms.join(', ')} with ${severity} severity lasting ${duration}, here's my assessment...`,
      disclaimer: 'This is not a medical diagnosis. Please consult with a healthcare professional for proper medical advice.'
    };
  }

  async generateHealthRoadmap(userProfile: any): Promise<HealthGoals> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      short: [
        'Establish a regular sleep schedule',
        'Drink 8 glasses of water daily',
        'Take a 15-minute walk after meals'
      ],
      medium: [
        'Complete a comprehensive health checkup',
        'Develop a consistent exercise routine',
        'Improve dietary habits with more vegetables'
      ],
      long: [
        'Achieve and maintain optimal weight',
        'Build strong cardiovascular health',
        'Develop stress management techniques'
      ]
    };
  }

  async generateDietPlan(preferences: any, healthConditions: string[]): Promise<DietRecommendation> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      meals: {
        breakfast: [
          { name: 'Oatmeal with berries', calories: 250, protein: 8, carbs: 45, fat: 5 },
          { name: 'Greek yogurt with granola', calories: 200, protein: 15, carbs: 25, fat: 6 }
        ],
        lunch: [
          { name: 'Grilled chicken salad', calories: 350, protein: 30, carbs: 15, fat: 18 },
          { name: 'Quinoa bowl with vegetables', calories: 300, protein: 12, carbs: 40, fat: 12 }
        ],
        dinner: [
          { name: 'Baked salmon with broccoli', calories: 400, protein: 35, carbs: 20, fat: 22 },
          { name: 'Lean beef stir-fry', calories: 380, protein: 28, carbs: 25, fat: 20 }
        ],
        snacks: [
          { name: 'Apple with almond butter', calories: 150, protein: 4, carbs: 20, fat: 8 },
          { name: 'Mixed nuts', calories: 160, protein: 6, carbs: 6, fat: 14 }
        ]
      },
      nutritionalAnalysis: {
        calories: 1800,
        protein: 140,
        carbs: 180,
        fat: 80
      },
      groceryList: [
        'Rolled oats', 'Mixed berries', 'Greek yogurt', 'Granola',
        'Chicken breast', 'Salmon fillets', 'Lean ground beef',
        'Quinoa', 'Broccoli', 'Mixed greens', 'Almonds'
      ]
    };
  }
}