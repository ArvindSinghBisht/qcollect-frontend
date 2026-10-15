"use client";

import { useEffect, useState } from "react";

import {
    getSubmissionAnswers,
    reviewAnswer,
} from "@/services/submission.service";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";

interface SubmissionAnswer {

    id: string;

    fieldId: string;

    fieldName: string;

    fieldType: string;

    value: string;

}

interface Props {

    submissionId: string;

}

export default function SubmissionAnswerTable({

    submissionId,

}: Props) {

    const [answers, setAnswers] = useState<SubmissionAnswer[]>([]);

    const [loading, setLoading] = useState(true);

    const [review, setReview] = useState<
        Record<
            string,
            {
                status: string;
                remarks: string;
            }
        >
    >({});

    useEffect(() => {

        loadAnswers();

    }, [submissionId]);

    async function loadAnswers() {

        try {

            const response =
                await getSubmissionAnswers(
                    submissionId
                );

            setAnswers(response.data);

        }

        catch (e) {

            console.error(e);

        }

        finally {

            setLoading(false);

        }

    }

    async function handleReview(
        answerId: string
    ) {

        try {

            await reviewAnswer(
                answerId,
                review[answerId]
            );

            alert("Answer reviewed successfully");

        }

        catch (e) {

            console.error(e);

            alert("Failed to review answer");

        }

    }

    if (loading) {

        return <p>Loading Answers...</p>;

    }

    if (answers.length === 0) {

        return (

            <p className="text-muted-foreground">

                No Answers Found.

            </p>

        );

    }

    return (

        <Table>

            <TableHeader>

                <TableRow>

                    <TableHead>

                        Field

                    </TableHead>

                    <TableHead>

                        Value

                    </TableHead>

                    <TableHead>

                        Status

                    </TableHead>

                    <TableHead>

                        Remarks

                    </TableHead>

                    <TableHead>

                    </TableHead>

                </TableRow>

            </TableHeader>

            <TableBody>

                {

                    answers.map((answer) => (

                        <TableRow
                            key={answer.id}
                        >

                            <TableCell>

                                {answer.fieldName}

                            </TableCell>

                            <TableCell>

                                {answer.value}

                            </TableCell>

                            <TableCell>

                                <Select

                                    value={
                                        review[
                                            answer.id
                                        ]?.status ??
                                        ""
                                    }

                                    onValueChange={(value) =>

                                        setReview({

                                            ...review,

                                            [answer.id]: {

                                                status: value ?? "",

                                                remarks:
                                                    review[
                                                        answer.id
                                                    ]?.remarks ??
                                                    "",

                                            },

                                        })

                                    }

                                >

                                    <SelectTrigger>

                                        <SelectValue
                                            placeholder="Status"
                                        />

                                    </SelectTrigger>

                                    <SelectContent>

                                        <SelectItem
                                            value="APPROVED"
                                        >

                                            APPROVED

                                        </SelectItem>

                                        <SelectItem
                                            value="REJECTED"
                                        >

                                            REJECTED

                                        </SelectItem>

                                    </SelectContent>

                                </Select>

                            </TableCell>

                            <TableCell>

                                <Textarea

                                    value={
                                        review[
                                            answer.id
                                        ]?.remarks ??
                                        ""
                                    }

                                    onChange={(e) =>

                                        setReview({

                                            ...review,

                                            [answer.id]: {

                                                status:
                                                    review[
                                                        answer.id
                                                    ]?.status ??
                                                    "",

                                                remarks:
                                                    e.target.value,

                                            },

                                        })

                                    }

                                />

                            </TableCell>

                            <TableCell>

                                <Button

                                    onClick={() =>

                                        handleReview(
                                            answer.id
                                        )

                                    }

                                >

                                    Save

                                </Button>

                            </TableCell>

                        </TableRow>

                    ))

                }

            </TableBody>

        </Table>

    );

}