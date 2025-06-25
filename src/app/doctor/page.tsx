
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import type { Alert, Appointment, NeuralScan, PatientProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Beaker, User, ShieldAlert, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { BrainModel } from '@/components/shared/brain-model';

export default function DoctorDashboard() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentScans, setRecentScans] = useState<(NeuralScan & {patientName: string})[]>([]);

  useEffect(() => {
    if (user && userProfile?.role === 'doctor' && userProfile.patients) {
      const fetchData = async () => {
        setLoading(true);
        // Fetch Alerts for this doctor
        const alertsQuery = query(collection(db, 'alerts'), where('doctorId', '==', user.uid), orderBy('timestamp', 'desc'), limit(5));
        const alertsSnap = await getDocs(alertsQuery);
        setAlerts(alertsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert)));

        // Fetch Today's Appointments for assigned patients
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        const appointmentPromises = userProfile.patients.map(async (patientId) => {
            const patientDoc = await getDoc(doc(db, 'users', patientId));
            const patientName = patientDoc.exists() ? patientDoc.data().displayName : 'Unknown Patient';

            const apptsQuery = query(
                collection(db, `users/${patientId}/appointments`),
                where('date', '>=', todayStart),
                where('date', '<=', todayEnd),
                orderBy('date', 'asc')
            );
            const apptsSnap = await getDocs(apptsQuery);
            return apptsSnap.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<Appointment, 'id'>),
                patientName, // Add patient name
            }));
        });

        const allAppointmentsNested = await Promise.all(appointmentPromises);
        const allAppointmentsFlat = allAppointmentsNested.flat().sort((a, b) => a.date.seconds - b.date.seconds);
        setAppointments(allAppointmentsFlat as Appointment[]);


        // Fetch Recent Scans from assigned patients
        const scanPromises = userProfile.patients.map(async (patientId) => {
            const patientDoc = await getDoc(doc(db, 'users', patientId));
            const patientName = patientDoc.exists() ? patientDoc.data().displayName : 'Unknown Patient';

            const scansQuery = query(collection(db, `users/${patientId}/neural_scans`), orderBy('date', 'desc'), limit(1));
            const scanSnap = await getDocs(scansQuery);
            if (!scanSnap.empty) {
                return {
                    ...scanSnap.docs[0].data(),
                    id: scanSnap.docs[0].id,
                    patientName,
                } as NeuralScan & {patientName: string};
            }
            return null;
        });

        const allScans = (await Promise.all(scanPromises)).filter(scan => scan !== null);
        setRecentScans(allScans as (NeuralScan & {patientName: string})[]);


        setLoading(false);
      };
      fetchData();
    } else if (user && userProfile) {
        // Not a doctor or no patients assigned
        setLoading(false);
    }
  }, [user, userProfile]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-bold font-headline">Doctor Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Alerts Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-destructive"/> Alerts</CardTitle>
              <CardDescription>Recent AI flags and patient updates.</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex items-start gap-3">
                        <div className={`mt-1 h-2 w-2 rounded-full ${alert.status === 'New' ? 'bg-destructive animate-pulse' : 'bg-muted'}`} />
                        <div>
                            <p className="text-sm font-semibold">{alert.patientName}: <span className="font-normal">{alert.message}</span></p>
                            <p className="text-xs text-muted-foreground">{new Date(alert.timestamp.seconds * 1000).toLocaleString()}</p>
                        </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No new alerts.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Appointments Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar /> Today's Appointments</CardTitle>
              <CardDescription>Your schedule for today.</CardDescription>
            </CardHeader>
            <CardContent>
               {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map(appt => (
                     <div key={appt.id} className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={`https://placehold.co/40x40/9467d4/2e2539?text=${appt.patientName?.charAt(0)}`} />
                            <AvatarFallback>{appt.patientName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-semibold">{appt.patientName}</p>
                            <p className="text-sm text-muted-foreground">{new Date(appt.date.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {appt.purpose}</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild><Link href="/doctor/consultations">Join</Link></Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No appointments scheduled for today.</p>
              )}
            </CardContent>
             <CardContent>
                <Button className="w-full" asChild>
                    <Link href="/doctor/consultations">View Full Calendar <ArrowRight className="ml-2"/></Link>
                </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Lab Feed Column */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Beaker /> Quick Lab Feed</CardTitle>
                    <CardDescription>Recently uploaded patient scans.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {recentScans.slice(0, 2).map(scan => (
                        <Link href="/doctor/brain-scan-lab" key={scan.id} className="block p-3 rounded-lg hover:bg-muted transition-colors">
                            <div className="flex gap-4">
                                <div className="w-24 h-24 rounded-md overflow-hidden shrink-0">
                                    <BrainModel isInteractive={false} />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold">{scan.patientName}</p>
                                    <p className="text-sm text-muted-foreground">{scan.type} Scan</p>
                                    <p className="text-xs text-muted-foreground">{new Date(scan.date.seconds * 1000).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                    <Button variant="secondary" className="w-full" asChild>
                        <Link href="/doctor/brain-scan-lab">Go to BrainScan Lab</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}


function DashboardSkeleton() {
    return (
    <div className="flex-1 space-y-6 p-4 md:p-6 animate-pulse">
      <Skeleton className="h-9 w-72" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><Skeleton className="h-6 w-24" /><Skeleton className="h-4 w-48 mt-2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32 mt-2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full mt-4" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-48 mt-2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
    )
}
