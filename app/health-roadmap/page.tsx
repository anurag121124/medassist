'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { 
  Route, 
  Target, 
  Calendar, 
  CheckCircle,
  Clock,
  Plus,
  TrendingUp,
  Award,
  Loader2,
  Download,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Goal {
  id: string;
  goal: string;
  target_date: string;
  completed: boolean;
  progress_percentage: number;
}

interface WeeklyTask {
  id: string;
  task: string;
  completed: boolean;
  due_date: string;
}

interface WeeklyPlan {
  week: number;
  focus: string;
  tasks: WeeklyTask[];
}

interface HealthRoadmap {
  roadmapId: string;
  goals: {
    short_term: Goal[];
    long_term: Goal[];
  };
  weeklyPlan: WeeklyPlan[];
  recommendations: string[];
}

export default function HealthRoadmapPage() {
  const [roadmap, setRoadmap] = useState<HealthRoadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [currentGoal, setCurrentGoal] = useState('');
  const [preferences, setPreferences] = useState({
    activityLevel: '',
    timeCommitment: '',
    focusAreas: [] as string[],
  });

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const response = await fetch('/api/health-roadmap/generate');
      if (response.ok) {
        const data = await response.json();
        if (data.roadmaps && data.roadmaps.length > 0) {
          setRoadmap(data.roadmaps[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch roadmaps:', error);
    }
  };

  const addGoal = () => {
    if (currentGoal.trim() && !healthGoals.includes(currentGoal.trim())) {
      setHealthGoals([...healthGoals, currentGoal.trim()]);
      setCurrentGoal('');
    }
  };

  const removeGoal = (goal: string) => {
    setHealthGoals(healthGoals.filter(g => g !== goal));
  };

  const handleCreateRoadmap = async () => {
    if (healthGoals.length === 0) {
      toast.error('Please add at least one health goal');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/health-roadmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          healthGoals,
          preferences,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate roadmap');
      }

      const data = await response.json();
      setRoadmap(data);
      setShowCreateDialog(false);
      toast.success('Health roadmap generated successfully!');
    } catch (error) {
      toast.error('Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (weekIndex: number, taskId: string) => {
    if (!roadmap) return;

    const updatedRoadmap = { ...roadmap };
    const task = updatedRoadmap.weeklyPlan[weekIndex].tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      setRoadmap(updatedRoadmap);
      toast.success(task.completed ? 'Task completed!' : 'Task marked as incomplete');
    }
  };

  const calculateOverallProgress = () => {
    if (!roadmap) return 0;
    
    const allGoals = [...roadmap.goals.short_term, ...roadmap.goals.long_term];
    const completedGoals = allGoals.filter(goal => goal.completed).length;
    return allGoals.length > 0 ? (completedGoals / allGoals.length) * 100 : 0;
  };

  const getCompletedTasksThisWeek = () => {
    if (!roadmap) return 0;
    
    const currentWeek = Math.min(Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % 12, roadmap.weeklyPlan.length - 1);
    const weekPlan = roadmap.weeklyPlan[currentWeek];
    return weekPlan ? weekPlan.tasks.filter(task => task.completed).length : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Route className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Health Roadmap</h1>
                    <p className="text-gray-600">Your personalized journey to better health</p>
                  </div>
                </div>
                
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create New Roadmap
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Your Health Roadmap</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Health Goals */}
                      <div className="space-y-4">
                        <Label className="text-base font-medium">What are your health goals?</Label>
                        <div className="flex gap-2">
                          <Input
                            value={currentGoal}
                            onChange={(e) => setCurrentGoal(e.target.value)}
                            placeholder="e.g., Lose 10 pounds, Exercise 3x per week"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                          />
                          <Button type="button" onClick={addGoal} variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {healthGoals.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {healthGoals.map((goal, index) => (
                              <Badge key={index} variant="secondary" className="px-3 py-1">
                                {goal}
                                <button
                                  onClick={() => removeGoal(goal)}
                                  className="ml-2 hover:text-red-500"
                                >
                                  ×
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Preferences */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Activity Level</Label>
                          <select 
                            className="w-full p-2 border rounded-md"
                            value={preferences.activityLevel}
                            onChange={(e) => setPreferences({...preferences, activityLevel: e.target.value})}
                          >
                            <option value="">Select level</option>
                            <option value="sedentary">Sedentary</option>
                            <option value="lightly-active">Lightly Active</option>
                            <option value="moderately-active">Moderately Active</option>
                            <option value="very-active">Very Active</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Time Commitment</Label>
                          <select 
                            className="w-full p-2 border rounded-md"
                            value={preferences.timeCommitment}
                            onChange={(e) => setPreferences({...preferences, timeCommitment: e.target.value})}
                          >
                            <option value="">Select time</option>
                            <option value="15-30-minutes">15-30 minutes/day</option>
                            <option value="30-60-minutes">30-60 minutes/day</option>
                            <option value="1-2-hours">1-2 hours/day</option>
                            <option value="2-plus-hours">2+ hours/day</option>
                          </select>
                        </div>
                      </div>

                      <Button 
                        onClick={handleCreateRoadmap} 
                        className="w-full" 
                        disabled={loading || healthGoals.length === 0}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Roadmap...
                          </>
                        ) : (
                          'Generate My Roadmap'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {roadmap ? (
              <div className="space-y-8">
                {/* Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                          <p className="text-2xl font-bold">{Math.round(calculateOverallProgress())}%</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                      <Progress value={calculateOverallProgress()} className="mt-3" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Short-term Goals</p>
                          <p className="text-2xl font-bold">{roadmap.goals.short_term.filter(g => g.completed).length}/{roadmap.goals.short_term.length}</p>
                        </div>
                        <Target className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Long-term Goals</p>
                          <p className="text-2xl font-bold">{roadmap.goals.long_term.filter(g => g.completed).length}/{roadmap.goals.long_term.length}</p>
                        </div>
                        <Award className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">This Week</p>
                          <p className="text-2xl font-bold">{getCompletedTasksThisWeek()} tasks</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="goals" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly Plan</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  </TabsList>

                  <TabsContent value="goals" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Short-term Goals */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-500" />
                            Short-term Goals (1-4 weeks)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {roadmap.goals.short_term.map((goal) => (
                              <div key={goal.id} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-medium">{goal.goal}</h3>
                                  <Badge variant={goal.completed ? "default" : "secondary"}>
                                    {goal.completed ? "Completed" : "In Progress"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <Calendar className="h-4 w-4" />
                                  Target: {new Date(goal.target_date).toLocaleDateString()}
                                </div>
                                <Progress value={goal.progress_percentage} className="h-2" />
                                <p className="text-sm text-gray-600 mt-1">{goal.progress_percentage}% complete</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Long-term Goals */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-purple-500" />
                            Long-term Goals (3-12 months)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {roadmap.goals.long_term.map((goal) => (
                              <div key={goal.id} className="p-4 border rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-medium">{goal.goal}</h3>
                                  <Badge variant={goal.completed ? "default" : "secondary"}>
                                    {goal.completed ? "Completed" : "In Progress"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <Calendar className="h-4 w-4" />
                                  Target: {new Date(goal.target_date).toLocaleDateString()}
                                </div>
                                <Progress value={goal.progress_percentage} className="h-2" />
                                <p className="text-sm text-gray-600 mt-1">{goal.progress_percentage}% complete</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="weekly" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {roadmap.weeklyPlan.map((week, weekIndex) => (
                        <Card key={week.week}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Clock className="h-5 w-5" />
                              Week {week.week}
                            </CardTitle>
                            <p className="text-sm text-gray-600">{week.focus}</p>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {week.tasks.map((task) => (
                                <div key={task.id} className="flex items-start gap-3">
                                  <Checkbox
                                    checked={task.completed}
                                    onCheckedChange={() => toggleTaskCompletion(weekIndex, task.id)}
                                  />
                                  <div className="flex-1">
                                    <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                      {task.task}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Due: {new Date(task.due_date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="recommendations" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Personalized Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {roadmap.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <p>{rec}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Goals
                  </Button>
                </div>
              </div>
            ) : (
              /* Empty State */
              <Card className="text-center py-12">
                <CardContent>
                  <Route className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Health Roadmap Yet</h3>
                  <p className="text-gray-600 mb-6">Create your personalized health roadmap to start your wellness journey.</p>
                  <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2 mx-auto">
                    <Plus className="h-4 w-4" />
                    Create Your First Roadmap
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