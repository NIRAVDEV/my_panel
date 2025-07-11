

import { getServerById } from "@/jexactylmc/actions";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, HardDrive, Users } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ResourceCharts } from "@/components/dashboard/resource-charts";
import { Badge } from "@/components/ui/badge";

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

      <ResourceCharts />
    </>
  );
}
