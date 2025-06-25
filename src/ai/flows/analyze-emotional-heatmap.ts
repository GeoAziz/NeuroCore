'use server';

/**
 * @fileOverview Flow for analyzing emotional heatmaps to identify dominant emotions and patterns.
 *
 * - analyzeEmotionalHeatmap - Analyzes emotional heatmaps to identify dominant emotions at different times of the day and detect patterns related to anxiety, burnout, or dissociation.
 * - AnalyzeEmotionalHeatmapInput - The input type for the analyzeEmotionalHeatmap function.
 * - AnalyzeEmotionalHeatmapOutput - The return type for the analyzeEmotionalHeatmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeEmotionalHeatmapInputSchema = z.object({
  heatmapData: z.string().describe('Emotional heatmap data as a JSON string.'),
  userJournal: z.string().optional().describe('Optional user journal entries for context.'),
});
export type AnalyzeEmotionalHeatmapInput = z.infer<typeof AnalyzeEmotionalHeatmapInputSchema>;

const AnalyzeEmotionalHeatmapOutputSchema = z.object({
  dominantEmotions: z
    .array(z.object({time: z.string(), emotion: z.string()}))
    .describe('Dominant emotions at different times of the day.'),
  patternDetections: z
    .array(z.string())
    .describe('Detected patterns related to anxiety, burnout, or dissociation.'),
  insights: z.array(z.string()).describe('Additional insights from the emotional heatmap and journal entries.'),
});
export type AnalyzeEmotionalHeatmapOutput = z.infer<typeof AnalyzeEmotionalHeatmapOutputSchema>;

export async function analyzeEmotionalHeatmap(input: AnalyzeEmotionalHeatmapInput): Promise<AnalyzeEmotionalHeatmapOutput> {
  return analyzeEmotionalHeatmapFlow(input);
}

const analyzeEmotionalHeatmapPrompt = ai.definePrompt({
  name: 'analyzeEmotionalHeatmapPrompt',
  input: {schema: AnalyzeEmotionalHeatmapInputSchema},
  output: {schema: AnalyzeEmotionalHeatmapOutputSchema},
  prompt: `You are an expert in analyzing emotional heatmaps to identify trends and patterns in user emotions.

  Analyze the provided emotional heatmap data and user journal entries (if available) to identify dominant emotions at different times of the day and detect patterns related to anxiety, burnout, or dissociation.

  Emotional Heatmap Data:
  {{heatmapData}}

  User Journal Entries (Optional):
  {{#if userJournal}}
  {{userJournal}}
  {{else}}
  No user journal entries provided.
  {{/if}}

  Provide your analysis in the following format:

  Dominant Emotions:
  - Time: [Time of Day], Emotion: [Dominant Emotion]

  Pattern Detections:
  - [Pattern related to anxiety, burnout, or dissociation]

  Insights:
  - [Additional insights from the emotional heatmap and journal entries]
  `,
});

const analyzeEmotionalHeatmapFlow = ai.defineFlow(
  {
    name: 'analyzeEmotionalHeatmapFlow',
    inputSchema: AnalyzeEmotionalHeatmapInputSchema,
    outputSchema: AnalyzeEmotionalHeatmapOutputSchema,
  },
  async input => {
    const {output} = await analyzeEmotionalHeatmapPrompt(input);
    return output!;
  }
);
