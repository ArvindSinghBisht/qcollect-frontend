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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Form } from "@/types/form";
import { updateForm } from "@/services/form.service";
import { createDefaultSurveySchema, serializeSurveySchema } from "@/types/survey";

interface Props {

    form: Form;

    onSuccess?: () => void;

}

export default function EditFormDialog({

    form,

    onSuccess,

}: Props) {

    const [open, setOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const [name, setName] = useState(form.name);

    const [description, setDescription] = useState(
        form.description || ""
    );

    useEffect(() => {

        setName(form.name);

        setDescription(form.description || "");

    }, [form]);

    async function handleUpdate() {

        try {

            setLoading(true);

            await updateForm(form.id, {

                name,

                description,

                surveyJson: form.surveyJson || serializeSurveySchema(createDefaultSurveySchema(name, description)),

            });

            alert("Form Updated Successfully");

            setOpen(false);

            onSuccess?.();

        }

        catch (error) {

            console.error(error);

            alert("Unable to update form");

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
                <Button
                    size="sm"
                    variant="outline"
                >
                    Edit
                </Button>
            </DialogTrigger>

            <DialogContent>

                <DialogHeader>

                    <DialogTitle>

                        Edit Form

                    </DialogTitle>

                </DialogHeader>

                <div className="space-y-4">

                    <div>

                        <Label>

                            Name

                        </Label>

                        <Input
                            value={name}
                            onChange={(e)=>
                                setName(e.target.value)
                            }
                        />

                    </div>

                    <div>

                        <Label>

                            Description

                        </Label>

                        <Textarea
                            rows={4}
                            value={description}
                            onChange={(e)=>
                                setDescription(e.target.value)
                            }
                        />

                    </div>

                    <Button
                        className="w-full"
                        disabled={loading}
                        onClick={handleUpdate}
                    >

                        {

                            loading

                                ?

                                "Updating..."

                                :

                                "Update Form"

                        }

                    </Button>

                </div>

            </DialogContent>

        </Dialog>

    );

}