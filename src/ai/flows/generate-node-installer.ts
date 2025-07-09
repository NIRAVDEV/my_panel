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
  os: z.string().optional().describe('The operating system of the VPS. Can be "debian" or "nixos". Defaults to "debian".'),
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
  The target operating system is: {{{os}}}

  Generate a step-by-step guide in Markdown format for setting up the server. The guide should be concise and focus only on the commands to be executed.

  If the OS is 'nixos', provide instructions to:
  1.  Explain that the user needs to edit their /etc/nixos/configuration.nix file.
  2.  Provide the necessary Nix configuration snippet to enable Docker and configure the node service as a systemd service using the same Docker container.
  3.  Instruct the user to run 'sudo nixos-rebuild switch'.
  4.  Provide a command to verify the service is running (e.g., systemctl status wings).

  If the OS is 'debian' or anything else, provide instructions to:
  1.  **System Update:** Commands to update and upgrade system packages.
  2.  **Docker Installation:** Commands to install Docker Engine.
  3.  **Node Service Setup:** Provide the single command to download and run the Docker container for the node software.
  4.  **Verification:** A simple command on how the user can check if the node service is running correctly.

  Use this Docker command as the base for the service:
  \`\`\`bash
  docker run -d --restart=always --name=wings -p 8080:8080 -p 2022:2022 -v /var/run/docker.sock:/var/run/docker.sock -v /etc/pterodactyl:/etc/pterodactyl -e WINGS_UID=988 -e WINGS_GID=988 -e WINGS_TOKEN={{{nodeId}}} -e WINGS_URL={{{panelUrl}}} jexactyl/wings
  \`\`\`

  Ensure the output is only the raw Markdown content. Do not add any extra commentary before or after the guide.
  `,
});

const generateNodeInstallerFlow = ai.defineFlow(
  {
    name: 'generateNodeInstallerFlow',
    inputSchema: GenerateNodeInstallerInputSchema,
    outputSchema: GenerateNodeInstallerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
