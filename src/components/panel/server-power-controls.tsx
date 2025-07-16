
"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Play, RefreshCw, Square } from "lucide-react";
import type { Server } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function ServerPowerControls({ server }: { server: Server }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleAction = (action: "start" | "stop" | "restart") => {
        startTransition(async () => {
            // Mock server action
            console.log(`Action "${action}" on server ${server.id}`);
            await new Promise(resolve => setTimeout(resolve, 500));
            toast({
                title: "Action Sent",
                description: `The "${action}" command has been sent to the server. (Mock)`,
            });
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction("start")}
                disabled={isPending || server.status === 'Online' || server.status === 'Starting'}
            >
                <Play className="mr-2 h-4 w-4" /> Start
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction("restart")}
                disabled={isPending || server.status === 'Offline' || server.status === 'Starting'}
            >
                <RefreshCw className="mr-2 h-4 w-4" /> Restart
            </Button>
            <Button
                variant="destructive"
                size="sm"
                onClick={() => handleAction("stop")}
                disabled={isPending || server.status === 'Offline'}
            >
                <Square className="mr-2 h-4 w-4" /> Stop
            </Button>
        </div>
    );
}
