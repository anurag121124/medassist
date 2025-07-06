import { MongoClient, Db, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medical-platform';
const MONGODB_DB = process.env.MONGODB_DB || 'medical-platform';

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(MONGODB_DB);
  }
  return { client, db };
}

export async function getCollection(name: string): Promise<Collection> {
  if (!db) {
    await connectToDatabase();
  }
  return db.collection(name);
}

// Database schemas
export interface UserProfile {
  _id?: string;
  userId: string;
  personalInfo: {
    name: string;
    email: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    bloodType?: string;
    height?: number;
    weight?: number;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  medicalHistory: {
    conditions: string[];
    medications: string[];
    allergies: string[];
    surgeries: string[];
    familyHistory: string[];
  };
  preferences: {
    notifications: boolean;
    dataSharing: boolean;
    language: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SymptomCheck {
  _id?: string;
  userId: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  additionalInfo?: string;
  assessment?: {
    possibleConditions: string[];
    recommendations: string[];
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    aiResponse: string;
  };
  createdAt: Date;
}

export interface HealthRoadmap {
  _id?: string;
  userId: string;
  goals: {
    short: string[];
    medium: string[];
    long: string[];
  };
  plan: {
    weekly: any[];
    monthly: any[];
  };
  progress: {
    completed: string[];
    inProgress: string[];
    upcoming: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DietPlan {
  _id?: string;
  userId: string;
  preferences: {
    dietType: string;
    restrictions: string[];
    allergies: string[];
    healthConditions: string[];
  };
  meals: {
    breakfast: any[];
    lunch: any[];
    dinner: any[];
    snacks: any[];
  };
  groceryList: string[];
  nutritionalTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: Date;
  updatedAt: Date;
}