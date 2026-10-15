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

import { Button } from "@/components/ui/button";

import { deleteField } from "@/services/formField.service";

interface Props {
    fieldId: string;
    onSuccess: () => void;
}

export default function DeleteFieldDialog({
    fieldId,
    onSuccess,
}: Props) {

    const [loading, setLoading] = useState(false);

    async function handleDelete() {

        try {

            setLoading(true);

            await deleteField(fieldId);

            onSuccess();

        }

        catch (error) {

            console.error(error);

            alert("Failed to delete field");

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

                        Delete Field?

                    </AlertDialogTitle>

                    <AlertDialogDescription>

                        This action cannot be undone.

                    </AlertDialogDescription>

                </AlertDialogHeader>

                <AlertDialogFooter>

                    <AlertDialogCancel>

                        Cancel

                    </AlertDialogCancel>

                    <AlertDialogAction
                        disabled={loading}
                        onClick={handleDelete}
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