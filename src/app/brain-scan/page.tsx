
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import type { NeuralScan } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainModel } from '@/components/shared/brain-model';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bot, Dna, Activity } from 'lucide-react';

export default function BrainScanViewer() {
  const { user, loading: authLoading } = useAuth();
  const [scans, setScans] = useState<NeuralScan[]>([]);
  const [selectedScan, setSelectedScan] = useState<NeuralScan | null>(null);
  const [loading, setLoading] = useState(true);

  // AI Overlay Toggles
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showStressZones, setShowStressZones] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchScans = async () => {
        setLoading(true);
        const scansQuery = query(collection(db, `users/${user.uid}/neural_scans`), orderBy('date', 'desc'));
        const scansSnap = await getDocs(scansQuery);
        const scansData = scansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as NeuralScan);
        setScans(scansData);
        if (scansData.length > 0) {
          setSelectedScan(scansData[0]);
        }
        setLoading(false);
      };
      fetchScans();
    }
  }, [user]);

  if (authLoading || loading) {
    return <ScannerSkeleton />;
  }

  const handleScanChange = (scanId: string) => {
    const scan = scans.find(s => s.id === scanId);
    if (scan) {
      setSelectedScan(scan);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-bold font-headline">BrainScan Viewer</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Interactive Brain Model</CardTitle>
                        <Select onValueChange={handleScanChange} defaultValue={selectedScan?.id}>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Select a scan date" />
                            </SelectTrigger>
                            <SelectContent>
                                {scans.map(scan => (
                                    <SelectItem key={scan.id} value={scan.id}>
                                        {new Date(scan.date.seconds * 1000).toLocaleString()} - {scan.type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                    <CardTitle className="font-headline">AI Overlays</CardTitle>
                    <CardDescription>Toggle AI-generated insights on the model.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                        <Activity className="text-primary"/>
                        <Label htmlFor="heatmap-toggle" className="flex-1">Neural Activity Heatmap</Label>
                        <Switch id="heatmap-toggle" checked={showHeatmap} onCheckedChange={setShowHeatmap} />
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                        <Dna className="text-accent"/>
                        <Label htmlFor="stress-toggle" className="flex-1">Stress & Anxiety Zones</Label>
                        <Switch id="stress-toggle" checked={showStressZones} onCheckedChange={setShowStressZones} />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Bot /> AI Analysis & Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedScan ? (
                        <div className="space-y-4 text-sm">
                            <div>
                                <h4 className="font-semibold">Scan Type</h4>
                                <p className="text-muted-foreground">{selectedScan.type}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Key Findings</h4>
                                <ul className="list-disc list-inside text-muted-foreground">
                                    {selectedScan.findings.map((finding, i) => <li key={i}>{finding}</li>)}
                                </ul>
                            </div>
                             <div>
                                <h4 className="font-semibold">Doctor's Notes</h4>
                                <p className="text-muted-foreground italic">"{selectedScan.doctorNotes}"</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center">No scan selected.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

function ScannerSkeleton() {
    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <Skeleton className="h-9 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Skeleton className="h-[600px] w-full" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    );
}
