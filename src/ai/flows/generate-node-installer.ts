'use server';
/**
 * @fileOverview An AI agent to generate installation guides for new server nodes.
 *
 * - generateNodeInstaller - A function that generates a setup guide for a VPS.
 * - GenerateNodeInstallerInput - The input type for the function.
 * - GenerateNodeInstallerOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNodeInstallerInputSchema = z.object({
  nodeId: z.string().describe('The unique ID of the node to be installed.'),
  panelUrl: z.string().describe('The base URL of the control panel.'),
});
export type GenerateNodeInstallerInput = z.infer<typeof GenerateNodeInstallerInputSchema>;

const GenerateNodeInstallerOutputSchema = z.object({
  guide: z.string().describe('A step-by-step installation guide in Markdown format.'),
});
export type GenerateNodeInstallerOutput = z.infer<typeof GenerateNodeInstallerOutputSchema>;

export async function generateNodeInstaller(input: GenerateNodeInstallerInput): Promise<GenerateNodeInstallerOutput> {
  return generateNodeInstallerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNodeInstallerPrompt',
  input: {schema: GenerateNodeInstallerInputSchema},
  output: {schema: GenerateNodeInstallerOutputSchema},
  prompt: `You are an expert Linux system administrator. A user needs to set up a new virtual private server (VPS) to act as a node for a game server control panel.

  The user's control panel is located at: {{{panelUrl}}}
  The unique ID for this new node is: {{{nodeId}}}

  Generate a step-by-step guide in Markdown format for setting up a fresh Debian-based Linux (like Ubuntu) server. The guide must include the following steps:

  1.  **System Update:** Instructions to update and upgrade system packages.
  2.  **Docker Installation:** Clear instructions to install Docker Engine.
  3.  **Node Service Setup:** Provide a single command to download and run a Docker container for the node software. This command should be pre-configured to communicate back to the control panel. Use the provided Node ID and Panel URL in the command. Create a placeholder \`jexactyl/wings\` docker image for this. The command should look something like this, but feel free to make it more robust (e.g., ensuring it restarts automatically):

      \`\`\`bash
      docker run -d --restart=always --name=wings -p 8080:8080 -p 2022:2022 -v /var/run/docker.sock:/var/run/docker.sock -v /etc/pterodactyl:/etc/pterodactyl -e WINGS_UID=988 -e WINGS_GID=988 -e WINGS_TOKEN={{{nodeId}}} -e WINGS_URL={{{panelUrl}}} jexactyl/wings
      \`\`\`

  4.  **Verification:** A simple step on how the user can check if the node service is running correctly.

  Ensure the guide is clear, easy to follow, and uses best practices for server setup. Structure the output as a single Markdown string.
  `,
});

const generateNodeInstallerFlow = ai.defineFlow(
  {
    name: 'generateNodeInstallerFlow',
    inputSchema: GenerateNodeInstallerInputSchema,
    outputSchema: GenerateNodeInstallerOutputSchema,
  },
  async input => {
    // In a real application, you might generate a secure, one-time token here
    // and associate it with the nodeId in your database.
    // For this demo, we'll use the nodeId directly as a placeholder token.
    const {output} = await prompt(input);
    return output!;
  }
);
