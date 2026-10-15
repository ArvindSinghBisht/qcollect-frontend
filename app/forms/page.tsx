"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuthStore } from "@/store/auth.store";
import { getEffectiveRole, normalizeRole } from "@/lib/flow";

export default function FormsLandingPage() {
  const router = useRouter();
  const systemRole = useAuthStore((state) => state.systemRole || state.user?.systemRole || state.user?.role);
  const selectedProjectRole = useAuthStore((state) => state.selectedProjectRole);
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const [projectId, setProjectId] = useState(selectedProjectId || "");
  const normalizedRole = normalizeRole(getEffectiveRole(systemRole, selectedProjectRole));

  function openForms() {
    if (!projectId.trim()) return;
    router.push(`/projects/${projectId.trim()}/forms`);
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Forms" title="Form Workspace" description="Project Admin creates and manages forms. Accessor opens assigned forms from My Forms." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5 text-teal-600" />Open Project Forms</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">Paste or use selected Project ID to open form builder for that project.</p>
            <label className="space-y-2"><Label>Project ID</Label><Input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Project UUID" /></label>
            <Button className="rounded-lg font-semibold" disabled={!projectId.trim()} onClick={openForms}>Open Forms</Button>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-teal-600" />Role Shortcut</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">Current role: <b>{normalizedRole || "USER"}</b></p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => router.push("/my/forms")}>Accessor My Forms</Button>
              <Button variant="outline" onClick={() => router.push("/submissions/pending")}>QC Pending Reviews</Button>
              <Button variant="outline" onClick={() => router.push("/projects")}>Projects</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
