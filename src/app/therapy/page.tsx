'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Award, Clock, Brain, Wind, Gem, Puzzle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { collection, getDocs, addDoc, query, orderBy, limit, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { TherapyContent, JournalEntry, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { generateEffectivenessRating } from '@/ai/flows/generate-effectiveness-rating';

type IconType = typeof Brain | typeof Wind | typeof Gem | typeof Puzzle;

const iconMap: { [key: string]: IconType } = {
    'Calm Room': Wind,
    'Dream States': Brain,
    'Focus Gym': Gem,
    'Memory Maze': Puzzle,
};


export default function TherapyCenter() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [isAIPending, startAITransition] = useTransition();

  const [therapyOptions, setTherapyOptions] = useState<TherapyContent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeSession, setActiveSession] = useState<TherapyContent | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const fetchTherapyContent = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'therapyContent'));
        const options = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TherapyContent));
        setTherapyOptions(options);
      } catch (error) {
        console.error("Error fetching therapy content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTherapyContent();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession && sessionStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - sessionStartTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession, sessionStartTime]);


  const handleStartSession = (therapy: TherapyContent) => {
    if (activeSession) {
        toast({ title: 'Session in Progress', description: 'Please end the current session before starting a new one.', variant: 'destructive' });
        return;
    }
    setActiveSession(therapy);
    setSessionStartTime(Date.now());
    setElapsedTime(0);
    toast({ title: 'Session Started', description: `You have started the ${therapy.name} session.`});
  };

  const handleEndSession = async () => {
    if (!user || !userProfile || !activeSession || !sessionStartTime) return;

    startAITransition(async () => {
        const durationInSeconds = Math.floor(elapsedTime / 1000);
        const durationInMinutes = Math.round(durationInSeconds / 60);

        try {
            // 1. Fetch latest journal entry for context
            const journalQuery = query(collection(db, `users/${user.uid}/journalEntries`), orderBy('timestamp', 'desc'), limit(1));
            const journalSnapshot = await getDocs(journalQuery);
            const latestJournalEntry = journalSnapshot.docs.length > 0 ? (journalSnapshot.docs[0].data() as JournalEntry).text : "No recent journal entries.";

            // 2. Call AI to get effectiveness rating
            const { output: ratingOutput, error: ratingError } = await generateEffectivenessRating({
                sessionType: activeSession.name,
                duration: durationInMinutes,
                moodBefore: userProfile.patientData?.mood || 'Neutral',
                moodAfter: 'Calm', // Mocked for prototype
                userJournalFeedback: latestJournalEntry
            });
            
            if (ratingError) throw ratingError;

            const summary = ratingOutput?.summary || 'No summary generated.';

            // 3. Log the session to Firestore
            const sessionLog = {
                type: activeSession.name,
                date: new Date().toISOString().split('T')[0],
                duration: `${durationInMinutes}min`,
                result: `AI Rating: ${ratingOutput?.effectivenessRating}/10. ${summary}`,
                timestamp: serverTimestamp() // For ordering
            };
            await addDoc(collection(db, `users/${user.uid}/sessionLogs`), sessionLog);

            toast({
                title: 'Session Complete!',
                description: `Effectiveness Rating: ${ratingOutput?.effectivenessRating}/10. ${summary.substring(0, 100)}...`,
            });

        } catch (error: any) {
            console.error("Error ending session:", error);
            toast({ title: "Error", description: error.message || "Could not save session log.", variant: "destructive" });
        } finally {
            // 4. Reset state
            setActiveSession(null);
            setSessionStartTime(null);
            setElapsedTime(0);
        }
    });
  };
  
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  if (loading) {
    return (
        <div className="flex-1 p-4 md:p-6">
            <Skeleton className="h-9 w-96 mb-6" />
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex lg:flex-col h-auto bg-transparent p-0 gap-2 items-start w-full lg:w-80">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="flex-1">
                    <Skeleton className="h-[600px] w-full" />
                </div>
            </div>
        </div>
    );
  }
  
  if (therapyOptions.length === 0) {
      return <p>No therapy options available.</p>
  }

  const defaultTab = therapyOptions[0]?.category.toLowerCase().replace(' ', '') || '';

  return (
    <div className="flex-1 p-4 md:p-6">
      <h1 className="text-3xl font-bold font-headline mb-6">Therapy & Simulations Center</h1>
      <Tabs defaultValue={defaultTab} className="flex flex-col lg:flex-row gap-6">
        <TabsList className="flex lg:flex-col h-auto bg-transparent p-0 gap-2 items-start">
            {therapyOptions.map(opt => {
                const Icon = iconMap[opt.category] || Gem;
                const value = opt.category.toLowerCase().replace(' ', '');
                return (
                    <TabsTrigger key={opt.id} value={value} className="w-full justify-start text-left h-auto p-4 data-[state=active]:bg-card data-[state=active]:border-l-2 data-[state=active]:border-primary disabled:opacity-50" disabled={!!activeSession}>
                        <Icon className="w-6 h-6 mr-4 text-primary shrink-0" />
                        <div>
                            <p className="font-bold">{opt.category}</p>
                            <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                        </div>
                    </TabsTrigger>
                )
            })}
        </TabsList>
        <div className="flex-1">
            {therapyOptions.map(opt => {
                 const value = opt.category.toLowerCase().replace(' ', '');
                 const isThisSessionActive = activeSession?.id === opt.id;
                 return (
                 <TabsContent key={opt.id} value={value} className="m-0">
                    <Card className="overflow-hidden">
                        <div className="relative h-[400px] xl:h-[500px] w-full">
                           <Image src={opt.image} alt={opt.name} layout="fill" objectFit="cover" data-ai-hint={opt.data_ai_hint} />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                           <div className="absolute bottom-0 left-0 p-6">
                                <h2 className="text-4xl font-bold text-white font-headline">{opt.name}</h2>
                                <p className="text-white/80 max-w-lg mt-2">{opt.description}</p>
                           </div>
                           {isThisSessionActive && (
                           <div className="absolute top-4 right-4 p-2 bg-background/50 backdrop-blur-sm rounded-full border border-primary/50">
                             <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
                           </div>
                           )}
                        </div>
                        <div className="p-4 bg-card-foreground/5 flex items-center justify-between">
                            <div className="flex items-center gap-6 text-sm">
                                {isThisSessionActive ? (
                                <>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 animate-spin" />
                                    <span>{formatTime(elapsedTime)}</span>
                                </div>
                                </>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Award className="w-4 h-4" />
                                        <span>AI Effectiveness: 8.7/10</span>
                                    </div>
                                )}
                            </div>
                             <div className="flex items-center gap-2">
                                {isThisSessionActive ? (
                                    <Button variant="destructive" className="ml-4" onClick={handleEndSession} disabled={isAIPending}>
                                        {isAIPending && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                                        End Session
                                    </Button>
                                ) : (
                                    <Button onClick={() => handleStartSession(opt)} disabled={!!activeSession || isAIPending}>Start Session</Button>
                                )}
                             </div>
                        </div>
                         {isThisSessionActive && (
                            <CardContent className="p-4 pt-0">
                                <Progress value={(elapsedTime / (30 * 60 * 1000)) * 100} />
                            </CardContent>
                        )}
                    </Card>
                </TabsContent>
            )})}
        </div>
      </Tabs>
    </div>
  );
}
