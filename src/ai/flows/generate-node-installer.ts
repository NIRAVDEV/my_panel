'use server';
/**
 * @fileOverview A flow for generating Pterodactyl Wings installation guides.
 *
 * - generateNodeInstaller - A function that takes node details and returns a shell script guide.
 * - GenerateNodeInstallerInput - The input type for the function.
 * - GenerateNodeInstallerOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateNodeInstallerInputSchema = z.object({
    os: z.enum(["debian", "nixos"]).describe("The operating system of the target node."),
    nodeId: z.string().describe("The ID of the node to get the configuration for."),
    panelUrl: z.string().url().describe("The base URL of the control panel."),
});
export type GenerateNodeInstallerInput = z.infer<typeof GenerateNodeInstallerInputSchema>;

const GenerateNodeInstallerOutputSchema = z.object({
  guide: z.string().describe('The generated step-by-step installation script/guide.'),
});
export type GenerateNodeInstallerOutput = z.infer<typeof GenerateNodeInstallerOutputSchema>;


export async function generateNodeInstaller(input: GenerateNodeInstallerInput): Promise<GenerateNodeInstallerOutput> {
    return generateNodeInstallerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNodeInstallerPrompt',
  input: {schema: GenerateNodeInstallerInputSchema},
  output: {schema: GenerateNodeInstallerOutputSchema},
  prompt: `You are an expert Linux system administrator creating a setup guide for a Pterodactyl Wings daemon.
The user needs a shell script guide to set up a new server node.

The control panel URL is: {{{panelUrl}}}
The node ID is: {{{nodeId}}}

Generate a comprehensive, step-by-step guide as a shell script.

**Instructions for the guide:**
1.  **Introduction**: Start with a clear comment explaining the script's purpose.
2.  **Create Directories**: Include commands to create the necessary Pterodactyl directory: '/etc/pterodactyl'.
3.  **Download Config**: Provide a 'curl' command to download the 'config.yml' for the node and save it to '/etc/pterodactyl/config.yml'. The URL format is '{{{panelUrl}}}/api/nodes/{{{nodeId}}}/config'.
4.  **Download Docker Compose**: Provide a 'curl' command to download the 'docker-compose.yml' from '{{{panelUrl}}}/docker-compose.yml' and save it to '/etc/pterodactyl/docker-compose.yml'.
5.  **Run Installer**: Instruct the user to run the official installation script with the command: 'bash <(curl -s https://raw.githubusercontent.com/JishnuTheGamer/pterodactyl/blob/main/wings-jtg)'
6.  **Conclusion**: End with a confirmation message telling the user the daemon should be running and they can check its status on the panel.

Ensure the output is a single, well-formatted script within the 'guide' field. Use comments (#) to explain each step.
`,
});

const generateNodeInstallerFlow = ai.defineFlow(
  {
    name: 'generateNodeInstallerFlow',
    inputSchema: GenerateNodeInstallerInputSchema,
    outputSchema: GenerateNodeInstallerOutputSchema,
  },
  async (input) => {
    // In a real scenario, you might add more complex logic here,
    // like fetching a fresh docker-compose file from a trusted source.
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI did not return a valid installation guide.');
    }
    return output;
  }
);
