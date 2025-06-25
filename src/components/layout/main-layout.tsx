
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
  Bot,
  ListTree,
  Server,
  FileCog
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
    { href: "/admin", label: "Dashboard", icon: ShieldAlert },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/scan-center", label: "Scan Control", icon: Server },
    { href: "/admin/ai-engine", label: "AI Engine", icon: Bot },
    { href: "/admin/logs", label: "Logs & Analytics", icon: ListTree },
    { href: "/admin/settings", label: "System Settings", icon: FileCog },
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
    if (userProfile && (pathname === '/login' || pathname === '/')) {
        if (userProfile.role === 'doctor') router.push('/doctor');
        else if (userProfile.role === 'admin') router.push('/admin');
        else if (pathname !== '/') router.push('/'); // patient
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
  let sidebarStyle = {};
  if (userProfile?.role === 'doctor') {
    availableMenuItems = doctorMenuItems;
    settingsUrl = '/doctor/settings';
  }
  if (userProfile?.role === 'admin') {
    availableMenuItems = adminMenuItems;
    settingsUrl = '/admin/settings';
    sidebarStyle = {
        '--sidebar-background': 'hsl(220 10% 10%)',
        '--sidebar-foreground': 'hsl(210 10% 75%)',
        '--sidebar-border': 'hsl(220 10% 20%)',
        '--sidebar-accent': 'hsl(38 92% 50% / 0.1)',
        '--sidebar-accent-foreground': 'hsl(38 92% 50%)',
        '--sidebar-ring': 'hsl(38 92% 50%)'
    } as React.CSSProperties;
  }

  const isAdmin = userProfile?.role === 'admin';


  return (
    <SidebarProvider>
      <Sidebar style={sidebarStyle}>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className={`shrink-0 ${isAdmin ? 'text-amber-400' : 'text-primary'}`}>
                <BrainCircuit className="w-7 h-7" />
            </Button>
            <h1 className={`text-2xl font-bold font-headline ${isAdmin ? 'text-gray-100' : 'text-foreground'}`}>NeuroCore</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {availableMenuItems.map((item) => (
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
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 flex flex-col gap-2">
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.endsWith('/settings')}>
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
          <header className={`flex h-14 lg:h-[60px] items-center gap-4 border-b px-6 sticky top-0 z-30 ${isAdmin ? 'bg-gray-950/80 border-gray-800' : 'bg-background/80'} backdrop-blur-sm`}>
            <div className="lg:hidden">
                <SidebarTrigger />
            </div>
            <div className="flex-1">
                {/* Header content can go here */}
            </div>
             <div className="flex items-center gap-2">
                <Avatar>
                    <AvatarImage src={`https://placehold.co/40x40/${isAdmin ? 'f97316' : '9467d4'}/1e1b2e?text=${userProfile?.displayName?.charAt(0)?.toUpperCase()}`} />
                    <AvatarFallback>{userProfile?.displayName?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium">{userProfile?.displayName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userProfile?.role}</p>
                </div>
            </div>
          </header>
          <main className={`flex-1 flex flex-col ${isAdmin ? 'bg-gray-950' : 'bg-muted/40'}`}>
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
