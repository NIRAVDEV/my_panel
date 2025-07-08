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
import { MoreHorizontal, Play, PlusCircle, RefreshCw, Square } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

type Server = {
  id: string;
  name: string;
  status: "Online" | "Offline" | "Starting";
  players: {
    current: number;
    max: number;
  };
  version: string;
};

const initialServers: Server[] = [
  {
    id: "survival-1",
    name: "Survival Paradise",
    status: "Online",
    players: { current: 12, max: 100 },
    version: "1.21",
  },
  {
    id: "creative-build",
    name: "Creative World",
    status: "Offline",
    players: { current: 0, max: 50 },
    version: "1.20.4",
  },
  {
    id: "minigames",
    name: "Mini-Games Fun",
    status: "Starting",
    players: { current: 0, max: 200 },
    version: "1.21",
  },
];

export function ServerList() {
  const [servers, setServers] = useState<Server[]>(initialServers);
  const [open, setOpen] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const { toast } = useToast();

  const handleCreateServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName) return;

    const newServer: Server = {
        id: newServerName.toLowerCase().replace(/\s+/g, '-'),
        name: newServerName,
        status: "Offline",
        players: { current: 0, max: 20 },
        version: "1.21",
    };
    
    setServers(prev => [...prev, newServer]);
    setOpen(false);
    setNewServerName("");
    toast({
        title: "Server Created",
        description: `Your new server "${newServerName}" has been created.`,
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
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreateServer}>
                <DialogHeader>
                  <DialogTitle>Create New Server</DialogTitle>
                  <DialogDescription>
                      Enter a name for your new Minecraft server.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                      Server Name
                      </Label>
                      <Input id="name" value={newServerName} onChange={(e) => setNewServerName(e.target.value)} className="col-span-3" placeholder="e.g., My Awesome Server" required />
                  </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Cancel
                        </Button>
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
                  <div className="font-medium">{server.name}</div>
                  <div className="text-sm text-muted-foreground">v{server.version}</div>
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
