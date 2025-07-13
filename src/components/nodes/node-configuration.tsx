
"use client";

import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAINodeConfig } from '@/jexactylmc/actions';
import type { Node } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

type NodeConfigState = {
  config?: string;
  error?: string;
};

export function NodeConfiguration({ node }: { node: Node }) {
  const [state, setState] = useState<NodeConfigState>({});
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    startTransition(async () => {
      const panelUrl = window.location.origin;
      const result = await getAINodeConfig(node, panelUrl);
      setState(result);
      if (result.error) {
        toast({
          title: "Error Generating Config",
          description: result.error,
          variant: "destructive"
        })
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id]);

  const copyToClipboard = () => {
    if (state.config) {
        navigator.clipboard.writeText(state.config).then(() => {
            toast({
                title: "Copied to Clipboard",
                description: "The configuration has been copied.",
            });
        }, (err) => {
            toast({
                title: "Failed to Copy",
                description: "Could not copy the configuration to your clipboard.",
                variant: "destructive"
            });
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration File</CardTitle>
        <CardDescription>
            This YAML configuration is dynamically generated for your node.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending ? (
            <div className="space-y-2 rounded-md border p-4 bg-muted h-[400px]">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        ) : state.error ? (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Could not generate configuration</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        ) : (
            <>
                <div className="relative">
                    <pre className="text-sm font-mono whitespace-pre-wrap bg-muted rounded-md border p-4 text-foreground overflow-x-auto max-h-[400px]">
                        <code>{state.config}</code>
                    </pre>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-2 right-2"
                        onClick={copyToClipboard}
                    >
                        Copy
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Place this in your daemon's root directory (e.g., <code className="bg-muted p-1 rounded-sm">/etc/pterodactyl</code>) in a file named <code className="bg-muted p-1 rounded-sm">config.yml</code>.
                </p>
            </>
        )}
      </CardContent>
    </Card>
  );
}
