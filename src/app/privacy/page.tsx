'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import type { PatientProfile, Appointment, NeuralScan } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Calendar, BarChart4, Bot } from 'lucide-react';
import { BrainModel } from '@/components/shared/brain-model';
import { MoodTrackerChart } from '@/components/charts/mood-tracker-chart';
import { CognitiveScoreGauge } from '@/components/charts/cognitive-score-gauge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NeuroDashboard() {
  const { userProfile, loading } = useAuth();
  const [latestScan, setLatestScan] = useState<NeuralScan | null>(null);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (userProfile?.role === 'patient') {
      const fetchData = async () => {
        setLoadingData(true);
        const userId = userProfile.uid;

        // Fetch latest scan
        const scansQuery = query(collection(db, `users/${userId}/neural_scans`), orderBy('date', 'desc'), limit(1));
        const scansSnap = await getDocs(scansQuery);
        if (!scansSnap.empty) {
          setLatestScan({ id: scansSnap.docs[0].id, ...scansSnap.docs[0].data() } as NeuralScan);
        }

        // Fetch next appointment
        const appointmentsQuery = query(collection(db, `users/${userId}/appointments`), where('status', '==', 'Scheduled'), orderBy('date', 'asc'), limit(1));
        const appointmentsSnap = await getDocs(appointmentsQuery);
        if (!appointmentsSnap.empty) {
          const apptData = appointmentsSnap.docs[0].data();
          const doctorSnap = await getDoc(doc(db, 'users', apptData.doctorId));
          setNextAppointment({
              id: appointmentsSnap.docs[0].id,
              ...apptData,
              doctorName: doctorSnap.exists() ? doctorSnap.data().displayName : 'Unknown Doctor'
          } as Appointment);
        }
        setLoadingData(false);
      };
      fetchData();
    }
  }, [userProfile]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (userProfile?.role !== 'patient') {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-6 text-center">
        <h1 className="text-3xl font-bold font-headline">Welcome, {userProfile?.displayName}</h1>
        <p className="text-muted-foreground">This view is for patient accounts. Please select your role from the sidebar if available.</p>
      </div>
    );
  }

  const { patientData } = userProfile;
  const nextApptDate = nextAppointment?.date ? new Date(nextAppointment.date.seconds * 1000) : null;


  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-bold font-headline">Neuro_Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cognitive Health</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center">
            <CognitiveScoreGauge score={patientData.cognitiveHealthScore} />
            <p className="text-xs text-muted-foreground mt-2">AI-Assessed Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest BrainScan</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square w-full rounded-md overflow-hidden mt-2">
                <BrainModel isInteractive={false} />
            </div>
             <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link href="/brain-scan">View Full Scan</Link>
             </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className='pt-4'>
            {nextApptDate ? (
                 <div className="space-y-2">
                    <p className="text-lg font-bold">{nextApptDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm text-muted-foreground">{nextApptDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm font-medium">with {nextAppointment?.doctorName}</p>
                    <p className="text-xs text-muted-foreground pt-1">{nextAppointment?.purpose}</p>
                    <Button variant="secondary" size="sm" className="w-full mt-2" asChild>
                       <Link href="/consultations">Manage</Link>
                    </Button>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center pt-10">No upcoming appointments.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cognitive Progress</CardTitle>
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className='h-[200px] -ml-2 -mr-4'>
             <MoodTrackerChart data={patientData.moodTrackerData} loading={loading || loadingData}/>
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="font-headline">Therapy Hub</CardTitle>
                <CardDescription>Continue your assigned neural therapy programs.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <TherapyProgramCard program="Mindful VR" progress={75} />
                 <TherapyProgramCard program="Guided Audio" progress={40} />
                 <TherapyProgramCard program="Biofeedback" progress={90} />
            </CardContent>
          </Card>
           <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  "Your focus metrics have improved by 12% after consistent Focus Gym sessions. Consider exploring the Memory Maze next to challenge recall abilities."
                </p>
                <Button variant="link" className="p-0 mt-2">
                  View all insights
                </Button>
              </CardContent>
            </Card>
       </div>
    </div>
  );
}


function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="lg:col-span-2 h-48" />
            <Skeleton className="h-48" />
        </div>
    </div>
  );
}

function TherapyProgramCard({ program, progress }: { program: string; progress: number }) {
    return (
        <Card className='hover:bg-muted/50 transition-colors'>
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <p className="font-semibold">{program}</p>
                <div className="w-16 h-16 my-3 rounded-full bg-muted flex items-center justify-center">
                    <p className="text-primary font-bold text-lg">{progress}%</p>
                </div>
                 <Button variant="secondary" size="sm" className="w-full" asChild>
                    <Link href="/therapy-hub">Continue</Link>
                </Button>
            </CardContent>
        </Card>
    );
}