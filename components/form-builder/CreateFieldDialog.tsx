"use client";

import { useState } from "react";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { createField } from "@/services/formField.service";
import { Checkbox } from "../ui/checkbox";

interface Props {

    formId: string;

    onSuccess: () => void;

}

export default function CreateFieldDialog({

    formId,
    onSuccess,

}: Props) {

    const [open, setOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const [field, setField] = useState({

        label: "",

        name: "",

        fieldType: "TEXT",

        displayOrder: 1,

        required: false,

        placeholder: "",

        defaultValue: "",

        options: "",

        validationJson: "",

    });

    async function handleCreate() {

        try {

            setLoading(true);

            await createField(
                formId,
                field
            );

            setOpen(false);

            onSuccess();

            setField({

                label: "",

                name: "",

                fieldType: "TEXT",

                displayOrder: 1,

                required: false,

                placeholder: "",

                defaultValue: "",

                options: "",

                validationJson: "",

            });

        }

        catch (e) {

            console.error(e);

        }

        finally {

            setLoading(false);

        }

    }

    return (

        <Dialog
            open={open}
            onOpenChange={setOpen}
        >

            <DialogTrigger>

                <Button>

                    Add Field

                </Button>

            </DialogTrigger>

            <DialogContent className="max-w-xl">

                <DialogHeader>

                    <DialogTitle>

                        Create Field

                    </DialogTitle>

                </DialogHeader>

                <div className="space-y-4">

                    <div>

                        <Label>Label</Label>

                        <Input
                            value={field.label}
                            onChange={(e)=>
                                setField({
                                    ...field,
                                    label:e.target.value,
                                })
                            }
                        />

                    </div>

                    <div>

                        <Label>Name</Label>

                        <Input
                            value={field.name}
                            onChange={(e)=>
                                setField({
                                    ...field,
                                    name:e.target.value,
                                })
                            }
                        />

                    </div>

                    <div>

                        <Label>Type</Label>

                        <Select
                            value={field.fieldType}
                            onValueChange={(value)=>
                                setField({
                                    ...field,
                                    fieldType: value ?? field.fieldType,
                                })
                            }
                        >

                            <SelectTrigger>

                                <SelectValue/>

                            </SelectTrigger>

                            <SelectContent>

                                <SelectItem value="TEXT">
                                    Text
                                </SelectItem>

                                <SelectItem value="NUMBER">
                                    Number
                                </SelectItem>

                                <SelectItem value="TEXTAREA">
                                    Textarea
                                </SelectItem>

                                <SelectItem value="EMAIL">
                                    Email
                                </SelectItem>

                                <SelectItem value="PHONE">
                                    Phone
                                </SelectItem>

                                <SelectItem value="DATE">
                                    Date
                                </SelectItem>

                                <SelectItem value="RADIO">
                                    Radio
                                </SelectItem>

                                <SelectItem value="CHECKBOX">
                                    Checkbox
                                </SelectItem>

                                <SelectItem value="DROPDOWN">
                                    Dropdown
                                </SelectItem>

                            </SelectContent>

                        </Select>

                    </div>

                    <div>

                        <Label>Placeholder</Label>

                        <Input
                            value={field.placeholder}
                            onChange={(e)=>
                                setField({
                                    ...field,
                                    placeholder:e.target.value,
                                })
                            }
                        />

                    </div>

                    <div>

                        <Label>Display Order</Label>

                        <Input
                            type="number"
                            value={field.displayOrder}
                            onChange={(e)=>
                                setField({
                                    ...field,
                                    displayOrder:Number(e.target.value),
                                })
                            }
                        />

                    </div>

                    <div>

                        <Label>Options</Label>

                        <Input
                            placeholder="Male,Female"
                            value={field.options}
                            onChange={(e)=>
                                setField({
                                    ...field,
                                    options:e.target.value,
                                })
                            }
                        />

                    </div>

                    <div className="flex items-center gap-2">

                        <Checkbox
                            checked={field.required}
                            onCheckedChange={(checked)=>
                                setField({
                                    ...field,
                                    required:checked===true,
                                })
                            }
                        />

                        <Label>

                            Required

                        </Label>

                    </div>

                    <Button
                        className="w-full"
                        disabled={loading}
                        onClick={handleCreate}
                    >

                        {

                            loading

                                ? "Creating..."

                                : "Create Field"

                        }

                    </Button>

                </div>

            </DialogContent>

        </Dialog>

    );

}