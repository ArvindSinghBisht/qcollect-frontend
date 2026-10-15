export type SurveyFieldType =
  | "Text"
  | "Long text"
  | "Email"
  | "Number"
  | "Dropdown"
  | "Checkbox"
  | "Radio group"
  | "Date"
  | "File upload"
  | "Signature"
  | "Rating"
  | "NPS score"
  | "Address"
  | "Currency"
  | "Matrix"
  | "Repeater"
  | "Live location"
  | "Geotagged photo"
  | "Heading"
  | "Paragraph"
  | "Divider"
  | "Columns"
  | "Section"
  | "Tabs";

export type FieldWidth = "25%" | "33%" | "50%" | "66%" | "75%" | "100%";

export type ValidationType =
  | "required"
  | "minLength"
  | "maxLength"
  | "minValue"
  | "maxValue"
  | "regex"
  | "email"
  | "mobile"
  | "number"
  | "datePast"
  | "dateFuture"
  | "fileType"
  | "fileSize"
  | "gpsRequired"
  | "photoRequired"
  | "signatureRequired";

export type LogicOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "greaterThan"
  | "lessThan"
  | "isEmpty"
  | "isNotEmpty";

export type LogicAction =
  | "show"
  | "hide"
  | "enable"
  | "disable"
  | "require"
  | "optional"
  | "setValue";

export interface SurveyValidationRule {
  id: string;
  type: ValidationType;
  enabled: boolean;
  value?: string | number | boolean;
  message?: string;
}

export interface SurveyLogicRule {
  id: string;
  enabled: boolean;

  sourceFieldId: string;
  operator: LogicOperator;
  value?: string | number | boolean;

  action: LogicAction;
  targetFieldId: string;
  targetValue?: string | number | boolean;
}

export interface MatrixRow {
  id: string;
  label: string;
}

export interface MatrixColumn {
  id: string;
  label: string;
}

export interface SurveyField {
  id: string;
  type: SurveyFieldType | string;

  label: string;
  placeholder?: string;

  // Existing field name kept for compatibility
  help?: string;

  // New readable alias, useful for future UI
  helpText?: string;

  required?: boolean;
  readOnly?: boolean;
  hidden?: boolean;

  width?: FieldWidth | string;

  defaultValue?: unknown;

  // Options for Dropdown, Checkbox, Radio
  options?: string[];

  // Text validations
  minLength?: number;
  maxLength?: number;
  regex?: string;

  // Number / Currency validations
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;

  // Date validations
  minDate?: string;
  maxDate?: string;
  disablePastDates?: boolean;
  disableFutureDates?: boolean;

  // File upload
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
  multipleFiles?: boolean;

  // Rating / NPS
  ratingScale?: number;
  npsMinLabel?: string;
  npsMaxLabel?: string;

  // Matrix
  matrixRows?: MatrixRow[];
  matrixColumns?: MatrixColumn[];

  // Repeater
  repeaterFields?: SurveyField[];
  minRepeats?: number;
  maxRepeats?: number;

  // Location
  highAccuracy?: boolean;
  continuousTracking?: boolean;

  // Geotagged photo
  geotagRequired?: boolean;
  includeTimestamp?: boolean;
  allowGalleryUpload?: boolean;
  requireCameraOnly?: boolean;

  // Validation and logic
  validations?: SurveyValidationRule[];
  logic?: SurveyLogicRule[];

  // UI / design
  fieldWidth?: FieldWidth | string;
  cssClass?: string;
  backgroundColor?: string;
  textColor?: string;

    // Layout settings
    sectionStyle?: "plain" | "card" | "highlight";
    columnCount?: number;
    columnGap?: number;
    columnLabels?: string[];
    tabLabels?: string[];
    defaultActiveTab?: string;
    children?: SurveyField[];
    columnChildren?: Record<string, SurveyField[]>;
    tabChildren?: Record<string, SurveyField[]>;
}

export interface SurveyPage {
  id: string;
  title: string;
  description?: string;
  fields: SurveyField[];
}

export interface SurveySchema {
  title: string;
  description?: string;
  pages: SurveyPage[];
  version?: number;
  logic?: SurveyLogicRule[];
}

export interface SurveyAnswerPayload {
  answers: Record<string, unknown>;
  submittedAt?: string;
  savedAt?: string;
  schemaVersion?: number;
}

export function createDefaultSurveySchema(
  title = "Untitled form",
  description = ""
): SurveySchema {
  return {
    title,
    description,
    version: 1,
    pages: [
      {
        id: "page-1",
        title: "Page 1",
        description: "",
        fields: [
          {
            id: `heading-${Date.now()}`,
            type: "Heading",
            label: title || "Untitled form",
            help: description || "Start building your assessment form.",
            width: "100%",
            required: false,
            readOnly: false,
            hidden: false,
          },
        ],
      },
    ],
  };
}

export function normalizeSurveyField(field: Partial<SurveyField>, index = 0): SurveyField {
  return {
    id: field.id || `field-${Date.now()}-${index}`,
    type: field.type || "Text",
    label: field.label || "Untitled field",
    placeholder: field.placeholder || "",
    help: field.help || field.helpText || "",
    helpText: field.helpText || field.help || "",
    required: field.required ?? false,
    readOnly: field.readOnly ?? false,
    hidden: field.hidden ?? false,
    width: field.width || field.fieldWidth || "100%",
    fieldWidth: field.fieldWidth || field.width || "100%",
    options: Array.isArray(field.options) ? field.options : [],
    validations: Array.isArray(field.validations) ? field.validations : [],
    logic: Array.isArray(field.logic) ? field.logic : [],
    sectionStyle: field.sectionStyle || "card",
columnCount: field.columnCount || 2,
columnGap: field.columnGap || 12,
columnLabels: field.columnLabels || ["Column 1", "Column 2"],
tabLabels: field.tabLabels || ["Tab 1", "Tab 2"],
defaultActiveTab: field.defaultActiveTab || "Tab 1",

children: Array.isArray(field.children)
  ? field.children.map((child, childIndex) =>
      normalizeSurveyField(child, childIndex)
    )
  : [],

  columnChildren: field.columnChildren
  ? Object.keys(field.columnChildren).reduce<Record<string, SurveyField[]>>(
      (result, columnKey) => {
        result[columnKey] = Array.isArray(field.columnChildren?.[columnKey])
          ? field.columnChildren[columnKey].map((child, childIndex) =>
              normalizeSurveyField(child, childIndex)
            )
          : [];

        return result;
      },
      {}
    )
  : {},

  tabChildren: field.tabChildren
  ? Object.keys(field.tabChildren).reduce<Record<string, SurveyField[]>>(
      (result, tabKey) => {
        result[tabKey] = Array.isArray(field.tabChildren?.[tabKey])
          ? field.tabChildren[tabKey].map((child, childIndex) =>
              normalizeSurveyField(child, childIndex)
            )
          : [];

        return result;
      },
      {}
    )
  : {},

    minLength: field.minLength,
    maxLength: field.maxLength,
    regex: field.regex,

    min: field.min,
    max: field.max,
    step: field.step,
    prefix: field.prefix,
    suffix: field.suffix,

    minDate: field.minDate,
    maxDate: field.maxDate,
    disablePastDates: field.disablePastDates ?? false,
    disableFutureDates: field.disableFutureDates ?? false,

    allowedFileTypes: field.allowedFileTypes || [],
    maxFileSizeMB: field.maxFileSizeMB,
    multipleFiles: field.multipleFiles ?? false,

    ratingScale: field.ratingScale || 5,
    npsMinLabel: field.npsMinLabel || "Not likely",
    npsMaxLabel: field.npsMaxLabel || "Very likely",

    matrixRows: field.matrixRows || [],
    matrixColumns: field.matrixColumns || [],

    repeaterFields: field.repeaterFields || [],
    minRepeats: field.minRepeats,
    maxRepeats: field.maxRepeats,

    highAccuracy: field.highAccuracy ?? false,
    continuousTracking: field.continuousTracking ?? false,
    geotagRequired: field.geotagRequired ?? false,
    includeTimestamp: field.includeTimestamp ?? false,
    allowGalleryUpload: field.allowGalleryUpload ?? false,
    requireCameraOnly: field.requireCameraOnly ?? false,

    defaultValue: field.defaultValue,
    cssClass: field.cssClass,
    backgroundColor: field.backgroundColor,
    textColor: field.textColor,
  };
}

export function safeParseSurveySchema(
  value?: string | null,
  fallbackTitle = "Untitled form"
): SurveySchema {
  if (!value) return createDefaultSurveySchema(fallbackTitle);

  try {
    const parsed = JSON.parse(value) as Partial<SurveySchema>;

    if (!parsed || !Array.isArray(parsed.pages)) {
      return createDefaultSurveySchema(fallbackTitle);
    }

    return {
      title: parsed.title || fallbackTitle,
      description: parsed.description || "",
      version: parsed.version || 1,
      logic: Array.isArray(parsed.logic) ? parsed.logic : [],
      pages: parsed.pages.map((page, pageIndex) => ({
        id: page.id || `page-${pageIndex + 1}`,
        title: page.title || `Page ${pageIndex + 1}`,
        description: page.description || "",
        fields: Array.isArray(page.fields)
          ? page.fields.map((field, fieldIndex) => normalizeSurveyField(field, fieldIndex))
          : [],
      })),
    };
  } catch {
    return createDefaultSurveySchema(fallbackTitle);
  }
}

export function serializeSurveySchema(schema: SurveySchema): string {
  return JSON.stringify(schema);
}

export function allSurveyFields(schema: SurveySchema): SurveyField[] {
  return schema.pages.flatMap((page) => page.fields || []);
}

export function findFieldById(schema: SurveySchema, fieldId: string): SurveyField | undefined {
  return allSurveyFields(schema).find((field) => field.id === fieldId);
}

export function fieldIcon(name: string) {
  return (
    {
      Text: "T",
      "Long text": "≡",
      Email: "@",
      Number: "#",
      Dropdown: "⌄",
      Checkbox: "✓",
      "Radio group": "◉",
      Date: "▣",
      "File upload": "↑",
      Signature: "✎",
      Rating: "★",
      "NPS score": "10",
      Address: "⌖",
      Currency: "₹",
      Matrix: "▦",
      Repeater: "↻",
      "Live location": "⌖",
      "Geotagged photo": "◉",
      Heading: "H",
      Paragraph: "¶",
      Divider: "—",
      Columns: "▥",
      Section: "□",
      Tabs: "⊞",
    }[name] || "+"
  );
}