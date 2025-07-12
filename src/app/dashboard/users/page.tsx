
import { UserManagement } from "@/components/users/user-management";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, getUsers } from "@/jexactylmc/actions";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (user?.role !== 'Admin') {
    redirect('/dashboard');
  }

  const initialUsers = await getUsers();

  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">User Management</CardTitle>
          <CardDescription>
            Add, edit, or remove users and manage their roles.
          </CardDescription>
        </CardHeader>
        <UserManagement initialUsers={initialUsers} />
      </Card>
    </div>
  );
}
