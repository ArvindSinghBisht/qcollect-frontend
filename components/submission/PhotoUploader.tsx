"use client";

import { useState } from "react";

import { getCurrentLocation } from "@/lib/location";
import { uploadPhoto } from "@/services/submission.service";

interface Props {
    submissionId: string;
    onUploaded?: () => void;
}

export default function PhotoUploader({
    submissionId,
    onUploaded,
}: Props) {

    const [loading, setLoading] = useState(false);

    async function handleUpload(
        e: React.ChangeEvent<HTMLInputElement>
    ) {

        const file = e.target.files?.[0];

        if (!file) return;

        try {

            setLoading(true);

            const location =
                await getCurrentLocation();

            await uploadPhoto(
                submissionId,
                file,
                location.latitude,
                location.longitude
            );

            // Refresh gallery
            onUploaded?.();

            // Allow selecting the same file again
            e.target.value = "";

            alert("Photo uploaded successfully");

        } catch (error) {

            console.error(error);

            alert("Photo upload failed");

        } finally {

            setLoading(false);

        }

    }

    return (

        <div className="space-y-3">

            <input
                type="file"
                accept="image/*"
                capture="environment"
                disabled={loading}
                onChange={handleUpload}
            />

            {loading && (
                <p className="text-sm text-muted-foreground">
                    Uploading.........................................
                </p>
            )}

        </div>

    );

}