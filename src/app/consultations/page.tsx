
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/client';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Appointment, DoctorProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, Clock, Video } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ConsultationsPage() {
    const { user, loading: authLoading } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchAppointments = async () => {
                setLoading(true);
                const apptsQuery = query(collection(db, `users/${user.uid}/appointments`), orderBy('date', 'desc'));
                const apptsSnap = await getDocs(apptsQuery);

                const apptsData = await Promise.all(apptsSnap.docs.map(async (apptDoc) => {
                    const data = apptDoc.data();
                    const doctorSnap = await getDoc(doc(db, 'users', data.doctorId));
                    return {
                        id: apptDoc.id,
                        ...data,
                        doctorName: doctorSnap.exists() ? doctorSnap.data().displayName : 'Unknown Specialist',
                        doctorAvatar: 'https://placehold.co/40x40'
                    } as Appointment;
                }));
                
                setAppointments(apptsData);
                setLoading(false);
            };
            fetchAppointments();
        }
    }, [user]);

    if (authLoading || loading) {
        return <ConsultationsSkeleton />;
    }

    const upcomingAppointments = appointments.filter(a => a.status === 'Scheduled');
    const pastAppointments = appointments.filter(a => a.status === 'Completed');

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <h1 className="text-3xl font-bold font-headline">Consultations</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    {upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map(appt => <AppointmentCard key={appt.id} appointment={appt} />)
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No upcoming appointments scheduled.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Consultation History</CardTitle>
                    <CardDescription>Review notes and transcripts from past sessions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {pastAppointments.length > 0 ? (
                        pastAppointments.map(appt => (
                            <div key={appt.id}>
                                <AppointmentCard appointment={appt} />
                                <Separator className="my-4"/>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No past consultations found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
    const appointmentDate = new Date(appointment.date.seconds * 1000);
    const isCompleted = appointment.status === 'Completed';

    return (
         <Card className="bg-muted/50">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-4">
                         <Avatar>
                            <AvatarImage src={appointment.doctorAvatar} />
                            <AvatarFallback>{appointment.doctorName?.charAt(0) ?? 'D'}</AvatarFallback>
                        </Avatar>
                        <div>
                             <p className="font-bold">{appointment.purpose}</p>
                             <p className="text-sm text-muted-foreground">with {appointment.doctorName}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/>{appointmentDate.toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/>{appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <Badge variant={isCompleted ? "secondary" : "default"}>{appointment.status}</Badge>
                     </div>
                </div>
                 <div className="w-full md:w-auto flex flex-col gap-2 shrink-0">
                    {isCompleted ? (
                        <Button variant="outline" disabled>View Transcript</Button>
                    ) : (
                        <Button disabled><Video className="mr-2"/>Join Live NeuroCall</Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function ConsultationsSkeleton() {
    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
}
