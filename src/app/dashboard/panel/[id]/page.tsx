
import { initialServers } from "@/lib/server-data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Cpu, HardDrive, Users } from "lucide-react";
import { PluginManager } from "@/components/panel/plugin-manager";
import { Badge } from "@/components/ui/badge";
import type { Server } from "@/lib/server-data";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ResourceCharts } from "@/components/dashboard/resource-charts";

export default function ServerDetailPage({ params }: { params: { id: string } }) {
  // In a real app, you'd fetch this data from your backend.
  const server = initialServers.find((s) => s.id === params.id);

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <StatsCard
          title="Players"
          value={`${server.players.current}/${server.players.max}`}
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="RAM"
          value={`${server.ram} GB`}
          icon={<Cpu className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Storage"
          value={`${server.storage} GB`}
          icon={<HardDrive className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Version"
          value={server.version}
          icon={<Badge variant="outline">{server.type}</Badge>}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-8">
            <PluginManager />
        </div>
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Server Console</CardTitle>
                    <CardDescription>Live output from your server.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted aspect-video rounded-md p-4 text-sm font-mono text-muted-foreground overflow-auto">
                        <p>[INFO] Server is starting...</p>
                        <p>[INFO] Loading plugins...</p>
                        <p>[INFO] WorldEdit loaded.</p>
                        <p>[INFO] Done! For help, type "help".</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
