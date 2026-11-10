"use client";

import { useEffect } from "react";
import { ClipboardCheck, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/State";
import { RoleBadge } from "@/components/common/RoleBadge";
import {
  distinctMultiRoles,
  normalizeRole,
  roleLabel,
  type MultiRoleProjectRole,
} from "@/lib/flow";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth.store";

const roleMeta: Record<
  MultiRoleProjectRole,
  { icon: typeof UserCheck; blurb: string }
> = {
  ACCESSOR: {
    icon: ClipboardCheck,
    blurb: "Fill, draft, and submit assigned forms.",
  },
  QUALITY_CHECKER: {
    icon: UserCheck,
    blurb: "Review pending submissions for your projects.",
  },
  PROJECT_ADMIN: {
    icon: ShieldCheck,
    blurb: "Manage project members, forms, and workspace.",
  },
};

export default function SelectRolePage() {
  const user = useAuthStore((state) => state.user);
  const { continueWithProjectRole } = useAuth();
  const projects = user?.projects || [];
  const roles = distinctMultiRoles(projects);

  const soleRole = roles.length === 1 ? roles[0] : null;

  /*
   * Single-role accounts should not linger here — continue into the project
   * picker or workspace for that role (covers direct /select-role visits).
   */
  useEffect(() => {
    if (!soleRole) return;

    try {
      continueWithProjectRole(soleRole);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not open that role."
      );
    }
  }, [soleRole, continueWithProjectRole]);

  function chooseRole(role: MultiRoleProjectRole) {
    try {
      continueWithProjectRole(role);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not open that role."
      );
    }
  }

  if (soleRole) {
    return null;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your account"
        title="Choose your role"
        description="This account has more than one role. Pick which one you want to use for this session."
      />

      {roles.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => {
            const meta = roleMeta[role];
            const Icon = meta.icon;
            const projectCount = projects.filter(
              (project) => normalizeRole(project.role) === role
            ).length;

            return (
              <Card
                key={role}
                className="rounded-xl transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="flex items-center gap-2">
                    {roleLabel(role)}
                    <RoleBadge role={role} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-500">{meta.blurb}</p>
                  <p className="text-xs font-medium text-slate-400">
                    {projectCount}{" "}
                    {projectCount === 1 ? "project" : "projects"}
                  </p>
                  <Button
                    className="w-full rounded-lg font-semibold"
                    onClick={() => chooseRole(role)}
                  >
                    Continue as {roleLabel(role)}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="rounded-xl">
          <CardContent className="p-6">
            <EmptyState
              title="No project roles found"
              description="Your login succeeded, but this account has no Accessor, Quality Checker, or Project Admin memberships to choose from."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
