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
import { Shield, Lock, Unlock, Eye, ListCollapse, UserX } from 'lucide-react';
import { accessLogs } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function PrivacyConsole() {
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
                        <Switch id="therapymode" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="research" className="font-semibold">Anonymized Research</Label>
                            <p className="text-xs text-muted-foreground">Contribute anonymized data to neuroscience research.</p>
                        </div>
                        <Switch id="research" />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="doctor-access" className="font-semibold">Dr. Anya Sharma Access</Label>
                            <p className="text-xs text-muted-foreground">Primary neurospecialist.</p>
                        </div>
                        <Switch id="doctor-access" defaultChecked />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline">
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
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accessLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{log.viewer}</TableCell>
                                    <TableCell>{log.action}</TableCell>
                                    <TableCell>{log.date}</TableCell>
                                    <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
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
                 <Button className="w-full">
                    <Unlock className="w-4 h-4 mr-2" />
                    Configure New Lock
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
