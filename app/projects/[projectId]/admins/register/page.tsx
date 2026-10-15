"use client";

import { useParams } from "next/navigation";
import ProjectUserRegistrationForm from "@/components/registration/ProjectUserRegistrationForm";
import { PageHeader } from "@/components/common/PageHeader";

export default function ProjectAdminRegistrationPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tenant Admin Flow"
        title="Project Admin Registration"
        description="Create Project Admin for the selected project. Uses POST /projects/{projectId}/admins."
      />
      <ProjectUserRegistrationForm type="PROJECT_ADMIN" defaultProjectId={projectId} />
    </div>
  );
}
