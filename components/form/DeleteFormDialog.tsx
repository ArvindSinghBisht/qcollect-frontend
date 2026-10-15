"use client";

import { useState } from "react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "../ui/button";

import { deleteForm } from "@/services/form.service";

interface Props {

    formId: string;

    formName: string;

    onSuccess?: () => void;

}

export default function DeleteFormDialog({

    formId,

    formName,

    onSuccess,

}: Props) {

    const [loading, setLoading] = useState(false);

    async function handleDelete() {

        try {

            setLoading(true);

            await deleteForm(formId);

            alert("Form deleted successfully");

            onSuccess?.();

        }

        catch (error) {

            console.error(error);

            alert("Failed to delete form");

        }

        finally {

            setLoading(false);

        }

    }

    return (

        <AlertDialog>

            <AlertDialogTrigger>

                <Button
                    size="sm"
                    variant="destructive"
                >
                    Delete
                </Button>

            </AlertDialogTrigger>

            <AlertDialogContent>

                <AlertDialogHeader>

                    <AlertDialogTitle>

                        Delete Form

                    </AlertDialogTitle>

                    <AlertDialogDescription>

                        Are you sure you want to delete
                        <strong> {formName}</strong>?

                        <br />

                        This action cannot be undone.

                    </AlertDialogDescription>

                </AlertDialogHeader>

                <AlertDialogFooter>

                    <AlertDialogCancel>

                        Cancel

                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                    >

                        {loading
                            ? "Deleting..."
                            : "Delete"}

                    </AlertDialogAction>

                </AlertDialogFooter>

            </AlertDialogContent>

        </AlertDialog>

    );

}