import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
        <CardContent>
            <p>Node management functionality will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
