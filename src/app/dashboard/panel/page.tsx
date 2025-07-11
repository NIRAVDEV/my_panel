
import { ServerList } from "@/components/panel/server-list";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServers } from "@/jexactylmc/actions";

export default async function PanelPage() {
  const initialServers = await getServers();

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
