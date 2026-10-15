"use client";

import { FormField } from "@/types/formField";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import EditFieldDialog from "./EditFieldDialog";
import DeleteFieldDialog from "./DeleteFieldDialog";

interface Props {
    fields: FormField[];
    onRefresh: () => void;
}

export default function FieldTable({
    fields,
    onRefresh,
}: Props) {

    if (fields.length === 0) {

        return (
            <div className="border rounded-lg p-10 text-center text-muted-foreground">
                No fields added yet.
            </div>
        );

    }

    return (

        <Table>

            <TableHeader>

                <TableRow>

                    <TableHead>Order</TableHead>

                    <TableHead>Label</TableHead>

                    <TableHead>Type</TableHead>

                    <TableHead>Required</TableHead>

                    <TableHead>Placeholder</TableHead>

                    <TableHead>Actions</TableHead>

                </TableRow>

            </TableHeader>

            <TableBody>

                {fields.map((field) => (

                    <TableRow key={field.id}>

                        <TableCell>
                            {field.fieldOrder}
                        </TableCell>

                        <TableCell>
                            {field.label}
                        </TableCell>

                        <TableCell>
                            {field.fieldType}
                        </TableCell>

                        <TableCell>
                            {field.required ? "Yes" : "No"}
                        </TableCell>

                        <TableCell>
                            {field.placeholder || "-"}
                        </TableCell>

                        <TableCell>

                            <div className="flex gap-2">

                                <EditFieldDialog
                                    field={field}
                                    onSuccess={onRefresh}
                                />

                                <DeleteFieldDialog
                                    fieldId={field.id}
                                    onSuccess={onRefresh}
                                />

                            </div>

                        </TableCell>

                    </TableRow>

                ))}

            </TableBody>

        </Table>

    );

}