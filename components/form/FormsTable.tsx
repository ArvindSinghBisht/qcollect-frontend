"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/State";
import { Form } from "@/types/form";
import EditFormDialog from "./EditFormDialog";
import DeleteFormDialog from "./DeleteFormDialog";
import AssignFormDialog from "./AssignFormDialog";

interface Props {
  forms: Form[];
  projectId?: string;
  onRefresh?: () => void;
}

export default function FormsTable({ forms, projectId, onRefresh }: Props) {
  if (!forms.length) {
    return <EmptyState title="No forms found" description="Create a form to start building the Survey Builder schema." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {forms.map((form) => {
        const effectiveProjectId = form.projectId || projectId;
        const builderHref = effectiveProjectId ? `/projects/${effectiveProjectId}/forms/${form.id}` : `/forms/${form.id}`;
        return (
          <div key={form.id} className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-sm dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="rounded-lg bg-teal-50 p-3 text-teal-600 dark:bg-teal-500/10"><FileText className="h-5 w-5" /></div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={form.active !== false} />
                <StatusBadge status={form.published ? "PUBLISHED" : "DRAFT"} />
              </div>
            </div>
            <h3 className="text-lg font-semibold">{form.name}</h3>
            <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">{form.description || "No description"}</p>
            <p className="mt-2 text-xs font-bold text-slate-400">Version: {form.version || 1}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={builderHref}><Button size="sm" className="rounded-xl">Open Survey Builder</Button></Link>
              <Link href={`/forms/${form.id}/fill`}><Button size="sm" variant="outline" className="rounded-xl">Preview / Fill</Button></Link>
              {effectiveProjectId ? <AssignFormDialog projectId={effectiveProjectId} form={form} /> : null}
              <EditFormDialog form={form} onSuccess={onRefresh} />
              <DeleteFormDialog formId={form.id} formName={form.name} onSuccess={onRefresh} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
