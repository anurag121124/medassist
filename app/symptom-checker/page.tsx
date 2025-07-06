'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { 
  Stethoscope, 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  Plus,
  X,
  Loader2,
  FileText,
  Calendar,
  Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface SymptomAssessment {
  assessmentId: string;
  analysis: {
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
  };
  disclaimer: string;
}

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [duration, setDuration] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<SymptomAssessment | null>(null);

  const addSymptom = () => {
    if (currentSymptom.trim() && !symptoms.includes(currentSymptom.trim())) {
      setSymptoms([...symptoms, currentSymptom.trim()]);
      setCurrentSymptom('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.length === 0) {
      toast.error('Please add at least one symptom');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/symptoms/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms,
          severity,
          duration,
          additionalNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze symptoms');
      }

      const data = await response.json();
      setAssessment(data);
      toast.success('Symptom analysis completed');
    } catch (error) {
      toast.error('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return <AlertTriangle className="h-5 w-5" />;
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      case 'medium': return <Clock className="h-5 w-5" />;
      case 'low': return <CheckCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">AI Symptom Checker</h1>
                  <p className="text-gray-600">Get instant health insights powered by AI</p>
                </div>
              </div>
              
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  This tool provides preliminary health insights and should not replace professional medical advice. 
                  In case of emergency, call 911 immediately.
                </AlertDescription>
              </Alert>
            </div>

            {!assessment ? (
              /* Symptom Input Form */
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Describe Your Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Symptoms Input */}
                    <div className="space-y-4">
                      <Label htmlFor="symptoms" className="text-base font-medium">
                        What symptoms are you experiencing?
                      </Label>
                      
                      <div className="flex gap-2">
                        <Input
                          id="symptoms"
                          value={currentSymptom}
                          onChange={(e) => setCurrentSymptom(e.target.value)}
                          placeholder="e.g., headache, fever, nausea"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                        />
                        <Button type="button" onClick={addSymptom} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {symptoms.map((symptom, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1">
                              {symptom}
                              <button
                                type="button"
                                onClick={() => removeSymptom(symptom)}
                                className="ml-2 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Severity */}
                    <div className="space-y-2">
                      <Label className="text-base font-medium">How severe are your symptoms?</Label>
                      <Select value={severity} onValueChange={(value: any) => setSeverity(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild - Manageable discomfort</SelectItem>
                          <SelectItem value="moderate">Moderate - Noticeable impact on daily activities</SelectItem>
                          <SelectItem value="severe">Severe - Significant pain or distress</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-base font-medium">
                        How long have you had these symptoms?
                      </Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="less-than-1-hour">Less than 1 hour</SelectItem>
                          <SelectItem value="1-6-hours">1-6 hours</SelectItem>
                          <SelectItem value="6-24-hours">6-24 hours</SelectItem>
                          <SelectItem value="1-3-days">1-3 days</SelectItem>
                          <SelectItem value="3-7-days">3-7 days</SelectItem>
                          <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
                          <SelectItem value="more-than-2-weeks">More than 2 weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-base font-medium">
                        Additional Information (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Any additional details about your symptoms, triggers, or concerns..."
                        rows={3}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={loading || symptoms.length === 0 || !duration}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing Symptoms...
                        </>
                      ) : (
                        <>
                          <Stethoscope className="mr-2 h-5 w-5" />
                          Analyze Symptoms
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              /* Assessment Results */
              <div className="space-y-6">
                {/* Urgency Level */}
                <Card className={`border-l-4 ${assessment.analysis.urgencyLevel === 'emergency' ? 'border-red-500' : 
                  assessment.analysis.urgencyLevel === 'high' ? 'border-orange-500' :
                  assessment.analysis.urgencyLevel === 'medium' ? 'border-yellow-500' : 'border-green-500'}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded-full text-white ${getUrgencyColor(assessment.analysis.urgencyLevel)}`}>
                        {getUrgencyIcon(assessment.analysis.urgencyLevel)}
                      </div>
                      <div>
                        <span className="capitalize">{assessment.analysis.urgencyLevel}</span> Priority
                        {assessment.analysis.urgencyLevel === 'emergency' && (
                          <p className="text-sm font-normal text-red-600 mt-1">
                            Seek immediate medical attention or call 911
                          </p>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>

                {/* Possible Conditions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Possible Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assessment.analysis.possibleConditions.map((condition, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{condition.condition}</h3>
                            <Badge variant="outline">{condition.probability}% match</Badge>
                          </div>
                          <p className="text-gray-600">{condition.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {assessment.analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Red Flags */}
                {assessment.analysis.redFlags.length > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="text-red-800 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Warning Signs to Watch For
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {assessment.analysis.redFlags.map((flag, index) => (
                          <li key={index} className="flex items-start gap-3 text-red-700">
                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                    <Calendar className="h-6 w-6" />
                    <span>Schedule Appointment</span>
                  </Button>
                  <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
                    <Phone className="h-6 w-6" />
                    <span>Find Providers</span>
                  </Button>
                  <Button 
                    className="h-auto p-4 flex flex-col items-center gap-2" 
                    variant="outline"
                    onClick={() => setAssessment(null)}
                  >
                    <Stethoscope className="h-6 w-6" />
                    <span>New Assessment</span>
                  </Button>
                </div>

                {/* Disclaimer */}
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {assessment.disclaimer}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}