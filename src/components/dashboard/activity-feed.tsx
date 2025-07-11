"use client";

import { useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { summarizeActivity } from "@/jexactylmc/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bot, Sparkles } from "lucide-react";

// Mock activities. In a real app, this would be fetched from a logging service.
const activities: any[] = [];

type SummaryState = {
  summary?: string;
  trends?: string;
  error?: string;
}

export function ActivityFeed() {
  const [isPending, startTransition] = useTransition();
  const [summaryState, setSummaryState] = useState<SummaryState | null>(null);

  const handleSummarize = () => {
    startTransition(async () => {
      // In a real app, you'd fetch real logs. Here we'll send a placeholder.
      const activityLog = activities.length > 0
        ? activities.map(
            (activity) =>
              `[${activity.time}] ${activity.player} ${activity.action}`
          )
          .join("\n")
        : "No recent server activity to analyze.";
      const result = await summarizeActivity(activityLog);
      setSummaryState(result);
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>A log of recent player activities.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="space-y-4 flex-1">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={activity.avatar} alt={activity.player} />
                  <AvatarFallback>{activity.fallback}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    <span className="font-semibold">{activity.player}</span> {activity.action}
                  </p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground h-full flex items-center justify-center">
              <p>No recent activity.</p>
            </div>
          )}
        </div>
        <div className="mt-auto pt-4">
          <Button onClick={handleSummarize} disabled={isPending || activities.length === 0} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isPending ? (
              "Analyzing..."
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate AI Summary
              </>
            )}
          </Button>

          {isPending && (
            <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
          )}

          {summaryState && (summaryState.summary || summaryState.error) && (
            <Alert className="mt-4">
                <Bot className="h-4 w-4" />
                <AlertTitle>{summaryState.error ? "Error" : "AI Summary"}</AlertTitle>
                <AlertDescription>
                    {summaryState.error || (
                        <>
                            <p className="font-semibold">Summary:</p>
                            <p>{summaryState.summary}</p>
                            <p className="font-semibold mt-2">Trends:</p>
                            <p>{summaryState.trends}</p>
                        </>
                    )}
                </AlertDescription>
            </Alert>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
