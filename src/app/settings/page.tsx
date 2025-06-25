
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { PatientProfile, PrivacySettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bot, Brain, FileDown, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const profileSchema = z.object({
    displayName: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
    const { user, userProfile, loading } = useAuth();
    const { toast } = useToast();
    const [settings, setSettings] = useState<PrivacySettings | null>(null);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: userProfile?.displayName || '',
            email: userProfile?.email || '',
        },
    });
    
    useEffect(() => {
        if(userProfile) {
            form.reset({
                displayName: userProfile.displayName || '',
                email: userProfile.email || '',
            });
            if(userProfile.role === 'patient') {
                setSettings(userProfile.privacySettings);
            }
        }
    }, [userProfile, form]);
    
    const onProfileSubmit = async (data: ProfileFormValues) => {
        if (!user) return;
        toast({ title: "Updating profile...", description: "Please wait." });
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                displayName: data.displayName
            });
            toast({ title: 'Success', description: 'Profile updated successfully.' });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };
    
    const handleSettingChange = async (key: keyof PrivacySettings, value: boolean) => {
        if (!user || !settings) return;

        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings); // Optimistic update

        try {
            await updateDoc(doc(db, 'users', user.uid), {
                [`privacySettings.${key}`]: value
            });
            toast({ title: 'Success', description: 'Privacy setting updated.' });
        } catch (error) {
            setSettings(settings); // Revert on error
            toast({ title: 'Error', description: 'Failed to update setting.', variant: 'destructive' });
        }
    };

    if (loading) return <SettingsSkeleton />;

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <h1 className="text-3xl font-bold font-headline">Settings</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                         <Form {...form}>
                            <form onSubmit={form.handleSubmit(onProfileSubmit)}>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                    <CardDescription>Update your account details.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <FormField
                                        control={form.control}
                                        name="displayName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input {...field} disabled />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter>
                                     <Button type="submit" disabled={form.formState.isSubmitting}>Save Changes</Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Neural Data Sharing</CardTitle>
                            <CardDescription>Manage how your neural data is used.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <SettingToggle
                                icon={Brain}
                                id="live-therapy"
                                label="Live Therapy Mode"
                                description="Stream data during live sessions."
                                checked={settings?.liveTherapyMode ?? false}
                                onCheckedChange={(val) => handleSettingChange('liveTherapyMode', val)}
                             />
                             <SettingToggle
                                icon={Bot}
                                id="research"
                                label="Anonymized Research"
                                description="Contribute to neuroscience research."
                                checked={settings?.anonymizedResearch ?? false}
                                onCheckedChange={(val) => handleSettingChange('anonymizedResearch', val)}
                             />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Export Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" variant="secondary" disabled>
                                <FileDown className="mr-2"/>
                                Export Neural Report (PDF)
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function SettingToggle({icon: Icon, id, label, description, checked, onCheckedChange}: {icon: React.ElementType, id: string, label: string, description: string, checked: boolean, onCheckedChange: (c:boolean) => void}) {
    return (
        <div className="flex items-start gap-4 rounded-lg border p-3 bg-muted/20 hover:bg-muted/50 transition-colors">
            <Icon className="w-8 h-8 text-primary mt-1"/>
            <div className="flex-1">
                <Label htmlFor={id} className="font-semibold">{label}</Label>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    )
}

function SettingsSkeleton() {
    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <Skeleton className="h-9 w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        </div>
    );
}
