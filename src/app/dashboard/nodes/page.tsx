
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NodeManagement } from "@/components/nodes/node-management";
import { getCurrentUser, getNodes } from "@/jexactylmc/actions";
import { redirect } from "next/navigation";

export default async function NodesPage() {
  const user = await getCurrentUser();
  if (user?.role !== 'Admin') {
    redirect('/dashboard');
  }

  const initialNodes = await getNodes();

  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Node Management</CardTitle>
          <CardDescription>
            Manage the physical nodes that your servers run on.
          </CardDescription>
        </CardHeader>
        <NodeManagement initialNodes={initialNodes} />
      </Card>
    </div>
  );
}
