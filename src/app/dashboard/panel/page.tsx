
import { ServerList } from "@/components/panel/server-list";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { servers } from "@/lib/server-data";

export default function PanelPage() {
  const initialServers = servers;

  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Control Panel</CardTitle>
          <CardDescription>
            Manage your Minecraft servers.
          </CardDescription>
        </CardHeader>
        <ServerList initialServers={initialServers} />
      </Card>
    </div>
  );
}
