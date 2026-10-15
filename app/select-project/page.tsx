"use client";

import { useRouter } from "next/navigation";
import { FolderKanban, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/State";
import { RoleBadge } from "@/components/common/RoleBadge";
import { projectWorkspacePath, roleLabel } from "@/lib/flow";
import { useAuthStore } from "@/store/auth.store";
import type { ProjectMembership } from "@/types/auth";

export default function SelectProjectPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const setSelectedProject = useAuthStore((state) => state.setSelectedProject);
  const projects = user?.projects || [];

  function openProject(project: ProjectMembership) {
    setSelectedProject({
      projectId: project.projectId,
      projectName: project.projectName,
      role: project.role,
    });
  
    router.replace(projectWorkspacePath(project.role, project.projectId));
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Project Context"
        title="Select Project"
        description="Your login can contain multiple project roles. Select one project to set X-Project-Id and open the correct workspace."
      />

      {projects.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const active = selectedProjectId === project.projectId;
            return (
              <Card key={`${project.projectId}-${project.role}`} className={`rounded-xl transition hover:-translate-y-0.5 hover:shadow-sm ${active ? "border-teal-500 ring-2 ring-teal-200" : ""}`}>
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/10">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <CardTitle className="line-clamp-2">{project.projectName || project.name || project.projectId}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-500">Role:</span>
                    <RoleBadge role={project.role} />
                  </div>
                  <p className="break-all text-xs text-slate-400">{project.projectId}</p>
                  <Button className="w-full rounded-lg font-semibold" onClick={() => openProject(project)}>
                    {active ? `Continue as ${roleLabel(project.role)}` : `Open ${roleLabel(project.role)} Workspace`}
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
              title="No project memberships found"
              description="Your login succeeded, but backend did not return any projects[] membership. Ask Tenant Admin or Project Admin to add this user to a project."
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
