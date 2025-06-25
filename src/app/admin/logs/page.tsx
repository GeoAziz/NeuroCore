
'use client';

import { useEffect, useState } from 'react';
import { collectionGroup, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { AccessLog, UserProfile } from '@/lib/types';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, AlertCircle } from 'lucide-react';

type EnrichedAccessLog = AccessLog & { patientName: string };

export default function LogsAnalyticsPage() {
    const { toast } = useToast();
    const [accessLogs, setAccessLogs] = useState<EnrichedAccessLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                // This is a collection group query, it requires an index in Firestore.
                const logsQuery = query(collectionGroup(db, 'accessLogs'), orderBy('date', 'desc'), limit(100));
                const logsSnapshot = await getDocs(logsQuery);
                const allLogs: EnrichedAccessLog[] = [];

                // To avoid N+1 reads for patient names, fetch all patients first.
                const usersSnapshot = await getDocs(query(collection(db, 'users')));
                const userMap = new Map<string, string>();
                usersSnapshot.forEach(doc => {
                    const user = doc.data() as UserProfile;
                    userMap.set(user.uid, user.displayName || 'Unknown User');
                });
                
                logsSnapshot.forEach(logDoc => {
                    const logData = logDoc.data() as AccessLog;
                    const patientId = logDoc.ref.parent.parent?.id; // Get the user ID from the path
                    allLogs.push({
                        ...logData,
                        id: logDoc.id,
                        patientName: patientId ? userMap.get(patientId) || 'Unknown Patient' : 'N/A',
                    });
                });
                setAccessLogs(allLogs);
            } catch (error: any) {
                console.error("Error fetching access logs:", error);
                if (error.code === 'failed-precondition') {
                     toast({ 
                        title: "Action Required", 
                        description: "Firestore index needed for this query. Please create a composite index for the 'accessLogs' collection group.", 
                        variant: "destructive",
                        duration: 10000 
                    });
                } else {
                    toast({ title: "Error", description: "Could not fetch access logs.", variant: "destructive" });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [toast]);

    const filteredLogs = accessLogs.filter(log =>
        log.viewer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-bold font-headline text-amber-300">Logs & Analytics</h1>
      
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader className="flex-row items-center justify-between">
            <div>
                <CardTitle className="text-xl font-headline text-gray-200">System Access Audit</CardTitle>
                <CardDescription className="text-gray-400">Monitor all data access events across the platform.</CardDescription>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Search logs..." 
                        className="pl-9 bg-gray-900 border-gray-600 text-gray-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="border-amber-300/50 text-amber-300 hover:bg-amber-300/10 hover:text-amber-200">
                    <Download className="mr-2"/> Export CSV
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            {loading ? (
                 <div className="grid gap-2">
                   <Skeleton className="h-10 w-full bg-gray-800" />
                   <Skeleton className="h-10 w-full bg-gray-800" />
                   <Skeleton className="h-10 w-full bg-gray-800" />
                   <Skeleton className="h-10 w-full bg-gray-800" />
                </div>
            ) : (
             <Table>
                <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-800/50">
                        <TableHead className="text-gray-400">Actor</TableHead>
                        <TableHead className="text-gray-400">Target Patient</TableHead>
                        <TableHead className="text-gray-400">Action</TableHead>
                        <TableHead className="text-gray-400">Timestamp</TableHead>
                        <TableHead className="text-gray-400 text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredLogs.map(log => (
                         <TableRow key={log.id} className={`border-gray-800 hover:bg-gray-800/50 ${log.status === 'Violation' ? 'bg-red-900/20' : ''}`}>
                            <TableCell className="font-medium text-gray-300">{log.viewer}</TableCell>
                            <TableCell className="text-gray-400">{log.patientName}</TableCell>
                            <TableCell className="text-gray-400">{log.action}</TableCell>
                            <TableCell className="text-gray-400 font-mono text-xs">{log.date}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={log.status === 'Violation' ? 'destructive' : 'secondary'} className={log.status === 'Violation' ? 'bg-red-500/10 border-red-500/30 text-red-300' : 'bg-green-500/10 border-green-500/30 text-green-300'}>
                                    {log.status === 'Violation' && <AlertCircle className="w-3 h-3 mr-1"/>}
                                    {log.status}
                                </Badge>
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
