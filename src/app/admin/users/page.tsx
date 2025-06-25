
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, ShieldCheck, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function UserManagementPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const usersSnapshot = await getDocs(query(collection(db, 'users')));
                const allUsers = usersSnapshot.docs.map(doc => doc.data() as UserProfile);
                setUsers(allUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast({ title: "Error", description: "Could not fetch user data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [toast]);
    
    const filteredUsers = users
        .filter(user => {
            const term = searchTerm.toLowerCase();
            return user.displayName?.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term);
        })
        .filter(user => {
            if (roleFilter === 'all') return true;
            return user.role === roleFilter;
        });

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline text-amber-300">User Management</h1>
                    <p className="text-muted-foreground">Manage all users across the NeuroCore platform.</p>
                </div>
                <Button variant="outline" disabled className="border-amber-300/50 text-amber-300 hover:bg-amber-300/10 hover:text-amber-200">
                    <UserPlus className="mr-2"/> Add New User
                </Button>
            </div>

            <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Search by name or email..." 
                                className="pl-9 bg-gray-900 border-gray-600 text-gray-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[180px] bg-gray-900 border-gray-600 text-gray-300">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700 text-gray-200">
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="patient">Patient</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="grid gap-2">
                           <Skeleton className="h-12 w-full bg-gray-800" />
                           <Skeleton className="h-12 w-full bg-gray-800" />
                           <Skeleton className="h-12 w-full bg-gray-800" />
                        </div>
                    ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-700 hover:bg-gray-800/50">
                                <TableHead className="text-gray-400">User</TableHead>
                                <TableHead className="text-gray-400">Role</TableHead>
                                <TableHead className="text-gray-400">Status</TableHead>
                                <TableHead className="text-gray-400">Last Login</TableHead>
                                <TableHead className="text-right text-gray-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map(user => (
                                <TableRow key={user.uid} className="border-gray-800 hover:bg-gray-800/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={`https://placehold.co/40x40/4f46e5/ffffff?text=${user.displayName?.charAt(0)}`} />
                                                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-gray-200">{user.displayName}</p>
                                                <p className="text-xs text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize bg-gray-700 text-gray-300">{user.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={user.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-400 font-mono text-xs">
                                        {user.lastLogin ? new Date(user.lastLogin.seconds * 1000).toLocaleString() : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-800">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700 text-gray-200">
                                                <DropdownMenuItem disabled>View Profile</DropdownMenuItem>
                                                <DropdownMenuItem disabled>Suspend User</DropdownMenuItem>
                                                <DropdownMenuItem disabled className="text-red-400 focus:bg-red-900/50 focus:text-red-300">Delete User</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

