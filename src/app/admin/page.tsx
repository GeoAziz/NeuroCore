'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, UserPlus, Upload, ShieldAlert, Link2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { AccessLog, TherapyContent, UserProfile } from '@/lib/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


const addDoctorSchema = z.object({
    displayName: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AddDoctorFormValues = z.infer<typeof addDoctorSchema>;

export default function AdminConsole() {
    const { toast } = useToast();
    const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
    const [therapyContent, setTherapyContent] = useState<TherapyContent[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [loadingContent, setLoadingContent] = useState(true);
    const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);

    const form = useForm<AddDoctorFormValues>({
        resolver: zodResolver(addDoctorSchema),
        defaultValues: {
            displayName: '',
            email: '',
            password: '',
        },
    });
    
    const onAddDoctorSubmit = (data: AddDoctorFormValues) => {
        // In a real application, this would call a secure backend function (e.g., a Cloud Function)
        // that uses the Firebase Admin SDK to create a new user and set their role.
        // We are simulating this for the prototype.
        console.log('New Doctor Data:', data);
        toast({
            title: 'Action Required',
            description: 'Creating users requires a secure backend. This functionality is for demonstration. Check the console for the submitted data.',
            duration: 5000
        });
        setIsAddDoctorOpen(false);
        form.reset();
    };

    useEffect(() => {
        const fetchAccessLogs = async () => {
            setLoadingLogs(true);
            try {
                const usersSnapshot = await getDocs(query(collection(db, 'users'), where('role', '==', 'patient')));
                const allLogs: AccessLog[] = [];
                for (const userDoc of usersSnapshot.docs) {
                    const patient = userDoc.data() as UserProfile;
                    const logsSnapshot = await getDocs(collection(db, `users/${patient.uid}/accessLogs`));
                    logsSnapshot.forEach(logDoc => {
                        allLogs.push({ 
                            ...(logDoc.data() as Omit<AccessLog, 'id'>), 
                            id: logDoc.id, 
                            patientName: patient.displayName || 'Unknown Patient' 
                        });
                    });
                }
                setAccessLogs(allLogs);
            } catch (error) {
                console.error("Error fetching access logs:", error);
                toast({ title: "Error", description: "Could not fetch access logs.", variant: "destructive" });
            } finally {
                setLoadingLogs(false);
            }
        };

        const fetchTherapyContent = async () => {
            setLoadingContent(true);
            try {
                const contentSnapshot = await getDocs(collection(db, 'therapyContent'));
                const contentList = contentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TherapyContent));
                setTherapyContent(contentList);
            } catch (error) {
                console.error("Error fetching therapy content:", error);
                toast({ title: "Error", description: "Could not fetch therapy content.", variant: "destructive" });
            } finally {
                setLoadingContent(false);
            }
        };

        fetchAccessLogs();
        fetchTherapyContent();
    }, [toast]);

  return (
    <>
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Admin Console</h1>
        <div className="flex items-center gap-4">
             <Button onClick={() => setIsAddDoctorOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2"/>
                Add New Doctor
             </Button>
        </div>
      </div>
      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="logs">Doctor Access Logs</TabsTrigger>
          <TabsTrigger value="content">Therapy Content Manager</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Reports</TabsTrigger>
          <TabsTrigger value="bridge">MediChain Bridge</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
            <Card>
                <CardHeader>
                    <CardTitle>Doctor Access Logs</CardTitle>
                    <CardDescription>Monitor who viewed what mind data, and when.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                         <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search logs by user or action..." className="pl-9" disabled />
                        </div>
                    </div>
                    {loadingLogs ? (
                        <div className="grid gap-2">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className='text-right'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accessLogs.map(log => (
                                <TableRow key={log.id} className={log.status === 'Violation' ? 'bg-destructive/20' : ''}>
                                    <TableCell className="font-medium">{log.viewer}</TableCell>
                                    <TableCell>{log.patientName}</TableCell>
                                    <TableCell>{log.date}</TableCell>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell>
                                        <Badge variant={log.status === 'Violation' ? 'destructive' : 'secondary'}>{log.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {log.status === 'Violation' && <Button variant="destructive" size="sm" disabled>Suspend Access</Button>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="content">
             <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Therapy Content Manager</CardTitle>
                        <CardDescription>Upload new soundtracks, games, or VR sims.</CardDescription>
                    </div>
                    <Button disabled>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Content
                    </Button>
                </CardHeader>
                <CardContent>
                    {loadingContent ? (
                         <div className="grid gap-2">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Date Added</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {therapyContent.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{item.added}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="anomalies">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><ShieldAlert className='text-destructive' /> Anomaly Reports</CardTitle>
                    <CardDescription>AI-detected abnormal system behavior and potential security threats.</CardDescription>
                </Header>
                <CardContent className="text-center py-20">
                    <p className="text-muted-foreground">No anomalies detected in the last 24 hours.</p>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="bridge">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Link2 /> MediChain Record Bridge</CardTitle>
                    <CardDescription>Shows what data is synced from/to Zizo_MediChain.</CardDescription>
                </Header>
                <CardContent className="text-center py-20">
                     <p className="text-muted-foreground">Bridge is active. 1,204 records synced today.</p>
                     <Button variant="outline" className="mt-4">View Sync Status</Button>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>

    <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Doctor</DialogTitle>
                <DialogDescription>
                    Create a new doctor account. They will be sent an invitation to set up their profile.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onAddDoctorSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Dr. Anya Sharma" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="doctor@neurocore.dev" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Temporary Password</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Doctor
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
    </>
  );
}
