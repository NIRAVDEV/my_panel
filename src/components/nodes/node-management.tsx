"use client";

import { useState } from "react";
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
import { BookOpen, MoreHorizontal, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { getNodeInstallerGuide } from "@/lib/actions";
import { Skeleton } from "@/components/ui/skeleton";

type Node = {
  id: string;
  name: string;
  location: string;
  fqdn: string;
  memory: number; // in GB
  disk: number; // in GB
  ports: { start: number; end: number };
  servers: number;
};

const initialNodes: Node[] = [
  { id: 'node-1', name: 'US-East-1', location: 'Ashburn, VA', fqdn: 'node1.jexactyl.pro', memory: 64, disk: 500, ports: { start: 25565, end: 25575 }, servers: 3 },
  { id: 'node-2', name: 'EU-West-1', location: 'Frankfurt, DE', fqdn: 'node2.jexactyl.pro', memory: 128, disk: 1000, ports: { start: 25565, end: 25585 }, servers: 5 },
];

const defaultNewNode = {
    name: "",
    location: "",
    fqdn: "",
    memory: "32",
    disk: "250",
    portsStart: "25565",
    portsEnd: "25575",
};

export function NodeManagement() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [open, setOpen] = useState(false);
  const [newNodeDetails, setNewNodeDetails] = useState(defaultNewNode);
  const [guideDialogOpen, setGuideDialogOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [guideContent, setGuideContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewNodeDetails(prev => ({ ...prev, [id]: value }));
  };

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeDetails.name || !newNodeDetails.location || !newNodeDetails.fqdn) return;

    const newNode: Node = {
        id: `node-${nodes.length + 1}`,
        name: newNodeDetails.name,
        location: newNodeDetails.location,
        fqdn: newNodeDetails.fqdn,
        memory: parseInt(newNodeDetails.memory, 10),
        disk: parseInt(newNodeDetails.disk, 10),
        ports: {
            start: parseInt(newNodeDetails.portsStart, 10),
            end: parseInt(newNodeDetails.portsEnd, 10),
        },
        servers: 0,
    };
    
    setNodes(prev => [...prev, newNode]);
    setOpen(false);
    setNewNodeDetails(defaultNewNode);
    toast({
        title: "Node Created",
        description: `New node "${newNode.name}" has been created.`,
    })
  };

  const handleOpenGuide = async (node: Node) => {
    setSelectedNode(node);
    setGuideDialogOpen(true);
    setIsGenerating(true);
    setGuideContent(null);

    // Use the current window's origin as the panel URL for a real-world scenario.
    const panelUrl = window.location.origin;
    const result = await getNodeInstallerGuide(node.id, panelUrl);
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

  return (
    <CardContent>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Node
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleCreateNode}>
                <DialogHeader>
                  <DialogTitle>Create New Node</DialogTitle>
                  <DialogDescription>
                      Configure a new physical node to host servers.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={newNodeDetails.name} onChange={handleInputChange} className="col-span-3" placeholder="e.g., US-West-1" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">Location</Label>
                    <Input id="location" value={newNodeDetails.location} onChange={handleInputChange} className="col-span-3" placeholder="e.g., Los Angeles, CA" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="fqdn" className="text-right">FQDN</Label>
                    <Input id="fqdn" value={newNodeDetails.fqdn} onChange={handleInputChange} className="col-span-3" placeholder="e.g., node.example.com" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="memory" className="text-right">Memory (GB)</Label>
                    <Input id="memory" type="number" value={newNodeDetails.memory} onChange={handleInputChange} className="col-span-3" placeholder="e.g., 64" required />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="disk" className="text-right">Disk (GB)</Label>
                    <Input id="disk" type="number" value={newNodeDetails.disk} onChange={handleInputChange} className="col-span-3" placeholder="e.g., 500" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ports" className="text-right">Port Range</Label>
                    <div className="col-span-3 grid grid-cols-2 gap-2">
                        <Input id="portsStart" type="number" value={newNodeDetails.portsStart} onChange={handleInputChange} placeholder="e.g., 25565" required />
                        <Input id="portsEnd" type="number" value={newNodeDetails.portsEnd} onChange={handleInputChange} placeholder="e.g., 25575" required />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create Node</Button>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Node Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Servers</TableHead>
              <TableHead>Allocation</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nodes.map((node) => (
              <TableRow key={node.id}>
                <TableCell>
                  <div className="font-medium">{node.name}</div>
                  <div className="text-sm text-muted-foreground">{node.fqdn}</div>
                </TableCell>
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
                            <DropdownMenuItem onClick={() => handleOpenGuide(node)}>
                                <BookOpen className="mr-2 h-4 w-4" />
                                Installation Guide
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={guideDialogOpen} onOpenChange={setGuideDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Installation Guide for {selectedNode?.name}</DialogTitle>
            <DialogDescription>
              Follow these steps on your new VPS to configure it as a server node.
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
