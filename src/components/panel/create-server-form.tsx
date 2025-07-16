
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Node } from "@/lib/types";

export function CreateServerForm({ nodes, closeDialog }: { nodes: Node[], closeDialog: () => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
            // This is where you would call your backend API
            console.log("Form submitted", Object.fromEntries(formData));
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast({
                title: "Server Created",
                description: `Your new server has been created. (Mock)`,
            });
            closeDialog();
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create New Server</DialogTitle>
              <DialogDescription>
                  Configure and create a new Minecraft server.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" className="col-span-3" placeholder="e.g., My Awesome Server" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nodeId" className="text-right">Node</Label>
                <Select name="nodeId" required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a node to deploy to" />
                  </SelectTrigger>
                  <SelectContent>
                      {nodes.length > 0 ? (
                        nodes.map(node => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.name} ({node.location})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No available nodes</SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ram" className="text-right">RAM (GB)</Label>
                <Select name="ram" defaultValue="4">
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="2">2 GB</SelectItem>
                      <SelectItem value="4">4 GB</SelectItem>
                      <SelectItem value="8">8 GB</SelectItem>
                      <SelectItem value="16">16 GB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="storage" className="text-right">Storage (GB)</Label>
                <Input id="storage" name="storage" type="number" defaultValue="10" className="col-span-3" placeholder="e.g., 10" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">Server Type</Label>
                 <Select name="type" defaultValue="Paper">
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Vanilla">Vanilla</SelectItem>
                      <SelectItem value="Paper">Paper</SelectItem>
                      <SelectItem value="Spigot">Spigot</SelectItem>
                      <SelectItem value="Purpur">Purpur</SelectItem>
                      <SelectItem value="Forge">Forge</SelectItem>
                      <SelectItem value="Fabric">Fabric</SelectItem>
                      <SelectItem value="BungeeCord">BungeeCord</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="version" className="text-right">Version</Label>
                 <Select name="version" defaultValue="1.21">
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="1.21">1.21</SelectItem>
                      <SelectItem value="1.20.4">1.20.4</SelectItem>
                      <SelectItem value="1.19.2">1.19.2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isPending || nodes.length === 0}>{isPending ? "Creating..." : "Create Server"}</Button>
            </DialogFooter>
        </form>
    );
}
