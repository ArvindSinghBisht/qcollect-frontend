"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonLines } from "@/components/common/State";
import FormsTable from "@/components/form/FormsTable";
import CreateFormDialog from "@/components/form/CreateFormDialog";
import GoogleSheetsIntegrationDialog from "@/components/integrations/GoogleSheetsIntegrationDialog";
import { getForms } from "@/services/form.service";
import { getErrorMessage, unwrapApiData } from "@/lib/api-response";
import type { Form } from "@/types/form";

export default function ProjectFormsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadForms(); }, [projectId]);

  async function loadForms() {
    try {
      setLoading(true);
      const response = await getForms(projectId);
      setForms(unwrapApiData<Form[]>(response, []));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load forms"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Link href={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600"><ArrowLeft className="h-4 w-4" /> Back to Project</Link>
      <PageHeader eyebrow="Project Admin Flow" title="Project Forms" description="Create and publish forms, then assign each form to Accessors and Quality Checkers.">
        <div className="flex flex-wrap items-center gap-2">
          <GoogleSheetsIntegrationDialog projectId={projectId} />
          <CreateFormDialog projectId={projectId} onSuccess={loadForms} />
        </div>
      </PageHeader>
      <Card className="rounded-xl"><CardContent>{loading ? <SkeletonLines count={4} /> : <FormsTable forms={forms} projectId={projectId} onRefresh={loadForms} />}</CardContent></Card>
    </div>
  );
}
