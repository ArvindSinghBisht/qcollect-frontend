"use client";

import { FormField } from "@/types/formField";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
    fields: FormField[];
}

export default function FormPreview({
    fields,
}: Props) {

    return (

        <div className="space-y-6">

            {fields.map((field) => (

                <div
                    key={field.id}
                    className="space-y-2"
                >

                    <Label>

                        {field.label}

                        {field.required && (
                            <span className="text-red-500 ml-1">
                                *
                            </span>
                        )}

                    </Label>

                    {renderField(field)}

                </div>

            ))}

        </div>

    );

}

function renderField(
    field: FormField
) {

    switch (field.fieldType) {

        case "TEXT":

            return (
                <Input
                    placeholder={
                        field.placeholder ?? ""
                    }
                    disabled
                />
            );

        case "NUMBER":

            return (
                <Input
                    type="number"
                    placeholder={
                        field.placeholder ?? ""
                    }
                    disabled
                />
            );

        case "EMAIL":

            return (
                <Input
                    type="email"
                    placeholder={
                        field.placeholder ?? ""
                    }
                    disabled
                />
            );

        case "PHONE":

            return (
                <Input
                    placeholder={
                        field.placeholder ?? ""
                    }
                    disabled
                />
            );

        case "DATE":

            return (
                <Input
                    type="date"
                    disabled
                />
            );

        case "TEXTAREA":

            return (
                <Textarea
                    placeholder={
                        field.placeholder ?? ""
                    }
                    disabled
                />
            );

        case "CHECKBOX":

            return (
                <div className="flex items-center gap-2">

                    <Checkbox disabled />

                    <span>
                        {field.label}
                    </span>

                </div>
            );

        case "RADIO":

            return (

                <div className="space-y-2">

                    {(field.options ?? "")
                        .split(",")
                        .map((option) => (

                            <label
                                key={option}
                                className="flex items-center gap-2"
                            >

                                <input
                                    type="radio"
                                    disabled
                                />

                                {option.trim()}

                            </label>

                        ))}

                </div>

            );

        case "DROPDOWN":

            return (

                <select
                    disabled
                    className="border rounded-md px-3 py-2 w-full"
                >

                    <option>

                        Select...

                    </option>

                    {(field.options ?? "")
                        .split(",")
                        .map((option) => (

                            <option
                                key={option}
                            >

                                {option.trim()}

                            </option>

                        ))}

                </select>

            );

        default:

            return (
                <Input
                    disabled
                />
            );

    }

}