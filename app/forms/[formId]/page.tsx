"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { SkeletonLines } from "@/components/common/State";
import SurveyBuilder from "@/components/survey/SurveyBuilder";
import { getBuilder, getForm, publishBuilder, saveBuilder } from "@/services/form.service";
import { getErrorMessage, unwrapApiData } from "@/lib/api-response";
import { safeParseSurveySchema, serializeSurveySchema } from "@/types/survey";
import type { Form, FormBuilderResponse } from "@/types/form";
import type { SurveySchema } from "@/types/survey";

export default function DirectSurveyBuilderPage() {
  const params = useParams();
  const formId = params.formId as string;
  const [builder, setBuilder] = useState<FormBuilderResponse | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadBuilder(); }, [formId]);

  async function loadBuilder() {
    try {
      setLoading(true);
      const [builderResponse, formResponse] = await Promise.all([getBuilder(formId), getForm(formId)]);
      setBuilder(unwrapApiData<FormBuilderResponse | null>(builderResponse, null));
      setForm(unwrapApiData<Form | null>(formResponse, null));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load Survey Builder"));
    } finally {
      setLoading(false);
    }
  }

  const schema = useMemo(
    () => safeParseSurveySchema(builder?.surveyJson, builder?.formName || form?.name || "Untitled form"),
    [builder?.surveyJson, builder?.formName, form?.name]
  );

  async function handleSaveDraft(nextSchema: SurveySchema) {
    const response = await saveBuilder(formId, serializeSurveySchema(nextSchema));
    setBuilder(unwrapApiData<FormBuilderResponse | null>(response, builder));
    toast.success("Builder draft saved");
  }

  async function handlePublish(nextSchema: SurveySchema) {
    await saveBuilder(formId, serializeSurveySchema(nextSchema));
    const response = await publishBuilder(formId);
    setBuilder(unwrapApiData<FormBuilderResponse | null>(response, builder));
    toast.success("Form published for assigned Assessors");
  }

  if (loading) return <div className="p-6"><SkeletonLines count={6} /></div>;
  if (!builder) return <div className="p-6 text-sm text-slate-500">Unable to load builder.</div>;

  return (
    <SurveyBuilder
      initialSchema={schema}
      formName={builder.formName || form?.name}
      version={builder.version}
      published={builder.published}
      backHref={form?.projectId ? `/projects/${form.projectId}/forms` : "/forms"}
      fillHref={`/forms/${formId}/fill`}
      reviewHref="/submissions/pending"
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
    />
  );
}
