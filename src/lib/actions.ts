"use server";

import { generateServerGuide } from "@/ai/flows/generate-server-guide";
import { generateNodeInstaller } from "@/ai/flows/generate-node-installer";
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

type SummaryState = {
  summary?: string;
  trends?: string;
  error?: string;
};

export async function summarizeActivity(serverActivityLog: string): Promise<SummaryState> {
    try {
        const result = await summarizeServerActivity({ serverActivityLog });
        return { summary: result.summary, trends: result.trends };
    } catch (error) {
        return { error: "Failed to generate summary. The AI model might be unavailable. Please try again later." };
    }
}

type InstallerGuideState = {
    guide?: string;
    error?: string;
}

export async function getNodeInstallerGuide(nodeId: string, panelUrl: string): Promise<InstallerGuideState> {
    try {
        const result = await generateNodeInstaller({ nodeId, panelUrl });
        return { guide: result.guide };
    } catch (error) {
        console.error(error);
        return { error: "Failed to generate installation guide. The AI model might be unavailable. Please try again later." };
    }
}
