
"use client";

import { useState } from "react";
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
import { MoreHorizontal, Play, PlusCircle, RefreshCw, SlidersHorizontal, Square } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Server } from "@/lib/server-data";
import { initialServers } from "@/lib/server-data";

const defaultNewServer: Omit<Server, "id" | "status" | "players"> & {ram: string, storage: string} = {
    name: "",
    ram: "4",
    storage: "10",
    version: "1.21",
    type: "Paper",
};

export function ServerList() {
  const [servers, setServers] = useState<Server[]>(initialServers);
  const [open, setOpen] = useState(false);
  const [newServerDetails, setNewServerDetails] = useState(defaultNewServer);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewServerDetails(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: 'ram' | 'version' | 'type') => (value: string) => {
    setNewServerDetails(prev => ({...prev, [id]: value}));
  }

  const handleCreateServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerDetails.name) return;

    const newServer: Server = {
        id: newServerDetails.name.toLowerCase().replace(/\s+/g, '-'),
        name: newServerDetails.name,
        status: "Offline",
        players: { current: 0, max: 100 },
        version: newServerDetails.version,
        ram: parseInt(newServerDetails.ram, 10),
        storage: parseInt(newServerDetails.storage, 10),
        type: newServerDetails.type as Server["type"],
    };
    
    setServers(prev => [...prev, newServer]);
    setOpen(false);
    setNewServerDetails(defaultNewServer);
    toast({
        title: "Server Created",
        description: `Your new server "${newServer.name}" has been created.`,
    })
  };

  const handleServerAction = (serverId: string, action: "start" | "stop" | "restart") => {
    toast({
        title: "Action Sent",
        description: `The "${action}" command has been sent to server ${serverId}.`,
    });
    // In a real app, this would trigger an API call.
    // We can also update the status for demo purposes
    if (action === "start") {
        setServers(servers => servers.map(s => s.id === serverId ? {...s, status: "Starting"} : s));
        setTimeout(() => {
            setServers(servers => servers.map(s => s.id === serverId ? {...s, status: "Online"} : s));
        }, 3000)
    }
    if (action === "stop" || action === "restart") {
        setServers(servers => servers.map(s => s.id === serverId ? {...s, status: "Offline"} : s));
    }
    if (action === "restart") {
        setTimeout(() => {
            handleServerAction(serverId, 'start');
        }, 1000);
    }
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
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Server
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleCreateServer}>
                <DialogHeader>
                  <DialogTitle>Create New Server</DialogTitle>
                  <DialogDescription>
                      Configure and create a new Minecraft server.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={newServerDetails.name} onChange={handleInputChange} className="col-span-3" placeholder="e.g., My Awesome Server" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ram" className="text-right">RAM</Label>
                    <Select onValueChange={handleSelectChange('ram')} defaultValue={newServerDetails.ram}>
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
                    <Input id="storage" type="number" value={newServerDetails.storage} onChange={handleInputChange} className="col-span-3" placeholder="e.g., 10" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Server Type</Label>
                     <Select onValueChange={handleSelectChange('type')} defaultValue={newServerDetails.type}>
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
                     <Select onValueChange={handleSelectChange('version')} defaultValue={newServerDetails.version}>
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
                    <Button type="submit">Create Server</Button>
                </DialogFooter>
            </form>
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
            {servers.map((server) => (
              <TableRow key={server.id}>
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
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
}
