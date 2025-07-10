
"use client";

import { useState, useTransition, useEffect, useActionState } from "react";
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
import { createUser, deleteUser, updateUser } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

type UserActionState = {
  success: boolean;
  error: string | null;
  errors?: {
      [key: string]: string[] | undefined;
  };
};

const initialState: UserActionState = {
  success: false,
  error: null,
};

function AddUserForm({ closeDialog }: { closeDialog: () => void }) {
    const [state, formAction] = useActionState(createUser, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state.success) {
            toast({
                title: "User Created",
                description: "The new user account has been successfully created.",
            });
            closeDialog();
        } else if (state.error && !state.errors) {
            toast({
                title: "Error",
                description: state.error,
                variant: "destructive"
            });
        }
    }, [state, toast, closeDialog]);

    return (
        <form action={formAction}>
            <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
                Create a new user account and assign a role. Click save when you're done.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" name="name" className="col-span-3" placeholder="e.g., Steve" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" name="email" type="email" className="col-span-3" placeholder="user@example.com" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">Password</Label>
                  <Input id="password" name="password" type="password" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Role</Label>
                  <Select name="role" defaultValue="User">
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
                <Button type="submit">Create User</Button>
            </DialogFooter>
        </form>
    );
}

function EditUserForm({ user, closeDialog }: { user: User, closeDialog: () => void }) {
    const [state, formAction] = useActionState(updateUser.bind(null, user.id), initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state.success) {
            toast({
                title: "User Updated",
                description: "The user has been successfully updated.",
            });
            closeDialog();
        } else if (state.error && !state.errors) {
            toast({
                title: "Error",
                description: state.error,
                variant: "destructive"
            });
        }
    }, [state, toast, closeDialog]);

    return (
        <form action={formAction}>
            <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
                Update the user's details.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" name="name" className="col-span-3" defaultValue={user.name} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" name="email" type="email" className="col-span-3" defaultValue={user.email} required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">Role</Label>
                    <Select name="role" defaultValue={user.role}>
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
                <Button type="submit">Save Changes</Button>
            </DialogFooter>
        </form>
    );
}

export function UserManagement({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const handleOpenEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  }

  const handleDelete = (userId: string) => {
    startTransition(async () => {
      await deleteUser(userId);
      toast({
          title: "User Deleted",
          description: "The user has been successfully deleted.",
          variant: "destructive"
      });
    });
  }

  return (
    <CardContent>
      <div className="flex justify-end mb-4">
        <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <AddUserForm closeDialog={() => setAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {selectedUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-lg">
                <EditUserForm user={selectedUser} closeDialog={() => setEditDialogOpen(false)} />
            </DialogContent>
        </Dialog>
      )}

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
                            <DropdownMenuItem onClick={() => handleOpenEditDialog(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
                                onClick={() => handleDelete(user.id)}
                                disabled={user.email === 'admin@example.com'}
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
