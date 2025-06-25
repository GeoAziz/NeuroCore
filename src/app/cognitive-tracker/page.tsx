
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import type { CognitiveTestResult } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BrainCircuit, Lightbulb, Puzzle, Clock } from 'lucide-react';
import { ChartTooltip, ChartTooltipContent, ChartContainer } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';

export default function CognitiveTrackerPage() {
    const { user, loading: authLoading } = useAuth();
    const [testResults, setTestResults] = useState<CognitiveTestResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchResults = async () => {
                setLoading(true);
                const resultsQuery = query(collection(db, `users/${user.uid}/cognitive_tests`), orderBy('date', 'asc'));
                const resultsSnap = await getDocs(resultsQuery);
                const resultsData = resultsSnap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        // Format date for chart
                        date: new Date(data.date.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    } as CognitiveTestResult & { date: string };
                });
                setTestResults(resultsData);
                setLoading(false);
            };
            fetchResults();
        }
    }, [user]);

    if (authLoading || loading) {
        return <CognitiveTrackerSkeleton />;
    }
    
    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline">Cognitive Tracker</h1>
                <Button>
                    <BrainCircuit className="mr-2 h-4 w-4" /> Start New Test
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Neuro-Performance Timeline</CardTitle>
                    <CardDescription>Tracking your focus, memory, and reaction time over the past weeks.</CardDescription>
                </CardHeader>
                <CardContent className="h-96 pr-8">
                     <ResponsiveContainer width="100%" height="100%">
                        <ChartContainer
                            config={{
                                memory: { label: "Memory", color: "hsl(var(--chart-1))" },
                                focus: { label: "Focus", color: "hsl(var(--chart-2))" },
                                reactionTime: { label: "Reaction (ms)", color: "hsl(var(--chart-4))" },
                            }}
                        >
                            <LineChart data={testResults}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Line yAxisId="left" dataKey="memory" type="monotone" stroke="var(--color-memory)" strokeWidth={2} dot={{r: 4}} />
                                <Line yAxisId="left" dataKey="focus" type="monotone" stroke="var(--color-focus)" strokeWidth={2} dot={{r: 4}} />
                                <Line yAxisId="right" dataKey="reactionTime" type="monotone" stroke="var(--color-reactionTime)" strokeWidth={2} dot={{r: 4}} />
                            </LineChart>
                        </ChartContainer>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline"><Lightbulb /> AI Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Your reaction time has plateaued. Try the 'Synapse Speed' game to improve neural firing rates.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Suggested Exercises</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="secondary" className="w-full justify-start"><Puzzle className="mr-2"/>Memory Maze</Button>
                        <Button variant="secondary" className="w-full justify-start"><Clock className="mr-2"/>Synapse Speed</Button>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline">Past Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                        {[...testResults].reverse().slice(0, 3).map(result => (
                             <div key={result.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                <div>
                                    <p className="font-semibold">{result.name}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(result.date).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2">
                                   <Badge variant="outline">Focus: {result.focus}</Badge>
                                   <Badge variant="outline">Memory: {result.memory}</Badge>
                                </div>
                            </div>
                        ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


function CognitiveTrackerSkeleton() {
    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-10 w-40" />
            </div>
            <Skeleton className="h-96 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-48 md:col-span-2" />
            </div>
        </div>
    );
}

