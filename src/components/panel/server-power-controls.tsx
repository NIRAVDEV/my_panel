
"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Play, RefreshCw, Square } from "lucide-react";
import { updateServerStatus } from "@/jexactylmc/actions";
import type { Server } from "@/lib/types";

export function ServerPowerControls({ server }: { server: Server }) {
    const [isPending, startTransition] = useTransition();

    const handleAction = (action: "start" | "stop" | "restart") => {
        startTransition(async () => {
            const formData = new FormData();
            formData.append('serverId', server.id);
            formData.append('action', action);
            await updateServerStatus(formData);
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
