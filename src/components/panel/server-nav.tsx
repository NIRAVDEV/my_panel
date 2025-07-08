
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Puzzle } from "lucide-react";

export function ServerNav({ serverId }: { serverId: string }) {
  const pathname = usePathname();
  const navItems = [
    { href: `/dashboard/panel/${serverId}`, label: "Overview", icon: LayoutDashboard },
    { href: `/dashboard/panel/${serverId}/plugins`, label: "Plugins", icon: Puzzle },
  ];

  return (
    <nav className="grid items-start gap-2 text-sm font-medium">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            pathname === item.href && "bg-muted text-primary"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
