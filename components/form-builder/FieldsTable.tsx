"use client";

import { FormField } from "@/types/formField";

import {
    Table,
    TableHeader,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import EditFieldDialog from "./EditFieldDialog";

interface Props {

    fields: FormField[];

}

export default function FieldsTable({

    fields,

}: Props) {

    return (

        <Table>

            <TableHeader>

                <TableRow>

                    <TableHead>Label</TableHead>

                    <TableHead>Type</TableHead>

                    <TableHead>Required</TableHead>

                    <TableHead>Order</TableHead>

                    <TableHead className="text-right">

                        Action

                    </TableHead>

                </TableRow>

            </TableHeader>

            <TableBody>

                {

                    fields.map((field) => (

                        <TableRow
                            key={field.id}
                        >

                            <TableCell>

                                {field.label}

                            </TableCell>

                            <TableCell>

                                {field.fieldType}

                            </TableCell>

                            <TableCell>

                                {

                                    field.required

                                        ? "Yes"

                                        : "No"

                                }

                            </TableCell>

                            <TableCell>

                                {field.fieldOrder}

                            </TableCell>

                            <TableCell className="text-right space-x-2">

                                <EditFieldDialog
    field={field}
    onSuccess={() => window.location.reload()}
/>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                >
                                    Delete
                                </Button>

                            </TableCell>

                        </TableRow>

                    ))

                }

            </TableBody>

        </Table>

    );

}