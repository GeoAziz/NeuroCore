'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Award, Clock, Pause, Play, Brain, Wind, Gem, Puzzle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { TherapyContent } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type IconType = typeof Brain | typeof Wind | typeof Gem | typeof Puzzle;

const iconMap: { [key: string]: IconType } = {
    'Calm Room': Wind,
    'Dream States': Brain,
    'Focus Gym': Gem,
    'Memory Maze': Puzzle,
};


export default function TherapyCenter() {
  const [therapyOptions, setTherapyOptions] = useState<TherapyContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTherapyContent = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'therapyContent'));
        const options = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TherapyContent));
        setTherapyOptions(options);
      } catch (error) {
        console.error("Error fetching therapy content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTherapyContent();
  }, []);

  if (loading) {
    return (
        <div className="flex-1 p-4 md:p-6">
            <Skeleton className="h-9 w-96 mb-6" />
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex lg:flex-col h-auto bg-transparent p-0 gap-2 items-start w-full lg:w-80">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
                <div className="flex-1">
                    <Skeleton className="h-[600px] w-full" />
                </div>
            </div>
        </div>
    );
  }
  
  if (therapyOptions.length === 0) {
      return <p>No therapy options available.</p>
  }

  const defaultTab = therapyOptions[0]?.category.toLowerCase().replace(' ', '') || '';

  return (
    <div className="flex-1 p-4 md:p-6">
      <h1 className="text-3xl font-bold font-headline mb-6">Therapy & Simulations Center</h1>
       <TooltipProvider>
      <Tabs defaultValue={defaultTab} className="flex flex-col lg:flex-row gap-6">
        <TabsList className="flex lg:flex-col h-auto bg-transparent p-0 gap-2 items-start">
            {therapyOptions.map(opt => {
                const Icon = iconMap[opt.category] || Gem;
                const value = opt.category.toLowerCase().replace(' ', '');
                return (
                    <TabsTrigger key={opt.id} value={value} className="w-full justify-start text-left h-auto p-4 data-[state=active]:bg-card data-[state=active]:border-l-2 data-[state=active]:border-primary">
                        <Icon className="w-6 h-6 mr-4 text-primary shrink-0" />
                        <div>
                            <p className="font-bold">{opt.category}</p>
                            <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                        </div>
                    </TabsTrigger>
                )
            })}
        </TabsList>
        <div className="flex-1">
            {therapyOptions.map(opt => {
                 const value = opt.category.toLowerCase().replace(' ', '');
                 return (
                 <TabsContent key={opt.id} value={value} className="m-0">
                    <Card className="overflow-hidden">
                        <div className="relative h-[400px] xl:h-[500px] w-full">
                           <Image src={opt.image} alt={opt.name} layout="fill" objectFit="cover" data-ai-hint={opt.data_ai_hint} />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                           <div className="absolute bottom-0 left-0 p-6">
                                <h2 className="text-4xl font-bold text-white font-headline">{opt.name}</h2>
                                <p className="text-white/80 max-w-lg mt-2">{opt.description}</p>
                           </div>
                           <div className="absolute top-4 right-4 p-2 bg-background/50 backdrop-blur-sm rounded-full border border-primary/50">
                             <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
                           </div>
                        </div>
                        <div className="p-4 bg-card-foreground/5 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>30:00</span>
                                </div>
                                 <div className="flex items-center gap-2 text-sm">
                                    <Award className="w-4 h-4" />
                                    <span>AI Effectiveness: 8.7/10</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="secondary" size="icon" disabled>
                                            <Pause className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Session controls coming soon</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button size="icon" disabled>
                                            <Play className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Session controls coming soon</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="destructive" className="ml-4" disabled>End Session</Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Session controls coming soon</p></TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <Progress value={33} />
                        </CardContent>
                    </Card>
                </TabsContent>
            )})}
        </div>
      </Tabs>
      </TooltipProvider>
    </div>
  );
}
