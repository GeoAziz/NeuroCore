'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { analyzeEmotionalHeatmap, AnalyzeEmotionalHeatmapOutput } from '@/ai/flows/analyze-emotional-heatmap';
import { mindFeedbackComparison, MindFeedbackComparisonOutput } from '@/ai/flows/mind-feedback-comparison';
import { Loader2, Wand2, BarChart, Sun, Moon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import type { JournalEntry, MoodTrackerDataPoint } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type AIResult = (AnalyzeEmotionalHeatmapOutput & { type: 'heatmap' }) | (MindFeedbackComparisonOutput & { type: 'feedback' }) | null;

export default function AnalyticsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AIResult>(null);
  const [loadingData, setLoadingData] = useState(true);
  
  const [journalText, setJournalText] = useState("");
  const [heatmapData, setHeatmapData] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
        setLoadingData(true);
        try {
            // Fetch Journal Entries
            const journalQuery = query(collection(db, `users/${user.uid}/journalEntries`), orderBy('timestamp', 'desc'));
            const journalSnapshot = await getDocs(journalQuery);
            const journalEntries = journalSnapshot.docs.map(doc => doc.data() as JournalEntry);
            const formattedJournal = journalEntries.map(e => `${new Date(e.timestamp.seconds * 1000).toLocaleString()}: ${e.text}`).join('\n');
            setJournalText(formattedJournal);

            // Fetch Mood Tracker Data
            const moodQuery = query(collection(db, `users/${user.uid}/moodTracker`));
            const moodSnapshot = await getDocs(moodQuery);
            const moodData = moodSnapshot.docs.map(doc => doc.data() as MoodTrackerDataPoint);
            const moodDataMap = moodData.reduce((acc, item) => {
                acc[item.name] = { mood: item.mood, stress: item.stress };
                return acc;
            }, {} as Record<string, {mood: number, stress: number}>);
            setHeatmapData(JSON.stringify(moodDataMap, null, 2));

        } catch (error) {
            console.error("Failed to fetch user data:", error);
            toast({ title: 'Error', description: 'Failed to load your data.', variant: 'destructive' });
        } finally {
            setLoadingData(false);
        }
    };

    fetchData();
  }, [user, toast]);

  const handleHeatmapAnalysis = async () => {
    startTransition(async () => {
      setResult(null);
      const { output, error } = await analyzeEmotionalHeatmap({ heatmapData: heatmapData, userJournal: journalText });
      if (error) {
        toast({ title: 'Error Analyzing Heatmap', description: error.message, variant: 'destructive' });
      } else if (output) {
        setResult({ ...output, type: 'heatmap' });
      }
    });
  };

  const handleFeedbackComparison = async () => {
     startTransition(async () => {
      setResult(null);
      const { output, error } = await mindFeedbackComparison({ journalEntries: journalText, moodTrends: heatmapData });
      if (error) {
        toast({ title: 'Error Comparing Feedback', description: error.message, variant: 'destructive' });
      } else if (output) {
        setResult({ ...output, type: 'feedback' });
      }
    });
  };

  return (
     <div className="flex-1 space-y-6 p-4 md:p-6">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Neuro Analytics & AI Reports</h1>
      </div>
      {loadingData ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="space-y-6">
             <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className='font-headline'>AI Insights Generator</CardTitle>
                    <CardDescription>Use AI to analyze your journal entries, mood data, and detect patterns.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="journal">User Journal (Live Data)</Label>
                        <Textarea 
                            id="journal" 
                            rows={8}
                            value={journalText}
                            readOnly
                            className="bg-muted"
                        />
                    </div>
                     <div className="grid w-full gap-1.5">
                        <Label htmlFor="mood">Mood Data (Live Data)</Label>
                        <Textarea 
                            id="mood" 
                            rows={8}
                            value={heatmapData}
                            readOnly
                            className="font-mono text-xs bg-muted"
                        />
                    </div>
                </CardContent>
                <CardFooter className="gap-4">
                    <Button onClick={handleHeatmapAnalysis} disabled={isPending}>
                       {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Analyze Emotional Heatmap
                    </Button>
                    <Button onClick={handleFeedbackComparison} variant="secondary" disabled={isPending}>
                       {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart className="mr-2 h-4 w-4" />}
                        Compare Mind Feedback
                    </Button>
                </CardFooter>
            </Card>
            {isPending && (
                 <Card className="flex items-center justify-center p-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-4">AI is analyzing...</p>
                 </Card>
            )}
            {result && result.type === 'heatmap' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Emotional Heatmap Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold">Dominant Emotions</h3>
                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                {result.dominantEmotions.map((e, i) => <li key={i}>{e.time}: {e.emotion}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold">Pattern Detections</h3>
                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                {result.patternDetections.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold">Insights</h3>
                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                {result.insights.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}
            {result && result.type === 'feedback' && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Mind Feedback Comparison Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{result.insights}</p>
                    </CardContent>
                </Card>
            )}
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className='font-headline'>Data Visualizations</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="heatmap">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="heatmap">Emotional Heatmap</TabsTrigger>
                            <TabsTrigger value="sleep">Sleep Sync</TabsTrigger>
                        </TabsList>
                        <TabsContent value="heatmap" className="mt-4">
                            <div className="relative aspect-video w-full">
                                <Image src={'https://placehold.co/600x400'} alt="Emotional Heatmap" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="emotional heatmap" />
                                <div className='absolute inset-0 flex flex-col justify-between p-4 bg-black/30'>
                                    <div className='flex justify-between text-white'>
                                        <p className='font-bold flex items-center gap-2'><Sun className='w-4 h-4' /> Morning: Calm, Focused</p>
                                        <p className='font-bold flex items-center gap-2'><Moon className='w-4 h-4' /> Evening: Tired, Anxious</p>
                                    </div>
                                    <p className='text-white/80 text-xs'>Dominant emotions by time of day.</p>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="sleep" className="mt-4">
                            <div className="relative aspect-video w-full">
                                 <Image src={'https://placehold.co/600x400'} alt="Sleep Cycle" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="sleep cycle graph" />
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    </div>
    )}
    </div>
  );
}
