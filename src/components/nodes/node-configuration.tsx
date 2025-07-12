
"use client";

import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAINodeConfig } from '@/jexactylmc/actions';
import type { Node } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';
import { Button } from '../ui/button';

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
      const result = await getAINodeConfig(node);
      setState(result);
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        })
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration File</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending ? (
            <div className="space-y-2 rounded-md border p-4 bg-muted h-[300px]">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
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
                <pre className="text-sm font-mono whitespace-pre-wrap bg-muted rounded-md border p-4 text-foreground overflow-x-auto">
                    <code>{state.config}</code>
                </pre>
                <p className="text-sm text-muted-foreground">
                    This file should be placed in your daemon's root directory (usually <code className="bg-muted p-1 rounded-sm">/etc/pterodactyl</code>) in a file called <code className="bg-muted p-1 rounded-sm">config.yml</code>.
                </p>
            </>
        )}
      </CardContent>
    </Card>
  );
}
