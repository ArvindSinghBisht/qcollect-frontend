"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/State";

export default function MyDraftsPage() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Accessor Flow" title="Drafts" description="Saved draft submissions will appear here once the backend exposes a draft list endpoint." />
      <Card className="rounded-xl"><CardContent><EmptyState title="No drafts listed" description="Draft save is supported from the form fill page. A list API can be connected here when available."><Link href="/my/forms"><Button>Open My Forms</Button></Link></EmptyState></CardContent></Card>
    </div>
  );
}
