"use client";

import { useRouter } from "next/navigation";

import { login } from "@/services/auth.service";
import { removeToken, saveToken } from "@/utils/cookies";
import { useAuthStore } from "@/store/auth.store";
import {
  dashboardPathForRole,
  distinctMultiRoles,
  isMultiRoleProjectRole,
  normalizeRole,
  projectWorkspacePath,
} from "@/lib/flow";
import type { AuthUser, ProjectMembership } from "@/types/auth";

export function useAuth() {
  const router = useRouter();

  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setRole = useAuthStore((state) => state.setRole);
  const setSystemRole = useAuthStore((state) => state.setSystemRole);
  const setSelectedProject = useAuthStore(
    (state) => state.setSelectedProject
  );
  const clearSelectedProject = useAuthStore(
    (state) => state.clearSelectedProject
  );
  const logout = useAuthStore((state) => state.logout);

  async function loginUser(email: string, password: string) {
    const result = await login({
      email: email.trim(),
      password,
    });

    const token = result.accessToken;

    if (!token) {
      throw new Error("Login response did not include accessToken");
    }

    const systemRole =
      result.systemRole ||
      result.user?.systemRole ||
      result.role ||
      result.user?.role ||
      null;

    const projects: ProjectMembership[] =
      result.projects || result.user?.projects || [];

    const user: AuthUser = {
      userId: result.userId || result.user?.userId || null,
      tenantId: result.tenantId || result.user?.tenantId || null,
      systemRole,
      role: systemRole,
      firstName: result.firstName || result.user?.firstName || "User",
      lastName: result.lastName || result.user?.lastName || "",
      email: result.email || result.user?.email || email.trim(),
      phone: result.phone || result.user?.phone || null,
      projects,
    };

    saveToken(token);
    setToken(token);
    setUser(user);
    setSystemRole(systemRole);
    setRole(systemRole);

    const normalizedSystemRole = normalizeRole(systemRole);

    /*
     * Super Admin and Tenant Admin are single-email system roles.
     * They never enter the Acc / QC / PA multi-role chooser, even if the
     * account also has project memberships (Tenant Admin boundary case).
     */
    if (
      normalizedSystemRole === "SUPER_ADMIN" ||
      normalizedSystemRole === "TENANT_ADMIN"
    ) {
      clearSelectedProject();
      router.replace(dashboardPathForRole(normalizedSystemRole));
      router.refresh();
      return;
    }

    /*
     * USER accounts: if they hold more than one distinct Acc / QC / PA role,
     * ask which role to use. Otherwise open that role (project picker when
     * the role has multiple projects).
     */
    if (normalizedSystemRole === "USER") {
      routeUserMemberships(user, projects);
      return;
    }

    clearSelectedProject();
    router.replace(dashboardPathForRole(normalizedSystemRole));
    router.refresh();
  }

  function routeUserMemberships(
    user: AuthUser,
    memberships: ProjectMembership[]
  ) {
    const roles = distinctMultiRoles(memberships);

    if (roles.length > 1) {
      setUser({ ...user, projects: memberships });
      clearSelectedProject();
      router.replace("/select-role");
      router.refresh();
      return;
    }

    if (roles.length === 1) {
      openProjectMemberships(
        user,
        memberships.filter(
          (project) => normalizeRole(project.role) === roles[0]
        )
      );
      return;
    }

    openProjectMemberships(user, memberships);
  }

  function openProjectMemberships(
    user: AuthUser,
    memberships: ProjectMembership[]
  ) {
    if (memberships.length === 1) {
      const project = memberships[0];

      setUser({ ...user, projects: memberships });
      setSelectedProject({
        projectId: project.projectId,
        projectName: project.projectName || project.name || null,
        role: project.role,
      });

      router.replace(projectWorkspacePath(project.role, project.projectId));
      router.refresh();
      return;
    }

    setUser({ ...user, projects: memberships });
    clearSelectedProject();
    router.replace(
      memberships.length ? "/select-project" : dashboardPathForRole("USER")
    );
    router.refresh();
  }

  /**
   * Continue after the post-auth role chooser. Filters memberships to the
   * chosen Acc / QC / PA role, then opens the workspace or project picker.
   */
  function continueWithProjectRole(role: string) {
    if (!isMultiRoleProjectRole(role)) {
      throw new Error("Choose Accessor, Quality Checker, or Project Admin.");
    }

    const user = useAuthStore.getState().user;
    if (!user) {
      removeToken();
      logout();
      router.replace("/login");
      return;
    }

    const memberships = (user.projects || []).filter(
      (project) => normalizeRole(project.role) === role
    );

    if (!memberships.length) {
      throw new Error("This account does not have that project role.");
    }

    openProjectMemberships(user, memberships);
  }

  return {
    loginUser,
    continueWithProjectRole,
  };
}
