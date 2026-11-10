import {
  Bell,
  Building2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/types/auth";

export type SidebarMenuItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export function normalizeRole(role?: string | null): UserRole | null {
  const value = role?.trim().toUpperCase().replaceAll(" ", "_");

  switch (value) {
    case "SUPER_ADMIN":
      return "SUPER_ADMIN";

    case "TENANT_ADMIN":
      return "TENANT_ADMIN";

    case "USER":
      return "USER";

    case "PROJECT_ADMIN":
      return "PROJECT_ADMIN";

    case "ACCESSOR":
      return "ACCESSOR";

    case "QUALITY_CHECKER":
      return "QUALITY_CHECKER";

    default:
      return null;
  }
}

/** Acc / QC / PA — the only roles that participate in multi-role login. */
export const MULTI_ROLE_PROJECT_ROLES = [
  "ACCESSOR",
  "QUALITY_CHECKER",
  "PROJECT_ADMIN",
] as const;

export type MultiRoleProjectRole = (typeof MULTI_ROLE_PROJECT_ROLES)[number];

export function isMultiRoleProjectRole(
  role?: string | null
): role is MultiRoleProjectRole {
  const value = normalizeRole(role);
  return (
    value === "ACCESSOR" ||
    value === "QUALITY_CHECKER" ||
    value === "PROJECT_ADMIN"
  );
}

/**
 * Distinct Acc / QC / PA roles present in memberships, in stable UI order.
 * Super Admin and Tenant Admin never appear here.
 */
export function distinctMultiRoles(
  projects: { role?: string | null }[] | null | undefined
): MultiRoleProjectRole[] {
  const found = new Set<MultiRoleProjectRole>();

  for (const project of projects || []) {
    const role = normalizeRole(project.role);
    if (isMultiRoleProjectRole(role)) {
      found.add(role);
    }
  }

  return MULTI_ROLE_PROJECT_ROLES.filter((role) => found.has(role));
}

export function getEffectiveRole(
  systemRole?: string | null,
  selectedProjectRole?: string | null
): UserRole | null {
  const normalizedSystemRole = normalizeRole(systemRole);

  if (normalizedSystemRole === "USER") {
    return normalizeRole(selectedProjectRole);
  }

  return normalizedSystemRole || normalizeRole(selectedProjectRole);
}

export function roleLabel(role?: string | null): string {
  const value = normalizeRole(role);

  switch (value) {
    case "SUPER_ADMIN":
      return "Super Admin";

    case "TENANT_ADMIN":
      return "Tenant Admin";

    case "USER":
      return "User";

    case "PROJECT_ADMIN":
      return "Project Admin";

    case "ACCESSOR":
      return "Accessor";

    case "QUALITY_CHECKER":
      return "Quality Checker";

    default:
      return "User";
  }
}

export function dashboardPathForRole(role?: string | null): string {
  const value = normalizeRole(role);

  switch (value) {
    case "SUPER_ADMIN":
      return "/tenants";

    case "TENANT_ADMIN":
      return "/projects";

    case "USER":
      return "/select-role";

    case "PROJECT_ADMIN":
      return "/projects";

    case "ACCESSOR":
      return "/my/forms";

    case "QUALITY_CHECKER":
      return "/submissions/pending";

    default:
      return "/dashboard";
  }
}

export function projectWorkspacePath(role?: string | null, projectId?: string | null): string {
  const value = normalizeRole(role);

  switch (value) {
    case "PROJECT_ADMIN":
      return projectId ? `/projects/${projectId}` : "/projects";

    case "ACCESSOR":
      return "/my/forms";

    case "QUALITY_CHECKER":
      return "/submissions/pending";

    default:
      return "/select-role";
  }
}

export function roleAccent(role?: string | null): string {
  const value = normalizeRole(role);

  switch (value) {
    case "SUPER_ADMIN":
      return "from-slate-950 to-indigo-900";

    case "TENANT_ADMIN":
      return "from-blue-700 to-cyan-600";

    case "PROJECT_ADMIN":
      return "from-violet-700 to-fuchsia-600";

    case "ACCESSOR":
      return "from-emerald-700 to-teal-600";

    case "QUALITY_CHECKER":
      return "from-orange-700 to-rose-600";

    default:
      return "from-slate-900 to-slate-700";
  }
}

/**
 * Sidebar for the post-login chooser (no Acc / QC / PA selected yet).
 * Role-first when the account has more than one distinct project role.
 */
export function chooserMenuItem(
  projects?: { role?: string | null }[] | null
): SidebarMenuItem {
  const roles = distinctMultiRoles(projects);

  if (roles.length > 1) {
    return {
      title: "Choose your role",
      href: "/select-role",
      icon: ShieldCheck,
    };
  }

  return {
    title: "Choose a project",
    href: "/select-project",
    icon: FolderKanban,
  };
}

export function menusForRole(
  role?: string | null,
  projects?: { role?: string | null }[] | null
): SidebarMenuItem[] {
  const value = normalizeRole(role);

  const common: SidebarMenuItem[] = [
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  if (value === "SUPER_ADMIN") {
    return [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Tenants",
        href: "/tenants",
        icon: Building2,
      },
      {
        title: "Users",
        href: "/members",
        icon: Users,
      },
      ...common,
    ];
  }

  if (value === "TENANT_ADMIN") {
    return [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Projects",
        href: "/projects",
        icon: FolderKanban,
      },
      {
        title: "Project Admins",
        href: "/members",
        icon: ShieldCheck,
      },
      ...common,
    ];
  }

  if (value === "PROJECT_ADMIN") {
    return [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Project",
        href: "/projects",
        icon: FolderKanban,
      },
      {
        title: "Members",
        href: "/members",
        icon: Users,
      },
      {
        title: "Forms",
        href: "/forms",
        icon: FileText,
      },
      ...common,
    ];
  }

  if (value === "ACCESSOR") {
    return [
      {
        title: "My Forms",
        href: "/my/forms",
        icon: FileText,
      },
      {
        title: "Drafts",
        href: "/my/drafts",
        icon: FileCheck2,
      },
      {
        title: "Submissions",
        href: "/my/submissions",
        icon: ClipboardCheck,
      },
      ...common,
    ];
  }

  if (value === "QUALITY_CHECKER") {
    return [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Pending Reviews",
        href: "/submissions/pending",
        icon: ClipboardCheck,
      },
      {
        title: "Reviewed",
        href: "/submissions/reviewed",
        icon: FileCheck2,
      },
      ...common,
    ];
  }

  return [chooserMenuItem(projects), ...common];
}

export const flowSteps = [
  {
    role: "Super Admin",
    action: "Create Tenant and Tenant Admin",
  },
  {
    role: "Tenant Admin",
    action: "Create Project and Project Admin",
  },
  {
    role: "User",
    action: "Choose your role, then a project if needed",
  },
  {
    role: "Accessor",
    action: "Fill, Draft and Submit Forms",
  },
  {
    role: "Quality Checker",
    action: "Review, Approve or Reject",
  },
];

export function isSuperAdmin(role?: string | null): boolean {
  return normalizeRole(role) === "SUPER_ADMIN";
}

export function isTenantAdmin(role?: string | null): boolean {
  return normalizeRole(role) === "TENANT_ADMIN";
}

export function isProjectAdmin(role?: string | null): boolean {
  return normalizeRole(role) === "PROJECT_ADMIN";
}

export function isAccessor(role?: string | null): boolean {
  return normalizeRole(role) === "ACCESSOR";
}

export function isQualityChecker(role?: string | null): boolean {
  return normalizeRole(role) === "QUALITY_CHECKER";
}
