"use client";

import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function CreatedCredentialCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: { label: string; value?: string }[];
}) {
  function copy(value?: string) {
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast.success("Copied");
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6 opacity-80">{description}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {items.filter((item) => item.value).map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-lg bg-white/75 px-4 py-3 text-sm dark:bg-slate-950/60"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-60">{item.label}</p>
              <p className="break-all font-bold">{item.value}</p>
            </div>
            <Button type="button" variant="outline" size="icon" onClick={() => copy(item.value)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
