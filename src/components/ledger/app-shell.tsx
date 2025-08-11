"use client";

import Link from "next/link";
import {
  Settings,
  Users,
  BarChart,
  Briefcase,
  LogOut,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/analytics", label: "Analytics", icon: BarChart },
    { href: "/labour", label: "Labour", icon: Briefcase },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Logo className="size-8 text-primary" />
              <span className="text-lg font-semibold">AB INTERIOR</span>
            </div>
            <LogoutButton />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <main className="flex min-h-svh flex-1 flex-col bg-background">
        {children}
      </main>
      {/* Mobile bottom navbar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around items-center h-14">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} className={"flex flex-col items-center justify-center flex-1 " + (pathname.startsWith(item.href) ? "text-primary" : "text-gray-500") }>
            <item.icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex flex-col items-center justify-center flex-1 text-gray-500 hover:text-red-500"
        >
          <LogOut className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </nav>
    </SidebarProvider>
  );
}
