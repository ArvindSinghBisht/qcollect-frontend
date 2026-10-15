"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, RefreshCw, UserCheck, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getErrorMessage, unwrapApiData } from "@/lib/api-response";
import { assignForm, getFormAssignments, removeFormAssignment } from "@/services/form.service";
import { getMembers } from "@/services/project.service";
import type { Form, FormAssignment } from "@/types/form";
import type { ProjectMember } from "@/types/project";

type Props = {
  projectId: string;
  form: Form;
};

function normalizeRole(role?: string) {
  return role?.trim().toUpperCase().replaceAll(" ", "_") || "";
}

function memberUserId(member: ProjectMember) {
  return member.userId || member.id;
}

function memberName(member: ProjectMember) {
  const fullName = `${member.firstName || ""} ${member.lastName || ""}`.trim();
  return member.userName || member.name || fullName || member.email || memberUserId(member);
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AssignFormDialog({ projectId, form }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingAssignmentId, setRemovingAssignmentId] = useState<string | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [assignments, setAssignments] = useState<FormAssignment[]>([]);
  const [accessorId, setAccessorId] = useState("");
  const [qualityCheckerId, setQualityCheckerId] = useState("");

  const accessors = useMemo(
    () => members.filter((member) => normalizeRole(member.role) === "ACCESSOR"),
    [members]
  );

  const qualityCheckers = useMemo(
    () => members.filter((member) => normalizeRole(member.role) === "QUALITY_CHECKER"),
    [members]
  );

  useEffect(() => {
    if (open) {
      void loadAssignmentData();
    }
  }, [open, form.id, projectId]);

  async function loadAssignmentData() {
    try {
      setLoading(true);
      const [memberResponse, assignmentResponse] = await Promise.all([
        getMembers(projectId),
        getFormAssignments(form.id, projectId),
      ]);

      setMembers(unwrapApiData<ProjectMember[]>(memberResponse, []));
      setAssignments(unwrapApiData<FormAssignment[]>(assignmentResponse, []));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load assignment data"));
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!accessorId || !qualityCheckerId) {
      toast.error("Select both an Accessor and a Quality Checker");
      return;
    }

    const accessorAlreadyAssigned = assignments.some(
      (assignment) =>
        assignment.active !== false && assignment.accessorId === accessorId
    );

    if (accessorAlreadyAssigned) {
      toast.error("This Accessor is already assigned to this form");
      return;
    }

    try {
      setSaving(true);
      await assignForm(form.id, projectId, {
        accessorId,
        qualityCheckerId,
      });
      toast.success("Form assigned successfully");
      setAccessorId("");
      setQualityCheckerId("");
      await loadAssignmentData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to assign form"));
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveAssignment(assignment: FormAssignment) {
    const accessorLabel = assignment.accessorName || "this Accessor";
    const confirmed = window.confirm(
      `De-assign ${accessorLabel} from “${form.name}”?`
    );

    if (!confirmed) return;

    try {
      setRemovingAssignmentId(assignment.assignmentId);
      await removeFormAssignment(assignment.assignmentId, projectId);
      toast.success("Accessor de-assigned from form successfully");
      await loadAssignmentData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to de-assign Accessor"));
    } finally {
      setRemovingAssignmentId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" variant="outline" className="rounded-xl">
          <UserCheck className="h-4 w-4" /> Assign Team
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Assign “{form.name}”</DialogTitle>
          <DialogDescription>
            Select an Accessor who will fill this form and the Quality Checker who will review that Accessor&apos;s submissions.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex min-h-40 items-center justify-center text-sm font-semibold text-slate-500">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading members and assignments...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 rounded-lg border bg-slate-50 p-4 md:grid-cols-2 dark:bg-slate-950">
              <div className="space-y-2">
                <label htmlFor={`accessor-${form.id}`} className="text-sm font-semibold">
                  Accessor
                </label>
                <select
                  id={`accessor-${form.id}`}
                  value={accessorId}
                  onChange={(event) => setAccessorId(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="">Select Accessor</option>
                  {accessors.map((member) => (
                    <option key={member.id} value={memberUserId(member)}>
                      {memberName(member)}{member.email ? ` — ${member.email}` : ""}
                    </option>
                  ))}
                </select>
                {!accessors.length ? (
                  <p className="text-xs text-amber-700">
                    No Accessor exists in this project.{" "}
                    <Link className="font-semibold underline" href={`/projects/${projectId}/accessors/register`}>
                      Create Accessor
                    </Link>
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor={`qc-${form.id}`} className="text-sm font-semibold">
                  Quality Checker
                </label>
                <select
                  id={`qc-${form.id}`}
                  value={qualityCheckerId}
                  onChange={(event) => setQualityCheckerId(event.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-slate-900"
                >
                  <option value="">Select Quality Checker</option>
                  {qualityCheckers.map((member) => (
                    <option key={member.id} value={memberUserId(member)}>
                      {memberName(member)}{member.email ? ` — ${member.email}` : ""}
                    </option>
                  ))}
                </select>
                {!qualityCheckers.length ? (
                  <p className="text-xs text-amber-700">
                    No Quality Checker exists in this project.{" "}
                    <Link className="font-semibold underline" href={`/projects/${projectId}/quality-checkers/register`}>
                      Create Quality Checker
                    </Link>
                  </p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <Button
                  className="w-full rounded-xl font-semibold"
                  disabled={saving || !accessorId || !qualityCheckerId}
                  onClick={handleAssign}
                >
                  <ClipboardCheck className="h-4 w-4" />
                  {saving ? "Assigning..." : "Assign Form"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Existing assignments</h3>
                  <p className="text-xs text-slate-500">
                    The same form may be assigned to multiple Accessors with separate Quality Checkers.
                  </p>
                </div>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={loadAssignmentData}>
                  <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
              </div>

              {assignments.length ? (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900">
                      <tr>
                        <th className="p-3">Accessor</th>
                        <th className="p-3">Quality Checker</th>
                        <th className="p-3">Assigned By</th>
                        <th className="p-3">Assigned At</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {assignments.map((assignment) => (
                        <tr key={assignment.assignmentId} className="bg-white dark:bg-slate-950">
                          <td className="p-3 font-bold">{assignment.accessorName || assignment.accessorId}</td>
                          <td className="p-3 font-bold">{assignment.qualityCheckerName || assignment.qualityCheckerId}</td>
                          <td className="p-3 text-slate-500">{assignment.assignedByName || "-"}</td>
                          <td className="p-3 text-slate-500">{formatDate(assignment.assignedAt)}</td>
                          <td className="p-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                assignment.active === false
                                  ? "bg-slate-100 text-slate-500"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {assignment.active === false ? "Inactive" : "Active"}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {assignment.active === false ? (
                              <span className="text-xs font-bold text-slate-400">De-assigned</span>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                                disabled={removingAssignmentId === assignment.assignmentId}
                                onClick={() => void handleRemoveAssignment(assignment)}
                              >
                                <UserMinus className="h-4 w-4" />
                                {removingAssignmentId === assignment.assignmentId
                                  ? "Removing..."
                                  : "De-assign"}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-slate-500">
                  No team has been assigned to this form yet.
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
