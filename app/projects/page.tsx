"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search, FolderKanban, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, SkeletonLines } from "@/components/common/State";
import { StatusBadge } from "@/components/common/StatusBadge";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import { getProjects } from "@/services/project.service";
import { unwrapApiData } from "@/lib/api-response";
import { useAuthStore } from "@/store/auth.store";
import type { Project } from "@/types/project";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const setSelectedProject = useAuthStore((state) => state.setSelectedProject);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      const response = await getProjects();
      setProjects(unwrapApiData<Project[]>(response, []));
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch projects. Check backend token and role access.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return projects;
    return projects.filter((project) =>
      [project.name, project.description, project.id]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(keyword))
    );
  }, [projects, search]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tenant Admin Flow"
        title="Projects"
        description="Tenant Admin creates projects. Project Admin then manages accessors, quality checkers, forms and reviews inside each project."
      >
        <Link
          href="/projects/register"
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
        >
          Full Project Registration
        </Link>
        <CreateProjectDialog onSuccess={loadProjects} />
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-xl"><CardContent className="p-5"><p className="text-sm text-slate-500">Total Projects</p><p className="mt-2 text-3xl font-semibold">{projects.length}</p></CardContent></Card>
        <Card className="rounded-xl"><CardContent className="p-5"><p className="text-sm text-slate-500">Active</p><p className="mt-2 text-3xl font-semibold text-green-600">{projects.filter((p) => p.active !== false).length}</p></CardContent></Card>
        <Card className="rounded-xl"><CardContent className="p-5"><p className="text-sm text-slate-500">Inactive</p><p className="mt-2 text-3xl font-semibold text-red-600">{projects.filter((p) => p.active === false).length}</p></CardContent></Card>
      </div>

      <Card className="rounded-xl">
        <CardHeader className="gap-4 md:flex md:flex-row md:items-center md:justify-between">
          <CardTitle className="flex items-center gap-2"><FolderKanban className="h-5 w-5 text-teal-600" />Project Workspaces</CardTitle>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search project..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonLines count={5} />
          ) : filtered.length ? (
            <div className="project-directory">
              {filtered.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`} onClick={() => setSelectedProject({ id: project.id, name: project.name })}>
                  <div className="project-directory-row group">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="rounded-lg bg-teal-50 p-3 text-teal-600 dark:bg-teal-500/10">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <StatusBadge status={project.active !== false} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{project.name}</h3>
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">{project.description || "No description added."}</p>
                    <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
                      <span className="truncate">{project.id}</span>
                      <span className="font-semibold text-teal-600 group-hover:translate-x-1 transition">Open →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No projects found" description="Create a project to continue the backend flow.">
              <CreateProjectDialog onSuccess={loadProjects} />
            </EmptyState>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-teal-100 bg-teal-50/60 dark:border-teal-500/20 dark:bg-teal-500/10">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">Backend flow reminder</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Tenant Admin creates Project → creates Project Admin → Project Admin creates forms and users.</p>
          </div>
          <Button variant="outline" className="rounded-lg"><PlusCircle className="h-4 w-4" /> Continue</Button>
        </CardContent>
      </Card>
    </div>
  );
}
