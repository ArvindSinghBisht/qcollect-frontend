"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Image as ImageIcon, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonLines } from "@/components/common/State";
import { StatusBadge } from "@/components/common/StatusBadge";
import SurveyReadOnly from "@/components/survey/SurveyReadOnly";
import { getSubmission, getSubmissionPhotos, getSubmissionSurvey, reviewSubmission } from "@/services/submission.service";
import { getErrorMessage, unwrapApiData } from "@/lib/api-response";
import { safeParseSurveySchema } from "@/types/survey";
import type { Submission, SubmissionSurveyResponse } from "@/types/submission";

interface PhotoLike {
  id: string;
  fileUrl?: string;
  photoUrl?: string;
  url?: string;
  filePath?: string;
  latitude?: number;
  longitude?: number;
}

export default function SubmissionReviewPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.submissionId as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [survey, setSurvey] = useState<SubmissionSurveyResponse | null>(null);
  const [photos, setPhotos] = useState<PhotoLike[]>([]);
  const [remarks, setRemarks] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoLike | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const schema = useMemo(() => safeParseSurveySchema(survey?.surveyJson), [survey?.surveyJson]);
  const answers = useMemo(() => parseAnswers(survey?.answersJson), [survey?.answersJson]);

  async function loadSubmission() {
    try {
      setLoading(true);
      const [submissionResponse, surveyResponse, photoResponse] = await Promise.allSettled([
        getSubmission(submissionId),
        getSubmissionSurvey(submissionId),
        getSubmissionPhotos(submissionId),
      ]);

      if (submissionResponse.status === "fulfilled") {
        setSubmission(unwrapApiData<Submission | null>(submissionResponse.value, null));
      }
      if (surveyResponse.status === "fulfilled") {
        setSurvey(unwrapApiData<SubmissionSurveyResponse | null>(surveyResponse.value, null));
      }
      if (photoResponse.status === "fulfilled") {
        setPhotos(unwrapApiData<PhotoLike[]>(photoResponse.value, []));
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load submission"));
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(status: "APPROVED" | "REJECTED") {
    try {
      setReviewing(true);
      await reviewSubmission(submissionId, { status, remarks });
      toast.success(`Submission ${status.toLowerCase()}`);
      await loadSubmission();
    } catch (error) {
      toast.error(getErrorMessage(error, "Review failed"));
    } finally {
      setReviewing(false);
    }
  }

  if (loading) return <SkeletonLines count={6} />;

  return (
    <div className="space-y-8">
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <PageHeader eyebrow="Submission Review" title="Review Submission" description="Quality Checker reviews the rendered form exactly as submitted by the Accessor.">
        <StatusBadge status={submission?.status} />
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[1fr_.45fr]">
        <div className="space-y-6">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>{schema.title || "Submitted Form"}</CardTitle>
            </CardHeader>
            <CardContent>
              {schema.description ? <p className="mb-4 text-sm text-slate-500">{schema.description}</p> : null}
              <SurveyReadOnly schema={schema} answers={answers} />
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-teal-600" />Photos</CardTitle>
            </CardHeader>
            <CardContent>
              {photos.length ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {photos.map((photo) => {
                    const url = resolveMediaUrl(photo.fileUrl || photo.photoUrl || photo.url || photo.filePath || "");
                    return (
                      <button key={photo.id} onClick={() => setSelectedPhoto(photo)} className="overflow-hidden rounded-xl border bg-slate-100 text-left dark:bg-slate-900">
                        {url ? <img src={url} alt="Submission photo" className="h-40 w-full object-cover" /> : <div className="flex h-40 items-center justify-center text-slate-400">No preview</div>}
                        <div className="p-3 text-xs text-slate-500">Lat: {photo.latitude || "-"} / Lng: {photo.longitude || "-"}</div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No photos uploaded.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit rounded-xl">
          <CardHeader>
            <CardTitle>Final Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 text-xs dark:bg-slate-950">
              <p className="font-semibold">Submission ID</p>
              <p className="mt-1 break-all">{submissionId}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4 text-xs dark:bg-slate-950">
              <p className="font-semibold">Form ID</p>
              <p className="mt-1 break-all">{survey?.formId || submission?.formId || "-"}</p>
            </div>
            <Textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} placeholder="Add remarks / rejection comment" />
            <Button className="w-full rounded-lg font-semibold" disabled={reviewing} onClick={() => handleReview("APPROVED")}>
              <CheckCircle2 className="h-4 w-4" />Approve Submission
            </Button>
            <Button variant="destructive" className="w-full rounded-lg font-semibold" disabled={reviewing} onClick={() => handleReview("REJECTED")}>
              <XCircle className="h-4 w-4" />Reject Submission
            </Button>
          </CardContent>
        </Card>
      </div>

      {selectedPhoto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="max-h-[90vh] max-w-5xl overflow-hidden rounded-xl bg-white p-3 dark:bg-slate-950" onClick={(event) => event.stopPropagation()}>
            {resolveMediaUrl(selectedPhoto.fileUrl || selectedPhoto.photoUrl || selectedPhoto.url || selectedPhoto.filePath || "") ? (
              <img src={resolveMediaUrl(selectedPhoto.fileUrl || selectedPhoto.photoUrl || selectedPhoto.url || selectedPhoto.filePath || "")} alt="Preview" className="max-h-[80vh] w-full object-contain" />
            ) : (
              <div className="p-20 text-center">No preview</div>
            )}
            <Button className="mt-3 w-full" onClick={() => setSelectedPhoto(null)}>Close</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function parseAnswers(raw?: string): Record<string, unknown> {
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      "answers" in parsed
    ) {
      const answers = (parsed as { answers?: unknown }).answers;

      if (
        answers &&
        typeof answers === "object" &&
        !Array.isArray(answers)
      ) {
        return answers as Record<string, unknown>;
      }
    }

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }

    return {};
  } catch {
    return {};
  }
}

function resolveMediaUrl(url: string) {
  if (!url) return "";

  if (
    url.startsWith("https://") ||
    url.startsWith("http://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_API_URL ||
    "https://fifff-production.up.railway.app"
  ).replace(/\/$/, "");

  return `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}
