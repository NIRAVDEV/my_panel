import { StatsCard } from "@/components/dashboard/stats-card";
import { ResourceCharts } from "@/components/dashboard/resource-charts";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { HardDrive, Cpu, Users, Clock, ArrowRight, PlusCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Server Status"
          value="Online"
          icon={<HardDrive className="h-5 w-5 text-muted-foreground" />}
          change="Running"
          changeColor="text-green-500"
        />
        <StatsCard
          title="Active Players"
          value="12/100"
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          change="+2 new"
        />
        <StatsCard
          title="CPU Load"
          value="42%"
          icon={<Cpu className="h-5 w-5 text-muted-foreground" />}
          change="-5% from last hour"
        />
        <StatsCard
          title="Uptime"
          value="72h 15m"
          icon={<Clock className="h-5 w-5 text-muted-foreground" />}
          change="Since last restart"
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
