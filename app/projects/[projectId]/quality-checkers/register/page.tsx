"use client";

import { useParams } from "next/navigation";
import ProjectUserRegistrationForm from "@/components/registration/ProjectUserRegistrationForm";
import { PageHeader } from "@/components/common/PageHeader";

export default function QualityCheckerRegistrationPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Project Admin Flow"
        title="Quality Checker Registration"
        description="Create Quality Checker for the selected project. Uses POST /projects/{projectId}/quality-checkers."
      />
      <ProjectUserRegistrationForm type="QUALITY_CHECKER" defaultProjectId={projectId} />
    </div>
  );
}
