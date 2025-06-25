'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating AI-simulated dream environments based on user emotions.
 *
 * - aiDrivenDreamSimulation - A function that generates dream simulations based on patient emotions.
 * - AiDrivenDreamSimulationInput - The input type for the aiDrivenDreamSimulation function.
 * - AiDrivenDreamSimulationOutput - The return type for the aiDrivenDreamSimulation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiDrivenDreamSimulationInputSchema = z.object({
  emotion: z
    .string()
    .describe("The patient's current emotional state, e.g., 'anxious', 'calm', 'happy'."),
  userJournal: z.string().describe('The latest entry in the user journal.'),
});
export type AiDrivenDreamSimulationInput = z.infer<typeof AiDrivenDreamSimulationInputSchema>;

const AiDrivenDreamSimulationOutputSchema = z.object({
  dreamEnvironment: z
    .string()
    .describe('A description of the AI-simulated dream environment.'),
  therapeuticSuggestions: z
    .string()
    .describe('Suggestions for therapeutic actions within the dream environment.'),
});
export type AiDrivenDreamSimulationOutput = z.infer<typeof AiDrivenDreamSimulationOutputSchema>;

export async function aiDrivenDreamSimulation(input: AiDrivenDreamSimulationInput): Promise<AiDrivenDreamSimulationOutput> {
  return aiDrivenDreamSimulationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDrivenDreamSimulationPrompt',
  input: {schema: AiDrivenDreamSimulationInputSchema},
  output: {schema: AiDrivenDreamSimulationOutputSchema},
  prompt: `You are an AI dream simulation generator designed to create personalized and immersive therapy sessions based on user emotions.

  The patient is currently feeling: {{{emotion}}}.
  The latest entry in their journal is: {{{userJournal}}}.

  Generate a dream environment tailored to this emotional state, and provide therapeutic suggestions for actions within the dream.
  The dream environment should feel immersive and personalized.

  Output should be a json string:
  {
    dreamEnvironment: string //A description of the AI-simulated dream environment.
    therapeuticSuggestions: string // Suggestions for therapeutic actions within the dream environment.
  }
  `,
});

const aiDrivenDreamSimulationFlow = ai.defineFlow(
  {
    name: 'aiDrivenDreamSimulationFlow',
    inputSchema: AiDrivenDreamSimulationInputSchema,
    outputSchema: AiDrivenDreamSimulationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
