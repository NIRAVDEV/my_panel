'use server';
/**
 * @fileOverview A flow for generating Pterodactyl node configuration files.
 *
 * - generateNodeConfig - A function that takes node details and returns a YAML config.
 * - GenerateNodeConfigInput - The input type for the function.
 * - GenerateNodeConfigOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateNodeConfigInputSchema = z.object({
  name: z.string().describe("The name of the node."),
  fqdn: z.string().describe("The Fully Qualified Domain Name of the node."),
  memory: z.number().describe("The total memory available on the node in MB."),
  disk: z.number().describe("The total disk space available on the node in MB."),
  portsStart: z.number().describe("The starting port for the allocation range."),
  portsEnd: z.number().describe("The ending port for the allocation range."),
});
type GenerateNodeConfigInput = z.infer<typeof GenerateNodeConfigInputSchema>;

const GenerateNodeConfigOutputSchema = z.object({
  config: z.string().describe('The generated YAML configuration content.'),
});
type GenerateNodeConfigOutput = z.infer<
  typeof GenerateNodeConfigOutputSchema
>;

export async function generateNodeConfig(
  input: Omit<GenerateNodeConfigInput, 'memory' | 'disk'> & { memory: number, disk: number }
): Promise<GenerateNodeConfigOutput> {
  // Convert GB to MB for the prompt, which the AI will handle better
  const inputInMB = {
      ...input,
      memory: input.memory * 1024,
      disk: input.disk * 1024
  };
  return generateNodeConfigFlow(inputInMB);
}

const prompt = ai.definePrompt({
  name: 'generateNodeConfigPrompt',
  input: {schema: GenerateNodeConfigInputSchema},
  output: {schema: GenerateNodeConfigOutputSchema},
  prompt: `You are a helpful assistant who is an expert in configuring Pterodactyl server nodes.
Your task is to generate a 'config.yml' file for a new Pterodactyl daemon (wings).

Use the following details for the node:
- FQDN: {{{fqdn}}}
- Total Memory: {{{memory}}} MB
- Total Disk Space: {{{disk}}} MB
- Port Range: {{{portsStart}}}-{{{portsEnd}}}

Generate the complete YAML configuration. The memory and disk values are already provided in MB.
Ensure the output is only the raw YAML content, without any surrounding text or markdown formatting.
The scheme for the remote URL should be https. The daemon should listen on port 8080 and use SSL.
The sftp port should be 2022.
Set the 'name' field in the config to be the same as the node's FQDN for consistency.`,
});

const generateNodeConfigFlow = ai.defineFlow(
  {
    name: 'generateNodeConfigFlow',
    inputSchema: GenerateNodeConfigInputSchema,
    outputSchema: GenerateNodeConfigOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI did not return a valid configuration.');
    }
    return output;
  }
);
