export interface Form {
  id: string;
  projectId?: string;
  name: string;
  description?: string;
  active?: boolean;
  surveyJson?: string;
  version?: number;
  published?: boolean;
}

export interface CreateFormRequest {
  name: string;
  description?: string;
  surveyJson?: string;
}

export interface UpdateFormRequest {
  name: string;
  description?: string;
  surveyJson: string;
}

export interface FormBuilderResponse {
  formId: string;
  formName: string;
  version?: number;
  published?: boolean;
  surveyJson?: string;
}

export interface PublishedSurveyResponse {
  formId: string;
  formName: string;
  projectId?: string;
  projectName?: string;
  version?: number;
  surveyJson?: string;
}

export interface MobileFormResponse {
  formId: string;
  formName: string;
  projectId: string;
  projectName?: string;
  version?: number;
}

export interface AssignFormRequest {
  accessorId: string;
  qualityCheckerId: string;
}

export interface FormAssignment {
  assignmentId: string;
  projectId: string;
  formId: string;
  formName?: string;
  accessorId: string;
  accessorName?: string;
  qualityCheckerId: string;
  qualityCheckerName?: string;
  assignedBy?: string;
  assignedByName?: string;
  assignedAt?: string;
  active?: boolean;
}
