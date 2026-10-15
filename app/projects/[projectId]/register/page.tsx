"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BadgeCheck, ShieldCheck, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";

export default function ProjectRegistrationHubPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const cards = [
    {
      title: "Project Admin",
      description: "Tenant Admin creates the Project Admin for this project.",
      href: `/projects/${projectId}/admins/register`,
      icon: ShieldCheck,
    },
    {
      title: "Accessor",
      description: "Project Admin creates field users who fill and submit forms.",
      href: `/projects/${projectId}/accessors/register`,
      icon: UserPlus,
    },
    {
      title: "Quality Checker",
      description: "Project Admin creates reviewers who approve or reject submissions.",
      href: `/projects/${projectId}/quality-checkers/register`,
      icon: BadgeCheck,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Project Workflow"
        title="Project User Registration"
        description="Register users for this project using the exact backend endpoints for Project Admin, Accessor and Quality Checker."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="h-full rounded-xl transition hover:-translate-y-0.5 hover:shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-500/10">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-950 dark:text-white">{card.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.description}</p>
                  <p className="mt-6 text-sm font-semibold text-teal-600">Open Registration →</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
