"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, SkeletonLines } from "@/components/common/State";
import { StatusBadge } from "@/components/common/StatusBadge";
import CreateProjectAdminDialog from "@/components/projects/CreateProjectAdminDialog";
import CreateAccessorDialog from "@/components/projects/CreateAccessorDialog";
import CreateQualityCheckerDialog from "@/components/projects/CreateQualityCheckerDialog";
import { getMembers, removeMember } from "@/services/project.service";
import { getErrorMessage, unwrapApiData } from "@/lib/api-response";
import type { ProjectMember } from "@/types/project";

export default function ProjectMembersPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadMembers(); }, [projectId]);

  async function loadMembers() {
    try {
      setLoading(true);
      const response = await getMembers(projectId);
      setMembers(unwrapApiData<ProjectMember[]>(response, []));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load members"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Remove this member?")) return;
    try {
      await removeMember(projectId, memberId);
      toast.success("Member removed");
      loadMembers();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to remove member"));
    }
  }

  return (
    <div className="space-y-8">
      <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600"><ArrowLeft className="h-4 w-4" /> Back to Project</Link>
      <PageHeader eyebrow="Project Admin Flow" title="Project Members" description="Create Project Admin, Accessor and Quality Checker users for this project.">
        <CreateProjectAdminDialog projectId={projectId} onSuccess={loadMembers} />
        <CreateAccessorDialog projectId={projectId} onSuccess={loadMembers} />
        <CreateQualityCheckerDialog projectId={projectId} onSuccess={loadMembers} />
        <Link
          href={`/projects/${projectId}/register`}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
        >
          Full Registration
        </Link>
      </PageHeader>

      <Card className="rounded-xl">
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-teal-600" />Members</CardTitle></CardHeader>
        <CardContent>
          {loading ? <SkeletonLines count={5} /> : members.length ? (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900">
                  <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y">
                  {members.map((member) => (
                    <tr key={member.id} className="bg-white dark:bg-slate-950">
                      <td className="p-4 font-bold">{member.userName || member.name || `${member.firstName || ""} ${member.lastName || ""}` || member.userId}</td>
                      <td className="p-4 text-slate-500">{member.email || "-"}</td>
                      <td className="p-4"><StatusBadge status={member.role} /></td>
                      <td className="p-4 text-right"><Button variant="destructive" size="sm" onClick={() => handleRemove(member.id)}>Remove</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No members yet" description="Create Project Admins, Accessors and Quality Checkers using the buttons above." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
