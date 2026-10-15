export interface Project {
  id: string;
  tenantId?: string;
  name: string;
  description?: string;
  active?: boolean;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  tenantId?: string;
  projectAdminUserId?: string;
}

export interface ProjectMember {
  id: string;
  userId?: string;
  userName?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

export interface AddProjectMemberRequest {
  userId: string;
  role: string;
}

export interface CreateUserInProjectRequest {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
}

export interface ProjectMembership {
  projectId: string;
  projectName?: string | null;
  role: string;
}
