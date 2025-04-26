"use client";

import { Home, Search, Compass, User, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SideNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      name: "Home",
      href: "/dashboard/home",
      icon: Home
    },
    {
      name: "Search",
      href: "/dashboard/search",
      icon: Search
    },
    {
      name: "Discover",
      href: "/dashboard/discover",
      icon: Compass
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings
    }
  ];

  return (
    <div className="fixed h-full w-[244px] border-r border-gray-300 bg-background">
      <div className="flex h-14 items-center justify-center border-b">
        <h2 className="text-lg font-semibold"></h2>
      </div>
      <nav className="space-y-2 p-4">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={cn(
              "flex w-full justify-start gap-3 px-4 py-5",
              pathname === item.href ? "bg-secondary" : "hover:bg-secondary/50"
            )}
            onClick={() => router.push(item.href)}
          >
            <item.icon className="h-7 w-7" />
            <span className="text-lg">{item.name}</span>
          </Button>
        ))}
      </nav>
    </div>
  );
} 