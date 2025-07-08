"use server";

import { generateServerGuide } from "@/ai/flows/generate-server-guide";
import { summarizeServerActivity } from "@/ai/flows/summarize-server-activity";
import { z } from "zod";

const guideSchema = z.object({
  task: z.string().min(1, "Task description is required."),
});

type GuideState = {
  steps?: string[];
  error?: string;
};

export async function getAIGuide(prevState: any, formData: FormData): Promise<GuideState> {
  const validatedFields = guideSchema.safeParse({
    task: formData.get("task"),
  });

  if (!validatedFields.success) {
    return {
      error: "Please enter a task description.",
    };
  }

  try {
    const result = await generateServerGuide({ task: validatedFields.data.task });
    return { steps: result.steps };
  } catch (error) {
    return { error: "Failed to generate guide. The AI model might be unavailable. Please try again later." };
  }
}

const mockServerActivityLog = `
[2024-07-28 10:05:12] [Server thread/INFO]: Steve joined the game
[2024-07-28 10:12:45] [Server thread/INFO]: Alex crafted a diamond pickaxe
[2024-07-28 10:15:30] [Server thread/INFO]: Creeper was slain by Alex
[2024-07-28 10:22:01] [Server thread/INFO]: Steve mined 32 iron ore
[2024-07-28 10:30:55] [Server thread/INFO]: Alex reached the Nether
[2024-07-28 10:45:18] [Server thread/INFO]: Player_42 left the game
[2024-07-28 11:00:03] [Server thread/INFO]: Steve built a small house at X:123 Y:64 Z:456
[2024-07-28 11:15:22] [Server thread/INFO]: Alex found a fortress in the Nether
`;

type SummaryState = {
  summary?: string;
  trends?: string;
  error?: string;
};

export async function summarizeActivity(): Promise<SummaryState> {
    try {
        const result = await summarizeServerActivity({ serverActivityLog: mockServerActivityLog });
        return { summary: result.summary, trends: result.trends };
    } catch (error) {
        return { error: "Failed to generate summary. The AI model might be unavailable. Please try again later." };
    }
}
