

import { getServerById, updateServerStatus } from "@/jexactylmc/actions";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Play, RefreshCw, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Server } from "@/lib/types";
import { ServerNav } from "@/components/panel/server-nav";
import { Card } from "@/components/ui/card";

export default async function ServerManagementLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const server = await getServerById(params.id);

  if (!server) {
    notFound();
  }

  const getStatusBadge = (status: Server['status']) => {
    switch (status) {
      case "Online":
        return <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>;
      case "Offline":
        return <Badge variant="destructive">Offline</Badge>;
      case "Starting":
        return <Badge variant="secondary" className="animate-pulse">Starting</Badge>;
    }
  }

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <Link href="/dashboard/panel">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Control Panel</span>
                </Link>
            </Button>
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold font-headline lg:text-3xl">{server.name}</h1>
                {getStatusBadge(server.status)}
            </div>
        </div>
        <div className="flex items-center gap-2">
          <form action={updateServerStatus.bind(null, server.id, 'start')}>
            <Button type="submit" variant="outline" size="sm" disabled={server.status === 'Online' || server.status === 'Starting'}>
                <Play className="mr-2 h-4 w-4" /> Start
            </Button>
          </form>
          <form action={updateServerStatus.bind(null, server.id, 'restart')}>
             <Button type="submit" variant="outline" size="sm" disabled={server.status === 'Offline' || server.status === 'Starting'}>
                <RefreshCw className="mr-2 h-4 w-4" /> Restart
            </Button>
          </form>
          <form action={updateServerStatus.bind(null, server.id, 'stop')}>
            <Button type="submit" variant="destructive" size="sm" disabled={server.status === 'Offline'}>
                <Square className="mr-2 h-4 w-4" /> Stop
            </Button>
          </form>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
        <Card className="p-4 h-fit">
            <ServerNav serverId={server.id} />
        </Card>
        <div className="flex flex-col gap-6">
            {children}
        </div>
      </div>
    </div>
  );
}
