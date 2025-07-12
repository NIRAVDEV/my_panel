
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal, Play, PlusCircle, RefreshCw, SlidersHorizontal, Square, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Server } from "@/lib/types";
import { updateServerStatus, deleteServer } from "@/jexactylmc/actions";
import { CreateServerForm } from "./create-server-form";

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
      const formData = new FormData();
      formData.append('serverId', serverId);
      formData.append('action', action);
      await updateServerStatus(formData);
      toast({
        title: "Action Sent",
        description: `The "${action}" command has been sent to server ${serverId}.`,
      });
    });
  }

  const handleDelete = (serverId: string) => {
    startTransition(async () => {
      const result = await deleteServer(serverId);
      if (result.success) {
        toast({
            title: "Server Deleted",
            description: "The server has been successfully deleted.",
            variant: "destructive"
        });
      } else if (result.error) {
        toast({
            title: "Error Deleting Server",
            description: result.error,
            variant: "destructive"
        });
      }
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

      <div className="rounded-md border w-full overflow-x-auto">
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
