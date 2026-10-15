import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function WorkflowInfoCard({
  title,
  steps,
}: {
  title: string;
  steps: string[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-300">
        {title}
      </p>
      <div className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <div key={step} className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
              {index + 1}
            </div>
            <div className="flex-1 rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              {step}
            </div>
            {index < steps.length - 1 ? <ArrowRight className="mt-2 hidden h-4 w-4 text-slate-300 xl:block" /> : <CheckCircle2 className="mt-2 hidden h-4 w-4 text-emerald-500 xl:block" />}
          </div>
        ))}
      </div>
    </div>
  );
}
