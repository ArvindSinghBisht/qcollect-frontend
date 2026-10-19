"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ClipboardCheck, FileText, FolderKanban, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/State";
import { StatusBadge } from "@/components/common/StatusBadge";
import CreateProjectAdminDialog from "@/components/projects/CreateProjectAdminDialog";
import CreateAccessorDialog from "@/components/projects/CreateAccessorDialog";
import CreateQualityCheckerDialog from "@/components/projects/CreateQualityCheckerDialog";
import { getProject } from "@/services/project.service";
import { unwrapApiData } from "@/lib/api-response";
import { useAuthStore } from "@/store/auth.store";
import type { Project } from "@/types/project";

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const setSelectedProject = useAuthStore((state) => state.setSelectedProject);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  async function loadProject() {
    try {
      setLoading(true);
      const response = await getProject(projectId);
      const data = unwrapApiData<Project | null>(response, null);
      setProject(data);
      if (data) {
        const membership = useAuthStore
          .getState()
          .user?.projects?.find(
            (item) => item.projectId === data.id || item.projectId === projectId
          );
        setSelectedProject({
          id: data.id,
          name: data.name,
          role: membership?.role,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingState label="Loading project..." />;

  if (!project) {
    return (
      <div className="space-y-4">
        <Link href="/projects" className="text-sm font-bold text-teal-600">← Back to Projects</Link>
        <Card className="rounded-xl"><CardContent className="p-8">Project not found.</CardContent></Card>
      </div>
    );
  }

  const actions = [
    { title: "Members", href: `/projects/${projectId}/members`, icon: Users, description: "Create and manage Project Admins, Accessors and Quality Checkers." },
    { title: "Project Admin Registration", href: `/projects/${projectId}/admins/register`, icon: Users, description: "Create the Project Admin who will manage forms and users." },
    { title: "Accessor Registration", href: `/projects/${projectId}/accessors/register`, icon: Users, description: "Create field users who fill forms and upload evidence." },
    { title: "QC Registration", href: `/projects/${projectId}/quality-checkers/register`, icon: Users, description: "Create reviewers who approve or reject submissions." },
    { title: "Forms & Assignments", href: `/projects/${projectId}/forms`, icon: FileText, description: "Create forms and assign each one to Accessor and Quality Checker teams." },
    { title: "Pending Reviews", href: `/submissions/pending/${projectId}`, icon: ClipboardCheck, description: "Open submissions waiting for QC review." },
  ];

  return (
    <div className="space-y-8">
      <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600"><ArrowLeft className="h-4 w-4" /> Back to Projects</Link>
      <PageHeader eyebrow="Project Workspace" title={project.name} description={project.description || "Project workspace for users, forms and reviews."}>
        <StatusBadge status={project.active !== false} />
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <Card className="rounded-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><FolderKanban className="h-5 w-5 text-teal-600" />Project Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Info label="Project ID" value={project.id} />
            <Info label="Tenant ID" value={project.tenantId || "From logged-in tenant"} />
            <Info label="Status" value={project.active === false ? "Inactive" : "Active"} />
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader><CardTitle>Registration Shortcuts</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <CreateProjectAdminDialog projectId={projectId} onSuccess={loadProject} />
            <CreateAccessorDialog projectId={projectId} />
            <CreateQualityCheckerDialog projectId={projectId} />
            <Link
              href={`/projects/${projectId}/register`}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              Full Registration Pages
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href}>
              <Card className="h-full rounded-xl transition hover:-translate-y-0.5 hover:shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/10"><Icon className="h-5 w-5" /></div>
                  <h3 className="font-semibold text-slate-950 dark:text-white">{action.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{action.description}</p>
                  <Button variant="outline" className="mt-5 rounded-lg">Open</Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 break-all text-sm font-bold text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  );
}
