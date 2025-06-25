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
import { adminAccessLogs, therapyContent } from '@/lib/data';
import { Search, UserPlus, Upload, ShieldAlert, Link2 } from 'lucide-react';

export default function AdminConsole() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Admin Console</h1>
        <div className="flex items-center gap-4">
             <Button>
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
                            <Input placeholder="Search logs by user or action..." className="pl-9" />
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className='text-right'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {adminAccessLogs.map(log => (
                                <TableRow key={log.id} className={log.status === 'Violation' ? 'bg-destructive/20' : ''}>
                                    <TableCell className="font-medium">{log.user}</TableCell>
                                    <TableCell>{log.timestamp}</TableCell>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell>
                                        <Badge variant={log.status === 'Violation' ? 'destructive' : 'secondary'}>{log.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {log.status === 'Violation' && <Button variant="destructive" size="sm">Suspend Access</Button>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
                    <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Content
                    </Button>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="anomalies">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><ShieldAlert className='text-destructive' /> Anomaly Reports</CardTitle>
                    <CardDescription>AI-detected abnormal system behavior and potential security threats.</CardDescription>
                </CardHeader>
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
                </CardHeader>
                <CardContent className="text-center py-20">
                     <p className="text-muted-foreground">Bridge is active. 1,204 records synced today.</p>
                     <Button variant="outline" className="mt-4">View Sync Status</Button>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
