export interface FormField {
  id: string;
  label: string;
  fieldType: string | null;
  required?: boolean | null;
  placeholder?: string | null;
  defaultValue?: string | null;
  fieldOrder?: number;
  displayOrder?: number;
  options?: string | null;
  validationJson?: string | null;
}

export interface CreateFormFieldRequest {
  label: string;
  name: string;
  fieldType: string;
  displayOrder: number;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  options?: string;
  validationJson?: string;
}

export interface UpdateFormFieldRequest extends CreateFormFieldRequest {}
