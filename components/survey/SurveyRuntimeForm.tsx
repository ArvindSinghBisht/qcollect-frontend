"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { SurveyAnswerPayload, SurveyField, SurveySchema } from "@/types/survey";
import { getRuntimeFieldState } from "@/lib/survey/logicEngine";
import { validateSurveyAnswers } from "@/lib/survey/validationEngine";

interface SurveyRuntimeFormProps {
  schema: SurveySchema;
  initialAnswers?: Record<string, unknown>;
  saving?: boolean;
  submitting?: boolean;
  onSaveDraft?: (payload: SurveyAnswerPayload) => Promise<void>;
  onSubmit: (payload: SurveyAnswerPayload) => Promise<void>;
}

function isLayoutField(field: SurveyField) {
  return (
    field.type === "Heading" ||
    field.type === "Paragraph" ||
    field.type === "Divider" ||
    field.type === "Section" ||
    field.type === "Columns" ||
    field.type === "Tabs"
  );
}

export default function SurveyRuntimeForm({
  schema,
  initialAnswers = {},
  saving = false,
  submitting = false,
  onSaveDraft,
  onSubmit,
}: SurveyRuntimeFormProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialAnswers);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [status, setStatus] = useState("");

  const page = schema.pages[pageIndex] || schema.pages[0];

  function updateAnswer(fieldId: string, value: unknown) {
    setAnswers((current) => ({
      ...current,
      [fieldId]: value,
    }));

    setErrors((current) => {
      const next = { ...current };
      delete next[fieldId];
      return next;
    });
  }

  function buildPayload(type: "draft" | "submit"): SurveyAnswerPayload {
    return {
      answers,
      schemaVersion: schema.version || 1,
      ...(type === "draft"
        ? { savedAt: new Date().toISOString() }
        : { submittedAt: new Date().toISOString() }),
    };
  }

  async function handleSaveDraft() {
    if (!onSaveDraft) return;

    setStatus("Saving draft...");
    await onSaveDraft(buildPayload("draft"));
    setStatus("Draft saved");
  }

  async function handleSubmit() {
    const result = validateSurveyAnswers(schema, answers);

    setErrors(result.errors);

    if (!result.valid) {
      setStatus(`Please fix ${Object.keys(result.errors).length} issue(s) before submitting.`);
      return;
    }

    setStatus("Submitting...");
    await onSubmit(buildPayload("submit"));
    setStatus("Submitted successfully");
  }

  function goNext() {
    if (pageIndex < schema.pages.length - 1) {
      setPageIndex((current) => current + 1);
    }
  }

  function goBack() {
    if (pageIndex > 0) {
      setPageIndex((current) => current - 1);
    }
  }

  if (!page) {
    return (
      <div className="no-selection">
        No form pages available.
      </div>
    );
  }

  return (
    <div className="page-card">
      <div className="form-head">
        <span className="mini-logo">Q</span>
        <div>
          <h1>{schema.title}</h1>
          <p>
            {page.title} · Fields marked <em>*</em> are required
          </p>
        </div>
      </div>

      {schema.description && (
        <p style={{ marginBottom: 16 }}>{schema.description}</p>
      )}

      <div className="fields">
        {page.fields.map((field) => {
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
              value={answers[field.id]}
              error={errors[field.id]}
              onChange={(value) => updateAnswer(field.id, value)}
            />
          );
        })}
      </div>

      {status && (
        <small className={Object.keys(errors).length ? "capture-error" : ""}>
          {status}
        </small>
      )}

      <div className="form-footer">
        <span>
          Page {pageIndex + 1} of {schema.pages.length}
        </span>

        <div>
          <button type="button" onClick={goBack} disabled={pageIndex === 0}>
            Back
          </button>

          {onSaveDraft && (
            <button
              type="button"
              className="save"
              onClick={handleSaveDraft}
              disabled={saving || submitting}
            >
              {saving ? "Saving..." : "Save draft"}
            </button>
          )}

          {pageIndex < schema.pages.length - 1 ? (
            <button type="button" className="next" onClick={goNext}>
              Next →
            </button>
          ) : (
            <button
              type="button"
              className="publish"
              onClick={handleSubmit}
              disabled={saving || submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function RuntimeField({
  field,
  value,
  error,
  onChange,
}: {
  field: SurveyField;
  value?: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [geoError, setGeoError] = useState("");
  const [photo, setPhoto] = useState("");
  const watch = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (watch.current !== null) {
        navigator.geolocation.clearWatch(watch.current);
      }
    };
  }, []);

  function captureLocation() {
    if (!navigator.geolocation) {
      setGeoError("Location is not supported on this device.");
      return;
    }

    setGeoError("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition(pos);

        onChange({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date(pos.timestamp).toISOString(),
        });
      },
      (err) => {
        setGeoError(
          err.code === 1
            ? "Location permission was denied."
            : "Unable to determine location."
        );
      },
      {
        enableHighAccuracy: field.highAccuracy,
        maximumAge: 0,
      }
    );
  }

  function takePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    const applyValue = (pos?: GeolocationPosition) => {
      if (pos) {
        setPosition(pos);
      }

      setPhoto(previewUrl);

      onChange({
        fileName: file.name,
        fileType: file.type,
        size: file.size,
        previewUrl,
        latitude: pos?.coords.latitude,
        longitude: pos?.coords.longitude,
        accuracy: pos?.coords.accuracy,
        timestamp: new Date(pos?.timestamp || Date.now()).toISOString(),
      });

      setGeoError("");
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        applyValue,
        (err) => {
          if (field.geotagRequired) {
            setGeoError(
              err.code === 1
                ? "Allow location access to attach a geotag."
                : "A GPS fix is required before capture."
            );
            event.target.value = "";
          } else {
            applyValue();
          }
        },
        {
          enableHighAccuracy: field.highAccuracy,
          maximumAge: 0,
        }
      );
    } else if (field.geotagRequired) {
      setGeoError("Geolocation is unavailable on this device.");
    } else {
      applyValue();
    }
  }

  if (isLayoutField(field)) {
    if (field.type === "Heading") {
      return (
        <div className="field" style={{ width: field.width || "100%" }}>
          <h2>{field.label}</h2>
          {field.help && <p>{field.help}</p>}
        </div>
      );
    }

    if (field.type === "Paragraph") {
      return (
        <div className="field" style={{ width: field.width || "100%" }}>
          <p>{field.label}</p>
          {field.help && <small>{field.help}</small>}
        </div>
      );
    }

    if (field.type === "Divider") {
      return (
        <div className="field" style={{ width: field.width || "100%" }}>
          <hr />
        </div>
      );
    }

    return (
      <div className="field" style={{ width: field.width || "100%" }}>
        <h3>{field.label}</h3>
        {field.help && <small>{field.help}</small>}
      </div>
    );
  }

  return (
    <div className="field" style={{ width: field.width || "100%" }}>
      <label>
        {field.label} {field.required && <em>*</em>}
      </label>

      {field.type === "Long text" ? (
        <textarea
          value={String(value ?? "")}
          placeholder={field.placeholder}
          readOnly={field.readOnly}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : field.type === "Dropdown" ? (
        <select
          className="fake-input"
          value={String(value ?? "")}
          disabled={field.readOnly}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select option</option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === "Radio group" ? (
        <div className="choice-list">
          {(field.options || []).map((option) => (
            <label key={option} className="choice-option">
              <input
                type="radio"
                name={field.id}
                value={option}
                checked={value === option}
                disabled={field.readOnly}
                onChange={() => onChange(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      ) : field.type === "Checkbox" ? (
        <div className="choice-list">
          {(field.options || ["Yes"]).map((option) => {
            const selected = Array.isArray(value) ? value : [];

            return (
              <label key={option} className="choice-option">
                <input
                  type="checkbox"
                  value={option}
                  checked={selected.includes(option)}
                  disabled={field.readOnly}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onChange([...selected, option]);
                    } else {
                      onChange(selected.filter((item) => item !== option));
                    }
                  }}
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      ) : field.type === "Date" ? (
        <input
          className="fake-input"
          type="date"
          value={String(value ?? "")}
          readOnly={field.readOnly}
          min={field.minDate}
          max={field.maxDate}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : field.type === "Number" || field.type === "Currency" ? (
        <input
          className="fake-input"
          type="number"
          value={String(value ?? "")}
          placeholder={field.placeholder}
          readOnly={field.readOnly}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : field.type === "Email" ? (
        <input
          className="fake-input"
          type="email"
          value={String(value ?? "")}
          placeholder={field.placeholder}
          readOnly={field.readOnly}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : field.type === "Rating" ? (
        <div className="rating">
          {Array.from({ length: field.ratingScale || 5 }).map((_, index) => {
            const score = index + 1;

            return (
              <button
                type="button"
                key={score}
                onClick={() => onChange(score)}
                disabled={field.readOnly}
              >
                {Number(value) >= score ? "★" : "☆"}
              </button>
            );
          })}
        </div>
      ) : field.type === "NPS score" ? (
        <>
          <div className="rating">
            {Array.from({ length: 11 }).map((_, index) => (
              <button
                type="button"
                key={index}
                className={value === index ? "active" : ""}
                onClick={() => onChange(index)}
                disabled={field.readOnly}
              >
                {index}
              </button>
            ))}
          </div>
          <div className="rating-label">
            <span>{field.npsMinLabel || "Not likely"}</span>
            <span>{field.npsMaxLabel || "Very likely"}</span>
          </div>
        </>
      ) : field.type === "Live location" ? (
        <div className="geo-capture">
          <div className="geo-pulse">⌖</div>

          {position ? (
            <div className="geo-result">
              <b>
                {position.coords.latitude.toFixed(6)},{" "}
                {position.coords.longitude.toFixed(6)}
              </b>
              <span>
                Accuracy ±{Math.round(position.coords.accuracy)} m
              </span>
            </div>
          ) : (
            <div className="geo-result">
              <b>Location not captured</b>
              <span>Tap capture to attach GPS coordinates</span>
            </div>
          )}

          <button type="button" onClick={captureLocation} disabled={field.readOnly}>
            Capture location
          </button>
        </div>
      ) : field.type === "Geotagged photo" ? (
        <div className="photo-capture">
          {photo ? (
            <img src={photo} alt="Captured preview" />
          ) : (
            <div className="photo-placeholder">
              <b>◎</b>
              <span>No photo captured</span>
            </div>
          )}

          <label className="camera-button">
            ◉ Open camera
            <input
              type="file"
              accept="image/*"
              capture={field.requireCameraOnly ? "environment" : undefined}
              disabled={field.readOnly}
              onChange={takePhoto}
            />
          </label>

          {position && (
            <div className="geotag">
              <b>⌖ Geotag attached</b>
              <span>
                {position.coords.latitude.toFixed(5)},{" "}
                {position.coords.longitude.toFixed(5)} · ±
                {Math.round(position.coords.accuracy)} m
              </span>
              {field.includeTimestamp && (
                <span>{new Date(position.timestamp).toLocaleString()}</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <input
          className="fake-input"
          type="text"
          value={String(value ?? "")}
          placeholder={field.placeholder}
          readOnly={field.readOnly}
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      {field.help && <small>{field.help}</small>}
      {geoError && <small className="capture-error">{geoError}</small>}
      {error && <small className="capture-error">{error}</small>}
    </div>
  );
}