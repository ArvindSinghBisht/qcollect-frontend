"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuthStore } from "@/store/auth.store";

export default function MembersLandingPage() {
  const router = useRouter();
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const [projectId, setProjectId] = useState(selectedProjectId || "");

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="User Management" title="Members" description="Members are managed inside each project. Paste a Project ID or open one from Projects." />
      <Card className="max-w-2xl rounded-xl">
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-teal-600" />Open Project Members</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <label className="space-y-2"><Label>Project ID</Label><Input value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Project UUID" /></label>
          <Button className="rounded-lg font-semibold" disabled={!projectId.trim()} onClick={() => router.push(`/projects/${projectId.trim()}/members`)}>Open Members</Button>
        </CardContent>
      </Card>
    </div>
  );
}
