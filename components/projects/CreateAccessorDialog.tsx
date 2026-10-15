"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createAccessor } from "@/services/project.service";
import { getErrorMessage } from "@/lib/api-response";
import { emptyUserCreateForm, UserCreateFields, type UserCreateFormState } from "@/components/forms/UserCreateFields";

export default function CreateAccessorDialog({ projectId, onSuccess }: { projectId: string; onSuccess?: () => void }) {
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
      await createAccessor(projectId, form);
      toast.success("Accessor created successfully");
      setForm(emptyUserCreateForm);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create accessor"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" className="rounded-lg font-semibold"><UserPlus className="h-4 w-4" />Create Accessor</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Create Accessor</DialogTitle></DialogHeader>
        <UserCreateFields value={form} onChange={setForm} />
        <Button className="w-full rounded-lg font-semibold" disabled={loading} onClick={handleCreate}>{loading ? "Creating..." : "Create Accessor"}</Button>
      </DialogContent>
    </Dialog>
  );
}
