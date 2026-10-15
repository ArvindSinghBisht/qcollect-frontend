"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState, SkeletonLines } from "@/components/common/State";
import { getMyForms } from "@/services/form.service";
import { getErrorMessage, unwrapApiData } from "@/lib/api-response";
import { useAuthStore } from "@/store/auth.store";
import type { MobileFormResponse } from "@/types/form";

export default function MyFormsPage() {
  const selectedProjectId = useAuthStore((state) => state.selectedProjectId);
  const selectedProjectName = useAuthStore((state) => state.selectedProjectName);
  const [forms, setForms] = useState<MobileFormResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyForms();
  }, [selectedProjectId]);

  async function loadMyForms() {
    try {
      setLoading(true);
      const response = await getMyForms();
      const allForms = unwrapApiData<MobileFormResponse[]>(response, []);
      const visibleForms = selectedProjectId
        ? allForms.filter((form) => !form.projectId || form.projectId === selectedProjectId)
        : allForms;
      setForms(visibleForms);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load assigned forms"));
      setForms([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Accessor Flow"
        title="My Forms"
        description={`Published forms available for ${selectedProjectName || "your selected project"}. You can submit unlimited responses for each form.`}
      />

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-600" />
            Assigned Forms
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonLines count={4} />
          ) : forms.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {forms.map((form) => (
                <div key={`${form.projectId}-${form.formId}`} className="rounded-xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                  <h3 className="font-semibold">{form.formName}</h3>
                  <p className="mt-2 text-sm text-slate-500">Project: {form.projectName || form.projectId}</p>
                  <p className="mt-1 text-xs text-slate-400">Published version: {form.version || 1}</p>
                  <Link href={`/forms/${form.formId}/fill`}>
                    <Button className="mt-5 rounded-lg">Fill New Response</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No assigned forms yet"
              description="Only published forms assigned to the selected project will appear here. Ask the Project Admin to publish the form and add you to the project."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
