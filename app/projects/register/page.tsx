import ProjectRegistrationForm from "@/components/registration/ProjectRegistrationForm";
import { PageHeader } from "@/components/common/PageHeader";

export default function ProjectRegistrationPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tenant Admin Flow"
        title="Project Registration"
        description="Create a project using the logged-in Tenant Admin token. Then register a Project Admin for that project."
      />
      <ProjectRegistrationForm />
    </div>
  );
}
