
"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createNode, updateNode } from "@/jexactylmc/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Node } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "../ui/switch";

export function NodeForm({ node, closeDialog }: { node?: Node, closeDialog: () => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
            const result = node ? await updateNode(node.id, formData) : await createNode(formData);

            if (result.success) {
                toast({
                    title: node ? "Node Updated" : "Node Created",
                    description: `The node has been successfully ${node ? 'updated' : 'created'}.`,
                });
                closeDialog();
            } else if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive"
                });
            }
        });
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{node ? "Edit Node" : "Create New Node"}</DialogTitle>
              <DialogDescription>
                  {node ? "Update the details for this node." : "Configure a new physical node to host servers."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" className="col-span-3" placeholder="e.g., US-West-1" defaultValue={node?.name} required />
              </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="os" className="text-right">OS</Label>
                <Select name="os" defaultValue={node?.os || "debian"}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select an OS" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="debian">Debian / Ubuntu</SelectItem>
                        <SelectItem value="nixos">NixOS</SelectItem>
                    </SelectContent>
                </Select>
                </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Location</Label>
                <Input id="location" name="location" className="col-span-3" placeholder="e.g., Los Angeles, CA" defaultValue={node?.location} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Visibility</Label>
                  <RadioGroup name="visibility" defaultValue={node?.visibility || 'Public'} className="col-span-3 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Public" id="v-public" />
                        <Label htmlFor="v-public">Public</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Private" id="v-private" />
                        <Label htmlFor="v-private">Private</Label>
                    </div>
                  </RadioGroup>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fqdn" className="text-right">FQDN</Label>
                <Input id="fqdn" name="fqdn" className="col-span-3" placeholder="e.g., node.example.com or IP" defaultValue={node?.fqdn} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="useSSL" className="text-right">Use SSL</Label>
                <div className="col-span-3">
                    <Switch id="useSSL" name="useSSL" defaultChecked={node?.useSSL ?? true} />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="daemonPort" className="text-right">Daemon Port</Label>
                <Input id="daemonPort" name="daemonPort" type="number" className="col-span-3" placeholder="e.g., 8080" defaultValue={node?.daemonPort || 8080} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="memory" className="text-right">Memory (GB)</Label>
                <Input id="memory" name="memory" type="number" className="col-span-3" placeholder="e.g., 64" defaultValue={node?.memory} required />
              </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="disk" className="text-right">Disk (GB)</Label>
                <Input id="disk" name="disk" type="number" className="col-span-3" placeholder="e.g., 500" defaultValue={node?.disk} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="portsStart" className="text-right">Port Range</Label>
                <div className="col-span-3 grid grid-cols-2 gap-2">
                    <Input id="portsStart" name="portsStart" type="number" placeholder="e.g., 25565" defaultValue={node?.ports.start} required />
                    <Input id="portsEnd" name="portsEnd" type="number" placeholder="e.g., 25575" defaultValue={node?.ports.end} required />
                </div>
              </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : (node ? "Save Changes" : "Create Node")}</Button>
            </DialogFooter>
        </form>
    );
}
