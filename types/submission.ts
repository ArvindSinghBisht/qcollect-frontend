export interface Submission {
  id: string;
  formId?: string;
  accessorId?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string;
}

export interface CreateSubmissionRequest {
  latitude: number;
  longitude: number;
}

export interface SubmissionAnswerRequest {
  answersJson: string;
}

export interface SubmissionAnswersResponse {
  submissionId: string;
  answersJson?: string;
}

export interface SubmissionSurveyResponse {
  submissionId: string;
  formId: string;
  surveyJson?: string;
  answersJson?: string;
}

export interface SubmissionAnswerResponse {
  id: string;
  fieldId?: string;
  fieldName?: string;
  fieldType?: string;
  value?: string;
  answer?: string;
}

export interface QualityCheckRequest {
  status: string;
  remarks?: string;
}
