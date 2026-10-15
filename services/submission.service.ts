import api from "./api";
import {
  CreateSubmissionRequest,
  QualityCheckRequest,
} from "@/types/submission";

export const createSubmission = async (
  formId: string,
  request: CreateSubmissionRequest
) => {
  const response = await api.post(`/submissions/forms/${formId}`, request);
  return response.data;
};

export const saveAnswers = async (
  submissionId: string,
  answersJson: string
) => {
  const response = await api.post(`/submissions/${submissionId}/answers`, { answersJson });
  return response.data;
};

export const getSubmissionAnswers = async (submissionId: string) => {
  const response = await api.get(`/submissions/${submissionId}/answers`);
  return response.data;
};

export const getSubmissionSurvey = async (submissionId: string) => {
  const response = await api.get(`/submissions/${submissionId}/survey`);
  return response.data;
};

export const submitSubmission = async (submissionId: string) => {
  const response = await api.post(`/submissions/${submissionId}/submit`);
  return response.data;
};

export const getSubmission = async (submissionId: string) => {
  const response = await api.get(`/submissions/${submissionId}`);
  return response.data;
};

export const getMySubmissions = async () => {
  const response = await api.get("/submissions/my");
  return response.data;
};

export const getSubmissionPhotos = async (submissionId: string) => {
  const response = await api.get(`/submissions/${submissionId}/photos`);
  return response.data;
};

export const uploadPhoto = async (
  submissionId: string,
  file: File,
  latitude = 0,
  longitude = 0
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("latitude", latitude.toString());
  formData.append("longitude", longitude.toString());

  const response = await api.post(`/submissions/${submissionId}/photos`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const getPendingSubmissions = async (projectId?: string) => {
  const response = await api.get(projectId ? `/submissions/projects/${projectId}/pending` : "/submissions/pending");
  return response.data;
};

export const getReviewedSubmissions = async () => {
  const response = await api.get("/submissions/reviewed");
  return response.data;
};

export const reviewSubmission = async (
  submissionId: string,
  request: QualityCheckRequest
) => {
  const response = await api.put(`/submissions/${submissionId}/review`, request);
  return response.data;
};

export const reviewAnswer = async (
  answerId: string,
  request: { status: string; remarks?: string }
) => {
  const response = await api.post(`/submissions/answers/${answerId}/review`, request);
  return response.data;
};

export const reviewPhoto = async (
  photoId: string,
  request: { status: string; remarks?: string }
) => {
  const response = await api.post(`/submissions/photos/${photoId}/review`, request);
  return response.data;
};
