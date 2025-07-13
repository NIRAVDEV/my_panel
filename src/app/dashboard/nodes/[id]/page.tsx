
import { getNodeById } from "@/jexactylmc/actions";
import { NodeConfiguration } from "@/components/nodes/node-configuration";
import { notFound } from "next/navigation";
import { NodeInstaller } from "@/components/nodes/node-installer";

export default async function NodeConfigurationPage({ params }: { params: { id: string } }) {
  const node = await getNodeById(params.id);

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
