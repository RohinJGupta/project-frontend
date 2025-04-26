"use client";

import { Home, Search, Settings, PlusSquare, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      name: "Home",
      href: "/dashboard",
      icon: Home
    },
    {
      name: "Discover",
      href: "/dashboard/discover",
      icon: Search
    },
    {
      name: "New Post",
      href: "/dashboard/new",
      icon: PlusSquare
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
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex h-16 items-center justify-around px-4">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={cn(
              "flex flex-col items-center gap-1 px-3",
              pathname === item.href && "text-primary"
            )}
            onClick={() => router.push(item.href)}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.name}</span>
          </Button>
        ))}
      </nav>
    </div>
  );
} 