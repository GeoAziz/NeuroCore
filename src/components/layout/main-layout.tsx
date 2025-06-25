
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Stethoscope,
  BrainCircuit,
  ShieldCheck,
  Brain,
  LogOut,
  Settings,
  Loader2,
  LineChart,
  Calendar,
  FlaskConical,
  Users,
  FileText,
  Video,
  Beaker,
  ShieldAlert,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";
import React, { useEffect, useState } from 'react';
import { SplashScreen } from "../shared/splash-screen";

const patientMenuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/brain-scan", label: "BrainScan Viewer", icon: Brain },
  { href: "/cognitive-tracker", label: "Cognitive Tracker", icon: LineChart },
  { href: "/therapy-hub", label: "Therapy Hub", icon: FlaskConical },
  { href: "/consultations", label: "Consultations", icon: Calendar },
];

const doctorMenuItems = [
    { href: "/doctor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/doctor/patients", label: "Patient Directory", icon: Users },
    { href: "/doctor/brain-scan-lab", label: "BrainScan Lab", icon: Beaker },
    { href: "/doctor/cognitive-reports", label: "Cognitive Reports", icon: FileText },
    { href: "/doctor/therapy-oversight", label: "Therapy Oversight", icon: BrainCircuit },
    { href: "/doctor/consultations", label: "Live Consultations", icon: Video },
];

const adminMenuItems = [
    { href: "/admin", label: "Admin Console", icon: ShieldAlert },
];


export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // This effect ensures the splash screen is shown for a minimum duration.
    const minDisplayTime = 2500;
    let isMounted = true; 

    if (!loading) {
      const timer = setTimeout(() => {
        if(isMounted) setIsInitializing(false);
      }, minDisplayTime);

      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [loading]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    // This effect handles routing logic after initialization.
    if (isInitializing) return;
    
    // If not logged in and not on an auth page, redirect to login.
    if (!user && !isAuthPage) {
      router.push('/login');
    }
    
    // Redirect to the correct dashboard after login.
    if (userProfile && pathname === '/login') {
        if (userProfile.role === 'doctor') router.push('/doctor');
        else if (userProfile.role === 'admin') router.push('/admin');
        else router.push('/');
    }

  }, [isInitializing, user, userProfile, isAuthPage, pathname, router]);

  if (isInitializing) {
    return <SplashScreen />;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }
  
  if (!user || !userProfile) {
    return (
         <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="ml-2">Loading user data...</p>
        </div>
    );
  }
  
  let availableMenuItems = patientMenuItems; // Default
  let settingsUrl = '/settings';
  if (userProfile?.role === 'doctor') {
    availableMenuItems = doctorMenuItems;
    settingsUrl = '/doctor/settings';
  }
  if (userProfile?.role === 'admin') {
    availableMenuItems = adminMenuItems;
    settingsUrl = '/settings'; // Admins can use the general settings page
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 text-primary">
                <BrainCircuit className="w-7 h-7" />
            </Button>
            <h1 className="text-2xl font-bold font-headline text-foreground">NeuroCore</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {userProfile ? availableMenuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )) : (
                <>
                    <SidebarMenuSkeleton showIcon />
                    <SidebarMenuSkeleton showIcon />
                    <SidebarMenuSkeleton showIcon />
                </>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 flex flex-col gap-2">
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === settingsUrl}>
                    <Link href={settingsUrl}>
                        <Settings />
                        <span>Settings</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6 sticky top-0 z-30">
            <div className="lg:hidden">
                <SidebarTrigger />
            </div>
            <div className="flex-1">
                {/* Header content can go here */}
            </div>
             <div className="flex items-center gap-2">
                <Avatar>
                    <AvatarImage src="https://placehold.co/40x40" />
                    <AvatarFallback>{userProfile?.displayName?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium">{userProfile?.displayName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userProfile?.role}</p>
                </div>
            </div>
          </header>
          <main className="flex-1 flex flex-col bg-muted/40">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
