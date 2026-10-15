export type SystemRole = "SUPER_ADMIN" | "TENANT_ADMIN" | "USER";

export type ProjectRole = "PROJECT_ADMIN" | "ACCESSOR" | "QUALITY_CHECKER";

export type UserRole = SystemRole | ProjectRole;

export interface ProjectMembership {
  projectId: string;
  projectName?: string | null;
  name?: string | null;
  role: ProjectRole | string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  userId?: string | null;
  tenantId?: string | null;
  systemRole?: SystemRole | string | null;
  role?: UserRole | string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  projects?: ProjectMembership[];
}

export interface LoginResponse {
  accessToken: string;
  tokenType?: string;
  userId?: string | null;
  tenantId?: string | null;
  systemRole?: SystemRole | string | null;
  role?: UserRole | string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  projects?: ProjectMembership[];
  user?: AuthUser | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
