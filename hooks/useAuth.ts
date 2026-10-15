"use client";

import { useRouter } from "next/navigation";

import { login } from "@/services/auth.service";
import { saveToken } from "@/utils/cookies";
import { useAuthStore } from "@/store/auth.store";
import {
  dashboardPathForRole,
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
     * USER accounts receive their actual role from projects[].
     * A single membership can be opened directly. Multiple memberships
     * must first go through the project-selection page.
     */
    if (normalizedSystemRole === "USER") {
      if (projects.length === 1) {
        const project = projects[0];

        setSelectedProject({
          projectId: project.projectId,
          projectName: project.projectName || project.name || null,
          role: project.role,
        });

        router.replace(
          projectWorkspacePath(project.role, project.projectId)
        );
      } else {
        clearSelectedProject();
        router.replace("/select-project");
      }

      router.refresh();
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

  return {
    loginUser,
  };
}
