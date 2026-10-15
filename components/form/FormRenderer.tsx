"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { FormField } from "@/types/formField";

interface Props {

    fields: FormField[];

    values: Record<string, string>;

    onChange: (
        fieldId: string,
        value: string
    ) => void;

}

export default function FormRenderer({

    fields,
    values,
    onChange,

}: Props) {

    function renderField(field: FormField) {

        const value = values[field.id] || "";

        switch (field.fieldType) {

            case "TEXT":

                return (
                    <Input
                        value={value}
                        placeholder={field.placeholder ?? ""}
                        onChange={(e) =>
                            onChange(
                                field.id,
                                e.target.value
                            )
                        }
                    />
                );

            case "NUMBER":

                return (
                    <Input
                        type="number"
                        value={value}
                        placeholder={field.placeholder ?? ""}
                        onChange={(e) =>
                            onChange(
                                field.id,
                                e.target.value
                            )
                        }
                    />
                );

            case "EMAIL":

                return (
                    <Input
                        type="email"
                        value={value}
                        placeholder={field.placeholder ?? ""}
                        onChange={(e) =>
                            onChange(
                                field.id,
                                e.target.value
                            )
                        }
                    />
                );

            case "PHONE":

                return (
                    <Input
                        type="tel"
                        value={value}
                        placeholder={field.placeholder ?? ""}
                        onChange={(e) =>
                            onChange(
                                field.id,
                                e.target.value
                            )
                        }
                    />
                );

            case "DATE":

                return (
                    <Input
                        type="date"
                        value={value}
                        onChange={(e) =>
                            onChange(
                                field.id,
                                e.target.value
                            )
                        }
                    />
                );

            case "TEXTAREA":

                return (
                    <Textarea
                        rows={4}
                        value={value}
                        placeholder={field.placeholder ?? ""}
                        onChange={(e) =>
                            onChange(
                                field.id,
                                e.target.value
                            )
                        }
                    />
                );

            case "CHECKBOX":

                return (
                    <Checkbox
                        checked={value === "true"}
                        onCheckedChange={(checked) =>
                            onChange(
                                field.id,
                                checked ? "true" : "false"
                            )
                        }
                    />
                );

            case "DROPDOWN":

                return (

                    <Select
                        value={value}
                        onValueChange={(v) =>
                            onChange(
                                field.id,
                                v ?? ""
                            )
                        }
                    >

                        <SelectTrigger>

                            <SelectValue
                                placeholder="Select"
                            />

                        </SelectTrigger>

                        <SelectContent>

                            {(field.options ?? "")
                                .split(",")
                                .filter(Boolean)
                                .map((option) => (

                                    <SelectItem
                                        key={option.trim()}
                                        value={option.trim()}
                                    >
                                        {option.trim()}
                                    </SelectItem>

                                ))}

                        </SelectContent>

                    </Select>

                );

            case "RADIO":

                return (

                    <div className="space-y-2">

                        {(field.options ?? "")
                            .split(",")
                            .filter(Boolean)
                            .map((option) => (

                                <label
                                    key={option.trim()}
                                    className="flex items-center gap-2"
                                >

                                    <input
                                        type="radio"
                                        name={field.id}
                                        value={option.trim()}
                                        checked={
                                            value === option.trim()
                                        }
                                        onChange={(e) =>
                                            onChange(
                                                field.id,
                                                e.target.value
                                            )
                                        }
                                    />

                                    {option.trim()}

                                </label>

                            ))}

                    </div>

                );

            default:

                return (
                    <Input
                        value={value}
                        placeholder={field.placeholder ?? ""}
                        onChange={(e) =>
                            onChange(
                                field.id,
                                e.target.value
                            )
                        }
                    />
                );

        }

    }

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