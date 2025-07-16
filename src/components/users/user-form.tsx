
"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import type { User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function UserForm({ user, closeDialog }: { user?: User, closeDialog: () => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
            // This is where you would call your backend API
            console.log("Form submitted", Object.fromEntries(formData));
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast({
                title: user ? "User Updated" : "User Created",
                description: `The user has been successfully ${user ? 'updated' : 'created'}. (Mock)`,
            });
            closeDialog();
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
