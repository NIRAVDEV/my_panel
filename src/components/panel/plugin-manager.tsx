
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

type Plugin = {
  name: string;
  version: string;
  enabled: boolean;
};

const initialPlugins: Plugin[] = [
  { name: "WorldEdit", version: "7.2.5", enabled: true },
  { name: "EssentialsX", version: "2.19.0", enabled: true },
  { name: "LuckPerms", version: "5.3", enabled: false },
];

export function PluginManager() {
  const [plugins, setPlugins] = useState<Plugin[]>(initialPlugins);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pluginUrl, setPluginUrl] = useState("");

  const handleTogglePlugin = (pluginName: string) => {
    setPlugins(
      plugins.map((p) =>
        p.name === pluginName ? { ...p, enabled: !p.enabled } : p
      )
    );
    toast({ title: `Plugin status changed for ${pluginName}` });
  };
  
  const handleAddPlugin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pluginUrl) return;
    // In a real app, you'd download and install the plugin from the URL.
    toast({
        title: "Plugin installation started",
        description: `Downloading from ${pluginUrl}`,
    });
    setPluginUrl("");
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Plugin Management</CardTitle>
          <CardDescription>Install, enable, or disable server plugins.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Plugin
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleAddPlugin}>
                    <DialogHeader>
                        <DialogTitle>Add New Plugin</DialogTitle>
                        <DialogDescription>
                            Enter the URL to the plugin file (e.g., from SpigotMC or Bukkit).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="plugin-url">Plugin URL</Label>
                        <Input id="plugin-url" value={pluginUrl} onChange={e => setPluginUrl(e.target.value)} placeholder="https://example.com/my-plugin.jar" required />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                        <Button type="submit">Install Plugin</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Plugin</TableHead>
                <TableHead>Version</TableHead>
                <TableHead className="text-right">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {plugins.map((plugin) => (
                <TableRow key={plugin.name}>
                    <TableCell className="font-medium">{plugin.name}</TableCell>
                    <TableCell>{plugin.version}</TableCell>
                    <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Switch
                        id={`plugin-toggle-${plugin.name}`}
                        checked={plugin.enabled}
                        onCheckedChange={() => handleTogglePlugin(plugin.name)}
                        aria-label={`Toggle ${plugin.name}`}
                        />
                         <Label htmlFor={`plugin-toggle-${plugin.name}`} className="text-sm text-muted-foreground">
                            {plugin.enabled ? "Enabled" : "Disabled"}
                        </Label>
                    </div>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
