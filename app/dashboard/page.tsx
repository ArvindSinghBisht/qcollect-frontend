"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bell, Building2, CheckCircle2, ClipboardCheck, FileText, FolderKanban, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { MetricCard } from "@/components/common/MetricCard";
import { RoleBadge } from "@/components/common/RoleBadge";
import { useAuthStore } from "@/store/auth.store";
import { getEffectiveRole, normalizeRole, roleLabel } from "@/lib/flow";
import { unwrapApiData } from "@/lib/api-response";
import { getCounts, getTrend } from "@/services/dashboard.service";
import { getProjects } from "@/services/project.service";
import type { Project } from "@/types/project";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const systemRole = useAuthStore((state) => state.systemRole || state.user?.systemRole || state.user?.role);
  const selectedProjectRole = useAuthStore((state) => state.selectedProjectRole);
  const role = getEffectiveRole(systemRole, selectedProjectRole) || systemRole;
  const normalizedRole = normalizeRole(role);
  const [projects, setProjects] = useState<Project[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [trend, setTrend] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const [projectsResponse, countsResponse, trendResponse] = await Promise.allSettled([
        getProjects(),
        getCounts(),
        getTrend(),
      ]);

      if (projectsResponse.status === "fulfilled") {
        setProjects(unwrapApiData<Project[]>(projectsResponse.value, []));
      }
      if (countsResponse.status === "fulfilled") {
        setCounts(unwrapApiData<Record<string, number>>(countsResponse.value, {}));
      }
      if (trendResponse.status === "fulfilled") {
        setTrend(unwrapApiData<Array<Record<string, unknown>>>(trendResponse.value, []));
      }
    } catch (error) {
      console.error(error);
      toast.error("Dashboard loaded with limited data");
    } finally {
      setLoading(false);
    }
  }

  const chartData = useMemo(() => {
    if (trend.length) {
      return trend.map((item, index) => ({
        name: String(item.date || item.month || item.label || `Day ${index + 1}`),
        submissions: Number(item.count || item.total || item.submissions || 0),
      }));
    }

    return [
      { name: "Pending", submissions: counts.pendingSubmissions || counts.pending || 0 },
      { name: "Approved", submissions: counts.approvedSubmissions || counts.approved || 0 },
      { name: "Rejected", submissions: counts.rejectedSubmissions || counts.rejected || 0 },
    ];
  }, [trend, counts]);

  const actions = {
    SUPER_ADMIN: [
      { title: "Create Tenant", href: "/tenants", icon: Building2 },
      { title: "Create Tenant Admin", href: "/tenants", icon: Users },
    ],
    TENANT_ADMIN: [
      { title: "Create Project", href: "/projects", icon: FolderKanban },
      { title: "Create Project Admin", href: "/projects", icon: Users },
    ],
    PROJECT_ADMIN: [
      { title: "Manage Forms", href: "/forms", icon: FileText },
      { title: "Create Accessor/QC", href: "/projects", icon: Users },
    ],
    ACCESSOR: [
      { title: "My Forms", href: "/my/forms", icon: FileText },
      { title: "Drafts", href: "/my/drafts", icon: ClipboardCheck },
    ],
    QUALITY_CHECKER: [
      { title: "Pending Reviews", href: "/submissions/pending", icon: ClipboardCheck },
      { title: "Notifications", href: "/notifications", icon: Bell },
    ],
  } as const;

  const quickActions = actions[normalizedRole as keyof typeof actions] || actions.TENANT_ADMIN;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace overview"
        title={`Welcome${user?.firstName ? `, ${user.firstName}` : ""}`}
        description={`You are working as ${roleLabel(role)}. Track your projects, submissions and review activity.`}
      >
        <RoleBadge role={normalizedRole} />
      </PageHeader>

      <div className="metrics-strip grid md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Projects" value={projects.length || counts.projects || 0} icon={<FolderKanban className="h-5 w-5" />} hint="Tenant / project workspace" />
        <MetricCard label="Forms" value={counts.forms || 0} icon={<FileText className="h-5 w-5" />} hint="Dynamic forms" />
        <MetricCard label="Pending" value={counts.pending || counts.pendingSubmissions || 0} icon={<ClipboardCheck className="h-5 w-5" />} hint="Awaiting review" />
        <MetricCard label="Approved" value={counts.approved || counts.approvedSubmissions || 0} icon={<CheckCircle2 className="h-5 w-5" />} hint="Accepted submissions" />
        <MetricCard label="Rejected" value={counts.rejected || counts.rejectedSubmissions || 0} icon={<ClipboardCheck className="h-5 w-5" />} hint="Needs correction" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Submission activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="submissions" fill="var(--primary)" maxBarSize={42} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <div className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-slate-50 dark:hover:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-teal-50 p-2 text-teal-600"><Icon className="h-4 w-4" /></div>
                      <div className="font-semibold">{action.title}</div>
                    </div>
                    <Button variant="outline" size="sm">Open</Button>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Recent projects</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-slate-500">Loading...</div>
          ) : projects.length ? (
            <div className="recent-project-list">
              {projects.slice(0, 6).map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="recent-project-row p-4 transition">
                    <p className="font-semibold">{project.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.description || "No description"}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-900">
              No projects available yet. Use the next step for your role to start the workflow.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
