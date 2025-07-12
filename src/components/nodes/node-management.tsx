
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Edit, MoreHorizontal, PlusCircle, RefreshCw, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { createNode, getNodeInstallerGuide, updateNodeStatus, deleteNode, updateNode } from "@/jexactylmc/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Node } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

function NodeForm({ node, closeDialog }: { node?: Node, closeDialog: () => void }) {
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
                <Input id="fqdn" name="fqdn" className="col-span-3" placeholder="e.g., node.example.com" defaultValue={node?.fqdn} required />
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


export function NodeManagement({ initialNodes }: { initialNodes: Node[] }) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | undefined>(undefined);
  
  const [guideDialogOpen, setGuideDialogOpen] = useState(false);
  const [guideNode, setGuideNode] = useState<Node | null>(null);
  const [guideContent, setGuideContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { toast } = useToast();

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);
  
  const handleOpenDialog = (node?: Node) => {
    setSelectedNode(node);
    setDialogOpen(true);
  }

  const handleOpenGuide = async (node: Node) => {
    setGuideNode(node);
    setGuideDialogOpen(true);
    setIsGenerating(true);
    setGuideContent(null);

    const panelUrl = window.location.origin;
    const result = await getNodeInstallerGuide(node.id, panelUrl, node.os);
    if (result.guide) {
        setGuideContent(result.guide);
    } else {
        const errorMsg = result.error || "An unknown error occurred.";
        setGuideContent(errorMsg);
        toast({
            title: "Error",
            description: errorMsg,
            variant: "destructive"
        })
    }
    setIsGenerating(false);
  };
  
  const handleCheckStatus = (node: Node) => {
    startTransition(async () => {
        const result = await updateNodeStatus(node.id, node.status);
        if (result.success) {
            toast({
                title: `Node is now ${result.newStatus}`,
                description: `Status for node "${node.name}" has been updated.`,
            });
        }
    });
  };

  const handleDelete = (nodeId: string) => {
    startTransition(async () => {
        const result = await deleteNode(nodeId);
        if (result.success) {
            toast({
                title: "Node Deleted",
                description: "The node has been successfully deleted.",
                variant: "destructive"
            });
        } else if (result.error) {
            toast({
                title: "Error Deleting Node",
                description: result.error,
                variant: "destructive"
            });
        }
    });
  }

  const getStatusBadge = (status: Node['status']) => {
    if (status === 'Online') {
      return <Badge className="bg-green-500 hover:bg-green-600 text-primary-foreground">Online</Badge>;
    }
    return <Badge variant="destructive">Offline</Badge>;
  };

  return (
    <CardContent>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Node
        </Button>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <NodeForm node={selectedNode} closeDialog={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Node Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Servers</TableHead>
              <TableHead>Allocation</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nodes.length > 0 ? nodes.map((node) => (
              <TableRow key={node.id} className={isPending ? 'opacity-50' : ''}>
                <TableCell>
                  <div className="font-medium flex items-center gap-2">{node.name} <Badge variant="outline">{node.os}</Badge></div>
                  <div className="text-sm text-muted-foreground">{node.fqdn}</div>
                </TableCell>
                <TableCell>{getStatusBadge(node.status)}</TableCell>
                <TableCell>{node.location}</TableCell>
                <TableCell>{node.servers}</TableCell>
                <TableCell>
                    <div>{node.memory} GB RAM &bull; {node.disk} GB Disk</div>
                    <div className="text-sm text-muted-foreground">Ports: {node.ports.start}-{node.ports.end}</div>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(node)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCheckStatus(node)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Check Status
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenGuide(node)}>
                                <BookOpen className="mr-2 h-4 w-4" />
                                Installation Guide
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(node.id)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No nodes created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={guideDialogOpen} onOpenChange={setGuideDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Installation Guide for {guideNode?.name}</DialogTitle>
            <DialogDescription>
              Follow these steps on your new {guideNode?.os === 'nixos' ? 'NixOS' : 'Debian/Ubuntu'} VPS to configure it as a server node.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border p-4 h-[60vh] overflow-y-auto bg-muted">
            {isGenerating ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <br/>
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
                <pre className="text-sm font-mono whitespace-pre-wrap bg-transparent border-none p-0 text-foreground">
                    {guideContent}
                </pre>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  );
}
