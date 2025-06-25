
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoodTrackerChart } from '@/components/charts/mood-tracker-chart';
import { BrainModel } from '@/components/shared/brain-model';
import { Activity, Zap, Brain, TrendingUp, NotebookText, Bell, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientDashboard() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-64" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /></CardContent></Card>
            </div>
             <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Skeleton className="lg:col-span-2 h-[480px]" />
                <div className="space-y-6">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-48" />
                </div>
            </div>
        </div>
    );
  }

  // With our new type-safe UserProfile, we can be sure that if the role is 'patient',
  // the patientData object exists.
  if (userProfile?.role !== 'patient') {
     return (
      <div className="flex-1 space-y-6 p-4 md:p-6 text-center">
        <h1 className="text-3xl font-bold font-headline">Welcome, {userProfile?.displayName}</h1>
        <p className="text-muted-foreground">This is not a patient account.</p>
        <p className="text-sm text-muted-foreground">(Please log in as a patient to view the dashboard or select your role from the sidebar).</p>
      </div>
    );
  }

  // Now we can safely access patientData
  const patientData = userProfile.patientData;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Patient Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarImage src="https://placehold.co/40x40" />
            <AvatarFallback>{userProfile.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cognition Score
            </CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientData.cognitionScore.value}/10</div>
            <p className="text-xs text-muted-foreground">+{patientData.cognitionScore.change}% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mental Health Grade
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientData.mentalHealthGrade}</div>
            <p className="text-xs text-muted-foreground">AI-Assessed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sleep Quality</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientData.sleepQuality}%</div>
            <p className="text-xs text-muted-foreground">Last night</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mood</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientData.mood}</div>
            <p className="text-xs text-muted-foreground">AI Prediction: {patientData.moodPrediction}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">3D Brain Model</CardTitle>
            <CardDescription>
              Interactive neural model. Click regions for activity info.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <BrainModel />
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Therapy Sessions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button size="lg" className="w-full justify-start">Start: Focus Gym</Button>
              <Button size="lg" variant="secondary" className="w-full justify-start">Start: Sleep Scape</Button>
              <Button size="lg" variant="secondary" className="w-full justify-start">Start: Calm Room</Button>
              <Button variant="outline" className="w-full">Schedule Mental Checkup</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <NotebookText className="h-5 w-5" />
                Doctor Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                "Patient shows improvement in stress response. Continue with weekly Calm Room sessions. Re-evaluate in one month."
              </p>
              <Button variant="link" className="p-0 mt-2">
                View all notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Mood Tracker Timeline</CardTitle>
          <CardDescription>Weekly mood states and stress levels. <Badge variant="destructive" className="ml-2 animate-pulse">AI Alert: Burnout Imminent</Badge></CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <MoodTrackerChart data={patientData.moodTrackerData} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
