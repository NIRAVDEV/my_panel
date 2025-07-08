import { GuideGenerator } from "@/components/assistant/guide-generator";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AssistantPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">AI Game Assistant</CardTitle>
          <CardDescription>
            Need help with a task in Minecraft? Describe what you want to do,
            and the AI assistant will provide you with a step-by-step guide.
          </CardDescription>
        </CardHeader>
        <GuideGenerator />
      </Card>
    </div>
  );
}
