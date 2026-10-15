import api from "./api";
import type {
  ConnectGoogleRequest,
  SelectSpreadsheetRequest,
} from "@/types/google-integration";

export const getGoogleAuthorizationUrl = async () => {
  const response = await api.get("/google/authorize");
  return response.data;
};

export const connectGoogleProject = async (
  projectId: string,
  request: ConnectGoogleRequest
) => {
  const response = await api.post(`/google/${projectId}/connect`, request, {
    headers: { "X-Project-Id": projectId },
  });
  return response.data;
};

export const getGoogleSpreadsheets = async (projectId: string) => {
  const response = await api.get(`/google/${projectId}/spreadsheets`, {
    headers: { "X-Project-Id": projectId },
  });
  return response.data;
};

export const selectGoogleSpreadsheet = async (
  projectId: string,
  request: SelectSpreadsheetRequest
) => {
  const response = await api.post(`/google/${projectId}/spreadsheet`, request, {
    headers: { "X-Project-Id": projectId },
  });
  return response.data;
};
