import api from "./api";

export const getFields = async (formId: string) => {
  const response = await api.get(`/forms/${formId}/fields`);
  return response.data;
};

export const getField = async (fieldId: string) => {
  const response = await api.get(`/forms/fields/${fieldId}`);
  return response.data;
};

export const createField = async (
  formId: string,
  request: any
) => {
  const response = await api.post(
    `/forms/${formId}/fields`,
    request
  );

  return response.data;
};

export const updateField = async (
  fieldId: string,
  request: any
) => {
  const response = await api.put(
    `/forms/fields/${fieldId}`,
    request
  );

  return response.data;
};

export const deleteField = async (
  fieldId: string
) => {
  const response = await api.delete(
    `/forms/fields/${fieldId}`
  );

  return response.data;
};