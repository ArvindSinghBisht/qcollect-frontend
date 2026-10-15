import api from "./api";
import {
  AddProjectMemberRequest,
  CreateProjectRequest,
  CreateUserInProjectRequest,
} from "@/types/project";

export const getProjects = async () => {
  const response = await api.get("/projects");
  return response.data;
};

export const getProject = async (projectId: string) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

export const createProject = async (request: CreateProjectRequest) => {
  const response = await api.post("/projects", request);
  return response.data;
};

export const createProjectAdmin = async (
  projectId: string,
  request: CreateUserInProjectRequest
) => {
  const response = await api.post(`/projects/${projectId}/admins`, request);
  return response.data;
};

export const getMembers = async (projectId: string) => {
  const response = await api.get(`/projects/${projectId}/members`, {
    headers: { "X-Project-Id": projectId },
  });
  return response.data;
};

export const addMember = async (
  projectId: string,
  request: AddProjectMemberRequest
) => {
  const response = await api.post(`/projects/${projectId}/members`, request);
  return response.data;
};

export const removeMember = async (projectId: string, memberId: string) => {
  const response = await api.delete(`/projects/${projectId}/members/${memberId}`);
  return response.data;
};

export const assignProjectAdmin = async (
  projectId: string,
  request: CreateUserInProjectRequest
) => {
  return createProjectAdmin(projectId, request);
};

export const createAccessor = async (
  projectId: string,
  request: CreateUserInProjectRequest
) => {
  const response = await api.post(`/projects/${projectId}/accessors`, request);
  return response.data;
};

export const createQualityChecker = async (
  projectId: string,
  request: CreateUserInProjectRequest
) => {
  const response = await api.post(`/projects/${projectId}/quality-checkers`, request);
  return response.data;
};
