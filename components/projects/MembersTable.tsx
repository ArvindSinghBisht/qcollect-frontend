"use client";

import {

    Table,

    TableBody,

    TableCell,

    TableHead,

    TableHeader,

    TableRow,

} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import { removeMember } from "@/services/project.service";

interface Props{

    members:any[];

    projectId:string;

    refresh:()=>void;

}

export default function MembersTable({

    members,

    projectId,

    refresh,

}:Props){

    async function deleteMember(memberId:string){

        if(!confirm("Remove this member?")){

            return;

        }

        try{

            await removeMember(

                projectId,

                memberId

            );

            refresh();

        }

        catch(error){

            console.error(error);

        }

    }

    if(members.length===0){

        return(

            <div className="text-center py-20">

                No Members Found

            </div>

        );

    }

    return(

        <Table>

            <TableHeader>

                <TableRow>

                    <TableHead>Name</TableHead>

                    <TableHead>Email</TableHead>

                    <TableHead>Role</TableHead>

                    <TableHead></TableHead>

                </TableRow>

            </TableHeader>

            <TableBody>

                {

                    members.map((member:any)=>(

                        <TableRow

                            key={member.id}

                        >

                            <TableCell>

                                {member.userName}

                            </TableCell>

                            <TableCell>

                                {member.email}

                            </TableCell>

                            <TableCell>

                                {member.role}

                            </TableCell>

                            <TableCell>

                                <Button

                                    variant="destructive"

                                    onClick={()=>

                                        deleteMember(

                                            member.id

                                        )

                                    }

                                >

                                    Remove

                                </Button>

                            </TableCell>

                        </TableRow>

                    ))

                }

            </TableBody>

        </Table>

    );

}