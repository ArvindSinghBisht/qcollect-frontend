import api from "./api";

export interface CreateTenantRequest {
  tenantName: string;
  tenantCode: string;
  logoUrl?: string;
}

export interface CreateTenantAdminRequest {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
}

export const createTenant = async (request: CreateTenantRequest) => {
  const response = await api.post("/tenants", request);
  return response.data;
};

export const createTenantAdmin = async (
  tenantId: string,
  request: CreateTenantAdminRequest
) => {
  const response = await api.post(`/tenants/${tenantId}/admins`, request);
  return response.data;
};
