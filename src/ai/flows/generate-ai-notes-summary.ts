'use server';
/**
 * @fileOverview An AI agent that generates a summary of AI notes based on patient data.
 *
 * - generateAiNotesSummary - A function that generates the AI notes summary.
 * - GenerateAiNotesSummaryInput - The input type for the generateAiNotesSummary function.
 * - GenerateAiNotesSummaryOutput - The return type for the generateAiNotesSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAiNotesSummaryInputSchema = z.object({
  patientData: z.string().describe('The patient data, including mood trends, anxiety spikes, sleep tracking, and journal entries.'),
});
export type GenerateAiNotesSummaryInput = z.infer<typeof GenerateAiNotesSummaryInputSchema>;

const GenerateAiNotesSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the AI notes based on the patient data.'),
});
export type GenerateAiNotesSummaryOutput = z.infer<typeof GenerateAiNotesSummaryOutputSchema>;

export async function generateAiNotesSummary(input: GenerateAiNotesSummaryInput): Promise<GenerateAiNotesSummaryOutput> {
  return generateAiNotesSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAiNotesSummaryPrompt',
  input: {schema: GenerateAiNotesSummaryInputSchema},
  output: {schema: GenerateAiNotesSummaryOutputSchema},
  prompt: `You are an AI assistant that specializes in summarizing patient data for doctors.

  Based on the patient data provided, generate a concise summary of key trends and insights regarding the patient's mental state.

  Patient Data: {{{patientData}}}
  `,
});

const generateAiNotesSummaryFlow = ai.defineFlow(
  {
    name: 'generateAiNotesSummaryFlow',
    inputSchema: GenerateAiNotesSummaryInputSchema,
    outputSchema: GenerateAiNotesSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
