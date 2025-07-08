import { ServerList } from "@/components/panel/server-list";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PanelPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Control Panel</CardTitle>
          <CardDescription>
            Manage your Minecraft servers.
          </CardDescription>
        </CardHeader>
        <ServerList />
      </Card>
    </div>
  );
}
