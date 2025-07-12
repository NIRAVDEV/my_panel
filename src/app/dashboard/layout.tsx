import * as React from "react";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Bot,
  Gamepad2,
  LayoutGrid,
  LogOut,
  Server,
  ServerCog,
  Users,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { getCurrentUser } from "@/jexactylmc/actions";
import { notFound } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        // This case should ideally redirect to login, but for now, we'll show not found.
        // In a real app with auth, a middleware would handle this.
        return notFound();
    }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Gamepad2 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-semibold font-headline text-sidebar-foreground">JexactylMC</h1>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="font-medium"
              >
                <Link href="/dashboard">
                  <LayoutGrid />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="font-medium"
              >
                <Link href="/dashboard/panel">
                  <Server />
                  Control Panel
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="font-medium"
              >
                <Link href="/dashboard/assistant">
                  <Bot />
                  AI Game Assistant
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {user.role === 'Admin' && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="font-medium"
                  >
                    <Link href="/dashboard/users">
                      <Users />
                      User Management
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="font-medium"
                  >
                    <Link href="/dashboard/nodes">
                      <ServerCog />
                      Node Management
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/100x100.png" alt={`@${user.name}`} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/70">
                {user.email}
              </p>
            </div>
            <Link href="/">
              <LogOut className="w-5 h-5 text-sidebar-foreground/70 hover:text-sidebar-foreground" />
            </Link>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
