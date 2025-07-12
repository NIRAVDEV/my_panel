
"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
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
} from "@/components/ui/dialog";
import { BookOpen, Edit, MoreHorizontal, PlusCircle, RefreshCw, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { updateNodeStatus, deleteNode, getNodeInstallerGuide } from "@/jexactylmc/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Node } from "@/lib/types";
import { NodeForm } from "./node-form";

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
      
      <div className="rounded-md border w-full overflow-x-auto">
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
                  <Link href={`/dashboard/nodes/${node.id}`} className="font-medium hover:underline flex items-center gap-2">
                    {node.name} <Badge variant="outline">{node.os}</Badge>
                  </Link>
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
        </DialogContent>
      </Dialog>
    </CardContent>
  );
}
