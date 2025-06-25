
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Check, BookOpen } from 'lucide-react';
import Image from 'next/image';

// Mock Data
const mockPatients = [
    { id: 'p1', name: 'John Doe' },
    { id: 'p2', name: 'Jane Smith' },
];

const mockTherapyData = {
    p1: [
        { id: 't1', name: "Mindful VR", type: 'VR', progress: 75, status: 'In Progress', image: 'https://placehold.co/600x400', data_ai_hint: 'vr landscape' },
        { id: 't2', name: "Guided Audio", type: 'Audio', progress: 40, status: 'In Progress', image: 'https://placehold.co/600x400', data_ai_hint: 'calm meditation' },
    ],
    p2: [
        { id: 't3', name: "Biofeedback Sync", type: 'Biofeedback', progress: 90, status: 'In Progress', image: 'https://placehold.co/600x400', data_ai_hint: 'biofeedback wave' },
        { id: 't4', name: "Dream Weaving", type: 'VR', progress: 100, status: 'Completed', image: 'https://placehold.co/600x400', data_ai_hint: 'surreal dream' },
        { id: 't5', name: "Cognitive Reframing", type: 'Audio', progress: 15, status: 'In Progress', image: 'https://placehold.co/600x400', data_ai_hint: 'abstract thoughts' },
    ]
};

export default function TherapyOversightPage() {
    const [selectedPatient, setSelectedPatient] = useState('p1');
    const data = mockTherapyData[selectedPatient as keyof typeof mockTherapyData];

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Therapy Oversight</h1>
                    <p className="text-muted-foreground">Monitor patient progress and assign new therapy modules.</p>
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
                    <Button><BrainCircuit className="mr-2"/> Assign New Therapy</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map(module => (
                    <ModuleCard key={module.id} module={module} />
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Session Logs & Feedback</CardTitle>
                    <CardDescription>Review notes from {mockPatients.find(p=>p.id===selectedPatient)?.name}'s recent sessions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-3 border rounded-md">
                            <p className="font-semibold">Mindful VR - Session 5</p>
                            <p className="text-sm text-muted-foreground">Patient feedback: "Felt calmer afterwards, but the forest scene was a bit dark."</p>
                        </div>
                        <div className="p-3 border rounded-md">
                            <p className="font-semibold">Guided Audio - Session 2</p>
                            <p className="text-sm text-muted-foreground">AI Note: Patient's heart rate variability improved by 8% during this session.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


function ModuleCard({ module }: { module: any }) {
    return (
        <Card className="flex flex-col overflow-hidden">
            <div className="relative h-40 w-full">
                <Image src={module.image} alt={module.name} layout="fill" objectFit="cover" data-ai-hint={module.data_ai_hint} />
                <Badge variant="secondary" className="absolute top-2 right-2">{module.type}</Badge>
            </div>
            <CardHeader>
                <CardTitle className="text-lg">{module.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
                <div className="flex justify-between items-center mb-1 text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>{module.progress}%</span>
                </div>
                <Progress value={module.progress} />
            </CardContent>
            <CardContent>
                <Button variant="outline" className="w-full"><BookOpen className="mr-2"/> View Details</Button>
            </CardContent>
        </Card>
    );
}

