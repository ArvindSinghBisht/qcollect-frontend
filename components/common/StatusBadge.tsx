import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status?: string | boolean | null }) {
  const text = typeof status === "boolean" ? (status ? "ACTIVE" : "INACTIVE") : (status || "UNKNOWN");
  const value = text.toString().toUpperCase();
  const variant =
    value.includes("APPROVED") || value.includes("ACTIVE") || value.includes("SUBMITTED")
      ? "default"
      : value.includes("REJECT") || value.includes("INACTIVE")
        ? "destructive"
        : "secondary";

  return (
    <Badge variant={variant} className="h-6 rounded-full px-3 font-bold">
      {value.replaceAll("_", " ")}
    </Badge>
  );
}
