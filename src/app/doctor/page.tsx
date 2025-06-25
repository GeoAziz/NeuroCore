import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BrainModel } from '@/components/shared/brain-model';
import { EegChart } from '@/components/charts/eeg-chart';
import { Search, Send, FileText, BrainCircuit, User, Bell } from 'lucide-react';
import { sessionLogs } from '@/lib/data';
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

export default function DoctorView() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search patient ID or name..." className="pl-9" />
            </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-accent animate-ping"></span>
          </Button>
          <div className="flex items-center gap-2">
            <Avatar>
                <AvatarImage src="https://placehold.co/40x40" />
                <AvatarFallback>DR</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-sm font-medium">Dr. Anya Sharma</p>
                <p className="text-xs text-muted-foreground">Neurospecialist</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="font-headline">Patient Mind Map: John Doe</CardTitle>
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
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">
                <span className="font-semibold text-accent">Anxiety trending high.</span> Mild dissociation patterns detected post-Dream Sim session. Recommend follow-up with Calm Room therapy.
              </p>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2">
                 <Button className="w-full">
                    <Send className="mr-2 h-4 w-4" /> Send to Zizo_MediAI
                 </Button>
                 <p className="text-xs text-muted-foreground text-center w-full">Last accessed by Dr. Chan at 13:02</p>
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
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
               <Button variant="link" className="w-full mt-2">View All Logs</Button>
            </CardContent>
             <CardFooter className="flex-col gap-2">
                <Button className="w-full">Create New Diagnosis</Button>
                <Button variant="outline" className="w-full">Write Notes to Chain</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
