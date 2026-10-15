"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createQualityChecker } from "@/services/project.service";
import { getErrorMessage } from "@/lib/api-response";
import { emptyUserCreateForm, UserCreateFields, type UserCreateFormState } from "@/components/forms/UserCreateFields";

export default function CreateQualityCheckerDialog({ projectId, onSuccess }: { projectId: string; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UserCreateFormState>(emptyUserCreateForm);

  async function handleCreate() {
    if (!form.firstName || !form.email || !form.password) {
      toast.error("First name, email and password are required");
      return;
    }
    try {
      setLoading(true);
      await createQualityChecker(projectId, form);
      toast.success("Quality Checker created successfully");
      setForm(emptyUserCreateForm);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create quality checker"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" className="rounded-lg font-semibold"><BadgeCheck className="h-4 w-4" />Create QC</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Create Quality Checker</DialogTitle></DialogHeader>
        <UserCreateFields value={form} onChange={setForm} />
        <Button className="w-full rounded-lg font-semibold" disabled={loading} onClick={handleCreate}>{loading ? "Creating..." : "Create Quality Checker"}</Button>
      </DialogContent>
    </Dialog>
  );
}
