
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Stethoscope, Shield, Activity, Cpu, Database, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Mock data for dashboard widgets
const userStats = {
    patients: 124,
    doctors: 12,
    admins: 2,
};

const systemHealth = [
    { name: 'API Latency', value: '42ms', status: 'Ok' },
    { name: 'Database CPU', value: '38%', status: 'Ok' },
    { name: 'AI Model Accuracy', value: '98.7%', status: 'Ok' },
];

const anomalyFeed = [
    { id: 'ANOM-001', type: 'Scan Failure', severity: 'High', timestamp: '2 mins ago', details: 'Scan SCN-9481 for patient John Doe failed processing.'},
    { id: 'ANOM-002', type: 'Login Spike', severity: 'Medium', timestamp: '15 mins ago', details: 'Unusual login activity from new IP range.'},
    { id: 'ANOM-003', type: 'High Latency', severity: 'Low', timestamp: '1 hour ago', details: 'Cognitive test endpoint latency > 200ms.'},
];

export default function AdminDashboard() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 bg-gray-900 text-gray-200">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline text-amber-300">Admin Dashboard</h1>
            <p className="text-gray-400">System-wide overview and operational control.</p>
        </div>
      </div>
      
      {/* User Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
         <StatCard icon={Users} title="Total Patients" value={userStats.patients.toLocaleString()} />
         <StatCard icon={Stethoscope} title="Active Doctors" value={userStats.doctors.toLocaleString()} />
         <StatCard icon={Shield} title="System Admins" value={userStats.admins.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Anomaly Feed */}
        <Card className="lg:col-span-2 bg-gray-900/50 border-gray-700">
            <CardHeader className="flex-row items-center justify-between">
                 <div>
                    <CardTitle className="flex items-center gap-2 font-headline text-lg text-red-400"><AlertTriangle/> AI Anomaly Feed</CardTitle>
                    <CardDescription className="text-gray-400">Live feed of AI-detected system and data anomalies.</CardDescription>
                 </div>
                 <Link href="/admin/logs" className="text-sm text-amber-300 hover:underline flex items-center gap-1">View All Logs <ArrowRight className="w-4 h-4"/></Link>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-gray-700 hover:bg-gray-800/50">
                            <TableHead className="text-gray-400">Type</TableHead>
                            <TableHead className="text-gray-400">Details</TableHead>
                            <TableHead className="text-gray-400">Timestamp</TableHead>
                            <TableHead className="text-gray-400 text-right">Severity</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {anomalyFeed.map(item => (
                            <TableRow key={item.id} className="border-gray-800 hover:bg-gray-800/50">
                                <TableCell className="font-medium text-gray-300">{item.type}</TableCell>
                                <TableCell className="text-gray-400">{item.details}</TableCell>
                                <TableCell className="text-gray-500 text-xs">{item.timestamp}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="destructive" className={
                                        item.severity === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                        item.severity === 'Medium' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                    }>{item.severity}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {/* System Health */}
        <Card className="bg-gray-900/50 border-gray-700">
            <CardHeader>
                <CardTitle className="font-headline text-lg text-gray-200">System Health</CardTitle>
                <CardDescription className="text-gray-400">Real-time platform metrics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {systemHealth.map(metric => (
                    <div key={metric.name} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                           {metric.name.includes('API') && <Activity className="w-4 h-4 text-amber-300"/>}
                           {metric.name.includes('Database') && <Database className="w-4 h-4 text-amber-300"/>}
                           {metric.name.includes('AI') && <Cpu className="w-4 h-4 text-amber-300"/>}
                           {metric.name}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className="font-mono font-bold text-gray-200">{metric.value}</span>
                           <div className={`w-2 h-2 rounded-full ${metric.status === 'Ok' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

function StatCard({ icon: Icon, title, value }: { icon: React.ElementType, title: string, value: string | number }) {
    return (
        <Card className="bg-gray-900/50 border-gray-700 hover:bg-gray-800/50 hover:border-amber-300/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
                <Icon className="h-5 w-5 text-amber-300" />
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold text-gray-100">{value}</div>
            </CardContent>
        </Card>
    )
}
