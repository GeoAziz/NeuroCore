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
import { Award, Clock, Pause, Play, Brain, Wind, Gem, Puzzle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const therapyOptions = [
    { value: 'calm', title: 'Calm Rooms', icon: Wind, description: 'Virtual relaxation spaces, soundscapes, and breathing exercises.', image: 'https://placehold.co/1200x800', data_ai_hint: 'calm beach' },
    { value: 'dream', title: 'Dream States', icon: Brain, description: 'AI-simulated environments based on your current emotions.', image: 'https://placehold.co/1200x800', data_ai_hint: 'surreal dreamscape' },
    { value: 'focus', title: 'Focus Gym', icon: Gem, description: 'Puzzle games designed to enhance focus and mental acuity.', image: 'https://placehold.co/1200x800', data_ai_hint: 'abstract puzzle' },
    { value: 'memory', title: 'Memory Maze', icon: Puzzle, description: 'Strengthen memory recall through interactive challenges.', image: 'https://placehold.co/1200x800', data_ai_hint: 'glowing maze' },
];

export default function TherapyCenter() {
  return (
    <div className="flex-1 p-4 md:p-6">
      <h1 className="text-3xl font-bold font-headline mb-6">Therapy & Simulations Center</h1>
      <Tabs defaultValue="calm" className="flex flex-col lg:flex-row gap-6">
        <TabsList className="flex lg:flex-col h-auto bg-transparent p-0 gap-2 items-start">
            {therapyOptions.map(opt => (
                <TabsTrigger key={opt.value} value={opt.value} className="w-full justify-start text-left h-auto p-4 data-[state=active]:bg-card data-[state=active]:border-l-2 data-[state=active]:border-primary">
                    <opt.icon className="w-6 h-6 mr-4 text-primary" />
                    <div>
                        <p className="font-bold">{opt.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                    </div>
                </TabsTrigger>
            ))}
        </TabsList>
        <div className="flex-1">
            {therapyOptions.map(opt => (
                 <TabsContent key={opt.value} value={opt.value} className="m-0">
                    <Card className="overflow-hidden">
                        <div className="relative h-[400px] xl:h-[500px] w-full">
                           <Image src={opt.image} alt={opt.title} layout="fill" objectFit="cover" data-ai-hint={opt.data_ai_hint} />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                           <div className="absolute bottom-0 left-0 p-6">
                                <h2 className="text-4xl font-bold text-white font-headline">{opt.title}</h2>
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
                                <Button variant="secondary" size="icon">
                                    <Pause className="w-4 h-4" />
                                </Button>
                                <Button size="icon">
                                    <Play className="w-4 h-4" />
                                </Button>
                                <Button variant="destructive" className="ml-4">End Session</Button>
                            </div>
                        </div>
                        <CardContent className="p-4">
                            <Progress value={33} />
                        </CardContent>
                    </Card>
                </TabsContent>
            ))}
        </div>
      </Tabs>
    </div>
  );
}
