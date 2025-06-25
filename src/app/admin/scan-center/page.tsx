
'use client';

import { useEffect, useState } from 'react';
import { collectionGroup, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { NeuralScan, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, FileSearch, Trash2, UserPlus, BrainCircuit } from 'lucide-react';
import { BrainModel } from '@/components/shared/brain-model';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type EnrichedNeuralScan = NeuralScan & { patientName: string };

export default function ScanControlCenterPage() {
    const { toast } = useToast();
    const [scans, setScans] = useState<EnrichedNeuralScan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScans = async () => {
            setLoading(true);
            try {
                // Collection group query to get all scans from all users
                const scansQuery = query(collectionGroup(db, 'neural_scans'), orderBy('date', 'desc'), limit(50));
                const scansSnapshot = await getDocs(scansQuery);
                
                const userMap = new Map<string, string>();
                const usersSnapshot = await getDocs(query(collection(db, 'users')));
                usersSnapshot.forEach(doc => {
                    const user = doc.data() as UserProfile;
                    userMap.set(user.uid, user.displayName || 'Unknown User');
                });

                const allScans = scansSnapshot.docs.map(doc => {
                    const patientId = doc.ref.parent.parent?.id;
                    return {
                        id: doc.id,
                        ...(doc.data() as Omit<NeuralScan, 'id'>),
                        patientName: patientId ? userMap.get(patientId) || 'Unknown Patient' : 'N/A'
                    };
                });
                
                setScans(allScans);

            } catch (error: any) {
                console.error("Error fetching scans:", error);
                 if (error.code === 'failed-precondition') {
                     toast({ 
                        title: "Action Required", 
                        description: "Firestore index needed. Please create a composite index for the 'neural_scans' collection group.", 
                        variant: "destructive",
                        duration: 10000 
                    });
                } else {
                    toast({ title: "Error", description: "Could not fetch scans.", variant: "destructive" });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchScans();
    }, [toast]);

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline text-amber-300">Scan Control Center</h1>
                    <p className="text-muted-foreground">Manage and review all neural scans across the system.</p>
                </div>
                <Button variant="destructive" disabled>
                    <Trash2 className="mr-2"/> Purge Orphaned Scans
                </Button>
            </div>

            <Card className="bg-gray-900/50 border-gray-700">
                 <CardHeader>
                    <CardTitle className="text-xl font-headline text-gray-200">Recent Scans</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="grid gap-2">
                           <Skeleton className="h-10 w-full bg-gray-800" />
                           <Skeleton className="h-10 w-full bg-gray-800" />
                           <Skeleton className="h-10 w-full bg-gray-800" />
                        </div>
                    ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-700 hover:bg-gray-800/50">
                                <TableHead className="text-gray-400">Patient</TableHead>
                                <TableHead className="text-gray-400">Scan Type</TableHead>
                                <TableHead className="text-gray-400">Date</TableHead>
                                <TableHead className="text-gray-400">AI Status</TableHead>
                                <TableHead className="text-gray-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {scans.map(scan => (
                                <TableRow key={scan.id} className="border-gray-800 hover:bg-gray-800/50">
                                    <TableCell className="font-medium text-gray-300">{scan.patientName}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-gray-600 text-gray-300">{scan.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-400">{new Date(scan.date.seconds * 1000).toLocaleString()}</TableCell>
                                    <TableCell>
                                         <Badge className="bg-green-900/50 border-green-500/30 text-green-300">Success</Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                         <Dialog>
                                            <DialogTrigger asChild>
                                                 <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-800 hover:text-white">
                                                    <Brain className="mr-2"/> Preview
                                                 </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-gray-200">
                                                <DialogHeader>
                                                    <DialogTitle className="font-headline text-amber-300">Scan Preview: {scan.patientName}</DialogTitle>
                                                    <DialogDescription className="text-gray-400">{new Date(scan.date.seconds * 1000).toLocaleString()}</DialogDescription>
                                                </DialogHeader>
                                                <div className="h-96 w-full rounded-lg my-4">
                                                    <BrainModel isInteractive={false} showHeatmap={true} />
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <Button variant="outline" size="sm" className="border-amber-300/50 text-amber-300 hover:bg-amber-300/10" disabled>
                                            <BrainCircuit className="mr-2"/> Force Analyze
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

