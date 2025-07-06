'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { 
  User, 
  Edit, 
  Save, 
  Calendar, 
  Phone, 
  Mail,
  Heart,
  Pill,
  AlertTriangle,
  Users,
  Shield,
  Camera,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  blood_type?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medical_conditions: string[];
  current_medications: string[];
  allergies: string[];
  family_history: string[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setFormData(data.profile);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.full_name,
          dateOfBirth: formData.date_of_birth,
          gender: formData.gender,
          height: formData.height,
          weight: formData.weight,
          bloodType: formData.blood_type,
          emergencyContact: formData.emergency_contact,
          medicalConditions: formData.medical_conditions || [],
          currentMedications: formData.current_medications || [],
          allergies: formData.allergies || [],
          familyHistory: formData.family_history || [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditing(false);
        toast.success('Profile updated successfully');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setEditing(false);
  };

  const addItem = (field: keyof UserProfile, value: string) => {
    if (!value.trim()) return;
    
    const currentArray = (formData[field] as string[]) || [];
    if (!currentArray.includes(value.trim())) {
      setFormData({
        ...formData,
        [field]: [...currentArray, value.trim()]
      });
    }
  };

  const removeItem = (field: keyof UserProfile, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    setFormData({
      ...formData,
      [field]: currentArray.filter(item => item !== value)
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const calculateBMI = (height: number, weight: number) => {
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-600">Manage your personal and medical information</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <Button variant="outline" onClick={handleCancel} disabled={saving}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="medical">Medical History</TabsTrigger>
                <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
                <TabsTrigger value="health">Health Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-2xl">
                          {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {editing && (
                        <Button variant="outline" className="flex items-center gap-2">
                          <Camera className="h-4 w-4" />
                          Change Photo
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={formData.full_name || ''}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                          disabled={!editing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          disabled={!editing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.date_of_birth || ''}
                          onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                          disabled={!editing}
                        />
                        {formData.date_of_birth && (
                          <p className="text-sm text-gray-600">
                            Age: {calculateAge(formData.date_of_birth)} years
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select 
                          value={formData.gender || ''} 
                          onValueChange={(value: any) => setFormData({...formData, gender: value})}
                          disabled={!editing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={formData.height || ''}
                          onChange={(e) => setFormData({...formData, height: parseInt(e.target.value)})}
                          disabled={!editing}
                          placeholder="170"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={formData.weight || ''}
                          onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value)})}
                          disabled={!editing}
                          placeholder="70"
                        />
                        {formData.height && formData.weight && (
                          <p className="text-sm text-gray-600">
                            BMI: {calculateBMI(formData.height, formData.weight)}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bloodType">Blood Type</Label>
                        <Select 
                          value={formData.blood_type || ''} 
                          onValueChange={(value) => setFormData({...formData, blood_type: value})}
                          disabled={!editing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medical" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Medical Conditions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        Medical Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {editing && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add medical condition"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addItem('medical_conditions', e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                addItem('medical_conditions', input.value);
                                input.value = '';
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {(formData.medical_conditions || []).map((condition, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {condition}
                              {editing && (
                                <button
                                  onClick={() => removeItem('medical_conditions', condition)}
                                  className="ml-1 hover:text-red-500"
                                >
                                  ×
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Current Medications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5 text-blue-500" />
                        Current Medications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {editing && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add medication"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addItem('current_medications', e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                addItem('current_medications', input.value);
                                input.value = '';
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {(formData.current_medications || []).map((medication, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {medication}
                              {editing && (
                                <button
                                  onClick={() => removeItem('current_medications', medication)}
                                  className="ml-1 hover:text-red-500"
                                >
                                  ×
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Allergies */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        Allergies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {editing && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add allergy"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addItem('allergies', e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                addItem('allergies', input.value);
                                input.value = '';
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {(formData.allergies || []).map((allergy, index) => (
                            <Badge key={index} variant="destructive" className="flex items-center gap-1">
                              {allergy}
                              {editing && (
                                <button
                                  onClick={() => removeItem('allergies', allergy)}
                                  className="ml-1 hover:text-red-700"
                                >
                                  ×
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Family History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-500" />
                        Family History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {editing && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add family history"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addItem('family_history', e.currentTarget.value);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                addItem('family_history', input.value);
                                input.value = '';
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {(formData.family_history || []).map((history, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              {history}
                              {editing && (
                                <button
                                  onClick={() => removeItem('family_history', history)}
                                  className="ml-1 hover:text-red-500"
                                >
                                  ×
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="emergency" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-500" />
                      Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyName">Contact Name</Label>
                        <Input
                          id="emergencyName"
                          value={formData.emergency_contact?.name || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            emergency_contact: {
                              ...formData.emergency_contact,
                              name: e.target.value,
                              phone: formData.emergency_contact?.phone || '',
                              relationship: formData.emergency_contact?.relationship || ''
                            }
                          })}
                          disabled={!editing}
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Phone Number</Label>
                        <Input
                          id="emergencyPhone"
                          type="tel"
                          value={formData.emergency_contact?.phone || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            emergency_contact: {
                              ...formData.emergency_contact,
                              name: formData.emergency_contact?.name || '',
                              phone: e.target.value,
                              relationship: formData.emergency_contact?.relationship || ''
                            }
                          })}
                          disabled={!editing}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergencyRelationship">Relationship</Label>
                        <Input
                          id="emergencyRelationship"
                          value={formData.emergency_contact?.relationship || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            emergency_contact: {
                              ...formData.emergency_contact,
                              name: formData.emergency_contact?.name || '',
                              phone: formData.emergency_contact?.phone || '',
                              relationship: e.target.value
                            }
                          })}
                          disabled={!editing}
                          placeholder="Spouse, Parent, Sibling, etc."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="health" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">BMI</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      {formData.height && formData.weight ? (
                        <>
                          <div className="text-3xl font-bold text-blue-600">
                            {calculateBMI(formData.height, formData.weight)}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {parseFloat(calculateBMI(formData.height, formData.weight)) < 18.5 ? 'Underweight' :
                             parseFloat(calculateBMI(formData.height, formData.weight)) < 25 ? 'Normal' :
                             parseFloat(calculateBMI(formData.height, formData.weight)) < 30 ? 'Overweight' : 'Obese'}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-500">Add height and weight to calculate BMI</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">Age</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      {formData.date_of_birth ? (
                        <>
                          <div className="text-3xl font-bold text-green-600">
                            {calculateAge(formData.date_of_birth)}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">years old</p>
                        </>
                      ) : (
                        <p className="text-gray-500">Add date of birth</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">Blood Type</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      {formData.blood_type ? (
                        <>
                          <div className="text-3xl font-bold text-red-600">
                            {formData.blood_type}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">blood type</p>
                        </>
                      ) : (
                        <p className="text-gray-500">Add blood type</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Health Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm font-medium">Medical Conditions</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formData.medical_conditions?.length || 0}
                        </p>
                      </div>

                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Pill className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm font-medium">Medications</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formData.current_medications?.length || 0}
                        </p>
                      </div>

                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-sm font-medium">Allergies</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {formData.allergies?.length || 0}
                        </p>
                      </div>

                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                        <p className="text-sm font-medium">Family History</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {formData.family_history?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}