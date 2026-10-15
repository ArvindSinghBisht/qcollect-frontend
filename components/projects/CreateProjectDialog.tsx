"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/services/project.service";
import { getErrorMessage } from "@/lib/api-response";

interface Props {
  onSuccess?: () => void;
}

export default function CreateProjectDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  async function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      setLoading(true);
      await createProject({
        name: form.name.trim(),
        description: form.description.trim(),
      });
      toast.success("Project created successfully");
      setOpen(false);
      setForm({ name: "", description: "" });
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create project"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="rounded-lg font-semibold">
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <label className="space-y-2">
            <Label>Project Name</Label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Inspection Project" />
          </label>
          <label className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Short description" />
          </label>
          <Button className="w-full rounded-lg font-semibold" disabled={loading} onClick={handleSubmit}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
