"use client";

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
  LockKeyhole,
  Activity,
  ShieldCheck,
  Brain,
  LogOut,
  Settings,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth-context";
import { auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ['patient'] },
  { href: "/doctor", label: "Doctor View", icon: Stethoscope, roles: ['doctor'] },
  { href: "/therapy", label: "Therapy Center", icon: BrainCircuit, roles: ['patient', 'doctor'] },
  { href: "/privacy", label: "Privacy", icon: LockKeyhole, roles: ['patient'] },
  { href: "/analytics", label: "Analytics", icon: Activity, roles: ['patient', 'doctor'] },
  { href: "/admin", label: "Admin", icon: ShieldCheck, roles: ['admin'] },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !isAuthPage) {
    // router.push('/login') will cause a render loop issue with Next.js App Router
    // We handle redirection in a useEffect within a page or a dedicated component
    // For now, we return null to prevent rendering protected content
    if (typeof window !== "undefined") {
        router.push('/login');
    }
    return (
         <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="ml-2">Redirecting to login...</p>
        </div>
    );
  }
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  const availableMenuItems = menuItems.filter(item => userProfile?.role && item.roles.includes(userProfile.role));

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 text-primary">
                <Brain className="w-7 h-7" />
            </Button>
            <h1 className="text-2xl font-bold font-headline text-foreground">NeuroCore</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {userProfile ? availableMenuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
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
                <SidebarMenuButton>
                    <Settings />
                    <span>Settings</span>
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
                    <AvatarFallback>{userProfile?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-medium">{userProfile?.displayName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userProfile?.role}</p>
                </div>
            </div>
          </header>
          <main className="flex-1 flex flex-col bg-background">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
