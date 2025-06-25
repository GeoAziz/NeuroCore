
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query } from 'firebase/firestore';
import type { TherapyModule } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, PauseCircle, PlayCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function TherapyHubPage() {
    const { user, loading: authLoading } = useAuth();
    const [modules, setModules] = useState<TherapyModule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchModules = async () => {
                setLoading(true);
                const modulesQuery = query(collection(db, `users/${user.uid}/therapy_modules`));
                const modulesSnap = await getDocs(modulesQuery);
                const modulesData = modulesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TherapyModule));
                setModules(modulesData);
                setLoading(false);
            };
            fetchModules();
        }
    }, [user]);

    if (authLoading || loading) {
        return <TherapyHubSkeleton />;
    }

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <h1 className="text-3xl font-bold font-headline">Therapy Hub</h1>
            <p className="text-muted-foreground">Your personalized neural therapy programs. Start a session to continue your progress.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map(module => (
                    <ModuleCard key={module.id} module={module} />
                ))}
            </div>
        </div>
    );
}

function ModuleCard({ module }: { module: TherapyModule }) {
    const Icon = module.status === 'Completed' ? CheckCircle : module.status === 'In Progress' ? PauseCircle : PlayCircle;
    
    return (
        <Card className="flex flex-col overflow-hidden group hover:shadow-primary/20 hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-48 w-full">
                <Image src={module.image} alt={module.name} layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform duration-300" data-ai-hint={module.data_ai_hint} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <Badge variant="secondary" className="absolute top-2 right-2">{module.type}</Badge>
            </div>
            <CardHeader>
                <CardTitle>{module.name}</CardTitle>
                <CardDescription className="h-10">{module.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
                <div>
                    <div className="flex justify-between items-center mb-2 text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span>{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} />
                </div>
            </CardContent>
            <div className="p-4 bg-muted/30 border-t">
                 <Button className="w-full" disabled={module.status === 'Completed'}>
                    <Icon className="mr-2"/>
                    {module.status === 'Completed' ? 'Completed' : 'Start Session'}
                </Button>
            </div>
        </Card>
    );
}

function TherapyHubSkeleton() {
    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
            </div>
        </div>
    );
}
