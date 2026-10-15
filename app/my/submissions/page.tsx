"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClipboardCheck, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, SkeletonLines } from "@/components/common/State";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getMySubmissions } from "@/services/submission.service";
import { getErrorMessage, unwrapApiData } from "@/lib/api-response";
import type { Submission } from "@/types/submission";

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    try {
      setLoading(true);
      const response = await getMySubmissions();
      setSubmissions(unwrapApiData<Submission[]>(response, []));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load your submissions"));
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Accessor Flow"
        title="My Submissions"
        description="All drafts, submitted, approved and rejected submissions created by you."
      >
        <Link href="/my/forms"><Button className="rounded-lg font-semibold"><FileText className="h-4 w-4" /> Fill New Response</Button></Link>
      </PageHeader>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-teal-600" /> Submission History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonLines count={5} />
          ) : submissions.length ? (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div key={submission.id} className="flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">Submission</p>
                      <StatusBadge status={submission.status || "DRAFT"} />
                    </div>
                    <p className="mt-1 break-all text-xs text-slate-500">{submission.id}</p>
                    {submission.formId ? <p className="mt-2 break-all text-sm text-slate-500">Form: {submission.formId}</p> : null}
                    {submission.submittedAt ? <p className="mt-1 text-xs text-slate-400">Submitted: {new Date(submission.submittedAt).toLocaleString()}</p> : null}
                    {submission.updatedAt ? <p className="mt-1 text-xs text-slate-400">Updated: {new Date(submission.updatedAt).toLocaleString()}</p> : null}
                    {submission.remarks ? <p className="mt-2 text-sm text-slate-500">Remarks: {submission.remarks}</p> : null}
                  </div>
                  <Link href={`/submissions/${submission.id}`}>
                    <Button variant="outline" className="rounded-lg font-semibold">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No submissions yet" description="Open My Forms and submit a response. You can submit the same published form multiple times.">
              <Link href="/my/forms"><Button>Open My Forms</Button></Link>
            </EmptyState>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
