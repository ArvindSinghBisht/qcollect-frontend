"use client";

import Link from "next/link";
import { Project } from "@/types/project";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Props {
    projects: Project[];
}

export default function ProjectTable({ projects }: Props) {

    if (projects.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/20">
                <div className="text-center">
                    <h3 className="text-lg font-semibold">
                        No Projects Found
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                        Create your first project to get started.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">
                        Action
                    </TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {projects.map((project) => (
                    <TableRow key={project.id}>
                        <TableCell className="font-medium">
                            {project.name}
                        </TableCell>

                        <TableCell>
                            {project.description || "-"}
                        </TableCell>

                        <TableCell>
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    project.active
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {project.active ? "Active" : "Inactive"}
                            </span>
                        </TableCell>

                        <TableCell className="text-right">
                            <Link
                                href={`/projects/${project.id}`}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                View
                            </Link>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}