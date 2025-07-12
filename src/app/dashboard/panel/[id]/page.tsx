

import { getServerById } from "@/jexactylmc/actions";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, HardDrive, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ResourceCharts } from "@/components/dashboard/resource-charts";
import { Badge } from "@/components/ui/badge";
import { ServerConsole } from "@/components/panel/server-console";

export default async function ServerOverviewPage({ params }: { params: { id: string } }) {
  const server = await getServerById(params.id);

  if (!server) {
    notFound();
  }

  return (
    <>
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

      <ServerConsole serverId={server.id} />

      <ResourceCharts />
    </>
  );
}
