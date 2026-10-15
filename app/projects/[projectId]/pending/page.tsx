import { redirect } from "next/navigation";

export default async function ProjectPendingRedirectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/submissions/pending/${projectId}`);
}
