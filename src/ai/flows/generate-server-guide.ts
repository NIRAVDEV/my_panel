'use server';
/**
 * @fileOverview A flow for generating server setup guides for players.
 *
 * - generateServerGuide - A function that takes server details and returns a setup guide.
 * - GenerateServerGuideInput - The input type for the function.
 * - GenerateServerGuideOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateServerGuideInputSchema = z.object({
  serverType: z.string().describe("The type of the Minecraft server (e.g., Paper, Forge)."),
  serverVersion: z.string().describe("The version of the Minecraft server (e.g., 1.21)."),
});
export type GenerateServerGuideInput = z.infer<typeof GenerateServerGuideInputSchema>;

const GenerateServerGuideOutputSchema = z.object({
  guide: z.array(
    z.object({
        title: z.string().describe("The title of the guide step."),
        instruction: z.string().describe("The detailed instruction for the step."),
        command: z.string().optional().describe("An optional command to run for this step."),
    })
  ).describe('The generated step-by-step setup guide.'),
});
export type GenerateServerGuideOutput = z.infer<typeof GenerateServerGuideOutputSchema>;


export async function generateServerGuide(input: GenerateServerGuideInput): Promise<GenerateServerGuideOutput> {
    return generateServerGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateServerGuidePrompt',
  input: {schema: GenerateServerGuideInputSchema},
  output: {schema: GenerateServerGuideOutputSchema},
  prompt: `You are an expert Minecraft server administrator creating a setup guide for a new server owner.
The user needs a guide to set up their new server before its first launch.

The server type is: {{{serverType}}}
The server version is: {{{serverVersion}}}

Generate a clear, step-by-step guide.

**Instructions for the guide:**
1.  **Welcome**: Start with a welcoming step that explains the purpose of the guide.
2.  **Accept EULA**: Create a step that instructs the user to find the 'eula.txt' file in the File Manager. Tell them to change 'eula=false' to 'eula=true'.
3.  **Server Properties**: Create a step about the 'server.properties' file. Advise them to review this file to set the server name (motd), game mode, difficulty, etc.
4.  **First Start**: Create a final step instructing them to start the server for the first time to generate the world files.
5.  **Optional Plugin/Mod Step**: If the server type is Forge, Fabric, Paper, Spigot, or Purpur, add a step suggesting they can now add plugins or mods to the appropriate folder ('plugins' or 'mods').

Ensure the output is a well-structured guide within the 'guide' field, with each step having a title and instruction.
`,
});

const generateServerGuideFlow = ai.defineFlow(
  {
    name: 'generateServerGuideFlow',
    inputSchema: GenerateServerGuideInputSchema,
    outputSchema: GenerateServerGuideOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI did not return a valid setup guide.');
    }
    return output;
  }
);
