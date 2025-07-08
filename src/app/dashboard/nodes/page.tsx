import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NodeManagement } from "@/components/nodes/node-management";

export default function NodesPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Node Management</CardTitle>
          <CardDescription>
            Manage the physical nodes that your servers run on.
          </CardDescription>
        </CardHeader>
        <NodeManagement />
      </Card>
    </div>
  );
}
