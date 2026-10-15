import api from "./api";
import { AssignFormRequest, CreateFormRequest, UpdateFormRequest } from "@/types/form";

export const getForms = async (projectId: string) => {
  const response = await api.get(`/projects/${projectId}/forms`);
  return response.data;
};

export const getForm = async (formId: string) => {
  const response = await api.get(`/forms/${formId}`);
  return response.data;
};

export const createForm = async (
  projectId: string,
  request: Partial<CreateFormRequest> & { name: string }
) => {
  const response = await api.post(`/projects/${projectId}/forms`, {
    name: request.name,
    description: request.description || "",
    ...(request.surveyJson?.trim()
      ? { surveyJson: request.surveyJson }
      : {}),
  });
  return response.data;
};

export const updateForm = async (
  formId: string,
  request: UpdateFormRequest
) => {
  const response = await api.put(`/forms/${formId}`, request);
  return response.data;
};

export const deleteForm = async (formId: string) => {
  const response = await api.delete(`/forms/${formId}`);
  return response.data;
};

export const publishForm = async (formId: string) => {
  const response = await api.patch(`/forms/${formId}/publish`);
  return response.data;
};

export const getBuilder = async (formId: string) => {
  const response = await api.get(`/forms/${formId}/builder`);
  return response.data;
};

export const saveBuilder = async (formId: string, surveyJson: string) => {
  const response = await api.put(`/forms/${formId}/builder`, { surveyJson });
  return response.data;
};

export const publishBuilder = async (formId: string) => {
  const response = await api.post(`/forms/${formId}/builder/publish`);
  return response.data;
};

export const getPublishedForm = async (formId: string) => {
  const response = await api.get(`/forms/${formId}/published`);
  return response.data;
};

export const getMyForms = async () => {
  const response = await api.get("/mobile/forms");
  return response.data;
};

export const getMobileSurvey = async (formId: string) => {
  const response = await api.get(`/mobile/forms/${formId}`);
  return response.data;
};

export const getQcForms = async () => {
  const response = await api.get("/mobile/forms");
  return response.data;
};

export const getFormAssignments = async (formId: string, projectId?: string) => {
  const response = await api.get(`/forms/${formId}/assignments`, {
    headers: projectId ? { "X-Project-Id": projectId } : undefined,
  });
  return response.data;
};

export const assignForm = async (
  formId: string,
  projectId: string,
  request: AssignFormRequest
) => {
  const response = await api.post(`/forms/${formId}/assignments`, request, {
    params: { projectId },
    headers: { "X-Project-Id": projectId },
  });
  return response.data;
};

export const removeFormAssignment = async (
  assignmentId: string,
  projectId: string
) => {
  const response = await api.delete(`/forms/assignments/${assignmentId}`, {
    headers: { "X-Project-Id": projectId },
  });
  return response.data;
};
