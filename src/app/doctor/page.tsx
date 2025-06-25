
'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainModel } from '@/components/shared/brain-model';
import { EegChart } from '@/components/charts/eeg-chart';
import { Wand2, Send, FileText, BrainCircuit, User, Bell, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useAuth } from '@/context/auth-context';
import type { UserProfile, PatientProfile, SessionLog } from '@/lib/types';
import { generateAiNotesSummary } from '@/ai/flows/generate-ai-notes-summary';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function DoctorView() {
  const { userProfile: doctorProfile } = useAuth();
  const { toast } = useToast();

  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingPatientDetails, setLoadingPatientDetails] = useState(false);
  const [isSummaryPending, startSummaryTransition] = useTransition();

  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'patient'));
        const querySnapshot = await getDocs(q);
        const patientList = querySnapshot.docs.map(doc => doc.data() as PatientProfile);
        setPatients(patientList);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast({ title: 'Error', description: 'Could not fetch patient list.', variant: 'destructive' });
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, [toast]);

  useEffect(() => {
    if (!selectedPatientId) return;

    const fetchPatientDetails = async () => {
      setLoadingPatientDetails(true);
      setAiSummary(''); // Reset summary when patient changes
      try {
        const patientDocRef = doc(db, 'users', selectedPatientId);
        const patientDocSnap = await getDoc(patientDocRef);
        if (patientDocSnap.exists() && patientDocSnap.data().role === 'patient') {
          setSelectedPatient(patientDocSnap.data() as PatientProfile);
        }

        const logsQuery = query(collection(db, `users/${selectedPatientId}/sessionLogs`));
        const logsSnapshot = await getDocs(logsQuery);
        const logsData = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SessionLog));
        setSessionLogs(logsData);
      } catch (error) {
        console.error("Error fetching patient details:", error);
        toast({ title: 'Error', description: 'Could not fetch patient details.', variant: 'destructive' });
      } finally {
        setLoadingPatientDetails(false);
      }
    };
    fetchPatientDetails();
  }, [selectedPatientId, toast]);

  const handleGenerateSummary = () => {
    if (!selectedPatient) return;
    startSummaryTransition(async () => {
      const dataForSummary = {
        patientData: selectedPatient.patientData,
        sessionLogs: sessionLogs,
      };
      const { output, error } = await generateAiNotesSummary({ patientData: JSON.stringify(dataForSummary, null, 2) });
      if (error) {
        toast({ title: "AI Summary Error", description: error.message, variant: "destructive" });
      } else if (output) {
        setAiSummary(output.summary);
      }
    });
  };
  
  if (doctorProfile?.role !== 'doctor') {
    return (
       <div className="flex-1 space-y-6 p-4 md:p-6 text-center">
        <h1 className="text-3xl font-bold font-headline">Access Denied</h1>
        <p className="text-muted-foreground">This page is for doctor accounts only.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
            <Select onValueChange={setSelectedPatientId} disabled={loadingPatients}>
              <SelectTrigger>
                <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Search patient ID or name..."} />
              </SelectTrigger>
              <SelectContent>
                {patients.map(p => (
                  <SelectItem key={p.uid} value={p.uid}>
                    {p.displayName} ({p.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-accent animate-ping"></span>
          </Button>
          <div className="flex items-center gap-2">
            <Avatar>
                <AvatarImage src="https://placehold.co/40x40" />
                <AvatarFallback>{doctorProfile?.displayName?.substring(0, 2) || 'DR'}</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-sm font-medium">{doctorProfile?.displayName}</p>
                <p className="text-xs text-muted-foreground capitalize">{doctorProfile?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {!selectedPatientId ? (
        <Card className="flex flex-col items-center justify-center h-96">
            <User className="h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Please select a patient to view their details.</p>
        </Card>
      ) : loadingPatientDetails ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[480px]" />
            <Skeleton className="h-[300px]" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-96" />
          </div>
        </div>
      ) : selectedPatient && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="font-headline">Patient Mind Map: {selectedPatient.displayName}</CardTitle>
                  <CardDescription>3D neural scan with real-time activity zones.</CardDescription>
                </div>
                <Badge variant="outline">Live</Badge>
              </CardHeader>
              <CardContent className="h-[400px]">
                <BrainModel />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5" /> Waveform Feed (EEG/BCI)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <EegChart />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">AI Notes Summary</CardTitle>
                <CardDescription>Generated based on latest patient data.</CardDescription>
              </CardHeader>
              <CardContent className="min-h-24">
                {isSummaryPending ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating summary...</span>
                  </div>
                ) : aiSummary ? (
                   <p className="text-sm text-foreground">{aiSummary}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Click the button below to generate an AI summary.</p>
                )}
              </CardContent>
              <CardFooter className="flex-col items-start gap-2">
                   <Button className="w-full" onClick={handleGenerateSummary} disabled={isSummaryPending}>
                      <Wand2 className="mr-2 h-4 w-4" /> Generate Summary
                   </Button>
                   <Button className="w-full" variant="secondary" disabled>
                      <Send className="mr-2 h-4 w-4" /> Send to Zizo_MediAI
                   </Button>
              </CardFooter>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Session Log Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionLogs.slice(0, 3).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.type}</TableCell>
                        <TableCell>{log.date.split(' ')[0]}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" disabled>View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                 <Button variant="link" className="w-full mt-2" disabled>View All Logs</Button>
              </CardContent>
               <CardFooter className="flex-col gap-2">
                  <Button className="w-full" disabled>Create New Diagnosis</Button>
                  <Button variant="outline" className="w-full" disabled>Write Notes to Chain</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
