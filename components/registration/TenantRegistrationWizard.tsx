"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, KeyRound, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTenant, createTenantAdmin } from "@/services/tenant.service";
import { getErrorMessage } from "@/lib/api-response";
import {
  emptyUserCreateForm,
  UserCreateFields,
  type UserCreateFormState,
} from "@/components/forms/UserCreateFields";
import CreatedCredentialCard from "@/components/registration/CreatedCredentialCard";
import WorkflowInfoCard from "@/components/registration/WorkflowInfoCard";
import { extractCreatedId } from "@/components/registration/helpers";

export default function TenantRegistrationWizard() {
  const [tenantForm, setTenantForm] = useState({
    tenantName: "",
    tenantCode: "",
    logoUrl: "",
  });
  const [tenantId, setTenantId] = useState("");
  const [adminForm, setAdminForm] = useState<UserCreateFormState>(emptyUserCreateForm);
  const [tenantLoading, setTenantLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [createdAdminEmail, setCreatedAdminEmail] = useState("");

  async function handleCreateTenant() {
    if (!tenantForm.tenantName.trim() || !tenantForm.tenantCode.trim()) {
      toast.error("Tenant name and tenant code are required");
      return;
    }

    try {
      setTenantLoading(true);
      const response = await createTenant({
        tenantName: tenantForm.tenantName.trim(),
        tenantCode: tenantForm.tenantCode.trim(),
        logoUrl: tenantForm.logoUrl.trim(),
      });
      const createdTenantId = extractCreatedId(response);

      if (createdTenantId) {
        setTenantId(createdTenantId);
      }

      toast.success("Tenant created. Now create Tenant Admin.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create tenant"));
    } finally {
      setTenantLoading(false);
    }
  }

  async function handleCreateTenantAdmin() {
    if (!tenantId.trim()) {
      toast.error("Tenant ID is required");
      return;
    }
    if (!adminForm.firstName.trim() || !adminForm.email.trim() || !adminForm.password.trim()) {
      toast.error("First name, email and password are required");
      return;
    }

    try {
      setAdminLoading(true);
      await createTenantAdmin(tenantId.trim(), {
        ...adminForm,
        firstName: adminForm.firstName.trim(),
        lastName: adminForm.lastName.trim(),
        email: adminForm.email.trim(),
        phone: adminForm.phone.trim(),
        password: adminForm.password,
      });
      setCreatedAdminEmail(adminForm.email.trim());
      toast.success("Tenant Admin created. Use this account to login and create projects.");
      setAdminForm(emptyUserCreateForm);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create tenant admin"));
    } finally {
      setAdminLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <WorkflowInfoCard
          title="Super Admin Registration Flow"
          steps={[
            "Login as Super Admin",
            "Create Tenant",
            "Create Tenant Admin",
            "Tenant Admin logs in to create projects",
          ]}
        />

        <Card className="rounded-xl border-teal-100 bg-gradient-to-br from-teal-50 to-white dark:border-teal-500/20 dark:from-teal-950/40 dark:to-slate-950">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-300">
                  Next Step
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  After Tenant Admin is created
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Give the Tenant Admin the email and password. They should login and continue to Project Registration.
                </p>
              </div>
              <Link
                href="/projects/register"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
              >
                Project Registration
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-teal-600" />
              1. Create Tenant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="space-y-2">
              <Label>Tenant Name</Label>
              <Input
                value={tenantForm.tenantName}
                onChange={(event) => setTenantForm({ ...tenantForm, tenantName: event.target.value })}
                placeholder="ABC Company"
              />
            </label>
            <label className="space-y-2">
              <Label>Tenant Code</Label>
              <Input
                value={tenantForm.tenantCode}
                onChange={(event) => setTenantForm({ ...tenantForm, tenantCode: event.target.value })}
                placeholder="ABC001"
              />
            </label>
            <label className="space-y-2">
              <Label>Logo URL</Label>
              <Textarea
                value={tenantForm.logoUrl}
                onChange={(event) => setTenantForm({ ...tenantForm, logoUrl: event.target.value })}
                placeholder="Optional logo URL"
              />
            </label>
            <Button onClick={handleCreateTenant} disabled={tenantLoading} className="w-full rounded-lg font-semibold">
              {tenantLoading ? "Creating Tenant..." : "Create Tenant"}
            </Button>

            {tenantId ? (
              <CreatedCredentialCard
                title="Tenant created"
                description="Use this Tenant ID to create Tenant Admin."
                items={[{ label: "Tenant ID", value: tenantId }]}
              />
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-teal-600" />
              2. Create Tenant Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="space-y-2">
              <Label>Tenant ID</Label>
              <Input
                value={tenantId}
                onChange={(event) => setTenantId(event.target.value)}
                placeholder="Paste tenant UUID"
              />
            </label>
            <UserCreateFields value={adminForm} onChange={setAdminForm} />
            <Button onClick={handleCreateTenantAdmin} disabled={adminLoading} className="w-full rounded-lg font-semibold">
              {adminLoading ? "Creating Tenant Admin..." : "Create Tenant Admin"}
            </Button>

            {createdAdminEmail ? (
              <CreatedCredentialCard
                title="Tenant Admin created"
                description="This user can now login and create projects."
                items={[
                  { label: "Login Email", value: createdAdminEmail },
                  { label: "Tenant ID", value: tenantId },
                ]}
              />
            ) : (
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                <KeyRound className="mt-0.5 h-4 w-4 text-teal-600" />
                <p>
                  This API is protected. Use it after Super Admin login. Do not use public registration for Tenant Admin.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
