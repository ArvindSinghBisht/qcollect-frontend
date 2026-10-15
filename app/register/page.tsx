import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FolderPlus,
  LockKeyhole,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { flowSteps } from "@/lib/flow";

const registrationCards = [
  {
    title: "Tenant Registration",
    role: "Super Admin",
    description: "Create Tenant and then create Tenant Admin.",
    href: "/tenants/register",
    icon: Building2,
    accent: "from-slate-950 to-teal-900",
  },
  {
    title: "Project Registration",
    role: "Tenant Admin",
    description: "Create Project under the logged-in tenant.",
    href: "/projects/register",
    icon: FolderPlus,
    accent: "from-blue-700 to-cyan-600",
  },
  {
    title: "Project Admin Registration",
    role: "Tenant Admin",
    description: "Create a Project Admin after creating/opening project.",
    href: "/projects",
    icon: ShieldCheck,
    accent: "from-violet-700 to-fuchsia-600",
  },
  {
    title: "Accessor Registration",
    role: "Project Admin",
    description: "Create field users who fill forms and submit data.",
    href: "/projects",
    icon: UserPlus,
    accent: "from-emerald-700 to-teal-600",
  },
  {
    title: "Quality Checker Registration",
    role: "Project Admin",
    description: "Create reviewers who approve/reject submitted forms.",
    href: "/projects",
    icon: BadgeCheck,
    accent: "from-orange-700 to-rose-600",
  },
];

export default function RegistrationFlowPage() {
  return (
    <main className="registration-page min-h-screen p-4">
      <div className="mx-auto max-w-7xl py-8 md:py-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/70 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm backdrop-blur dark:border-teal-500/20 dark:bg-white/10 dark:text-teal-200">
              <LockKeyhole className="h-4 w-4" />
              QCollect registration
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">
              Set up your workspace.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
              There is no open public signup. Each registration step is controlled by the previous authorized role: Super Admin → Tenant Admin → Project Admin → Accessor / Quality Checker.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
            >
              Open Console
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-5">
          {flowSteps.map((step, index) => (
            <Card key={step.role} className="rounded-xl border-white/70 bg-white/80 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <CardContent className="p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                  {index + 1}
                </div>
                <p className="font-semibold text-slate-950 dark:text-white">{step.role}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{step.action}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {registrationCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href}>
                <div className="group h-full overflow-hidden rounded-xl border border-white/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900">
                  <div className="registration-card-heading p-5">
                    <Icon className="h-6 w-6" />
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-300">{card.role}</p>
                    <h2 className="mt-2 text-xl font-semibold">{card.title}</h2>
                  </div>
                  <div className="p-5">
                    <p className="min-h-16 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.description}</p>
                    <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-teal-600">
                      Continue
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
