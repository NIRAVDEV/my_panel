
"use client";

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Copy, Terminal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { generateServerGuide } from '@/ai/flows/generate-server-guide';
import type { Server } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Rocket, CheckCircle } from 'lucide-react';

type GuideStep = {
    title: string;
    instruction: string;
    command?: string;
};

export function ServerSetupGuide({ server }: { server: Server }) {
  const [guideDialogOpen, setGuideDialogOpen] = useState(false);
  const [guideContent, setGuideContent] = useState<GuideStep[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, startTransition] = useTransition();
  const { toast } = useToast();

  const handleOpenGuide = () => {
    setGuideDialogOpen(true);
    if (guideContent) return; // Don't re-generate if we already have it

    startTransition(async () => {
      setError(null);
      try {
        const result = await generateServerGuide({ serverType: server.type, serverVersion: server.version });
        setGuideContent(result.guide);
      } catch (e: any) {
        const errorMsg = e.message || "An unknown error occurred.";
        setError(`Error generating guide: ${errorMsg}`);
        toast({
          title: "Error Generating Guide",
          description: errorMsg,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>First-Time Setup</CardTitle>
          <CardDescription>
            New server? Get a quick guide to get it running.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This guide will walk you through the necessary steps before launching your server for the first time.
          </p>
          <Button onClick={handleOpenGuide} className="w-full">
            <Rocket className="mr-2 h-4 w-4" />
            Show Setup Guide
          </Button>
        </CardContent>
      </Card>

      <Dialog open={guideDialogOpen} onOpenChange={setGuideDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Setup Guide for {server.name}</DialogTitle>
            <DialogDescription>
              Follow these steps to prepare your new {server.type} server.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border p-4 h-[60vh] overflow-y-auto bg-muted">
            {isGenerating ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <br />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : error ? (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : guideContent ? (
                <div className="space-y-6">
                    {guideContent.map((step, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground">
                                    {index + 1}
                                </div>
                                {index < guideContent.length - 1 && (
                                    <div className="w-px h-full bg-border mt-2"></div>
                                )}
                            </div>
                            <div className="flex-1 pb-4">
                                <h4 className="font-semibold text-foreground">{step.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{step.instruction}</p>
                                {step.command && (
                                    <pre className="mt-2 text-xs font-mono bg-background p-2 rounded-md border text-foreground">
                                        <code>{step.command}</code>
                                    </pre>
                                )}
                            </div>
                        </div>
                    ))}
                     <div className="flex gap-4">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-500 text-white">
                           <CheckCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-foreground">Done!</h4>
                            <p className="text-sm text-muted-foreground mt-1">Your server is ready to launch. Enjoy!</p>
                        </div>
                    </div>
                </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
