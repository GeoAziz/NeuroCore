'use server';

/**
 * @fileOverview Compares journal entries with mood trends to identify personalized insights and potential triggers for mood changes.
 *
 * - mindFeedbackComparison - A function that handles the comparison of journal entries and mood trends.
 * - MindFeedbackComparisonInput - The input type for the mindFeedbackComparison function.
 * - MindFeedbackComparisonOutput - The return type for the mindFeedbackComparison function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MindFeedbackComparisonInputSchema = z.object({
  journalEntries: z
    .string()
    .describe('The patient journal entries, as a single string.'),
  moodTrends: z.string().describe('The mood trends of the patient.'),
});
export type MindFeedbackComparisonInput = z.infer<
  typeof MindFeedbackComparisonInputSchema
>;

const MindFeedbackComparisonOutputSchema = z.object({
  insights: z.string().describe('Personalized insights and potential triggers.'),
});
export type MindFeedbackComparisonOutput = z.infer<
  typeof MindFeedbackComparisonOutputSchema
>;

export async function mindFeedbackComparison(
  input: MindFeedbackComparisonInput
): Promise<MindFeedbackComparisonOutput> {
  return mindFeedbackComparisonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mindFeedbackComparisonPrompt',
  input: {schema: MindFeedbackComparisonInputSchema},
  output: {schema: MindFeedbackComparisonOutputSchema},
  prompt: `You are an AI assistant specializing in mental health analysis.

You will be provided with a patient's journal entries and mood trends.
Your goal is to identify potential triggers for mood changes and give personalized insights.

Journal Entries: {{{journalEntries}}}

Mood Trends: {{{moodTrends}}}

Based on the journal entries and mood trends, provide personalized insights and potential triggers for mood changes.
`,
});

const mindFeedbackComparisonFlow = ai.defineFlow(
  {
    name: 'mindFeedbackComparisonFlow',
    inputSchema: MindFeedbackComparisonInputSchema,
    outputSchema: MindFeedbackComparisonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
