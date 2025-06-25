
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { PatientProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function PatientDirectoryPage() {
    const { user, userProfile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState<PatientProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user && userProfile?.role === 'doctor') {
            const fetchPatients = async () => {
                setLoading(true);
                // In a real app, you'd likely fetch based on an array of patient UIDs in the doctor's profile.
                // For this prototype, we fetch all patients.
                const patientsQuery = query(collection(db, 'users'), where('role', '==', 'patient'));
                const patientsSnap = await getDocs(patientsQuery);
                const patientList = patientsSnap.docs.map(doc => doc.data() as PatientProfile);
                setPatients(patientList);
                setLoading(false);
            };
            fetchPatients();
        }
    }, [user, userProfile]);

    const filteredPatients = patients.filter(p => 
        p.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Patient Directory</h1>
                    <p className="text-muted-foreground">Search and manage all assigned patients.</p>
                </div>
                <Button disabled><UserPlus className="mr-2"/> Add New Patient</Button>
            </div>
            
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search by name or email..." 
                    className="pl-10 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(8)].map((_, i) => <PatientCardSkeleton key={i} />)}
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredPatients.map(patient => (
                        <PatientCard key={patient.uid} patient={patient} />
                    ))}
                </div>
            )}
        </div>
    );
}

function PatientCard({ patient }: { patient: PatientProfile }) {
    const riskScore = patient.patientData.riskScore;
    const riskColor = riskScore > 70 ? 'bg-destructive' : riskScore > 50 ? 'bg-orange-500' : 'bg-green-500';
    return (
        <Card className="flex flex-col group transition-all hover:shadow-lg hover:border-primary/50">
            <CardHeader className="flex-row gap-4 items-center">
                 <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://placehold.co/80x80/9467d4/2e2539?text=${patient.displayName?.charAt(0)}`} />
                    <AvatarFallback>{patient.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-lg">{patient.displayName}</CardTitle>
                    <CardDescription>{patient.email}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Condition</p>
                    <Badge variant="secondary">{patient.patientData.condition}</Badge>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-semibold text-muted-foreground">Risk Score</p>
                        <p className={cn("text-sm font-bold", riskScore > 70 ? 'text-destructive' : riskScore > 50 ? 'text-orange-500' : 'text-green-500')}>{riskScore}</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                        <div className={cn("h-2 rounded-full", riskColor)} style={{ width: `${riskScore}%` }} />
                    </div>
                </div>
            </CardContent>
            <CardContent>
                <Button className="w-full group-hover:bg-primary" variant="outline" asChild>
                    <Link href="#">View Record <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1"/></Link>
                </Button>
            </CardContent>
        </Card>
    );
}


function PatientCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex-row gap-4 items-center">
                 <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-40" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-2 w-full" />
                </div>
            </CardContent>
             <CardContent>
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );
}

