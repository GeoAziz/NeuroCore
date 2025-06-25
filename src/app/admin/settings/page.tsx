
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, DatabaseZap, ShieldCheck, UploadCloud, Trash2 } from 'lucide-react';

export default function AdminSettingsPage() {
    const [uploadsEnabled, setUploadsEnabled] = useState(true);
    const [liveAiReview, setLiveAiReview] = useState(false);

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
             <h1 className="text-3xl font-bold font-headline text-amber-300">System Settings</h1>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-gray-900/50 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-xl font-headline text-gray-200">Platform Toggles</CardTitle>
                            <CardDescription className="text-gray-400">Enable or disable major system features.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <SettingToggle
                                icon={UploadCloud}
                                id="uploads"
                                label="Patient Scan Uploads"
                                description="Globally enable or disable new scan uploads from patients."
                                checked={uploadsEnabled}
                                onCheckedChange={setUploadsEnabled}
                            />
                             <SettingToggle
                                icon={ShieldCheck}
                                id="live-ai"
                                label="Live AI Review"
                                description="Enable real-time AI analysis on active therapy sessions (high resource usage)."
                                checked={liveAiReview}
                                onCheckedChange={setLiveAiReview}
                            />
                        </CardContent>
                    </Card>
                     <Card className="bg-gray-900/50 border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-xl font-headline text-gray-200">Data Retention Policies</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="retention-logs" className="text-gray-300">Audit Log Retention (days)</Label>
                                <Input id="retention-logs" type="number" defaultValue="90" className="bg-gray-900 border-gray-600 text-gray-300" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="retention-scans" className="text-gray-300">Inactive Scan Retention (days)</Label>
                                <Input id="retention-scans" type="number" defaultValue="365" className="bg-gray-900 border-gray-600 text-gray-300" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="border-amber-300/50 text-amber-300 hover:bg-amber-300/10 hover:text-amber-200">Save Policies</Button>
                        </CardFooter>
                    </Card>
                </div>
                <div className="space-y-6">
                     <Card className="border-red-500/50 bg-red-900/20 text-red-300">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-400 font-headline"><AlertTriangle /> Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-red-300/80">These actions are irreversible and may result in data loss. Proceed with extreme caution.</p>
                            <Button variant="destructive" className="w-full">
                                <DatabaseZap className="mr-2"/>
                                 Wipe Staging Database
                            </Button>
                             <Button variant="destructive" className="w-full">
                                <Trash2 className="mr-2"/>
                                 Purge Inactive Accounts
                            </Button>
                        </CardContent>
                    </Card>
                </div>
             </div>
        </div>
    )
}


function SettingToggle({icon: Icon, id, label, description, checked, onCheckedChange}: {icon: React.ElementType, id: string, label: string, description: string, checked: boolean, onCheckedChange: (c:boolean) => void}) {
    return (
        <div className="flex items-start gap-4 rounded-lg border border-gray-700 p-4 bg-gray-900 hover:bg-gray-800/50 transition-colors">
            <Icon className="w-8 h-8 text-amber-300 mt-1 shrink-0"/>
            <div className="flex-1">
                <Label htmlFor={id} className="font-semibold text-gray-200">{label}</Label>
                <p className="text-xs text-gray-400">{description}</p>
            </div>
            <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    )
}
