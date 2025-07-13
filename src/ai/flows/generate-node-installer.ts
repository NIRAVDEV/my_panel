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

The operating system is: {{{os}}}
The control panel URL is: {{{panelUrl}}}
The node ID is: {{{nodeId}}}

Generate a comprehensive, step-by-step guide. The guide should be a shell script that can be mostly copy-pasted.

**Instructions for the guide:**
1.  **Introduction**: Start with a clear comment explaining the script's purpose for the specified OS.
2.  **Install Dependencies**:
    *   For **Debian/Ubuntu**: Include commands to 'apt-get update' and install 'docker.io' and 'docker-compose'.
    *   For **NixOS**: Explain that Docker is usually configured in 'configuration.nix' and provide a sample Nix configuration snippet to enable Docker. Advise the user to run 'nixos-rebuild switch'.
3.  **Create Directories**: Include commands to create the necessary Pterodactyl directories: '/etc/pterodactyl' and '/var/lib/pterodactyl'.
4.  **Download Config**: Provide a 'curl' command to download the 'config.yml' file for the node. The URL format is '{{{panelUrl}}}/api/nodes/{{{nodeId}}}/config'. The user should place it in '/etc/pterodactyl/config.yml'.
5.  **Docker Compose**: Provide the contents of a 'docker-compose.yml' file for Wings. Use the 'ghcr.io/pterodactyl/wings:v1.6.1' image. The user should save this as '/etc/pterodactyl/docker-compose.yml'.
6.  **Start Wings**: Include the command 'docker-compose -f /etc/pterodactyl/docker-compose.yml up -d' to start the daemon.
7.  **Conclusion**: End with a confirmation message telling the user the daemon should be running and they can check its status on the panel.

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
