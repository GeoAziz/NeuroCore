'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate an effectiveness rating for a therapy session.
 *
 * - generateEffectivenessRating - A function that generates the effectiveness rating.
 * - GenerateEffectivenessRatingInput - The input type for the generateEffectivenessRating function.
 * - GenerateEffectivenessRatingOutput - The return type for the generateEffectivenessRating function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEffectivenessRatingInputSchema = z.object({
  sessionType: z.string().describe('The type of therapy session (e.g., Calm Room, Dream States, Focus Gym, Memory Maze).'),
  duration: z.number().describe('The duration of the therapy session in minutes.'),
  moodBefore: z.string().describe('The patient\'s mood before the session (e.g., Happy, Anxious, Tired).'),
  moodAfter: z.string().describe('The patient\'s mood after the session.'),
  userJournalFeedback: z.string().describe('The patient\'s feedback on the session from their journal.'),
});
export type GenerateEffectivenessRatingInput = z.infer<typeof GenerateEffectivenessRatingInputSchema>;

const GenerateEffectivenessRatingOutputSchema = z.object({
  effectivenessRating: z.number().describe('A numerical rating (1-10) of the session\'s effectiveness, with 10 being most effective.'),
  summary: z.string().describe('A brief summary of why the session was rated as such.'),
});
export type GenerateEffectivenessRatingOutput = z.infer<typeof GenerateEffectivenessRatingOutputSchema>;

export async function generateEffectivenessRating(input: GenerateEffectivenessRatingInput): Promise<GenerateEffectivenessRatingOutput> {
  return generateEffectivenessRatingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEffectivenessRatingPrompt',
  input: {schema: GenerateEffectivenessRatingInputSchema},
  output: {schema: GenerateEffectivenessRatingOutputSchema},
  prompt: `You are an AI that analyzes therapy session data and generates an effectiveness rating.

  Based on the following information, provide an effectivenessRating (1-10) and a brief summary of your reasoning:

  Session Type: {{{sessionType}}}
  Duration: {{{duration}}} minutes
  Mood Before: {{{moodBefore}}}
  Mood After: {{{moodAfter}}}
  User Journal Feedback: {{{userJournalFeedback}}}

  Consider the session highly effective if the mood improved significantly and the user feedback is positive.
  Consider it ineffective if the mood worsened or the user feedback is negative.
`,
});

const generateEffectivenessRatingFlow = ai.defineFlow(
  {
    name: 'generateEffectivenessRatingFlow',
    inputSchema: GenerateEffectivenessRatingInputSchema,
    outputSchema: GenerateEffectivenessRatingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
