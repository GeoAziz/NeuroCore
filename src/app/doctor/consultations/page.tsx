
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, Video, Check } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

// Mock Data
const mockAppointments = [
    { id: 1, patientName: 'John Doe', time: '10:00 AM', purpose: 'Cognitive Review', status: 'Scheduled' },
    { id: 2, patientName: 'Jane Smith', time: '02:00 PM', purpose: 'Therapy Follow-up', status: 'Scheduled' },
    { id: 3, patientName: 'John Doe', time: '04:00 PM', purpose: 'Scan Results', status: 'Completed' },
];

export default function ConsultationsPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Live Consultations</h1>
                    <p className="text-muted-foreground">Manage your appointment schedule and join calls.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Sessions for {date?.toLocaleDateString()}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mockAppointments.map(appt => (
                                <Card key={appt.id} className="bg-muted/50">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={`https://placehold.co/80x80/9467d4/2e2539?text=${appt.patientName?.charAt(0)}`} />
                                            <AvatarFallback>{appt.patientName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-bold">{appt.patientName}</p>
                                            <p className="text-sm text-muted-foreground">{appt.purpose}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4"/>{appt.time}</p>
                                            <Badge variant={appt.status === 'Completed' ? 'secondary' : 'default'} className="mt-1">
                                                {appt.status === 'Completed' && <Check className="w-3 h-3 mr-1"/>}
                                                {appt.status}
                                            </Badge>
                                        </div>
                                        <Button disabled={appt.status === 'Completed'}>
                                            <Video className="mr-2"/> Join NeuroCall
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
