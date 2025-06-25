'use client';

import { useState, useTransition } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import Image from 'next/image';

type AIResult = (AnalyzeEmotionalHeatmapOutput & { type: 'heatmap' }) | (MindFeedbackComparisonOutput & { type: 'feedback' }) | null;

export function AnalyticsView() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AIResult>(null);
  
  const [journalText, setJournalText] = useState(
    "Felt overwhelmed with work this morning. The focus gym session helped, but by evening, I was exhausted. The dream simulation was strange, a bit unsettling. Woke up feeling more rested than usual though."
  );
  const [heatmapData, setHeatmapData] = useState(
    JSON.stringify({
      "08:00": "Anxiety",
      "12:00": "Focused",
      "18:00": "Fatigue",
      "22:00": "Unease"
    }, null, 2)
  );

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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className='font-headline'>AI Insights Generator</CardTitle>
                    <CardDescription>Use AI to analyze your journal entries, mood data, and detect patterns.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="journal">User Journal</Label>
                        <Textarea 
                            placeholder="Type your journal entry here..." 
                            id="journal" 
                            rows={6}
                            value={journalText}
                            onChange={(e) => setJournalText(e.target.value)}
                        />
                    </div>
                     <div className="grid w-full gap-1.5">
                        <Label htmlFor="mood">Mood & Emotional Data (JSON)</Label>
                        <Textarea 
                            placeholder="Enter emotional heatmap data..." 
                            id="mood" 
                            rows={6}
                            value={heatmapData}
                            onChange={(e) => setHeatmapData(e.target.value)}
                            className="font-mono text-xs"
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
                                <Image src="https://placehold.co/600x400" alt="Emotional Heatmap" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="emotional heatmap" />
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
                                 <Image src="https://placehold.co/600x400" alt="Sleep Cycle" layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="sleep cycle graph" />
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
