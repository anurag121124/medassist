'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { 
  Activity, 
  Heart, 
  Calendar, 
  FileText,
  TrendingUp,
  Clock,
  Users,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface DashboardStats {
  totalAssessments: number;
  activeRoadmaps: number;
  dietPlansCreated: number;
  upcomingAppointments: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
    urgency?: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessments: 0,
    activeRoadmaps: 0,
    dietPlansCreated: 0,
    upcomingAppointments: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Simulate loading dashboard data
    setTimeout(() => {
      setStats({
        totalAssessments: 3,
        activeRoadmaps: 1,
        dietPlansCreated: 2,
        upcomingAppointments: 1,
        recentActivity: [
          {
            id: '1',
            type: 'symptom_check',
            description: 'Completed symptom assessment for headache and fatigue',
            date: '2 hours ago',
            urgency: 'medium'
          },
          {
            id: '2',
            type: 'roadmap',
            description: 'New health roadmap generated with 12-week plan',
            date: '1 day ago'
          },
          {
            id: '3',
            type: 'diet_plan',
            description: 'Mediterranean diet plan created',
            date: '3 days ago'
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  const quickActions = [
    {
      title: 'Check Symptoms',
      description: 'Get AI-powered health insights',
      icon: Activity,
      href: '/symptom-checker',
      color: 'bg-blue-500'
    },
    {
      title: 'Health Roadmap',
      description: 'View your personalized plan',
      icon: TrendingUp,
      href: '/health-roadmap',
      color: 'bg-green-500'
    },
    {
      title: 'Diet Planner',
      description: 'Create meal plans',
      icon: Heart,
      href: '/diet-planner',
      color: 'bg-orange-500'
    },
    {
      title: 'Find Providers',
      description: 'Locate healthcare providers',
      icon: Users,
      href: '/providers',
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.fullName || 'User'}!
            </h1>
            <p className="text-gray-600">
              Here's an overview of your health journey and recent activity.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Symptom Assessments
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAssessments}</div>
                <p className="text-xs text-muted-foreground">
                  Total health checks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Roadmaps
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeRoadmaps}</div>
                <p className="text-xs text-muted-foreground">
                  Health plans in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Diet Plans
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.dietPlansCreated}</div>
                <p className="text-xs text-muted-foreground">
                  Nutrition plans created
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Appointments
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  Upcoming this month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link key={index} href={action.href}>
                      <div className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className={`p-3 rounded-full ${action.color} text-white mr-4`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{action.title}</h3>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        {activity.type === 'symptom_check' && (
                          <Activity className="h-5 w-5 text-blue-500" />
                        )}
                        {activity.type === 'roadmap' && (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        )}
                        {activity.type === 'diet_plan' && (
                          <Heart className="h-5 w-5 text-orange-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-500">{activity.date}</p>
                          {activity.urgency && (
                            <Badge 
                              variant={activity.urgency === 'high' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {activity.urgency} priority
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Alerts */}
          <Card className="mt-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                Health Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <p className="font-medium text-gray-900">Annual Checkup Due</p>
                    <p className="text-sm text-gray-600">Schedule your yearly physical examination</p>
                  </div>
                  <Button size="sm">Schedule</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <p className="font-medium text-gray-900">Medication Refill</p>
                    <p className="text-sm text-gray-600">Your prescription expires in 5 days</p>
                  </div>
                  <Button size="sm" variant="outline">Remind Later</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}