"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import type { SurveyField, SurveySchema } from "@/types/survey";
import { allSurveyFields } from "@/types/survey";
import { getRuntimeFieldState } from "@/lib/survey/logicEngine";

export interface RuntimePhoto {
  fieldId: string;
  file: File;
  latitude?: number;
  longitude?: number;
}

interface SurveyRuntimeProps {
  schema: SurveySchema;
  answers: Record<string, unknown>;
  onAnswersChange: (answers: Record<string, unknown>) => void;
  onPhotosChange?: (photos: RuntimePhoto[]) => void;
  errors?: Record<string, string>;
  onErrorClear?: (fieldId: string) => void;
  readOnly?: boolean;
}

export default function SurveyRuntime({
  schema,
  answers,
  onAnswersChange,
  onPhotosChange,
  errors = {},
  onErrorClear,
  readOnly = false,
}: SurveyRuntimeProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [photos, setPhotos] = useState<RuntimePhoto[]>([]);

  const page = schema.pages[pageIndex] || schema.pages[0];

  const answerableFields = useMemo(
    () =>
      allSurveyFields(schema).filter((field) => {
        if (isLayoutField(field)) return false;
        return !getRuntimeFieldState(field, answers).hidden;
      }),
    [schema, answers]
  );

  const answeredCount = useMemo(
    () => answerableFields.filter((field) => valuePresent(answers[field.id])).length,
    [answers, answerableFields]
  );

  function setAnswer(fieldId: string, value: unknown) {
    onAnswersChange({ ...answers, [fieldId]: value });
    onErrorClear?.(fieldId);
  }

  function updatePhotos(next: RuntimePhoto[]) {
    setPhotos(next);
    onPhotosChange?.(next);
  }

  function setPhoto(field: SurveyField, file: File, position?: GeolocationPosition) {
    const next = photos.filter((photo) => photo.fieldId !== field.id);

    next.push({
      fieldId: field.id,
      file,
      latitude: position?.coords.latitude,
      longitude: position?.coords.longitude,
    });

    updatePhotos(next);

    setAnswer(field.id, {
      fileName: file.name,
      fileType: file.type,
      size: file.size,
      latitude: position?.coords.latitude ?? null,
      longitude: position?.coords.longitude ?? null,
      accuracy: position?.coords.accuracy ?? null,
      capturedAt: new Date(position?.timestamp || Date.now()).toISOString(),
    });
  }

  return (
    <main className="respondent-shell">
      <div className="respondent-card">
        <header className="respondent-head">
          <h1>{schema.title}</h1>
          <p>
            {schema.description ||
              page?.title ||
              "Complete the assigned form and submit for quality review."}
          </p>
        </header>

        <div className="respondent-progress">
          <i
            style={{
              width: `${Math.round(
                (answeredCount / Math.max(answerableFields.length, 1)) * 100
              )}%`,
            }}
          />
        </div>

        <section className="respondent-form">
          {page?.fields.map((field) => {
            const runtimeState = getRuntimeFieldState(field, answers);

            if (runtimeState.hidden) {
              return null;
            }

            return (
              <RuntimeField
                key={field.id}
                field={{
                  ...field,
                  required: runtimeState.required,
                  readOnly: runtimeState.readOnly,
                }}
                value={runtimeState.value ?? answers[field.id]}
                error={errors[field.id]}
                onChange={(value) => setAnswer(field.id, value)}
                onPhoto={(file, position) => setPhoto(field, file, position)}
                readOnly={readOnly || Boolean(runtimeState.readOnly)}
              />
            );
          })}

          <div className="respondent-actions">
            <button
              type="button"
              disabled={pageIndex === 0}
              onClick={() => setPageIndex((index) => Math.max(0, index - 1))}
            >
              Back
            </button>

            {pageIndex < schema.pages.length - 1 ? (
              <button
                type="button"
                className="primary"
                onClick={() =>
                  setPageIndex((index) => Math.min(schema.pages.length - 1, index + 1))
                }
              >
                Next
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function RuntimeField({
  field,
  value,
  error,
  onChange,
  onPhoto,
  readOnly,
}: {
  field: SurveyField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
  onPhoto: (file: File, position?: GeolocationPosition) => void;
  readOnly: boolean;
}) {
  const [geoError, setGeoError] = useState("");
  const [preview, setPreview] = useState("");
  const [capturing, setCapturing] = useState(false);

  const stringValue =
    value == null ? "" : typeof value === "string" ? value : JSON.stringify(value);

  function captureLocation() {
    if (!navigator.geolocation) {
      setGeoError("Location is not supported on this device.");
      return;
    }

    setCapturing(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoError("");
        setCapturing(false);

        onChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date(position.timestamp).toISOString(),
        });
      },
      (locationError) => {
        setCapturing(false);
        setGeoError(
          locationError.code === 1
            ? "Location permission was denied."
            : "Unable to determine location."
        );
      },
      { enableHighAccuracy: field.highAccuracy, maximumAge: 0 }
    );
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    const applyPhoto = (position?: GeolocationPosition) => {
      setGeoError("");
      onPhoto(file, position);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        applyPhoto,
        (locationError) => {
          if (field.geotagRequired) {
            setGeoError(
              locationError.code === 1
                ? "Allow location access to attach a geotag."
                : "A GPS fix is required before capture."
            );
            event.target.value = "";
            setPreview("");
          } else {
            applyPhoto();
          }
        },
        { enableHighAccuracy: field.highAccuracy, maximumAge: 0 }
      );
    } else if (field.geotagRequired) {
      setGeoError("Geolocation is unavailable on this device.");
      event.target.value = "";
      setPreview("");
    } else {
      applyPhoto();
    }
  }

  if (field.type === "Heading") {
    return (
      <div className="respondent-field respondent-heading">
        <h2>{field.label}</h2>
        {field.help ? <small>{field.help}</small> : null}
      </div>
    );
  }

  if (field.type === "Paragraph") {
    return (
      <div className="respondent-field">
        <p>{field.label}</p>
        {field.help ? <small>{field.help}</small> : null}
      </div>
    );
  }

  if (field.type === "Divider") {
    return <hr className="respondent-divider" />;
  }

  if (field.type === "Section" || field.type === "Columns" || field.type === "Tabs") {
    return (
      <div className="respondent-field respondent-heading">
        <h2>{field.label}</h2>
        {field.help ? <small>{field.help}</small> : null}
      </div>
    );
  }

  return (
    <div className="respondent-field">
      <label>
        {field.label}
        {field.required ? <em> *</em> : null}
      </label>

      {field.type === "Long text" ? (
        <textarea
          disabled={readOnly}
          value={stringValue}
          placeholder={field.placeholder || ""}
          minLength={field.minLength}
          maxLength={field.maxLength}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}

      {field.type === "Text" ||
      field.type === "Email" ||
      field.type === "Number" ||
      field.type === "Date" ||
      field.type === "Address" ||
      field.type === "Currency" ? (
        <input
          disabled={readOnly}
          type={inputType(field.type)}
          value={stringValue}
          placeholder={field.placeholder || ""}
          min={field.type === "Date" ? field.minDate : field.min}
          max={field.type === "Date" ? field.maxDate : field.max}
          step={field.step}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}

      {field.type === "Dropdown" ? (
        <select disabled={readOnly} value={stringValue} onChange={(event) => onChange(event.target.value)}>
          <option value="">Select...</option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : null}

      {field.type === "Radio group" ? (
        <div className="respondent-options">
          {(field.options || []).map((option) => (
            <label key={option}>
              <input
                disabled={readOnly}
                type="radio"
                checked={stringValue === option}
                onChange={() => onChange(option)}
              />
              {option}
            </label>
          ))}
        </div>
      ) : null}

      {field.type === "Checkbox" ? (
        <div className="respondent-options">
          {(field.options?.length ? field.options : ["Yes"]).map((option) => {
            const selected = Array.isArray(value) ? (value as string[]) : [];

            return (
              <label key={option}>
                <input
                  disabled={readOnly}
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={(event) =>
                    onChange(
                      event.target.checked
                        ? [...selected, option]
                        : selected.filter((item) => item !== option)
                    )
                  }
                />
                {option}
              </label>
            );
          })}
        </div>
      ) : null}

      {field.type === "Rating" ? (
        <div className="respondent-rating">
          {Array.from({ length: field.ratingScale || 5 }, (_, index) => index + 1).map(
            (rating) => (
              <button
                type="button"
                disabled={readOnly}
                className={Number(value) >= rating ? "active" : ""}
                key={rating}
                onClick={() => onChange(rating)}
              >
                ★
              </button>
            )
          )}
        </div>
      ) : null}

      {field.type === "NPS score" ? (
        <>
          <div className="respondent-rating">
            {Array.from({ length: 11 }, (_, index) => index).map((score) => (
              <button
                type="button"
                disabled={readOnly}
                className={Number(value) === score ? "active" : ""}
                key={score}
                onClick={() => onChange(score)}
              >
                {score}
              </button>
            ))}
          </div>
          <div className="rating-label">
            <span>{field.npsMinLabel || "Not likely"}</span>
            <span>{field.npsMaxLabel || "Very likely"}</span>
          </div>
        </>
      ) : null}

      {field.type === "Matrix" ? (
        <div className="capture-box">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 6 }} />
                {(field.matrixColumns || []).map((column) => (
                  <th key={column.id} style={{ textAlign: "center", padding: 6 }}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(field.matrixRows || []).map((row) => {
                const selected =
                  value && typeof value === "object"
                    ? String((value as Record<string, unknown>)[row.id] || "")
                    : "";

                return (
                  <tr key={row.id}>
                    <td style={{ padding: 6 }}>{row.label}</td>
                    {(field.matrixColumns || []).map((column) => (
                      <td key={column.id} style={{ textAlign: "center", padding: 6 }}>
                        <input
                          disabled={readOnly}
                          type="radio"
                          name={`${field.id}-${row.id}`}
                          checked={selected === column.label}
                          onChange={() =>
                            onChange({
                              ...((value as Record<string, unknown>) || {}),
                              [row.id]: column.label,
                            })
                          }
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {field.type === "Live location" ? (
        <div className="capture-box">
          <button type="button" disabled={readOnly || capturing} onClick={captureLocation}>
            {capturing ? "Capturing..." : "Capture location"}
          </button>
          {value ? <div className="capture-value">{stringValue}</div> : null}
        </div>
      ) : null}

      {field.type === "Geotagged photo" || field.type === "File upload" ? (
        <div className="capture-box">
          <label className="capture-file">
            {field.type === "Geotagged photo" ? "Open camera" : "Select file"}
            <input
              disabled={readOnly}
              type="file"
              accept={field.type === "Geotagged photo" ? "image/*" : acceptedFileTypes(field)}
              capture={field.type === "Geotagged photo" && field.requireCameraOnly ? "environment" : undefined}
              onChange={handlePhoto}
            />
          </label>
          {preview ? (
            <div className="capture-preview">
              {field.type === "Geotagged photo" ? <img src={preview} alt="Upload preview" /> : null}
              <span>{stringValue}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {field.type === "Signature" ? (
        <div className="capture-box">
          <input
            disabled={readOnly}
            type="text"
            value={stringValue}
            placeholder="Type signer name / signature reference"
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      ) : null}

      {field.type === "Repeater" ? (
        <div className="capture-box">
          Repeater response entry will be configured in the next phase.
        </div>
      ) : null}

      {geoError ? <small className="form-error">{geoError}</small> : null}
      {error ? <small className="form-error">{error}</small> : null}
      {field.help ? <small>{field.help}</small> : null}
    </div>
  );
}

function inputType(type: string) {
  if (type === "Email") return "email";
  if (type === "Number" || type === "Currency") return "number";
  if (type === "Date") return "date";
  return "text";
}

function acceptedFileTypes(field: SurveyField) {
  if (!field.allowedFileTypes?.length) return undefined;

  return field.allowedFileTypes
    .map((type) => {
      const cleaned = type.trim();
      if (!cleaned) return "";
      if (cleaned.includes("/")) return cleaned;
      return cleaned.startsWith(".") ? cleaned : `.${cleaned}`;
    })
    .filter(Boolean)
    .join(",");
}

function isLayoutField(field: SurveyField) {
  return ["Heading", "Paragraph", "Divider", "Columns", "Section", "Tabs"].includes(
    field.type
  );
}

function valuePresent(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== "";
}
