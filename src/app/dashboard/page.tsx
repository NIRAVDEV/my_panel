
import { StatsCard } from "@/components/dashboard/stats-card";
import { ResourceCharts } from "@/components/dashboard/resource-charts";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { HardDrive, Cpu, Users, Clock, ArrowRight, PlusCircle, Server } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServers, getUsers } from "@/jexactylmc/actions";

export default async function DashboardPage() {
  const servers = await getServers();
  const users = await getUsers();

  const onlineServers = servers.filter(s => s.status === "Online").length;
  const serverStatus = onlineServers > 0 ? "Online" : "Offline";
  const totalPlayers = servers.reduce((acc, server) => acc + server.players.current, 0);
  const maxPlayers = servers.reduce((acc, server) => acc + server.players.max, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Server Status"
          value={serverStatus}
          icon={<HardDrive className="h-5 w-5 text-muted-foreground" />}
          change={`${onlineServers} of ${servers.length} servers online`}
          changeColor={serverStatus === "Online" ? "text-green-500" : ""}
        />
        <StatsCard
          title="Active Players"
          value={`${totalPlayers} / ${maxPlayers}`}
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          change="Across all servers"
        />
        <StatsCard
          title="Total Servers"
          value={servers.length}
          icon={<Server className="h-5 w-5 text-muted-foreground" />}
          change="Configured servers"
        />
        <StatsCard
          title="Total Users"
          value={users.length}
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          change="Registered accounts"
        />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <ResourceCharts />
          <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get to where you need to go, faster.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="w-full sm:w-auto">
                    <Link href="/dashboard/panel">
                        Go to Control Panel <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href="/dashboard/panel">
                        <PlusCircle className="mr-2 h-4 w-4" /> Create New Server
                    </Link>
                </Button>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
