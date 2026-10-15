"use client";

import { FormField } from "@/types/formField";
import EditFieldDialog from "./EditFieldDialog";

// import EditFieldDialog from "./EditFieldDialog.tsx";

interface Props {
    field: FormField;
    onRefresh: () => void;
}

export default function FieldCard({
    field,
    onRefresh,
}: Props) {

    return (

        <div className="border rounded-lg p-4 flex justify-between items-center">

            <div>

                <h3 className="font-semibold">
                    {field.label}
                </h3>

                <p className="text-sm text-gray-500">
                    {field.fieldType}
                </p>

                <p className="text-xs text-muted-foreground">
                    Display Order : {field.fieldOrder}
                </p>

                {field.required && (
                    <span className="text-xs text-red-500">
                        Required
                    </span>
                )}

            </div>

            <div className="flex gap-2">

                <EditFieldDialog
                    field={field}
                    onSuccess={onRefresh}
                />

            </div>

        </div>

    );

}