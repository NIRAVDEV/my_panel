
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Play, PlusCircle, RefreshCw, SlidersHorizontal, Square, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Server } from "@/lib/types";
import { createServer, updateServerStatus, deleteServer } from "@/lib/actions";


function CreateServerForm({ closeDialog }: { closeDialog: () => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const result = await createServer(formData);
            if (result.success) {
                toast({
                    title: "Server Created",
                    description: `Your new server has been created.`,
                });
                closeDialog();
            } else if (result.error) {
                toast({
                    title: "Error creating server",
                    description: result.error,
                    variant: "destructive"
                });
            }
        });
    };

    return (
        <form action={handleSubmit}>
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
                <Label htmlFor="ram" className="text-right">RAM</Label>
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
                <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create Server"}</Button>
            </DialogFooter>
        </form>
    );
}

export function ServerList({ initialServers }: { initialServers: Server[] }) {
  const [servers, setServers] = useState<Server[]>(initialServers);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setServers(initialServers);
  }, [initialServers]);

  const handleServerAction = (serverId: string, action: "start" | "stop" | "restart") => {
    startTransition(async () => {
      await updateServerStatus(serverId, action);
      toast({
        title: "Action Sent",
        description: `The "${action}" command has been sent to server ${serverId}.`,
      });
    });
  }

  const handleDelete = (serverId: string) => {
    startTransition(async () => {
      await deleteServer(serverId);
      toast({
        title: "Server Deleted",
        description: "The server has been successfully deleted.",
        variant: "destructive"
      });
    });
  }

  const getStatusBadge = (status: Server['status']) => {
    switch (status) {
      case "Online":
        return <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>;
      case "Offline":
        return <Badge variant="destructive">Offline</Badge>;
      case "Starting":
        return <Badge variant="secondary" className="animate-pulse">Starting</Badge>;
    }
  }

  return (
    <CardContent>
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Server
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <CreateServerForm closeDialog={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Server Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Players</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servers.length > 0 ? servers.map((server) => (
              <TableRow key={server.id} className={isPending ? 'opacity-50' : ''}>
                <TableCell>
                  <div className="font-medium">
                    <Link href={`/dashboard/panel/${server.id}`} className="hover:underline">
                      {server.name}
                    </Link>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {server.ram}GB RAM &bull; {server.type} &bull; v{server.version}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(server.status)}
                </TableCell>
                <TableCell>
                  {`${server.players.current} / ${server.players.max}`}
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={server.status === 'Starting'}>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/panel/${server.id}`}>
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    Manage
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleServerAction(server.id, 'start')} disabled={server.status === 'Online'}>
                                <Play className="mr-2 h-4 w-4" /> Start
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleServerAction(server.id, 'stop')} disabled={server.status === 'Offline'}>
                                <Square className="mr-2 h-4 w-4" /> Stop
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleServerAction(server.id, 'restart')} disabled={server.status === 'Offline'}>
                                <RefreshCw className="mr-2 h-4 w-4" /> Restart
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(server.id)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No servers created yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
}
