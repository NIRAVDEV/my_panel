
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NodeTab = {
  name: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export function NodeTabs({ tabs }: { tabs: NodeTab[] }) {
  const pathname = usePathname();

  return (
    <div className="border-b">
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "group inline-flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <tab.icon
                className={cn(
                  "h-4 w-4",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
