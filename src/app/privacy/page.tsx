'use client';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Unlock, Eye, ListCollapse, UserX, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, updateDoc, collection, getDocs, query } from 'firebase/firestore';
import type { PrivacySettings, AccessLog } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


export default function PrivacyConsole() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [settings, setSettings] = useState<PrivacySettings | null>(null);
    const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        };

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch privacy settings once
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setSettings(userDocSnap.data().privacySettings as PrivacySettings);
                } else {
                    setSettings(null);
                }

                // Fetch access logs once
                const logsQuery = query(collection(db, `users/${user.uid}/accessLogs`));
                const logsSnapshot = await getDocs(logsQuery);
                const logsData = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccessLog));
                setAccessLogs(logsData);
            } catch (error) {
                console.error("Error fetching privacy data:", error);
                toast({ title: "Error", description: "Could not load privacy data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();

    }, [user, toast]);

    const handleSettingChange = async (key: keyof PrivacySettings, value: boolean) => {
        if (!user || !settings) return;

        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings); // Optimistic update

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                [`privacySettings.${key}`]: value
            });
            toast({ title: 'Success', description: 'Privacy setting updated.' });
        } catch (error) {
            console.error("Error updating setting:", error);
            setSettings(settings); // Revert on error
            toast({ title: 'Error', description: 'Failed to update setting.', variant: 'destructive' });
        }
    };
    
    if (loading) {
        return (
             <div className="flex-1 space-y-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-9 w-96" />
                    <Skeleton className="h-9 w-40" />
                </div>
                 <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-80 w-full" />
                        <Skeleton className="h-96 w-full" />
                    </div>
                     <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
       <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Privacy & MindLock Console</h1>
        <Badge variant="destructive" className="text-base animate-pulse">
            <Shield className="w-4 h-4 mr-2"/>
            MindLock Active
        </Badge>
       </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Access Controls</CardTitle>
                    <CardDescription>Manage who can view your mental data and under what circumstances.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="therapymode" className="font-semibold">Live Therapy Mode</Label>
                            <p className="text-xs text-muted-foreground">Allow live mental data streaming during sessions.</p>
                        </div>
                        <Switch id="therapymode" checked={settings?.liveTherapyMode} onCheckedChange={(checked) => handleSettingChange('liveTherapyMode', checked)} />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="research" className="font-semibold">Anonymized Research</Label>
                            <p className="text-xs text-muted-foreground">Contribute anonymized data to neuroscience research.</p>
                        </div>
                        <Switch id="research" checked={settings?.anonymizedResearch} onCheckedChange={(checked) => handleSettingChange('anonymizedResearch', checked)} />
                    </div>
                     {settings?.doctorAccess && Object.keys(settings.doctorAccess).map(doctorId => (
                         <div key={doctorId} className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor={`doctor-access-${doctorId}`} className="font-semibold">Doctor Access</Label>
                                <p className="text-xs text-muted-foreground">Allow access for primary neurospecialist.</p>
                            </div>
                            <Switch id={`doctor-access-${doctorId}`} checked={settings.doctorAccess[doctorId]} disabled />
                        </div>
                     ))}
                </CardContent>
                <CardFooter>
                    <Button variant="outline" disabled>
                        <ListCollapse className="w-4 h-4 mr-2" />
                        Manage All Permissions
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Shared Sessions Log</CardTitle>
                    <CardDescription>Record of who has accessed your mental data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Viewer</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accessLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{log.viewer}</TableCell>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell>{log.date}</TableCell>
                                    <TableCell>
                                         <Badge variant={log.status === 'Violation' ? 'destructive' : 'secondary'}>{log.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive-foreground hover:bg-destructive" disabled>
                                        <UserX className="w-4 h-4 mr-2" />
                                        Revoke
                                    </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <Card className="h-fit">
            <CardHeader>
                 <CardTitle className="font-headline flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Emotional Unlock
                </CardTitle>
                <CardDescription>
                    Create a custom "MindLock" that only allows data access when a specific emotional state is detected.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label>Unlock Trigger</Label>
                    <p className="text-sm text-muted-foreground">Data is locked. Access will be granted if AI detects a 'panic' state.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="text-2xl">😢</Button>
                    <Button variant="outline" className="text-2xl">😱</Button>
                    <Button variant="secondary" className="text-2xl">😰</Button>
                    <Button variant="outline" className="text-2xl">😥</Button>
                </div>
                 <div>
                    <Label>Target Data</Label>
                    <p className="text-sm text-muted-foreground">Trauma files, past session logs.</p>
                </div>
                 <div>
                    <Label>Expiration</Label>
                    <p className="text-sm text-muted-foreground">Lock auto-renews every 24 hours.</p>
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" disabled>
                    <Unlock className="w-4 h-4 mr-2" />
                    Configure New Lock
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
