
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
} from "@/components/ui/dialog";
import { Edit, MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { User } from "@/lib/types";
import { deleteUser } from "@/jexactylmc/actions";
import { useToast } from "@/hooks/use-toast";
import { UserForm } from "./user-form";

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

      <div className="rounded-md border w-full overflow-x-auto">
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
                                disabled={user.email === 'admin@admin.com'}
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

    