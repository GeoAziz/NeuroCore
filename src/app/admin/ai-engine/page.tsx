
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, Cpu, CheckCircle, AlertTriangle, GitBranch, ArrowUpRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const aiModules = [
    { name: 'Scan Analysis v2.1', version: '2.1.3', accuracy: 98.7, status: 'Running' as const, type: 'Core' },
    { name: 'Cognitive Prediction', version: '1.8.0', accuracy: 94.2, status: 'Running' as const, type: 'Core' },
    { name: 'Therapy Matching', version: '1.5.4', accuracy: 96.5, status: 'Running' as const, type: 'Core' },
    { name: 'Red Flag Detector (Beta)', version: '0.5.1', accuracy: 91.0, status: 'Idle' as const, type: 'Experimental' },
];

const feedbackLogs = [
    { id: 'F001', doctor: 'Dr. Anya Sharma', aiSuggestion: 'Elevated amygdala activity.', feedback: 'Accepted' as const, timestamp: '2023-10-28 14:30' },
    { id: 'F002', doctor: 'Dr. Anya Sharma', aiSuggestion: 'Potential for sleep disruption.', feedback: 'Accepted' as const, timestamp: '2023-10-28 11:00' },
    { id: 'F003', doctor: 'Dr. Evelyn Reed', aiSuggestion: 'Reduced prefrontal cortex flow.', feedback: 'Rejected' as const, timestamp: '2023-10-27 09:15' },
    { id: 'F004', doctor: 'Dr. Kenji Tanaka', aiSuggestion: 'Irregular alpha wave patterns.', feedback: 'Accepted' as const, timestamp: '2023-10-26 18:00' },
];

export default function AiEnginePage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-amber-300">AI Engine Insights</h1>
          <p className="text-muted-foreground">Monitor, manage, and deploy NeuroCore AI models.</p>
        </div>
        <Button variant="outline" className="border-amber-300/50 text-amber-300 hover:bg-amber-300/10 hover:text-amber-200">
            <GitBranch className="mr-2"/> Deploy New AI Model
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiModules.map(module => (
            <Card key={module.name} className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <CardTitle className="text-lg font-headline text-gray-200">{module.name}</CardTitle>
                         <Badge variant={module.type === 'Core' ? 'secondary' : 'destructive'} className="bg-gray-800 border-gray-600 text-gray-300">{module.type}</Badge>
                    </div>
                    <CardDescription className="text-gray-400">Version {module.version}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-baseline justify-between">
                         <span className="text-sm text-gray-400">Accuracy</span>
                         <span className="text-2xl font-bold text-amber-300">{module.accuracy}%</span>
                    </div>
                     <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-400">Status</span>
                         <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${module.status === 'Running' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                             <span className="text-gray-300">{module.status}</span>
                         </div>
                    </div>
                    <Button variant="ghost" className="w-full justify-center text-gray-300 hover:bg-gray-800 hover:text-white">
                        <Cpu className="mr-2"/> View Performance
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>

      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
            <CardTitle className="text-xl font-headline text-gray-200">Doctor Feedback on AI Suggestions</CardTitle>
            <CardDescription className="text-gray-400">Review how doctors are interacting with AI-generated insights.</CardDescription>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-800/50">
                        <TableHead className="text-gray-400">Doctor</TableHead>
                        <TableHead className="text-gray-400">AI Suggestion</TableHead>
                        <TableHead className="text-gray-400">Timestamp</TableHead>
                        <TableHead className="text-gray-400 text-right">Feedback</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {feedbackLogs.map(log => (
                        <TableRow key={log.id} className="border-gray-800 hover:bg-gray-800/50">
                            <TableCell className="font-medium text-gray-300">{log.doctor}</TableCell>
                            <TableCell className="text-gray-400 italic">"{log.aiSuggestion}"</TableCell>
                            <TableCell className="text-gray-400">{log.timestamp}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={log.feedback === 'Accepted' ? 'secondary' : 'destructive'} className={log.feedback === 'Accepted' ? 'bg-green-900/50 border-green-500/30 text-green-300' : 'bg-red-900/50 border-red-500/30 text-red-300'}>
                                    {log.feedback === 'Accepted' ? <CheckCircle className="mr-1.5"/> : <AlertTriangle className="mr-1.5"/>}
                                    {log.feedback}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
