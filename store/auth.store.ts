import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, ProjectRole, SystemRole, UserRole } from "@/types/auth";

type SelectedProject = {
  id?: string | null;
  projectId?: string | null;
  name?: string | null;
  projectName?: string | null;
  title?: string | null;
  role?: ProjectRole | string | null;
  [key: string]: unknown;
};

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  role: UserRole | string | null;
  systemRole: SystemRole | string | null;

  selectedProjectId: string | null;
  selectedProjectName: string | null;
  selectedProjectRole: ProjectRole | string | null;
  selectedProject: SelectedProject | null;

  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setRole: (role: UserRole | string | null) => void;
  setSystemRole: (role: SystemRole | string | null) => void;

  setSelectedProjectId: (projectId: string | null) => void;
  setSelectedProjectName: (projectName: string | null) => void;
  setSelectedProjectRole: (role: ProjectRole | string | null) => void;
  setSelectedProject: (project: SelectedProject | null) => void;

  clearSelectedProjectId: () => void;
  clearSelectedProject: () => void;

  logout: () => void;
}

function getProjectId(project: SelectedProject | null): string | null {
  return (
    project?.projectId?.toString() ||
    project?.id?.toString() ||
    null
  );
}

function getProjectName(project: SelectedProject | null): string | null {
  return (
    project?.projectName?.toString() ||
    project?.name?.toString() ||
    project?.title?.toString() ||
    null
  );
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      systemRole: null,

      selectedProjectId: null,
      selectedProjectName: null,
      selectedProjectRole: null,
      selectedProject: null,

      setUser: (user) => {
        const systemRole = user?.systemRole || user?.role || null;
        set({
          user,
          systemRole,
          role: systemRole,
        });
      },

      setToken: (token) => set({ token }),

      setRole: (role) => set({ role }),

      setSystemRole: (role) => set({ systemRole: role, role }),

      setSelectedProjectId: (projectId) =>
        set({
          selectedProjectId: projectId,
        }),

      setSelectedProjectName: (projectName) =>
        set({
          selectedProjectName: projectName,
        }),

      setSelectedProjectRole: (role) =>
        set({
          selectedProjectRole: role,
        }),

      setSelectedProject: (project) => {
        const projectId = getProjectId(project);
        const projectName = getProjectName(project);
        const projectRole = project?.role?.toString() || null;

        set({
          selectedProject: project,
          selectedProjectId: projectId,
          selectedProjectName: projectName,
          selectedProjectRole: projectRole,
        });
      },

      clearSelectedProjectId: () =>
        set({
          selectedProjectId: null,
        }),

      clearSelectedProject: () =>
        set({
          selectedProject: null,
          selectedProjectId: null,
          selectedProjectName: null,
          selectedProjectRole: null,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          role: null,
          systemRole: null,
          selectedProjectId: null,
          selectedProjectName: null,
          selectedProjectRole: null,
          selectedProject: null,
        }),
    }),
    {
      name: "qcollect-auth-store",
    }
  )
);
