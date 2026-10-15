"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createForm } from "@/services/form.service";
import { getErrorMessage } from "@/lib/api-response";

type CreateFormDialogProps = {
  projectId: string;
  onSuccess?: () => void;
};

function createDefaultSurveyJson(
  name: string,
  description: string
): string {
  return JSON.stringify({
    title: name,
    description: description || "",
    showProgressBar: "top",
    progressBarType: "pages",
    pages: [
      {
        name: "page1",
        title: "Section 1",
        elements: [],
      },
    ],
  });
}

export default function CreateFormDialog({
  projectId,
  onSuccess,
}: CreateFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  async function handleCreate() {
    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      toast.error("Form name is required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name,
        description,
        surveyJson: createDefaultSurveyJson(name, description),
      };

      await createForm(projectId, payload);

      toast.success("Form created successfully");
      setOpen(false);
      setForm({
        name: "",
        description: "",
      });
      onSuccess?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create form"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="rounded-lg font-semibold">
          <Plus className="h-4 w-4" />
          Create Form
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Form</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <label className="space-y-2">
            <Label>Form Name</Label>
            <Input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </label>

          <label className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </label>

          <Button
            className="w-full rounded-lg font-semibold"
            disabled={loading}
            onClick={handleCreate}
          >
            {loading ? "Creating..." : "Create Form"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
