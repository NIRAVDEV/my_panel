"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Download, PlusCircle, Search } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

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

const marketplacePlugins = [
    { name: "Vault", description: "Permissions, Chat, & Economy API.", icon: "https://placehold.co/100x100.png", dataAiHint: "vault lock" },
    { name: "PlaceholderAPI", description: "The best and simplest way to add placeholders to your server.", icon: "https://placehold.co/100x100.png", dataAiHint: "code api" },
    { name: "WorldGuard", description: "Protect your server's world from griefers and miscreants.", icon: "https://placehold.co/100x100.png", dataAiHint: "shield protection" },
    { name: "Multiverse-Core", description: "The original multi-world plugin.", icon: "https://placehold.co/100x100.png", dataAiHint: "galaxy portal" },
    { name: "GSit", description: "The simple Sit, Lay and Crawl plugin for spigot.", icon: "https://placehold.co/100x100.png", dataAiHint: "person sitting" },
    { name: "Dynmap", description: "A Google Maps-like map for your Minecraft server.", icon: "https://placehold.co/100x100.png", dataAiHint: "world map" },
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
    toast({
        title: "Plugin installation started",
        description: `Downloading from ${pluginUrl}`,
    });
    setPluginUrl("");
    setOpen(false);
  }

  const handleInstallFromMarketplace = (pluginName: string) => {
    toast({
        title: "Plugin installation started",
        description: `Installing ${pluginName} from the marketplace...`,
    });
    // In a real app, you'd add this to the installed plugins list after installation.
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plugin Management</CardTitle>
        <CardDescription>Install, enable, or disable server plugins.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="installed">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="installed">Installed Plugins</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          </TabsList>

          <TabsContent value="installed" className="mt-4">
            <div className="flex justify-end mb-4">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" /> Install from URL
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
            </div>
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
          </TabsContent>

          <TabsContent value="marketplace" className="mt-4">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search for plugins..." className="pl-10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketplacePlugins.map((plugin) => (
                    <Card key={plugin.name}>
                        <CardHeader className="flex-row gap-4 items-start">
                             <Image src={plugin.icon} alt={plugin.name} width={50} height={50} className="rounded-md border" data-ai-hint={plugin.dataAiHint} />
                             <div>
                                <CardTitle className="text-base font-semibold">{plugin.name}</CardTitle>
                                <CardDescription className="text-xs line-clamp-2">{plugin.description}</CardDescription>
                             </div>
                        </CardHeader>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleInstallFromMarketplace(plugin.name)}>
                                <Download className="mr-2 h-4 w-4" /> Install
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
