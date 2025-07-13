
"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { Subuser, User } from "@/lib/types";
import { addSubuser, removeSubuser } from "@/jexactylmc/actions";

export function SubuserManager({ serverId, initialSubusers, allUsers }: { serverId: string, initialSubusers: Subuser[], allUsers: User[] }) {
    const [subusers, setSubusers] = useState<Subuser[]>(initialSubusers);
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const handleAddSubuser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        startTransition(async () => {
            const result = await addSubuser(serverId, email);
            if (result.success) {
                toast({ title: "Subuser Added", description: "The user now has access to this server." });
                setAddDialogOpen(false);
                setEmail("");
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            }
        });
    };
    
    const handleRemoveSubuser = (userId: string) => {
        startTransition(async () => {
            const result = await removeSubuser(serverId, userId);
            if (result.success) {
                toast({ title: "Subuser Removed", description: "The user's access has been revoked.", variant: "destructive" });
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" });
            }
        });
    }

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Subuser Management</CardTitle>
                    <CardDescription>Grant other users access to manage this server.</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Subuser
                </Button>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialSubusers.length > 0 ? (
                                initialSubusers.map((subuser) => (
                                    <TableRow key={subuser.id} className={isPending ? "opacity-50" : ""}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={subuser.avatar} alt={subuser.name} />
                                                    <AvatarFallback>{subuser.fallback}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{subuser.name}</p>
                                                    <p className="text-sm text-muted-foreground">{subuser.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {/* In a real app, this would be more granular */}
                                            Full Control
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive" onClick={() => handleRemoveSubuser(subuser.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Remove Access
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No subusers have been added to this server yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                 <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogContent>
                        <form onSubmit={handleAddSubuser}>
                            <DialogHeader>
                                <DialogTitle>Add New Subuser</DialogTitle>
                                <DialogDescription>
                                    Enter the email address of the user you want to grant access to.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Label htmlFor="email">User Email</Label>
                                <Input id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com" required type="email" />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                                <Button type="submit" disabled={isPending}>{isPending ? "Adding..." : "Add Subuser"}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
