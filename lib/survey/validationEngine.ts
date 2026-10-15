import { SurveyField, SurveySchema } from "@/types/survey";
import { getRuntimeFieldState, SurveyAnswers } from "@/lib/survey/logicEngine";

export interface SurveyValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

function isEmptyValue(value: unknown) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
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

function collectNestedFields(fields: SurveyField[]): SurveyField[] {
  return fields.flatMap((field) => {
    const sectionChildren = collectNestedFields(field.children || []);

    const columnChildren = Object.values(field.columnChildren || {}).flatMap(
      (columnFields) => collectNestedFields(columnFields || [])
    );
    
    const tabChildren = Object.values(field.tabChildren || {}).flatMap((tabFields) =>
      collectNestedFields(tabFields || [])
    );
    
    const repeaterChildren = collectNestedFields(field.repeaterFields || []);
    
    return [
      field,
      ...sectionChildren,
      ...columnChildren,
      ...tabChildren,
      ...repeaterChildren,
    ];
  });
}

function isValidEmail(value: unknown) {
  if (typeof value !== "string") return false;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function hasGpsValue(value: unknown) {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;

  const latitude = record.latitude ?? record.lat;
  const longitude = record.longitude ?? record.lng;

  return latitude !== undefined && longitude !== undefined;
}

function hasPhotoValue(value: unknown) {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;

  return Boolean(record.fileName || record.previewUrl || record.url || record.photo);
}

function getFileSizeMB(value: unknown) {
  if (!value || typeof value !== "object") return undefined;

  const record = value as Record<string, unknown>;

  if (typeof record.size === "number") {
    return record.size / (1024 * 1024);
  }

  if (typeof record.sizeBytes === "number") {
    return record.sizeBytes / (1024 * 1024);
  }

  return undefined;
}

function getFileValues(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item)
    );
  }

  if (value && typeof value === "object") {
    return [value as Record<string, unknown>];
  }

  return [];
}

function getFileExtension(value: unknown) {
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;

  const fileName = String(record.fileName || record.name || "");

  if (!fileName.includes(".")) return "";

  return fileName.split(".").pop()?.toLowerCase() || "";
}

export function validateFieldValue(
  field: SurveyField,
  answers: SurveyAnswers
): string | null {
  if (isLayoutField(field)) return null;

  const runtimeState = getRuntimeFieldState(field, answers);

  if (runtimeState.hidden) return null;

  const value = runtimeState.value ?? answers[field.id];

  if (field.type === "Repeater") {
    const rows = Array.isArray(value)
      ? (value as Record<string, unknown>[])
      : [];
  
    if (runtimeState.required && rows.length === 0) {
      return `${field.label} is required.`;
    }
  
    if (field.minRepeats !== undefined && rows.length < field.minRepeats) {
      return `Minimum ${field.minRepeats} item(s) required.`;
    }
  
    if (field.maxRepeats !== undefined && rows.length > field.maxRepeats) {
      return `Maximum ${field.maxRepeats} item(s) allowed.`;
    }
  
    const childFields = field.repeaterFields || [];
  
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex] || {};
  
      for (const childField of childFields) {
        const childError = validateFieldValue(
          childField,
          row as SurveyAnswers
        );
  
        if (childError) {
          return `Item ${rowIndex + 1}: ${childError}`;
        }
      }
    }
  
    return null;
  }
  
  if (runtimeState.required && isEmptyValue(value)) {
    return `${field.label} is required.`;
  }
  
  if (isEmptyValue(value)) {
    return null;
  }

  if (field.type === "Matrix") {
    const rows = field.matrixRows || [];
  
    if (field.required) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return `${field.label} is required.`;
      }
  
      const matrixValue = value as Record<string, unknown>;
  
      const missingRow = rows.find((row) => isEmptyValue(matrixValue[row.id]));
  
      if (missingRow) {
        return `Please answer matrix row: ${missingRow.label}.`;
      }
    }
  }

  if (field.type === "Email" && !isValidEmail(value)) {
    return "Please enter a valid email address.";
  }

  if (
    (field.type === "Text" ||
      field.type === "Long text" ||
      field.type === "Address") &&
    typeof value === "string"
  ) {
    if (field.minLength && value.trim().length < field.minLength) {
      return `Minimum ${field.minLength} characters required.`;
    }

    if (field.maxLength && value.trim().length > field.maxLength) {
      return `Maximum ${field.maxLength} characters allowed.`;
    }

    if (field.regex) {
      try {
        const pattern = new RegExp(field.regex);

        if (!pattern.test(value)) {
          return "Value does not match the required format.";
        }
      } catch {
        return "Invalid regex configured for this field.";
      }
    }
  }

  if (
    field.type === "Number" ||
    field.type === "Currency" ||
    field.type === "Rating" ||
    field.type === "NPS score"
  ) {
    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      return "Please enter a valid number.";
    }

    if (field.min !== undefined && numberValue < field.min) {
      return `Value must be at least ${field.min}.`;
    }

    if (field.max !== undefined && numberValue > field.max) {
      return `Value must not exceed ${field.max}.`;
    }
  }

  if (field.type === "Date" && typeof value === "string") {
    const selectedDate = new Date(value);
    const today = new Date();

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (field.minDate && selectedDate < new Date(field.minDate)) {
      return `Date must be on or after ${field.minDate}.`;
    }

    if (field.maxDate && selectedDate > new Date(field.maxDate)) {
      return `Date must be on or before ${field.maxDate}.`;
    }

    if (field.disablePastDates && selectedDate < today) {
      return "Past dates are not allowed.";
    }

    if (field.disableFutureDates && selectedDate > today) {
      return "Future dates are not allowed.";
    }
  }

  if (field.type === "Live location") {
    if (field.required && !hasGpsValue(value)) {
      return "Location is required.";
    }
  }

  if (field.type === "Geotagged photo") {
    if (field.required && !hasPhotoValue(value)) {
      return "Photo is required.";
    }

    if (!isEmptyValue(value) && field.geotagRequired && !hasGpsValue(value)) {
      return "Geotag is required with the photo.";
    }
  }

  if (field.type === "File upload") {
    const files = getFileValues(value);
  
    for (const fileValue of files) {
      const extension = getFileExtension(fileValue);
      const sizeMB = getFileSizeMB(fileValue);
  
      if (
        field.allowedFileTypes?.length &&
        extension &&
        !field.allowedFileTypes
          .map((item) => item.replace(".", "").toLowerCase())
          .includes(extension)
      ) {
        return `Only ${field.allowedFileTypes.join(", ")} files are allowed.`;
      }
  
      if (
        field.maxFileSizeMB !== undefined &&
        sizeMB !== undefined &&
        sizeMB > field.maxFileSizeMB
      ) {
        return `File size must not exceed ${field.maxFileSizeMB} MB.`;
      }
    }
  }

  return null;
}

function validateFieldAndNestedChildren(
  field: SurveyField,
  answers: SurveyAnswers,
  errors: Record<string, string>
) {
  const runtimeState = getRuntimeFieldState(field, answers);

  if (runtimeState.hidden) {
    return;
  }

  const error = validateFieldValue(field, answers);

  if (error) {
    errors[field.id] = error;
  }

  for (const childField of field.children || []) {
    validateFieldAndNestedChildren(childField, answers, errors);
  }

  for (const columnFields of Object.values(field.columnChildren || {})) {
    for (const childField of columnFields || []) {
      validateFieldAndNestedChildren(childField, answers, errors);
    }
  }

  for (const tabFields of Object.values(field.tabChildren || {})) {
    for (const childField of tabFields || []) {
      validateFieldAndNestedChildren(childField, answers, errors);
    }
  }
}

export function validateSurveyAnswers(
  schema: SurveySchema,
  answers: SurveyAnswers
): SurveyValidationResult {
  const errors: Record<string, string> = {};

  for (const page of schema.pages || []) {
    for (const field of page.fields || []) {
      validateFieldAndNestedChildren(field, answers, errors);
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSchemaBeforePublish(schema: SurveySchema): string[] {
  const issues: string[] = [];

  if (!schema.title?.trim()) {
    issues.push("Form title is required.");
  }

  const pages = schema.pages || [];

  if (!pages.length) {
    issues.push("At least one page is required.");
  }

  const allFields = pages.flatMap((page) =>
    collectNestedFields(page.fields || [])
  );

  const allFieldIds = new Set(allFields.map((field) => field.id));

  pages.forEach((page, pageIndex) => {
    if (!page.title?.trim()) {
      issues.push(`Page ${pageIndex + 1}: Page title is required.`);
    }

    collectNestedFields(page.fields || []).forEach((field, fieldIndex) => {
      const fieldName = field.label || `Field ${fieldIndex + 1}`;

      if (!isLayoutField(field) && !field.label?.trim()) {
        issues.push(`Page ${pageIndex + 1}: Field label is required.`);
      }

      if (
        (field.type === "Dropdown" ||
          field.type === "Radio group" ||
          field.type === "Checkbox") &&
        (!field.options || field.options.length === 0)
      ) {
        issues.push(`${fieldName}: At least one option is required.`);
      }

      if (
        field.min !== undefined &&
        field.max !== undefined &&
        field.min > field.max
      ) {
        issues.push(`${fieldName}: Min value cannot be greater than max value.`);
      }

      if (
        field.minLength !== undefined &&
        field.maxLength !== undefined &&
        field.minLength > field.maxLength
      ) {
        issues.push(`${fieldName}: Min length cannot be greater than max length.`);
      }

      if (
        field.type === "Matrix" &&
        (!field.matrixRows?.length || !field.matrixColumns?.length)
      ) {
        issues.push(`${fieldName}: Matrix must have rows and columns.`);
      }

      if (
        field.type === "File upload" &&
        field.maxFileSizeMB !== undefined &&
        field.maxFileSizeMB <= 0
      ) {
        issues.push(`${fieldName}: File size must be greater than 0 MB.`);
      }

      for (const rule of field.logic || []) {
        if (!rule.sourceFieldId || !allFieldIds.has(rule.sourceFieldId)) {
          issues.push(`${fieldName}: Logic rule has invalid source field.`);
        }

        if (!rule.targetFieldId || !allFieldIds.has(rule.targetFieldId)) {
          issues.push(`${fieldName}: Logic rule has invalid target field.`);
        }
      }
    });
  });

  return issues;
}