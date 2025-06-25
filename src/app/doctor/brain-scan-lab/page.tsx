
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainModel } from '@/components/shared/brain-model';
import { EegChart } from '@/components/charts/eeg-chart';
import { FileText, Calendar, MessageSquare, Dna, Activity } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Mock Data - In a real app, this would be fetched based on patient selection
const mockPatients = [
    { id: 'p1', name: 'John Doe' },
    { id: 'p2', name: 'Jane Smith' },
]

const mockScan = {
    patientName: 'John Doe',
    scanDate: '2023-10-28 10:00 AM',
    scanType: 'fMRI',
    findings: [
        "Elevated activity in amygdala.",
        "Slightly reduced prefrontal cortex activity.",
        "Normal hippocampus volume."
    ],
    aiInsights: "Observed patterns are consistent with high-stress or anxiety states. Recommend monitoring and considering a 'Calm Room' therapy session."
}


export default function BrainScanLabPage() {
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [showStressZones, setShowStressZones] = useState(false);
  
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold font-headline">BrainScan Lab</h1>
                <p className="text-muted-foreground">Interactive diagnostic tools for neural scan analysis.</p>
            </div>
            <div className="w-64">
                <Select defaultValue='p1'>
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
       </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                    <CardHeader className='flex-row items-start justify-between'>
                        <div>
                            <CardTitle>Interactive Brain Model</CardTitle>
                            <CardDescription>{mockScan.patientName} - {mockScan.scanDate}</CardDescription>
                        </div>
                         <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch id="heatmap-toggle" checked={showHeatmap} onCheckedChange={setShowHeatmap} />
                                <Label htmlFor="heatmap-toggle" className="flex items-center gap-1.5 text-sm"><Activity className="w-4 h-4"/> Heatmap</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="stress-toggle" checked={showStressZones} onCheckedChange={setShowStressZones}/>
                                <Label htmlFor="stress-toggle" className="flex items-center gap-1.5 text-sm"><Dna className="w-4 h-4"/> Stress Zones</Label>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 relative">
                        <BrainModel isInteractive={true} showHeatmap={showHeatmap} showStress={showStressZones} />
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>AI Analysis & Findings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-muted-foreground text-sm">Key Findings</h4>
                             <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                                {mockScan.findings.map((f, i) => <li key={i}>{f}</li>)}
                             </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-muted-foreground text-sm">AI Insights</h4>
                            <p className="text-sm mt-1 italic">"{mockScan.aiInsights}"</p>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2">
                        <Button variant="secondary" className="w-full"><FileText className="mr-2"/>Add Note</Button>
                        <Button variant="secondary" className="w-full"><Calendar className="mr-2"/>Schedule Follow-up</Button>
                        <Button variant="secondary" className="w-full"><MessageSquare className="mr-2"/>Message Patient</Button>
                        <Button variant="secondary" className="w-full">Mark for Review</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
         <Card>
            <CardHeader>
                <CardTitle>Waveform Analysis (EEG)</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
                <EegChart />
            </CardContent>
        </Card>
    </div>
  );
}
