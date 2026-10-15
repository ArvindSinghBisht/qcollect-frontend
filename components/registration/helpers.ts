export function extractCreatedId(response: unknown): string {
  if (!response || typeof response !== "object") return "";

  const value = response as Record<string, unknown>;
  const data = value.data as Record<string, unknown> | undefined;

  const possibleValues = [
    value.id,
    value.tenantId,
    value.projectId,
    value.userId,
    data?.id,
    data?.tenantId,
    data?.projectId,
    data?.userId,
  ];

  const id = possibleValues.find((item) => typeof item === "string" && item.length > 0);
  return typeof id === "string" ? id : "";
}

export function registrationRoleLabel(type: string) {
  if (type === "PROJECT_ADMIN") return "Project Admin";
  if (type === "ACCESSOR") return "Accessor";
  if (type === "QUALITY_CHECKER") return "Quality Checker";
  if (type === "TENANT_ADMIN") return "Tenant Admin";
  return type;
}
