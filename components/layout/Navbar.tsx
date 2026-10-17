"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Menu, Moon, Repeat2, Sun, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeToken } from "@/utils/cookies";
import { useAuthStore } from "@/store/auth.store";
import { getEffectiveRole, menusForRole, roleLabel } from "@/lib/flow";

function getPageTitle(pathname: string) {
  if (pathname.startsWith("/select-project")) return "Select Project";
  if (pathname.startsWith("/tenants")) return "Tenants";
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/projects")) return "Projects";
  if (pathname.startsWith("/forms")) return "Forms";
  if (pathname.startsWith("/submissions")) return "Reviews";
  if (pathname.startsWith("/my")) return "My Workspace";
  if (pathname.startsWith("/notifications")) return "Notifications";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/members")) return "Members";
  return "QCollect";
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const systemRole = useAuthStore((state) => state.systemRole || state.user?.systemRole || state.user?.role);
  const selectedProjectRole = useAuthStore((state) => state.selectedProjectRole);
  const selectedProjectName = useAuthStore((state) => state.selectedProjectName);
  const role = getEffectiveRole(systemRole, selectedProjectRole) || systemRole;
  const logout = useAuthStore((state) => state.logout);
  const canSwitchProject = (user?.projects?.length || 0) > 1;

  const initials = `${user?.firstName?.[0] || "U"}${user?.lastName?.[0] || ""}`.toUpperCase();

  function handleLogout() {
    removeToken();
    logout();
    router.push("/login");
  }

  function toggleTheme() {
    document.documentElement.classList.toggle("dark");
  }

  return (
    <header className="workspace-navbar sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white md:text-xl">
              {getPageTitle(pathname)}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedProjectName
                ? `${selectedProjectName} · ${roleLabel(role)}`
                : `${roleLabel(role)} workflow`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {canSwitchProject ? (
            <Link href="/select-project">
              <Button variant="outline" className="hidden rounded-lg font-semibold md:inline-flex">
                <Repeat2 className="h-4 w-4" />
                Switch Project
              </Button>
            </Link>
          ) : null}

          <Button variant="outline" size="icon" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>

          <Link href="/notifications">
            <Button variant="outline" size="icon" className="relative" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="profile-trigger flex cursor-pointer items-center gap-3 px-2.5 py-2">
                <Avatar>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold leading-none text-slate-950 dark:text-white">
                    {user?.firstName || "User"}
                  </p>
                  <p className="mt-1 max-w-44 truncate text-xs text-slate-500 dark:text-slate-400">
                    {user?.email || roleLabel(role)}
                  </p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="font-semibold text-slate-900 dark:text-white">{user?.firstName || "QCollect User"}</div>
                  <div className="mt-1 truncate text-xs font-normal text-slate-500">{user?.email}</div>
                  <div className="mt-1 text-xs font-bold text-teal-600">{roleLabel(role)}</div>
                  {selectedProjectName ? <div className="mt-1 truncate text-xs font-semibold text-slate-500">{selectedProjectName}</div> : null}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {canSwitchProject ? (
                <Link href="/select-project"><DropdownMenuItem><Repeat2 className="h-4 w-4" /> Switch Project</DropdownMenuItem></Link>
              ) : null}
              <Link href="/settings"><DropdownMenuItem><UserCircle className="h-4 w-4" /> Profile & Settings</DropdownMenuItem></Link>
              <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {mobileOpen ? <nav id="mobile-navigation" className="mobile-navigation lg:hidden" aria-label="Workspace navigation">
        {menusForRole(role).map((menu) => <Link key={menu.href} href={menu.href} onClick={() => setMobileOpen(false)} aria-current={pathname === menu.href || pathname.startsWith(`${menu.href}/`) ? "page" : undefined}><menu.icon className="h-4 w-4" />{menu.title}</Link>)}
      </nav> : null}
    </header>
  );
}
