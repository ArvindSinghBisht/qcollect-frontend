import api from "./api";

export const getCounts = async () => {
  const response = await api.get("/dashboard/counts");
  return response.data;
};

export const getActivities = async () => {
  const response = await api.get("/dashboard/activities");
  return response.data;
};

export const getTrend = async () => {
  const response = await api.get("/dashboard/trends");
  return response.data;
};

export const getAccessorDashboard = async () => {
  const response = await api.get("/dashboard/accessor");
  return response.data;
};

export const getQualityDashboard = async () => {
  const response = await api.get("/dashboard/quality-checker");
  return response.data;
};

export const getProjectDashboard = async (projectId: string) => {
  const response = await api.get(`/dashboard/projects/${projectId}`);
  return response.data;
};