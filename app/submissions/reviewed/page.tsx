"use client";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/State";

export default function ReviewedSubmissionsPage() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Quality Checker Flow" title="Reviewed Submissions" description="Reviewed queue can be connected once backend exposes approved/rejected list endpoint." />
      <Card className="rounded-xl"><CardContent><EmptyState title="Reviewed list not connected yet" description="Review actions are available on the submission review screen." /></CardContent></Card>
    </div>
  );
}
