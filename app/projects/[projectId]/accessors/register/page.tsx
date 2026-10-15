"use client";

import { useParams } from "next/navigation";
import ProjectUserRegistrationForm from "@/components/registration/ProjectUserRegistrationForm";
import { PageHeader } from "@/components/common/PageHeader";

export default function AccessorRegistrationPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Project Admin Flow"
        title="Accessor Registration"
        description="Create Accessor for the selected project. Uses POST /projects/{projectId}/accessors."
      />
      <ProjectUserRegistrationForm type="ACCESSOR" defaultProjectId={projectId} />
    </div>
  );
}
