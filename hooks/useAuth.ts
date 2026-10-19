"use client";

import { useRouter } from "next/navigation";

import { login } from "@/services/auth.service";
import { removeToken, saveToken } from "@/utils/cookies";
import { useAuthStore } from "@/store/auth.store";
import {
  dashboardPathForRole,
  normalizeRole,
  projectWorkspacePath,
  roleLabel,
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

  async function loginUser(email: string, password: string, selectedRole?: string) {
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
    const chosenRole = normalizeRole(selectedRole);
    const isProjectRole =
      chosenRole === "PROJECT_ADMIN" ||
      chosenRole === "ACCESSOR" ||
      chosenRole === "QUALITY_CHECKER";

    /*
     * Project Admin, Accessor, and Quality Checker are memberships on a
     * tenant project. The account's system role stays USER, so the role
     * chosen on the login screen has to pick the matching membership.
     */
    if (isProjectRole) {
      const matches = projects.filter(
        (project) => normalizeRole(project.role) === chosenRole
      );

      if (matches.length === 0) {
        removeToken();
        logout();
        throw new Error(
          `This account is not a ${roleLabel(chosenRole)} on a project in this tenant.`
        );
      }

      openProjectMemberships(user, matches);
      return;
    }

    /*
     * USER accounts receive their actual role from projects[].
     * A single membership can be opened directly. Multiple memberships
     * must first go through the project-selection page.
     */
    if (normalizedSystemRole === "USER") {
      openProjectMemberships(user, projects);
      return;
    }

    /*
     * System-level and legacy direct-role accounts must also be redirected.
     * Previously there was no redirect outside the USER block, so the login
     * page stayed visible even after a successful response.
     */
    clearSelectedProject();
    router.replace(dashboardPathForRole(normalizedSystemRole));
    router.refresh();
  }

  function openProjectMemberships(user: AuthUser, memberships: ProjectMembership[]) {
    if (memberships.length === 1) {
      const project = memberships[0];

      setUser({ ...user, projects: memberships });
      setSelectedProject({
        projectId: project.projectId,
        projectName: project.projectName || project.name || null,
        role: project.role,
      });

      router.replace(
        projectWorkspacePath(project.role, project.projectId)
      );
      router.refresh();
      return;
    }

    setUser({ ...user, projects: memberships });
    clearSelectedProject();
    router.replace(memberships.length ? "/select-project" : dashboardPathForRole("USER"));
    router.refresh();
  }

  return {
    loginUser,
  };
}
