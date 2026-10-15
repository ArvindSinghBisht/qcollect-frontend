import { Badge } from "@/components/ui/badge";
import { normalizeRole, roleLabel } from "@/lib/flow";

type RoleBadgeProps = {
  role?: string | null;
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const normalizedRole = normalizeRole(role);

  const className =
    normalizedRole === "SUPER_ADMIN"
      ? "border-slate-300 bg-slate-100 text-slate-800"
      : normalizedRole === "TENANT_ADMIN"
      ? "border-blue-300 bg-blue-50 text-blue-700"
      : normalizedRole === "PROJECT_ADMIN"
      ? "border-violet-300 bg-violet-50 text-violet-700"
      : normalizedRole === "ACCESSOR"
      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
      : normalizedRole === "QUALITY_CHECKER"
      ? "border-orange-300 bg-orange-50 text-orange-700"
      : "border-slate-300 bg-slate-50 text-slate-600";

  return (
    <Badge variant="outline" className={className}>
      {roleLabel(normalizedRole)}
    </Badge>
  );
}

export default RoleBadge;