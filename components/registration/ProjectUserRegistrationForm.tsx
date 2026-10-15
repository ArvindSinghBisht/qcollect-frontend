"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, ClipboardList, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  emptyUserCreateForm,
  UserCreateFields,
  type UserCreateFormState,
} from "@/components/forms/UserCreateFields";
import {
  createAccessor,
  createProjectAdmin,
  createQualityChecker,
} from "@/services/project.service";
import { getErrorMessage } from "@/lib/api-response";
import CreatedCredentialCard from "@/components/registration/CreatedCredentialCard";
import WorkflowInfoCard from "@/components/registration/WorkflowInfoCard";
import { registrationRoleLabel } from "@/components/registration/helpers";

type RegistrationType = "PROJECT_ADMIN" | "ACCESSOR" | "QUALITY_CHECKER";

const config = {
  PROJECT_ADMIN: {
    title: "Create Project Admin",
    description: "Tenant Admin creates Project Admin for this project.",
    button: "Create Project Admin",
    success: "Project Admin created successfully",
    Icon: ShieldCheck,
    accent: "text-violet-600",
  },
  ACCESSOR: {
    title: "Create Accessor",
    description: "Project Admin creates Accessor for field data collection.",
    button: "Create Accessor",
    success: "Accessor created successfully",
    Icon: UserPlus,
    accent: "text-emerald-600",
  },
  QUALITY_CHECKER: {
    title: "Create Quality Checker",
    description: "Project Admin creates Quality Checker for submission review.",
    button: "Create Quality Checker",
    success: "Quality Checker created successfully",
    Icon: BadgeCheck,
    accent: "text-orange-600",
  },
};

export default function ProjectUserRegistrationForm({
  type,
  defaultProjectId = "",
}: {
  type: RegistrationType;
  defaultProjectId?: string;
}) {
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [form, setForm] = useState<UserCreateFormState>(emptyUserCreateForm);
  const [loading, setLoading] = useState(false);
  const [createdEmail, setCreatedEmail] = useState("");
  const item = config[type];
  const Icon = item.Icon;

  const steps = useMemo(() => {
    if (type === "PROJECT_ADMIN") {
      return [
        "Login as Tenant Admin",
        "Open or create the Project",
        "Create Project Admin",
        "Project Admin logs in and creates Accessors, QCs and Forms",
      ];
    }
    if (type === "ACCESSOR") {
      return [
        "Login as Project Admin",
        "Open Project",
        "Create Accessor",
        "Accessor logs in and fills assigned forms",
      ];
    }
    return [
      "Login as Project Admin",
      "Open Project",
      "Create Quality Checker",
      "Quality Checker logs in and reviews submissions",
    ];
  }, [type]);

  async function handleCreate() {
    if (!projectId.trim()) {
      toast.error("Project ID is required");
      return;
    }
    if (!form.firstName.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error("First name, email and password are required");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      };

      if (type === "PROJECT_ADMIN") {
        await createProjectAdmin(projectId.trim(), payload);
      } else if (type === "ACCESSOR") {
        await createAccessor(projectId.trim(), payload);
      } else {
        await createQualityChecker(projectId.trim(), payload);
      }

      setCreatedEmail(payload.email);
      setForm(emptyUserCreateForm);
      toast.success(item.success);
    } catch (error) {
      toast.error(getErrorMessage(error, `Failed to create ${registrationRoleLabel(type)}`));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <WorkflowInfoCard title={`${registrationRoleLabel(type)} Registration Flow`} steps={steps} />

        <Card className="rounded-xl border-slate-200 bg-gradient-to-br from-slate-50 to-white dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
                <ClipboardList className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-300">
                  Backend API Used
                </p>
                <p className="mt-2 break-all text-lg font-semibold text-slate-950 dark:text-white">
                  {type === "PROJECT_ADMIN" && "POST /projects/{projectId}/admins"}
                  {type === "ACCESSOR" && "POST /projects/{projectId}/accessors"}
                  {type === "QUALITY_CHECKER" && "POST /projects/{projectId}/quality-checkers"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  No backend endpoint name is changed. This page only gives a full-page registration flow instead of only popup dialogs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${item.accent}`} />
            {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-[1fr_.85fr]">
          <div className="space-y-4">
            <label className="space-y-2">
              <Label>Project ID</Label>
              <Input
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                placeholder="Paste project UUID"
              />
            </label>
            <UserCreateFields value={form} onChange={setForm} />
            <Button onClick={handleCreate} disabled={loading} className="w-full rounded-lg font-semibold">
              {loading ? "Creating..." : item.button}
            </Button>
          </div>

          <div className="space-y-4">
            {createdEmail ? (
              <CreatedCredentialCard
                title={`${registrationRoleLabel(type)} created`}
                description="Share these login credentials with the user."
                items={[
                  { label: "Login Email", value: createdEmail },
                  { label: "Project ID", value: projectId },
                ]}
              />
            ) : (
              <div className="rounded-xl bg-slate-50 p-5 text-sm leading-6 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                <p className="font-semibold text-slate-950 dark:text-white">Access rule</p>
                <p className="mt-2">{item.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={projectId ? `/projects/${projectId}/members` : "/projects"}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  >
                    View Members
                  </Link>
                  <Link
                    href={projectId ? `/projects/${projectId}` : "/projects"}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                  >
                    Open Project
                  </Link>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
