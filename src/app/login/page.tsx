
'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Fingerprint, Brain } from 'lucide-react';
import { AuthBrainAnimation } from '@/components/shared/auth-brain-animation';
import type { PatientProfile, PatientData, PrivacySettings } from '@/lib/types';


const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const signupSchema = z.object({
  displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({ title: 'Success', description: 'Logged in successfully.' });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Login Failed',
        description: error.message === 'Firebase: Error (auth/invalid-credential).' 
            ? 'Invalid email or password. Please try again.'
            : (error.message || 'An unexpected error occurred.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoginLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupFormValues) => {
    setIsSignupLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: data.displayName });

      const defaultPatientData: PatientData = {
        cognitionScore: { value: 0, change: 0 },
        mentalHealthGrade: 'N/A',
        sleepQuality: 0,
        mood: 'Neutral',
        moodPrediction: 'Stable',
        moodTrackerData: [],
      };

      const defaultPrivacySettings: PrivacySettings = {
        liveTherapyMode: true,
        anonymizedResearch: false,
        doctorAccess: {},
      };
      
      const userProfile: PatientProfile = {
        uid: user.uid,
        email: user.email,
        displayName: data.displayName,
        role: 'patient',
        patientData: defaultPatientData,
        privacySettings: defaultPrivacySettings,
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      toast({ title: 'Success', description: 'Account created successfully. Logging in...' });
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Sign Up Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSignupLoading(false);
    }
  };

  const handleEnterAsPatient = () => {
    loginForm.setValue('email', 'patient@neurocore.dev');
    loginForm.setValue('password', 'password123');
    // Using handleSubmit to trigger validation and submission
    loginForm.handleSubmit(onLoginSubmit)();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 from-background to-black bg-gradient-to-br">
       <div className="absolute inset-0 bg-grid-pattern opacity-10 -z-10"></div>
       <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 -z-10"></div>

      <div className="relative grid md:grid-cols-2 max-w-5xl w-full bg-card rounded-lg shadow-2xl shadow-primary/10 overflow-hidden border border-border">
        <div className="hidden md:flex flex-col items-center justify-center p-8 bg-muted/30 border-r border-border">
          <AuthBrainAnimation />
          <h2 className="mt-6 text-3xl font-bold font-headline text-center text-foreground">Zizo_NeuroCore</h2>
          <p className="mt-2 text-sm text-center text-muted-foreground">Unlocking Neural Potential Through Intelligence & Immersion</p>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8">
            <div className="md:hidden flex flex-col items-center text-center mb-8">
                 <Brain className="w-16 h-16 text-primary mb-3" />
                 <h2 className="text-2xl font-bold font-headline text-foreground">Zizo_NeuroCore</h2>
            </div>
            
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="mt-6">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="p-1 text-center md:text-left">
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="px-1">
                    <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField control={loginForm.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="patient@neurocore.dev" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={loginForm.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit" className="w-full" disabled={isLoginLoading}>
                            {isLoginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign In
                        </Button>
                        </form>
                    </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
                 <Card className="border-none shadow-none bg-transparent">
                    <CardHeader className="p-1 text-center md:text-left">
                        <CardTitle>Join NeuroCore</CardTitle>
                        <CardDescription>Create your account to begin your journey.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-1">
                        <Form {...signupForm}>
                            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                            <FormField control={signupForm.control} name="displayName" render={({ field }) => (
                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={signupForm.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="name@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={signupForm.control} name="password" render={({ field }) => (
                                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <Button type="submit" className="w-full" disabled={isSignupLoading}>
                                {isSignupLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign Up
                            </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleEnterAsPatient} disabled={isLoginLoading}>
                    <Brain className="mr-2 h-4 w-4" />
                    Guest Patient
                </Button>
                <Button variant="outline" disabled>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    Biometric ID
                </Button>
            </div>
        </div>
      </div>
       <style jsx>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, hsl(var(--border) / 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.5) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}
