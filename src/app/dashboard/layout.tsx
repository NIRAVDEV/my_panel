"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Users,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

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
              <Link href="/dashboard">
                <SidebarMenuButton
                  isActive={pathname === "/dashboard"}
                  className="font-medium"
                >
                  <LayoutGrid />
                  Dashboard
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/panel">
                <SidebarMenuButton
                  isActive={isActive("/dashboard/panel")}
                  className="font-medium"
                >
                  <Server />
                  Control Panel
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/assistant">
                <SidebarMenuButton
                  isActive={isActive("/dashboard/assistant")}
                  className="font-medium"
                >
                  <Bot />
                  AI Game Assistant
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/users">
                <SidebarMenuButton
                  isActive={isActive("/dashboard/users")}
                  className="font-medium"
                >
                  <Users />
                  User Management
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/100x100.png" alt="@admin" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-sidebar-foreground">Admin</p>
              <p className="text-xs text-sidebar-foreground/70">
                admin@jexactyl.pro
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
