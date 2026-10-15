"use client";

import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { FormField } from "@/types/formField";
import { updateField } from "@/services/formField.service";

interface Props {
    field: FormField;
    onSuccess: () => void;
}

export default function EditFieldDialog({
    field,
    onSuccess,
}: Props) {

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

const [form, setForm] = useState<{
    label: string;
    name: string;
    fieldType: string;
    displayOrder: number;
    required: boolean;
    placeholder: string;
    defaultValue: string;
    options: string;
    validationJson: string;
}>({
    label: field.label ?? "",
    name: "",
    fieldType: field.fieldType ?? "",
    displayOrder: field.fieldOrder ?? 1,
    required: field.required ?? false,
    placeholder: field.placeholder ?? "",
    defaultValue: field.defaultValue ?? "",
    options: field.options ?? "",
    validationJson: field.validationJson ?? "",
});

    useEffect(() => {
        if (open) {
      setForm({
    label: field.label ?? "",
    name: "",
    fieldType: field.fieldType ?? "",
    displayOrder: field.fieldOrder ?? 1,
    required: field.required ?? false,
    placeholder: field.placeholder ?? "",
    defaultValue: field.defaultValue ?? "",
    options: field.options ?? "",
    validationJson: field.validationJson ?? "",
});
        }
    }, [open, field]);

    async function handleUpdate() {
        try {
            setLoading(true);

            await updateField(field.id!, form);

            setOpen(false);
            onSuccess();
        } catch (e) {
            console.error(e);
            alert("Failed to update field");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>

            <DialogTrigger>
                <Button size="sm" variant="outline">
                    Edit
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-xl">

                <DialogHeader>
                    <DialogTitle>Edit Field</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">

                    <div>
                        <Label>Label</Label>
                        <Input
                            value={form.label}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    label: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div>
                        <Label>Type</Label>

                <Select
    value={form.fieldType || ""}
    onValueChange={(value) =>
        setForm({
            ...form,
            fieldType: value ?? "",
        })
    }
>
                        
                            <SelectTrigger>
                                <SelectValue placeholder="Select Field Type" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="TEXT">Text</SelectItem>
                                <SelectItem value="NUMBER">Number</SelectItem>
                                <SelectItem value="TEXTAREA">Textarea</SelectItem>
                                <SelectItem value="EMAIL">Email</SelectItem>
                                <SelectItem value="PHONE">Phone</SelectItem>
                                <SelectItem value="DATE">Date</SelectItem>
                                <SelectItem value="RADIO">Radio</SelectItem>
                                <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                                <SelectItem value="DROPDOWN">Dropdown</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Placeholder</Label>
                        <Input
                            value={form.placeholder}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    placeholder: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div>
                        <Label>Display Order</Label>
                        <Input
                            type="number"
                            value={form.displayOrder}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    displayOrder: Number(e.target.value),
                                })
                            }
                        />
                    </div>

                    <div>
                        <Label>Options</Label>
                        <Input
                            value={form.options}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    options: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={form.required}
                            onCheckedChange={(checked) =>
                                setForm({
                                    ...form,
                                    required: checked === true,
                                })
                            }
                        />
                        <Label>Required</Label>
                    </div>

                    <Button
                        className="w-full"
                        disabled={loading}
                        onClick={handleUpdate}
                    >
                        {loading ? "Updating..." : "Update Field"}
                    </Button>

                </div>

            </DialogContent>

        </Dialog>
    );
}