"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, SkeletonLines } from "@/components/common/State";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getPendingSubmissions } from "@/services/submission.service";
import { getErrorMessage, unwrapApiData } from "@/lib/api-response";
import type { Submission } from "@/types/submission";

export default function PendingSubmissionsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSubmissions(); }, [projectId]);

  async function loadSubmissions() {
    try {
      setLoading(true);
      const response = await getPendingSubmissions(projectId);
      setSubmissions(unwrapApiData<Submission[]>(response, []));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load pending submissions"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600"><ArrowLeft className="h-4 w-4" /> Back to Project</Link>
      <PageHeader eyebrow="Quality Checker Flow" title="Pending Submissions" description="Review submitted answers and photos, approve/reject and add remarks." />
      <Card className="rounded-xl">
        <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-teal-600" />Review Queue</CardTitle></CardHeader>
        <CardContent>
          {loading ? <SkeletonLines count={5} /> : submissions.length ? (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div key={submission.id} className="flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><p className="font-semibold">Submission</p><StatusBadge status={submission.status} /></div>
                    <p className="mt-1 break-all text-xs text-slate-500">{submission.id}</p>
                    <p className="mt-2 text-sm text-slate-500">Accessor: {submission.accessorId || "-"}</p>
                  </div>
                  <Link href={`/submissions/${submission.id}`}><Button className="rounded-lg font-semibold">Review</Button></Link>
                </div>
              ))}
            </div>
          ) : <EmptyState title="No pending submissions" description="Submissions will appear here after Accessors submit forms." />}
        </CardContent>
      </Card>
    </div>
  );
}
