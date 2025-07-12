
import { getNodeById } from "@/jexactylmc/actions";
import { NodeConfiguration } from "@/components/nodes/node-configuration";
import { notFound } from "next/navigation";

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
            {/* Placeholder for Auto-Deploy Card */}
        </div>
    </div>
  );
}
