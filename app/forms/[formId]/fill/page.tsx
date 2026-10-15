"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { SkeletonLines } from "@/components/common/State";
import SurveyRuntime, { type RuntimePhoto } from "@/components/survey/SurveyRuntime";
import { getMobileSurvey } from "@/services/form.service";
import {
  createSubmission,
  saveAnswers,
  submitSubmission,
  uploadPhoto,
} from "@/services/submission.service";
import { getErrorMessage, unwrapApiData } from "@/lib/api-response";
import { validateSurveyAnswers } from "@/lib/survey/validationEngine";
import { safeParseSurveySchema } from "@/types/survey";
import type { PublishedSurveyResponse } from "@/types/form";
import type { SurveySchema } from "@/types/survey";

export default function FillFormPage() {
  const params = useParams();
  const formId = params.formId as string;

  const [survey, setSurvey] = useState<PublishedSurveyResponse | null>(null);
  const [schema, setSchema] = useState<SurveySchema | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<RuntimePhoto[]>([]);
  const [submissionId, setSubmissionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const uploadedPhotoKeys = useRef<Set<string>>(new Set());
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    loadSurvey();
    requestLocation();
  }, [formId]);

  async function loadSurvey() {
    try {
      setLoading(true);
      const response = await getMobileSurvey(formId);
      const data = unwrapApiData<PublishedSurveyResponse | null>(response, null);

      setSurvey(data);
      setSchema(
        safeParseSurveySchema(data?.surveyJson, data?.formName || "Assigned form")
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Failed to load assigned form. Please ensure this form is published and assigned to you."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) =>
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 0 }
    );
  }

  async function ensureSubmission() {
    if (submissionId) return submissionId;

    const response = await createSubmission(formId, coords);
    const submission = unwrapApiData<{ id?: string }>(response, {});

    if (!submission.id) {
      throw new Error("Submission ID was not returned by backend");
    }

    setSubmissionId(submission.id);
    return submission.id;
  }

  function clearFieldError(fieldId: string) {
    setErrors((current) => {
      const next = { ...current };
      delete next[fieldId];
      return next;
    });
  }

  function buildAnswersJson(submitted = false) {
    return JSON.stringify({
      answers,
      schemaVersion: survey?.version || schema?.version || 1,
      savedAt: new Date().toISOString(),
      submittedAt: submitted ? new Date().toISOString() : undefined,
    });
  }

  async function uploadCapturedPhotos(id: string) {
    for (const photo of photos) {
      const uploadKey = `${id}:${photo.fieldId}:${photo.file.name}:${photo.file.size}:${photo.file.lastModified}`;
  
      if (uploadedPhotoKeys.current.has(uploadKey)) {
        continue;
      }
  
      await uploadPhoto(
        id,
        photo.file,
        photo.latitude ?? coords.latitude,
        photo.longitude ?? coords.longitude
      );
  
      uploadedPhotoKeys.current.add(uploadKey);
    }
  }

  async function handleSaveDraft() {
    try {
      setSaving(true);
      const id = await ensureSubmission();

      await saveAnswers(id, buildAnswersJson(false));
      await uploadCapturedPhotos(id);

      toast.success("Draft saved");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save draft"));
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!schema) return;

    const result = validateSurveyAnswers(schema, answers);
    setErrors(result.errors);

    if (!result.valid) {
      const firstError = Object.values(result.errors)[0];
      toast.error(firstError || "Please fix validation issues before submitting.");
      return;
    }

    try {
      setSaving(true);
      const id = await ensureSubmission();

      await saveAnswers(id, buildAnswersJson(true));
      await uploadCapturedPhotos(id);
      await submitSubmission(id);

      toast.success("Form submitted for Quality Checker review");
      setAnswers({});
      setPhotos([]);
      setSubmissionId("");
uploadedPhotoKeys.current.clear();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to submit form"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <SkeletonLines count={6} />
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="p-6 text-sm text-slate-500">
        No published survey schema available.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/my/forms"
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to My Forms
      </Link>

      <PageHeader
        eyebrow="Accessor Flow"
        title={survey?.formName || schema.title}
        description="Fill the published form and submit it for Quality Checker review."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_.32fr]">
        <SurveyRuntime
          schema={schema}
          answers={answers}
          errors={errors}
          onAnswersChange={setAnswers}
          onErrorClear={clearFieldError}
          onPhotosChange={setPhotos}
        />

        <Card className="h-fit rounded-xl">
          <CardHeader>
            <CardTitle>Submission Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-900">
              <p className="font-semibold">GPS</p>
              <p>
                {coords.latitude || "-"}, {coords.longitude || "-"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 rounded-xl"
                onClick={requestLocation}
              >
                Refresh location
              </Button>
            </div>

            {Object.keys(errors).length ? (
              <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                <p className="font-semibold">Validation issues</p>
                <p>{Object.keys(errors).length} field(s) need correction.</p>
              </div>
            ) : null}

            {submissionId ? (
              <div className="break-all rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-900">
                Draft ID: {submissionId}
              </div>
            ) : null}

            <Button
              variant="outline"
              className="w-full rounded-lg font-semibold"
              disabled={saving}
              onClick={handleSaveDraft}
            >
              Save Draft
            </Button>

            <Button
              className="w-full rounded-lg font-semibold"
              disabled={saving}
              onClick={handleSubmit}
            >
              Submit for QC
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
