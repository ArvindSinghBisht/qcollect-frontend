"use client";

import { ArrowUp, ArrowDown } from "lucide-react";

import { Button } from "@/components/ui/button";

import { FormField } from "@/types/formField";

interface Props {
    fields: FormField[];
    onMoveUp: (index: number) => void;
    onMoveDown: (index: number) => void;
    onEdit: (field: FormField) => void;
    onDelete: (field: FormField) => void;
}

export default function FieldList({
    fields,
    onMoveUp,
    onMoveDown,
    onEdit,
    onDelete,
}: Props) {
    return (
        <div className="space-y-3">

            {fields.map((field, index) => (

                <div
                    key={field.id}
                    className="border rounded-lg p-4 flex justify-between items-center"
                >
                    <div>

                        <h3 className="font-semibold">
                            {field.label}
                        </h3>

                        <p className="text-sm text-gray-500">
                            {field.fieldType}
                        </p>

                    </div>

                    <div className="flex gap-2">

                        <Button
                            size="icon"
                            variant="outline"
                            disabled={index === 0}
                            onClick={() => onMoveUp(index)}
                        >
                            <ArrowUp className="h-4 w-4" />
                        </Button>

                        <Button
                            size="icon"
                            variant="outline"
                            disabled={index === fields.length - 1}
                            onClick={() => onMoveDown(index)}
                        >
                            <ArrowDown className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() => onEdit(field)}
                        >
                            Edit
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={() => onDelete(field)}
                        >
                            Delete
                        </Button>

                    </div>

                </div>

            ))}

        </div>
    );
}