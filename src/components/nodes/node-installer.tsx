
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
import { getNodeInstallerGuide } from '@/jexactylmc/actions';
import type { Node } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function NodeInstaller({ node }: { node: Node }) {
  const [guideDialogOpen, setGuideDialogOpen] = useState(false);
  const [guideContent, setGuideContent] = useState<string | null>(null);
  const [isGenerating, startTransition] = useTransition();
  const { toast } = useToast();

  const handleOpenGuide = () => {
    setGuideDialogOpen(true);
    startTransition(async () => {
      setGuideContent(null);
      const panelUrl = window.location.origin;
      const result = await getNodeInstallerGuide(node.id, panelUrl, node.os);
      if (result.guide) {
        setGuideContent(result.guide);
      } else {
        const errorMsg = result.error || "An unknown error occurred.";
        setGuideContent(`Error generating guide: ${errorMsg}`);
        toast({
          title: "Error Generating Guide",
          description: errorMsg,
          variant: "destructive",
        });
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: "The installation guide has been copied.",
      });
    }, (err) => {
      toast({
        title: "Failed to Copy",
        description: "Could not copy the guide to your clipboard.",
        variant: "destructive",
      });
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Auto-Deploy Installer</CardTitle>
          <CardDescription>
            Generate a step-by-step installation script for this node.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Run this script on your new, clean {node.os} server to automatically install and configure the Pterodactyl daemon.
          </p>
          <Button onClick={handleOpenGuide} className="w-full">
            <BookOpen className="mr-2 h-4 w-4" />
            Generate Installation Guide
          </Button>
        </CardContent>
      </Card>

      <Dialog open={guideDialogOpen} onOpenChange={setGuideDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Installation Guide for {node.name}</DialogTitle>
            <DialogDescription>
              Follow these steps on your new {node.os} server to configure it as a node.
            </DialogDescription>
          </DialogHeader>
          <div className="relative rounded-md border p-4 h-[60vh] overflow-y-auto bg-muted">
            {isGenerating ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <br />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : guideContent ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(guideContent)}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
                {guideContent.startsWith("Error") ? (
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{guideContent}</AlertDescription>
                    </Alert>
                ) : (
                    <pre className="text-sm font-mono whitespace-pre-wrap bg-transparent border-none p-0 text-foreground">
                        <code>{guideContent}</code>
                    </pre>
                )}
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
