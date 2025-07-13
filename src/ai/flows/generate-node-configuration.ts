
'use server';
/**
 * @fileOverview A flow for generating Pterodactyl node configuration files.
 *
 * - generateNodeConfig - A function that takes node details and returns a YAML config.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateNodeConfigInputSchema = z.object({
  uuid: z.string().describe("The UUID of the node."),
  tokenId: z.string().describe("The token ID for the daemon."),
  token: z.string().describe("The authentication token for the daemon."),
  fqdn: z.string().describe("The Fully Qualified Domain Name of the node."),
  panelUrl: z.string().url().describe("The URL of the control panel."),
});
type GenerateNodeConfigInput = z.infer<typeof GenerateNodeConfigInputSchema>;

const GenerateNodeConfigOutputSchema = z.object({
  config: z.string().describe('The generated YAML configuration content.'),
});
type GenerateNodeConfigOutput = z.infer<
  typeof GenerateNodeConfigOutputSchema
>;

export async function generateNodeConfig(
  input: Omit<GenerateNodeConfigInput, 'memory' | 'disk'> & { memory: number, disk: number, panelUrl: string }
): Promise<GenerateNodeConfigOutput> {
  return generateNodeConfigFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNodeConfigPrompt',
  input: {schema: GenerateNodeConfigInputSchema},
  output: {schema: GenerateNodeConfigOutputSchema},
  prompt: `You are a helpful assistant creating a 'config.yml' for a Pterodactyl daemon (wings).
Generate the YAML configuration using the exact format below. Do not add any extra fields or comments.

**Template:**
\`\`\`yaml
debug: false
uuid: {{{uuid}}}
token_id: {{{tokenId}}}
token: {{{token}}}
api:
  host: 0.0.0.0
  port: 8080
  ssl:
    enabled: true
    cert: /etc/letsencrypt/live/{{{fqdn}}}/fullchain.pem
    key: /etc/letsencrypt/live/{{{fqdn}}}/privkey.pem
  upload_limit: 100
system:
  data: /var/lib/pterodactyl/volumes
  sftp:
    bind_port: 2022
allowed_mounts: []
remote: '{{{panelUrl}}}'
\`\`\`

**Instructions:**
- Replace the placeholders \`{{{uuid}}}\`, \`{{{tokenId}}}\`, \`{{{token}}}\`, \`{{{fqdn}}}\`, and \`{{{panelUrl}}}\` with the values provided.
- The output must be only the raw YAML content inside the 'config' field.
`,
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
    // Clean up potential markdown formatting from the AI response
    const cleanedConfig = output.config.replace(/```yaml\n/g, '').replace(/```/g, '');
    return { config: cleanedConfig };
  }
);
