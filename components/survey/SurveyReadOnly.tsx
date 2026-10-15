"use client";

import type { SurveySchema } from "@/types/survey";
import { allSurveyFields } from "@/types/survey";

interface SurveyReadOnlyProps {
  schema: SurveySchema;
  answers: Record<string, unknown>;
}

export default function SurveyReadOnly({ schema, answers }: SurveyReadOnlyProps) {
  const fields = allSurveyFields(schema).filter((field) => !["Heading", "Paragraph", "Divider", "Columns", "Section", "Tabs"].includes(field.type));

  if (!fields.length) {
    return <p className="text-sm text-slate-500">No survey fields found in this form.</p>;
  }

  return (
    <div className="space-y-3">
      {fields.map((field) => {
        const value = answers[field.id];
        return (
          <div key={field.id} className="rounded-xl border bg-white p-4 dark:bg-slate-900">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold">{field.label}</p>
                <p className="text-xs text-slate-500">{field.type}</p>
              </div>
              {field.required ? <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">Required</span> : null}
            </div>
            <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-200">{formatValue(value)}</pre>
          </div>
        );
      })}
    </div>
  );
}

function formatValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value, null, 2);
}
