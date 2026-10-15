"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, FolderPlus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/services/project.service";
import { getErrorMessage } from "@/lib/api-response";
import CreatedCredentialCard from "@/components/registration/CreatedCredentialCard";
import WorkflowInfoCard from "@/components/registration/WorkflowInfoCard";
import { extractCreatedId } from "@/components/registration/helpers";

export default function ProjectRegistrationForm() {
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState("");

  async function handleCreateProject() {
    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      setLoading(true);
      const response = await createProject({
        name: form.name.trim(),
        description: form.description.trim(),
      });
      const createdProjectId = extractCreatedId(response);
      if (createdProjectId) setProjectId(createdProjectId);
      toast.success("Project created. Now create Project Admin.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create project"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <WorkflowInfoCard
          title="Tenant Admin Registration Flow"
          steps={[
            "Login as Tenant Admin",
            "Create Project",
            "Create Project Admin",
            "Project Admin logs in to create users and forms",
          ]}
        />

        <Card className="rounded-xl border-blue-100 bg-gradient-to-br from-blue-50 to-white dark:border-blue-500/20 dark:from-blue-950/40 dark:to-slate-950">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                  Next Step
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  Register the Project Admin
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Once the project is created, create a Project Admin for that project.
                </p>
              </div>
              <Link
                href={projectId ? `/projects/${projectId}/admins/register` : "#"}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 ${!projectId ? "pointer-events-none opacity-50" : ""}`}
              >
                Create Project Admin
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-blue-600" />
            Create Project
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-[1fr_.85fr]">
          <div className="space-y-4">
            <label className="space-y-2">
              <Label>Project Name</Label>
              <Input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Inspection Project"
              />
            </label>
            <label className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Demo project description"
              />
            </label>
            <Button onClick={handleCreateProject} disabled={loading} className="w-full rounded-lg font-semibold">
              {loading ? "Creating Project..." : "Create Project"}
            </Button>
          </div>

          <div className="space-y-4">
            {projectId ? (
              <CreatedCredentialCard
                title="Project created"
                description="Use this Project ID for Project Admin, Accessor and Quality Checker registration."
                items={[{ label: "Project ID", value: projectId }]}
              />
            ) : (
              <div className="rounded-xl bg-slate-50 p-5 text-sm leading-6 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                Project creation uses <b>POST /projects</b> with your Tenant Admin token. No Tenant ID field is shown in the frontend because backend derives tenant from login.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
