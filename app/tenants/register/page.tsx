import TenantRegistrationWizard from "@/components/registration/TenantRegistrationWizard";
import { PageHeader } from "@/components/common/PageHeader";

export default function TenantRegistrationPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Super Admin Flow"
        title="Tenant Registration"
        description="Create a tenant and then create the Tenant Admin for that tenant. This follows POST /tenants and POST /tenants/{tenantId}/admins."
      />
      <TenantRegistrationWizard />
    </div>
  );
}
