"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, Copy, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/common/PageHeader";
import { createTenant, createTenantAdmin } from "@/services/tenant.service";
import { getErrorMessage, unwrapApiData } from "@/lib/api-response";
import { emptyUserCreateForm, UserCreateFields, type UserCreateFormState } from "@/components/forms/UserCreateFields";

interface TenantLike { id?: string; name?: string; code?: string; active?: boolean }

export default function TenantsPage() {
  const [tenantForm, setTenantForm] = useState({ tenantName: "", tenantCode: "", logoUrl: "" });
  const [createdTenant, setCreatedTenant] = useState<TenantLike | null>(null);
  const [tenantIdForAdmin, setTenantIdForAdmin] = useState("");
  const [adminForm, setAdminForm] = useState<UserCreateFormState>(emptyUserCreateForm);
  const [tenantLoading, setTenantLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  async function handleCreateTenant() {
    if (!tenantForm.tenantName || !tenantForm.tenantCode) {
      toast.error("Tenant name and code are required");
      return;
    }
    try {
      setTenantLoading(true);
      const response = await createTenant({
        tenantName: tenantForm.tenantName.trim(),
        tenantCode: tenantForm.tenantCode.trim(),
        logoUrl: tenantForm.logoUrl.trim(),
      });
      const tenant = unwrapApiData<TenantLike>(response, {});
      setCreatedTenant(tenant);
      if (tenant.id) setTenantIdForAdmin(tenant.id);
      toast.success("Tenant created. Now create Tenant Admin.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create tenant"));
    } finally {
      setTenantLoading(false);
    }
  }

  async function handleCreateTenantAdmin() {
    if (!tenantIdForAdmin || !adminForm.firstName || !adminForm.email || !adminForm.password) {
      toast.error("Tenant ID, first name, email and password are required");
      return;
    }
    try {
      setAdminLoading(true);
      await createTenantAdmin(tenantIdForAdmin, adminForm);
      toast.success("Tenant Admin created successfully. Login with this admin to create projects.");
      setAdminForm(emptyUserCreateForm);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create tenant admin"));
    } finally {
      setAdminLoading(false);
    }
  }

  function copyTenantId() {
    if (!tenantIdForAdmin) return;
    navigator.clipboard.writeText(tenantIdForAdmin);
    toast.success("Tenant ID copied");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Super Admin Flow"
        title="Tenant Setup"
        description="Step 1: Super Admin creates a tenant. Step 2: Super Admin creates Tenant Admin under that tenant."
      >
        <Link
          href="/tenants/register"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
        >
          Open Full Registration Page
        </Link>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-teal-600" />Create Tenant</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="space-y-2"><Label>Tenant Name</Label><Input value={tenantForm.tenantName} onChange={(e) => setTenantForm({ ...tenantForm, tenantName: e.target.value })} placeholder="ABC Company" /></label>
            <label className="space-y-2"><Label>Tenant Code</Label><Input value={tenantForm.tenantCode} onChange={(e) => setTenantForm({ ...tenantForm, tenantCode: e.target.value })} placeholder="ABC001" /></label>
            <label className="space-y-2"><Label>Logo URL</Label><Textarea value={tenantForm.logoUrl} onChange={(e) => setTenantForm({ ...tenantForm, logoUrl: e.target.value })} placeholder="Optional" /></label>
            <Button onClick={handleCreateTenant} disabled={tenantLoading} className="w-full rounded-lg font-semibold">{tenantLoading ? "Creating..." : "Create Tenant"}</Button>

            {createdTenant ? (
              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-500/10 dark:text-green-200">
                <p className="font-semibold">Tenant created</p>
                <p className="mt-1 break-all">Tenant ID: {createdTenant.id}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-teal-600" />Create Tenant Admin</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="space-y-2"><Label>Tenant ID</Label><div className="flex gap-2"><Input value={tenantIdForAdmin} onChange={(e) => setTenantIdForAdmin(e.target.value)} placeholder="Paste tenant UUID" /><Button variant="outline" size="icon" onClick={copyTenantId}><Copy className="h-4 w-4" /></Button></div></label>
            <UserCreateFields value={adminForm} onChange={setAdminForm} />
            <Button onClick={handleCreateTenantAdmin} disabled={adminLoading} className="w-full rounded-lg font-semibold">{adminLoading ? "Creating..." : "Create Tenant Admin"}</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
