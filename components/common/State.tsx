import type { ReactNode } from "react";
import { Loader2, SearchX } from "lucide-react";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-xl border border-slate-200 bg-white/80 p-8 text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
      <div className="flex items-center gap-3 text-sm font-semibold">
        <Loader2 className="h-4 w-4 animate-spin" />
        {label}
      </div>
    </div>
  );
}

export function EmptyState({
  title = "No data found",
  description = "There is nothing to show here yet.",
  children,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
      <div className="max-w-md">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          <SearchX className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
        {children ? <div className="mt-5 flex justify-center">{children}</div> : null}
      </div>
    </div>
  );
}

export function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
      ))}
    </div>
  );
}
