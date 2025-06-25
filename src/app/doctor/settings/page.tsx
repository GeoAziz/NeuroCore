
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bot, Bell, Camera } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function DoctorSettingsPage() {
    const { userProfile } = useAuth();
    const [aiAssist, setAiAssist] = useState(true);
    const [holographicMode, setHolographicMode] = useState(false);

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <h1 className="text-3xl font-bold font-headline">Doctor Settings</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Manage your professional details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" defaultValue={userProfile?.displayName || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" defaultValue={userProfile?.email || ''} disabled />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="specialty">Specialty</Label>
                                <Input id="specialty" defaultValue={(userProfile as any)?.specialty || 'Neuropsychology'} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save Changes</Button>
                        </CardFooter>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Feature Toggles</CardTitle>
                            <CardDescription>Enable or disable advanced features.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <SettingToggle 
                                icon={Bot}
                                id="ai-assist"
                                label="AI Assistant"
                                description="Enable smart auto-suggestions and insights."
                                checked={aiAssist}
                                onCheckedChange={setAiAssist}
                            />
                             <SettingToggle 
                                icon={Camera}
                                id="holographic-mode"
                                label="Holographic Mode"
                                description="Activate immersive 3D scan reviews (requires VR)."
                                checked={holographicMode}
                                onCheckedChange={setHolographicMode}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function SettingToggle({icon: Icon, id, label, description, checked, onCheckedChange}: {icon: React.ElementType, id: string, label: string, description: string, checked: boolean, onCheckedChange: (c:boolean) => void}) {
    return (
        <div className="flex items-start gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
            <Icon className="w-8 h-8 text-primary mt-1"/>
            <div className="flex-1">
                <Label htmlFor={id} className="font-semibold">{label}</Label>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    )
}
