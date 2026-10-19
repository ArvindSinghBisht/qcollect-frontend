"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Repeat2, Layers3 } from "lucide-react";
import { removeToken } from "@/utils/cookies";
import { useAuthStore } from "@/store/auth.store";
import { getEffectiveRole, menusForRole, roleLabel } from "@/lib/flow";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const systemRole = useAuthStore((state) => state.systemRole || state.user?.systemRole || state.user?.role);
  const selectedProjectRole = useAuthStore((state) => state.selectedProjectRole);
  const selectedProjectName = useAuthStore((state) => state.selectedProjectName);
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const role = getEffectiveRole(systemRole, selectedProjectRole) || systemRole;
  const logout = useAuthStore((state) => state.logout);
  const menus = menusForRole(role).map((menu) =>
    menu.title === "Project" && selectedProjectId && role === "PROJECT_ADMIN"
      ? { ...menu, href: `/projects/${selectedProjectId}` }
      : menu
  );
  const canSwitchProject = (user?.projects?.length || 0) > 1;

  function handleLogout() {
    removeToken();
    logout();
    router.push("/login");
  }

  return (
    <aside className="workspace-sidebar hidden lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="sidebar-brand">
        <div className="brand-symbol"><Layers3 className="h-5 w-5" /></div>
        <div><h1>QCollect</h1><p>Field data workspace</p></div>
      </div>
      <div className="sidebar-context">
        <span className="context-label">Your workspace</span>
        <p>{selectedProjectName || roleLabel(role)}</p>
        <span className="context-role">{roleLabel(role)} Console</span>
      </div>
      <nav className="sidebar-navigation flex-1 space-y-1 p-3">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const active = pathname === menu.href || pathname.startsWith(`${menu.href}/`);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "sidebar-link flex items-center gap-3",
                active
                  ? "is-active"
                  : "is-inactive"
              )}
            >
              <Icon className="h-4 w-4" />
              {menu.title}
            </Link>
          );
        })}

        {canSwitchProject ? (
          <Link
            href="/select-project"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Repeat2 className="h-4 w-4" />
            Switch Project
          </Link>
        ) : null}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="sidebar-logout flex w-full items-center gap-3"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
