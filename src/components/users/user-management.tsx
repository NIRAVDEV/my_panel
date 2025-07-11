
"use client";

import { useState, useTransition, useEffect } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Edit, MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { User } from "@/lib/types";
import { createUser, deleteUser, updateUser } from "@/jexactylmc/actions";
import { useToast } from "@/hooks/use-toast";

function UserForm({ user, closeDialog }: { user?: User, closeDialog: () => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
            const result = user ? await updateUser(user.id, formData) : await createUser(formData);

            if (result.success) {
                toast({
                    title: user ? "User Updated" : "User Created",
                    description: `The user has been successfully ${user ? 'updated' : 'created'}.`,
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
            <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
                {user ? "Update the user's details." : "Create a new user account and assign a role."}
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" className="col-span-3" placeholder="e.g., Steve" defaultValue={user?.name} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" name="email" type="email" className="col-span-3" placeholder="user@example.com" defaultValue={user?.email} required />
              </div>
              {!user && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">Password</Label>
                    <Input id="password" name="password" type="password" className="col-span-3" required />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Role</Label>
                  <Select name="role" defaultValue={user?.role || "User"}>
                  <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="User">User</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                  </Select>
              </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : (user ? "Save Changes" : "Create User")}</Button>
            </DialogFooter>
        </form>
    );
}

export function UserManagement({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleOpenDialog = (user?: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  }

  const handleDelete = (userId: string) => {
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (result.success) {
          toast({
              title: "User Deleted",
              description: "The user has been successfully deleted.",
              variant: "destructive"
          });
      } else if (result.error) {
          toast({
              title: "Error Deleting User",
              description: result.error,
              variant: "destructive"
          });
      }
    });
  }

  return (
    <CardContent>
      <div className="flex justify-end mb-4">
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
            <UserForm user={selectedUser} closeDialog={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className={isPending ? 'opacity-50' : ''}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} alt={user.name} data-ai-hint={user.avatarHint} />
                      <AvatarFallback>{user.fallback}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "Admin" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
                                onClick={() => handleDelete(user.id)}
                                disabled={user.email === 'admin@jexactyl.pro'}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
