
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartTooltipContent, ChartTooltip, ChartContainer } from "@/components/ui/chart";
import { Download, Share2, AlertTriangle } from 'lucide-react';

// Mock Data
const mockPatients = [
    { id: 'p1', name: 'John Doe' },
    { id: 'p2', name: 'Jane Smith' },
];

const mockCognitiveData = {
    p1: [
        { date: 'Oct 1', memory: 85, focus: 75, reactionTime: 250 },
        { date: 'Oct 8', memory: 82, focus: 85, reactionTime: 240 },
        { date: 'Oct 15', memory: 86, focus: 88, reactionTime: 220 },
        { date: 'Oct 22', memory: 90, focus: 91, reactionTime: 210 },
    ],
    p2: [
        { date: 'Oct 3', memory: 70, focus: 65, reactionTime: 310 },
        { date: 'Oct 10', memory: 72, focus: 60, reactionTime: 320 },
        { date: 'Oct 17', memory: 68, focus: 62, reactionTime: 325 },
        { date: 'Oct 24', memory: 71, focus: 64, reactionTime: 305 },
    ]
};

export default function CognitiveReportsPage() {
    const [selectedPatient, setSelectedPatient] = useState('p1');
    const data = mockCognitiveData[selectedPatient as keyof typeof mockCognitiveData];
    const isJane = selectedPatient === 'p2';

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Cognitive Reports</h1>
                    <p className="text-muted-foreground">Analyze neuro-performance statistics and timelines.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-64">
                         <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Patient..." />
                            </SelectTrigger>
                            <SelectContent>
                                {mockPatients.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="outline"><Share2 className="mr-2"/> Share</Button>
                    <Button><Download className="mr-2"/> Export as PDF</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Neuro-Performance Timeline</CardTitle>
                    <CardDescription>Tracking {mockPatients.find(p=>p.id === selectedPatient)?.name}'s focus, memory, and reaction time.</CardDescription>
                </CardHeader>
                <CardContent className="h-96 pr-8">
                     <ResponsiveContainer width="100%" height="100%">
                        <ChartContainer
                            config={{
                                memory: { label: "Memory (%)", color: "hsl(var(--chart-1))" },
                                focus: { label: "Focus (%)", color: "hsl(var(--chart-2))" },
                                reactionTime: { label: "Reaction (ms)", color: "hsl(var(--chart-4))" },
                            }}
                        >
                            <LineChart data={data}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis yAxisId="left" domain={[50, 100]} tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis yAxisId="right" orientation="right" domain={[200, 400]} tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Legend />
                                <Line yAxisId="left" dataKey="memory" type="monotone" stroke="var(--color-memory)" strokeWidth={2} dot={{r: 4}} />
                                <Line yAxisId="left" dataKey="focus" type="monotone" stroke="var(--color-focus)" strokeWidth={2} dot={{r: 4}} />
                                <Line yAxisId="right" dataKey="reactionTime" type="monotone" stroke="var(--color-reactionTime)" strokeWidth={2} dot={{r: 4}} />
                            </LineChart>
                        </ChartContainer>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {isJane && (
                <Card className="border-destructive/50 bg-destructive/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle/> AI-Generated Red Flag</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive/80">
                            AI analysis indicates a consistent decline in focus and an increase in reaction time over the last 3 weeks. This may suggest increased cognitive load or fatigue. Recommend scheduling a consultation to discuss potential stressors.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

