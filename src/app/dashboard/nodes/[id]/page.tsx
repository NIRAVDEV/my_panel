
import { NodeConfiguration } from "@/components/nodes/node-configuration";
import { notFound } from "next/navigation";
import { NodeInstaller } from "@/components/nodes/node-installer";
import { nodes } from "@/lib/server-data";

export default function NodeConfigurationPage({ params }: { params: { id: string } }) {
  const node = nodes.find(n => n.id === params.id);

  if (!node) {
    notFound();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <NodeConfiguration node={node} />
        </div>
        <div>
            <NodeInstaller node={node} />
        </div>
    </div>
  );
}
