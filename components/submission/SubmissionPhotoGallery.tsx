"use client";

import { useEffect, useState } from "react";

import { getSubmissionPhotos } from "@/services/submission.service";

interface Photo {

    id: string;

    fileName: string;

    fileUrl: string;

    latitude: number;

    longitude: number;

}

interface Props {

    submissionId: string;

    refresh?: number;

}

export default function SubmissionPhotoGallery({

    submissionId,

    refresh,

}: Props) {

    const [photos, setPhotos] = useState<Photo[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadPhotos();

    }, [submissionId, refresh]);

    async function loadPhotos() {

        try {

            setLoading(true);

            const response =
                await getSubmissionPhotos(submissionId);

            setPhotos(response.data);

        }

        catch (e) {

            console.error(e);

        }

        finally {

            setLoading(false);

        }

    }

    if (loading) {

        return <p>Loading photos...</p>;

    }

    if (photos.length === 0) {

        return (

            <p className="text-muted-foreground">

                No photos uploaded.

            </p>

        );

    }

    return (

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

            {

                photos.map((photo) => (

                    <div
                        key={photo.id}
                        className="border rounded-lg overflow-hidden"
                    >

                        <img
                            src={photo.fileUrl}
                            alt={photo.fileName}
                            className="w-full h-48 object-cover"
                        />

                        <div className="p-2 text-xs text-muted-foreground">

                            <p>{photo.fileName}</p>

                            <p>

                                {photo.latitude}, {photo.longitude}

                            </p>

                        </div>

                    </div>

                ))

            }

        </div>

    );

}