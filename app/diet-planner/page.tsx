'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { 
  UtensilsCrossed, 
  Plus, 
  ShoppingCart, 
  Calendar,
  Clock,
  Users,
  Loader2,
  Download,
  Filter,
  Heart,
  Zap,
  Apple
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface MealItem {
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  instructions: string[];
}

interface DayMeals {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snacks: MealItem[];
}

interface DietPlan {
  dietPlanId: string;
  weeklyMeals: {
    [key: string]: DayMeals;
  };
  groceryList: string[];
  nutritionalSummary: {
    daily_calories: number;
    daily_protein: number;
    daily_carbs: number;
    daily_fat: number;
  };
  shoppingList: {
    [category: string]: string[];
  };
}

interface DietPreferences {
  dietType: string;
  allergies: string[];
  restrictions: string[];
  healthConditions: string[];
  calorieTarget: number;
  cuisines: string[];
}

const dietTypes = [
  'Mediterranean', 'Keto', 'Paleo', 'Vegetarian', 'Vegan', 
  'Low-Carb', 'High-Protein', 'Balanced', 'Diabetic-Friendly'
];

const commonAllergies = [
  'Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Fish'
];

const cuisineTypes = [
  'Italian', 'Mediterranean', 'Asian', 'Mexican', 'Indian', 
  'American', 'French', 'Greek', 'Thai', 'Japanese'
];

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function DietPlannerPage() {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [preferences, setPreferences] = useState<DietPreferences>({
    dietType: '',
    allergies: [],
    restrictions: [],
    healthConditions: [],
    calorieTarget: 2000,
    cuisines: [],
  });

  useEffect(() => {
    fetchDietPlans();
  }, []);

  const fetchDietPlans = async () => {
    try {
      const response = await fetch('/api/diet-plan/generate');
      if (response.ok) {
        const data = await response.json();
        if (data.dietPlans && data.dietPlans.length > 0) {
          setDietPlan(data.dietPlans[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch diet plans:', error);
    }
  };

  const handleCreateDietPlan = async () => {
    if (!preferences.dietType) {
      toast.error('Please select a diet type');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/diet-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate diet plan');
      }

      const data = await response.json();
      setDietPlan(data);
      setShowCreateDialog(false);
      toast.success('Diet plan generated successfully!');
    } catch (error) {
      toast.error('Failed to generate diet plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAllergy = (allergy: string) => {
    setPreferences(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const toggleCuisine = (cuisine: string) => {
    setPreferences(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
    }));
  };

  const getMealNutrition = (meal: MealItem) => {
    return {
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat
    };
  };

  const getDayNutrition = (dayMeals: DayMeals) => {
    const breakfast = getMealNutrition(dayMeals.breakfast);
    const lunch = getMealNutrition(dayMeals.lunch);
    const dinner = getMealNutrition(dayMeals.dinner);
    const snacks = dayMeals.snacks.reduce((acc, snack) => ({
      calories: acc.calories + snack.calories,
      protein: acc.protein + snack.protein,
      carbs: acc.carbs + snack.carbs,
      fat: acc.fat + snack.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return {
      calories: breakfast.calories + lunch.calories + dinner.calories + snacks.calories,
      protein: breakfast.protein + lunch.protein + dinner.protein + snacks.protein,
      carbs: breakfast.carbs + lunch.carbs + dinner.carbs + snacks.carbs,
      fat: breakfast.fat + lunch.fat + dinner.fat + snacks.fat
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <UtensilsCrossed className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">AI Diet Planner</h1>
                    <p className="text-gray-600">Personalized nutrition plans for your health goals</p>
                  </div>
                </div>
                
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create Diet Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Your Personalized Diet Plan</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Diet Type */}
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Diet Type</Label>
                        <Select value={preferences.dietType} onValueChange={(value) => setPreferences({...preferences, dietType: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your preferred diet type" />
                          </SelectTrigger>
                          <SelectContent>
                            {dietTypes.map(type => (
                              <SelectItem key={type} value={type.toLowerCase().replace(' ', '-')}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Calorie Target */}
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Daily Calorie Target</Label>
                        <Input
                          type="number"
                          value={preferences.calorieTarget}
                          onChange={(e) => setPreferences({...preferences, calorieTarget: parseInt(e.target.value)})}
                          placeholder="2000"
                        />
                      </div>

                      {/* Allergies */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Allergies & Intolerances</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {commonAllergies.map(allergy => (
                            <div key={allergy} className="flex items-center space-x-2">
                              <Checkbox
                                checked={preferences.allergies.includes(allergy)}
                                onCheckedChange={() => toggleAllergy(allergy)}
                              />
                              <Label className="text-sm">{allergy}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Preferred Cuisines */}
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Preferred Cuisines</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {cuisineTypes.map(cuisine => (
                            <div key={cuisine} className="flex items-center space-x-2">
                              <Checkbox
                                checked={preferences.cuisines.includes(cuisine)}
                                onCheckedChange={() => toggleCuisine(cuisine)}
                              />
                              <Label className="text-sm">{cuisine}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={handleCreateDietPlan} 
                        className="w-full" 
                        disabled={loading || !preferences.dietType}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Diet Plan...
                          </>
                        ) : (
                          'Generate My Diet Plan'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {dietPlan ? (
              <div className="space-y-8">
                {/* Nutrition Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Daily Calories</p>
                          <p className="text-2xl font-bold">{dietPlan.nutritionalSummary.daily_calories}</p>
                        </div>
                        <Zap className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Protein</p>
                          <p className="text-2xl font-bold">{dietPlan.nutritionalSummary.daily_protein}g</p>
                        </div>
                        <Heart className="h-8 w-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Carbs</p>
                          <p className="text-2xl font-bold">{dietPlan.nutritionalSummary.daily_carbs}g</p>
                        </div>
                        <Apple className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Fat</p>
                          <p className="text-2xl font-bold">{dietPlan.nutritionalSummary.daily_fat}g</p>
                        </div>
                        <UtensilsCrossed className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="meals" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="meals">Weekly Meals</TabsTrigger>
                    <TabsTrigger value="shopping">Shopping List</TabsTrigger>
                    <TabsTrigger value="nutrition">Nutrition Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="meals" className="space-y-6">
                    {/* Day Selector */}
                    <div className="flex flex-wrap gap-2">
                      {days.map(day => (
                        <Button
                          key={day}
                          variant={selectedDay === day ? "default" : "outline"}
                          onClick={() => setSelectedDay(day)}
                          className="capitalize"
                        >
                          {day}
                        </Button>
                      ))}
                    </div>

                    {/* Selected Day Meals */}
                    {dietPlan.weeklyMeals[selectedDay] && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold capitalize">{selectedDay}</h2>
                          <div className="text-sm text-gray-600">
                            Total: {getDayNutrition(dietPlan.weeklyMeals[selectedDay]).calories} calories
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Breakfast */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                Breakfast
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <h3 className="font-semibold">{dietPlan.weeklyMeals[selectedDay].breakfast.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {dietPlan.weeklyMeals[selectedDay].breakfast.prepTime} min
                                  </span>
                                  <span>{dietPlan.weeklyMeals[selectedDay].breakfast.calories} cal</span>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">Ingredients:</p>
                                  <ul className="text-sm text-gray-600 space-y-1">
                                    {dietPlan.weeklyMeals[selectedDay].breakfast.ingredients.map((ingredient, i) => (
                                      <li key={i}>• {ingredient}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant="outline">{dietPlan.weeklyMeals[selectedDay].breakfast.protein}g protein</Badge>
                                  <Badge variant="outline">{dietPlan.weeklyMeals[selectedDay].breakfast.carbs}g carbs</Badge>
                                  <Badge variant="outline">{dietPlan.weeklyMeals[selectedDay].breakfast.fat}g fat</Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Lunch */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                Lunch
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <h3 className="font-semibold">{dietPlan.weeklyMeals[selectedDay].lunch.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {dietPlan.weeklyMeals[selectedDay].lunch.prepTime} min
                                  </span>
                                  <span>{dietPlan.weeklyMeals[selectedDay].lunch.calories} cal</span>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">Ingredients:</p>
                                  <ul className="text-sm text-gray-600 space-y-1">
                                    {dietPlan.weeklyMeals[selectedDay].lunch.ingredients.map((ingredient, i) => (
                                      <li key={i}>• {ingredient}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant="outline">{dietPlan.weeklyMeals[selectedDay].lunch.protein}g protein</Badge>
                                  <Badge variant="outline">{dietPlan.weeklyMeals[selectedDay].lunch.carbs}g carbs</Badge>
                                  <Badge variant="outline">{dietPlan.weeklyMeals[selectedDay].lunch.fat}g fat</Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Dinner */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                Dinner
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <h3 className="font-semibold">{dietPlan.weeklyMeals[selectedDay].dinner.name}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {dietPlan.weeklyMeals[selectedDay].dinner.prepTime} min
                                  </span>
                                  <span>{dietPlan.weeklyMeals[selectedDay].dinner.calories} cal</span>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">Ingredients:</p>
                                  <ul className="text-sm text-gray-600 space-y-1">
                                    {dietPlan.weeklyMeals[selectedDay].dinner.ingredients.map((ingredient, i) => (
                                      <li key={i}>• {ingredient}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant="outline">{dietPlan.weeklyMeals[selectedDay].dinner.protein}g protein</Badge>
                                  <Badge variant="outline">{dietPlan.weeklyMeals[selectedDay].dinner.carbs}g carbs</Badge>
                                  <Badge variant="outline">{dietPlan.weeklyMeals[selectedDay].dinner.fat}g fat</Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Snacks */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                Snacks
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {dietPlan.weeklyMeals[selectedDay].snacks.map((snack, index) => (
                                  <div key={index} className="p-3 border rounded-lg">
                                    <h4 className="font-medium">{snack.name}</h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                      <span>{snack.calories} cal</span>
                                      <span>{snack.protein}g protein</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="shopping" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          Weekly Shopping List
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {dietPlan.shoppingList ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(dietPlan.shoppingList).map(([category, items]) => (
                              <div key={category} className="space-y-3">
                                <h3 className="font-semibold capitalize text-lg">{category}</h3>
                                <ul className="space-y-2">
                                  {items.map((item, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <Checkbox />
                                      <span className="text-sm">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {dietPlan.groceryList.map((item, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Checkbox />
                                <span className="text-sm">{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="nutrition" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {days.map(day => {
                        if (!dietPlan.weeklyMeals[day]) return null;
                        const nutrition = getDayNutrition(dietPlan.weeklyMeals[day]);
                        return (
                          <Card key={day}>
                            <CardHeader>
                              <CardTitle className="capitalize">{day}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-2xl font-bold text-yellow-600">{nutrition.calories}</p>
                                    <p className="text-sm text-gray-600">Calories</p>
                                  </div>
                                  <div className="text-center p-3 bg-red-50 rounded-lg">
                                    <p className="text-2xl font-bold text-red-600">{nutrition.protein}g</p>
                                    <p className="text-sm text-gray-600">Protein</p>
                                  </div>
                                  <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">{nutrition.carbs}g</p>
                                    <p className="text-sm text-gray-600">Carbs</p>
                                  </div>
                                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-600">{nutrition.fat}g</p>
                                    <p className="text-sm text-gray-600">Fat</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export Meal Plan
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Export Shopping List
                  </Button>
                </div>
              </div>
            ) : (
              /* Empty State */
              <Card className="text-center py-12">
                <CardContent>
                  <UtensilsCrossed className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Diet Plan Yet</h3>
                  <p className="text-gray-600 mb-6">Create your personalized diet plan to start eating healthier.</p>
                  <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2 mx-auto">
                    <Plus className="h-4 w-4" />
                    Create Your First Diet Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}