
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerLogs } from "@/jexactylmc/actions";
import { Skeleton } from "../ui/skeleton";

export function ServerConsole({ serverId }: { serverId: string }) {
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const consoleEndRef = useRef<HTMLDivElement>(null);

    const fetchLogs = useCallback(async () => {
        try {
            const fetchedLogs = await getServerLogs(serverId);
            setLogs(fetchedLogs);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
            setLogs(prevLogs => [...prevLogs, "[ERROR] Could not connect to the server to fetch logs."]);
        } finally {
            // Only set loading to false on the first fetch
            if (isLoading) {
                setIsLoading(false);
            }
        }
    }, [serverId, isLoading]);

    useEffect(() => {
        // Initial fetch
        fetchLogs();

        // Set up interval to fetch logs periodically
        const interval = setInterval(fetchLogs, 5000);

        // Clean up interval on component unmount
        return () => clearInterval(interval);
    }, [fetchLogs]);

    useEffect(() => {
        // Scroll to the bottom of the console when logs update
        if (consoleEndRef.current) {
            consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Server Console</CardTitle>
                <CardDescription>Live output from your server. Updates automatically.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="bg-muted aspect-video rounded-md p-4 text-sm font-mono text-muted-foreground overflow-auto h-[400px]">
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ) : (
                        <>
                            {logs.map((log, index) => (
                                <p key={index}>{log}</p>
                            ))}
                            <div ref={consoleEndRef} />
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

    