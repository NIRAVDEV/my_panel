'use server';
/**
 * @fileOverview A flow for generating step-by-step guides for Minecraft tasks.
 *
 * - generateGuide - A function that takes a task and returns a guide.
 * - GenerateGuideInput - The input type for the generateGuide function.
 * - GenerateGuideOutput - The return type for the generateGuide function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateGuideInputSchema = z.object({
  task: z.string().describe('The task the user wants a guide for.'),
});
export type GenerateGuideInput = z.infer<typeof GenerateGuideInputSchema>;

const GenerateGuideOutputSchema = z.object({
  steps: z
    .array(z.string())
    .describe('The step-by-step guide for the task.'),
});
export type GenerateGuideOutput = z.infer<typeof GenerateGuideOutputSchema>;

export async function generateGuide(
  input: GenerateGuideInput
): Promise<GenerateGuideOutput> {
  return generateGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGuidePrompt',
  input: {schema: GenerateGuideInputSchema},
  output: {schema: GenerateGuideOutputSchema},
  prompt: `You are an expert Minecraft player providing helpful guides.
The user wants to know how to do the following task: {{{task}}}.

Provide a clear, step-by-step guide on how to accomplish this.
Respond with only the steps in the requested format.`,
});

const generateGuideFlow = ai.defineFlow(
  {
    name: 'generateGuideFlow',
    inputSchema: GenerateGuideInputSchema,
    outputSchema: GenerateGuideOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
