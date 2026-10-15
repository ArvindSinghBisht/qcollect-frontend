"use client";

import { useMemo, useState } from "react";
import { getComponentConfig } from "@/lib/survey/componentRegistry";
import {
  fieldIcon,
  MatrixColumn,
  MatrixRow,
  SurveyField,
  SurveyFieldType,
  SurveyPage,
} from "@/types/survey";

interface FieldPropertiesPanelProps {
  field: SurveyField;
  page: SurveyPage;
  onChange: (patch: Partial<SurveyField>) => void;
  onPageTitleChange: (title: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toNumber(value: string) {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function linesToOptions(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function rowsToText(rows?: MatrixRow[]) {
  return (rows || []).map((row) => row.label).join("\n");
}

function columnsToText(columns?: MatrixColumn[]) {
  return (columns || []).map((column) => column.label).join("\n");
}

function textToRows(value: string): MatrixRow[] {
  return linesToOptions(value).map((label) => ({
    id: makeId("row"),
    label,
  }));
}

function textToColumns(value: string): MatrixColumn[] {
  return linesToOptions(value).map((label) => ({
    id: makeId("column"),
    label,
  }));
}

const allowedRepeaterFieldTypes: SurveyFieldType[] = [
  "Text",
  "Long text",
  "Number",
  "Date",
  "Dropdown",
];

function makeRepeaterFieldId(label: string, index: number) {
  return `repeater-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "field"}-${index + 1}`;
}

function normaliseRepeaterFieldType(type?: string): SurveyFieldType {
  const cleanType = (type || "Text").trim();

  return allowedRepeaterFieldTypes.includes(cleanType as SurveyFieldType)
    ? (cleanType as SurveyFieldType)
    : "Text";
}

function repeaterFieldsToText(fields?: SurveyField[]) {
  if (!fields || fields.length === 0) {
    return [
      "Item detail | Text | required",
      "Quantity | Number | optional",
      "Remarks | Long text | optional",
    ].join("\n");
  }

  return fields
    .map((field) => {
      const requiredText = field.required ? "required" : "optional";
      const optionsText =
        field.type === "Dropdown" && field.options?.length
          ? ` | ${field.options.join(", ")}`
          : "";

      return `${field.label} | ${field.type} | ${requiredText}${optionsText}`;
    })
    .join("\n");
}

function textToRepeaterFields(value: string): SurveyField[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [labelPart, typePart, requiredPart, optionsPart] = line
        .split("|")
        .map((item) => item.trim());

      const label = labelPart || `Field ${index + 1}`;
      const type = normaliseRepeaterFieldType(typePart);
      const required = requiredPart?.toLowerCase() === "required";

      const options =
        type === "Dropdown"
          ? (optionsPart || "Option 1, Option 2")
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : undefined;

      return {
        id: makeRepeaterFieldId(label, index),
        type,
        label,
        placeholder:
          type === "Dropdown"
            ? "Select option"
            : type === "Date"
              ? "Select date"
              : `Enter ${label.toLowerCase()}`,
        width: "100%",
        required,
        readOnly: false,
        hidden: false,
        options,
      };
    });
}

function SwitchRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked?: boolean;
  onChange: () => void;
}) {
  return (
    <div className="switchrow">
      <div>
        <b>{title}</b>
        <span>{description}</span>
      </div>
      <button
        type="button"
        className={checked ? "switch on" : "switch"}
        onClick={onChange}
      >
        <i />
      </button>
    </div>
  );
}

export default function FieldPropertiesPanel({
  field,
  page,
  onChange,
  onPageTitleChange,
  onDuplicate,
  onDelete,
}: FieldPropertiesPanelProps) {
  const [tab, setTab] = useState<"General" | "Validation" | "Advanced">("General");

  const config = useMemo(() => getComponentConfig(field.type), [field.type]);

  const isChoiceField =
    field.type === "Dropdown" ||
    field.type === "Radio group" ||
    field.type === "Checkbox";

  const isTextField =
    field.type === "Text" ||
    field.type === "Long text" ||
    field.type === "Email" ||
    field.type === "Address";

  const isNumberField =
    field.type === "Number" ||
    field.type === "Currency" ||
    field.type === "Rating" ||
    field.type === "NPS score";

  const isDateField = field.type === "Date";
  const isFileField = field.type === "File upload";
  const isMatrixField = field.type === "Matrix";
  const isRepeaterField = field.type === "Repeater";
  const isLocationField = field.type === "Live location";
  const isPhotoField = field.type === "Geotagged photo";
  const isLayoutField =
    field.type === "Heading" ||
    field.type === "Paragraph" ||
    field.type === "Divider" ||
    field.type === "Section" ||
    field.type === "Columns" ||
    field.type === "Tabs";

  return (
    <>
      <div className="selection">
        <i>{fieldIcon(field.type)}</i>
        <div>
          <b>{field.label}</b>
          <span>{field.type} field</span>
        </div>
        <button type="button" onClick={onDuplicate}>
          ⎘
        </button>
        <button type="button" onClick={onDelete}>
          ⌫
        </button>
      </div>

      <div className="property-tabs">
        {(["General", "Validation", "Advanced"] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="props">
        {tab === "General" && (
          <>
            {field.type !== "Divider" && (
              <label>
                Field label
                <input
                  value={field.label}
                  onChange={(event) => onChange({ label: event.target.value })}
                />
              </label>
            )}

            {config?.supportsPlaceholder && (
              <label>
                Placeholder
                <input
                  value={field.placeholder || ""}
                  onChange={(event) =>
                    onChange({ placeholder: event.target.value })
                  }
                />
              </label>
            )}

            {config?.supportsHelpText && (
              <label>
                Help text
                <textarea
                  value={field.help || field.helpText || ""}
                  onChange={(event) =>
                    onChange({
                      help: event.target.value,
                      helpText: event.target.value,
                    })
                  }
                />
              </label>
            )}

{isChoiceField && (
  <div className="option-editor">
    <div className="option-editor-head">
      <b>Options</b>
      <button
        type="button"
        onClick={() =>
          onChange({
            options: [
              ...(field.options || []),
              `Option ${(field.options || []).length + 1}`,
            ],
          })
        }
      >
        + Add option
      </button>
    </div>

    <div className="option-list">
      {(field.options && field.options.length > 0
        ? field.options
        : ["Option 1", "Option 2", "Option 3"]
      ).map((option, optionIndex) => (
        <div className="option-row" key={`${option}-${optionIndex}`}>
          <span>{optionIndex + 1}</span>

          <input
            value={option}
            placeholder={`Option ${optionIndex + 1}`}
            onChange={(event) => {
              const nextOptions =
                field.options && field.options.length > 0
                  ? [...field.options]
                  : ["Option 1", "Option 2", "Option 3"];

              nextOptions[optionIndex] = event.target.value;

              onChange({
                options: nextOptions.filter((item) => item.trim() !== ""),
              });
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();

                const nextOptions =
                  field.options && field.options.length > 0
                    ? [...field.options]
                    : ["Option 1", "Option 2", "Option 3"];

                nextOptions.splice(
                  optionIndex + 1,
                  0,
                  `Option ${nextOptions.length + 1}`
                );

                onChange({ options: nextOptions });
              }
            }}
          />

          <button
            type="button"
            onClick={() => {
              const nextOptions = [...(field.options || [])];
              nextOptions.splice(optionIndex, 1);

              onChange({
                options: nextOptions.length ? nextOptions : ["Option 1"],
              });
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>

    <small>
      Press Enter inside any option to create the next option.
    </small>
  </div>
)}

{isRepeaterField && (
  <label>
    Repeater fields
    <textarea
      value={repeaterFieldsToText(field.repeaterFields)}
      onChange={(event) =>
        onChange({
          repeaterFields: textToRepeaterFields(event.target.value),
        })
      }
      placeholder={`Item detail | Text | required
Quantity | Number | optional
Remarks | Long text | optional`}
    />
    <small>
      Format: Label | Type | required/optional. Allowed types: Text, Long text,
      Number, Date, Dropdown.
    </small>
    <small>
      Dropdown example: Condition | Dropdown | required | Good, Average, Poor
    </small>
  </label>
)}

{field.type === "Section" && (
  <label>
    Section style
    <select
      value={field.sectionStyle || "card"}
      onChange={(event) =>
        onChange({
          sectionStyle: event.target.value as "plain" | "card" | "highlight",
        })
      }
    >
      <option value="plain">Plain</option>
      <option value="card">Card</option>
      <option value="highlight">Highlight</option>
    </select>
  </label>
)}

{field.type === "Columns" && (
  <>
    <div className="row">
      <label>
        Column count
        <select
          value={field.columnCount || 2}
          onChange={(event) => {
            const count = Number(event.target.value);
            const currentLabels = field.columnLabels || [];

            onChange({
              columnCount: count,
              columnLabels: Array.from({ length: count }).map(
                (_, index) => currentLabels[index] || `Column ${index + 1}`
              ),
            });
          }}
        >
          <option value={2}>2 columns</option>
          <option value={3}>3 columns</option>
          <option value={4}>4 columns</option>
        </select>
      </label>

      <label>
        Column gap
        <input
          type="number"
          value={field.columnGap ?? 12}
          onChange={(event) =>
            onChange({
              columnGap: Number(event.target.value || 12),
            })
          }
        />
      </label>
    </div>

    <label>
      Column labels
      <textarea
        value={(field.columnLabels || ["Column 1", "Column 2"]).join("\n")}
        onChange={(event) =>
          onChange({
            columnLabels: event.target.value
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
          })
        }
        placeholder="One column label per line"
      />
    </label>
  </>
)}

{field.type === "Tabs" && (
  <>
    <label>
      Tab labels
      <textarea
        value={(field.tabLabels || ["Tab 1", "Tab 2"]).join("\n")}
        onChange={(event) => {
          const labels = event.target.value
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean);

          onChange({
            tabLabels: labels,
            defaultActiveTab:
              labels.includes(field.defaultActiveTab || "")
                ? field.defaultActiveTab
                : labels[0] || "Tab 1",
          });
        }}
        placeholder="One tab label per line"
      />
    </label>

    <label>
      Default active tab
      <select
        value={field.defaultActiveTab || field.tabLabels?.[0] || "Tab 1"}
        onChange={(event) =>
          onChange({
            defaultActiveTab: event.target.value,
          })
        }
      >
        {(field.tabLabels || ["Tab 1", "Tab 2"]).map((tab) => (
          <option key={tab} value={tab}>
            {tab}
          </option>
        ))}
      </select>
    </label>
  </>
)}

            <div className="row">
              {config?.supportsWidth && (
                <label>
                  Field width
                  <select
                    value={field.width || "100%"}
                    onChange={(event) =>
                      onChange({
                        width: event.target.value,
                        fieldWidth: event.target.value,
                      })
                    }
                  >
                    <option>100%</option>
                    <option>75%</option>
                    <option>66%</option>
                    <option>50%</option>
                    <option>33%</option>
                    <option>25%</option>
                  </select>
                </label>
              )}

              <label>
                Page title
                <input
                  value={page.title}
                  onChange={(event) => onPageTitleChange(event.target.value)}
                />
              </label>
            </div>

            {!isLayoutField && (
              <>
                {config?.supportsRequired && (
                  <SwitchRow
                    title="Required field"
                    description="Respondents must answer this field"
                    checked={field.required}
                    onChange={() => onChange({ required: !field.required })}
                  />
                )}

                {config?.supportsReadOnly && (
                  <SwitchRow
                    title="Read only"
                    description="Prevent users from changing this field"
                    checked={field.readOnly}
                    onChange={() => onChange({ readOnly: !field.readOnly })}
                  />
                )}
              </>
            )}

            <SwitchRow
              title="Hidden field"
              description="Hide this component in live form"
              checked={field.hidden}
              onChange={() => onChange({ hidden: !field.hidden })}
            />
          </>
        )}

        {tab === "Validation" && (
          <>
            {isTextField && (
              <>
                <div className="row">
                  <label>
                    Min length
                    <input
                      type="number"
                      value={field.minLength ?? ""}
                      onChange={(event) =>
                        onChange({ minLength: toNumber(event.target.value) })
                      }
                    />
                  </label>

                  <label>
                    Max length
                    <input
                      type="number"
                      value={field.maxLength ?? ""}
                      onChange={(event) =>
                        onChange({ maxLength: toNumber(event.target.value) })
                      }
                    />
                  </label>
                </div>

                <label>
                  Regex pattern
                  <input
                    value={field.regex || ""}
                    onChange={(event) => onChange({ regex: event.target.value })}
                    placeholder="Example: ^[A-Za-z ]+$"
                  />
                </label>
              </>
            )}

            {isNumberField && (
              <>
                <div className="row">
                  <label>
                    Min value
                    <input
                      type="number"
                      value={field.min ?? ""}
                      onChange={(event) =>
                        onChange({ min: toNumber(event.target.value) })
                      }
                    />
                  </label>

                  <label>
                    Max value
                    <input
                      type="number"
                      value={field.max ?? ""}
                      onChange={(event) =>
                        onChange({ max: toNumber(event.target.value) })
                      }
                    />
                  </label>
                </div>

                {(field.type === "Number" || field.type === "Currency") && (
                  <label>
                    Step
                    <input
                      type="number"
                      value={field.step ?? ""}
                      onChange={(event) =>
                        onChange({ step: toNumber(event.target.value) })
                      }
                    />
                  </label>
                )}
              </>
            )}

            {field.type === "Currency" && (
              <div className="row">
                <label>
                  Prefix
                  <input
                    value={field.prefix || ""}
                    onChange={(event) => onChange({ prefix: event.target.value })}
                    placeholder="₹"
                  />
                </label>

                <label>
                  Suffix
                  <input
                    value={field.suffix || ""}
                    onChange={(event) => onChange({ suffix: event.target.value })}
                    placeholder="Optional"
                  />
                </label>
              </div>
            )}

            {isDateField && (
              <>
                <div className="row">
                  <label>
                    Min date
                    <input
                      type="date"
                      value={field.minDate || ""}
                      onChange={(event) =>
                        onChange({ minDate: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    Max date
                    <input
                      type="date"
                      value={field.maxDate || ""}
                      onChange={(event) =>
                        onChange({ maxDate: event.target.value })
                      }
                    />
                  </label>
                </div>

                <SwitchRow
                  title="Disable past dates"
                  description="User cannot select dates before today"
                  checked={field.disablePastDates}
                  onChange={() =>
                    onChange({ disablePastDates: !field.disablePastDates })
                  }
                />

                <SwitchRow
                  title="Disable future dates"
                  description="User cannot select dates after today"
                  checked={field.disableFutureDates}
                  onChange={() =>
                    onChange({ disableFutureDates: !field.disableFutureDates })
                  }
                />
              </>
            )}

            {isFileField && (
              <>
                <label>
                  Allowed file types
                  <input
                    value={(field.allowedFileTypes || []).join(", ")}
                    onChange={(event) =>
                      onChange({
                        allowedFileTypes: event.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="pdf, jpg, jpeg, png"
                  />
                </label>

                <label>
                  Max file size MB
                  <input
                    type="number"
                    value={field.maxFileSizeMB ?? ""}
                    onChange={(event) =>
                      onChange({ maxFileSizeMB: toNumber(event.target.value) })
                    }
                  />
                </label>

                <SwitchRow
                  title="Allow multiple files"
                  description="User can upload more than one file"
                  checked={field.multipleFiles}
                  onChange={() =>
                    onChange({ multipleFiles: !field.multipleFiles })
                  }
                />
              </>
            )}

            {field.type === "Rating" && (
              <label>
                Rating scale
                <select
                  value={field.ratingScale || 5}
                  onChange={(event) =>
                    onChange({ ratingScale: Number(event.target.value) })
                  }
                >
                  <option value={3}>3 stars</option>
                  <option value={5}>5 stars</option>
                  <option value={10}>10 points</option>
                </select>
              </label>
            )}

            {field.type === "NPS score" && (
              <>
                <label>
                  Minimum label
                  <input
                    value={field.npsMinLabel || ""}
                    onChange={(event) =>
                      onChange({ npsMinLabel: event.target.value })
                    }
                  />
                </label>

                <label>
                  Maximum label
                  <input
                    value={field.npsMaxLabel || ""}
                    onChange={(event) =>
                      onChange({ npsMaxLabel: event.target.value })
                    }
                  />
                </label>
              </>
            )}

            {isMatrixField && (
              <>
                <label>
                  Matrix rows
                  <textarea
                    value={rowsToText(field.matrixRows)}
                    onChange={(event) =>
                      onChange({ matrixRows: textToRows(event.target.value) })
                    }
                    placeholder="One row per line"
                  />
                </label>

                <label>
                  Matrix columns
                  <textarea
                    value={columnsToText(field.matrixColumns)}
                    onChange={(event) =>
                      onChange({
                        matrixColumns: textToColumns(event.target.value),
                      })
                    }
                    placeholder="One column per line"
                  />
                </label>
              </>
            )}

            {isRepeaterField && (
              <div className="row">
                <label>
                  Min repeats
                  <input
                    type="number"
                    value={field.minRepeats ?? ""}
                    onChange={(event) =>
                      onChange({ minRepeats: toNumber(event.target.value) })
                    }
                  />
                </label>

                <label>
                  Max repeats
                  <input
                    type="number"
                    value={field.maxRepeats ?? ""}
                    onChange={(event) =>
                      onChange({ maxRepeats: toNumber(event.target.value) })
                    }
                  />
                </label>
              </div>
            )}

            {(isLocationField || isPhotoField) && (
              <>
                <SwitchRow
                  title="High accuracy GPS"
                  description="Use precise device positioning"
                  checked={field.highAccuracy}
                  onChange={() =>
                    onChange({ highAccuracy: !field.highAccuracy })
                  }
                />

                {isLocationField && (
                  <SwitchRow
                    title="Continuous tracking"
                    description="Update coordinates in real time"
                    checked={field.continuousTracking}
                    onChange={() =>
                      onChange({
                        continuousTracking: !field.continuousTracking,
                      })
                    }
                  />
                )}

                {isPhotoField && (
                  <>
                    <SwitchRow
                      title="Require geotag"
                      description="Block photo capture without GPS"
                      checked={field.geotagRequired}
                      onChange={() =>
                        onChange({ geotagRequired: !field.geotagRequired })
                      }
                    />

                    <SwitchRow
                      title="Capture timestamp"
                      description="Store local capture date and time"
                      checked={field.includeTimestamp}
                      onChange={() =>
                        onChange({ includeTimestamp: !field.includeTimestamp })
                      }
                    />

                    <SwitchRow
                      title="Allow gallery upload"
                      description="Allow user to pick existing image"
                      checked={field.allowGalleryUpload}
                      onChange={() =>
                        onChange({
                          allowGalleryUpload: !field.allowGalleryUpload,
                        })
                      }
                    />

                    <SwitchRow
                      title="Camera only"
                      description="Force direct camera capture where supported"
                      checked={field.requireCameraOnly}
                      onChange={() =>
                        onChange({
                          requireCameraOnly: !field.requireCameraOnly,
                        })
                      }
                    />
                  </>
                )}
              </>
            )}

            {!isTextField &&
              !isNumberField &&
              !isDateField &&
              !isFileField &&
              !isMatrixField &&
              !isRepeaterField &&
              !isLocationField &&
              !isPhotoField && (
                <div className="no-selection">
                  No special validation settings for this component.
                </div>
              )}
          </>
        )}

        {tab === "Advanced" && (
          <>
            <label>
              Default value
              <input
                value={
                  typeof field.defaultValue === "string" ||
                  typeof field.defaultValue === "number"
                    ? String(field.defaultValue)
                    : ""
                }
                onChange={(event) =>
                  onChange({ defaultValue: event.target.value })
                }
                placeholder="Optional default value"
              />
            </label>

            <label>
              CSS class
              <input
                value={field.cssClass || ""}
                onChange={(event) =>
                  onChange({ cssClass: event.target.value })
                }
                placeholder="Optional custom class"
              />
            </label>

            <SwitchRow
              title="Read only"
              description="Prevent user changes"
              checked={field.readOnly}
              onChange={() => onChange({ readOnly: !field.readOnly })}
            />

            <SwitchRow
              title="Hidden"
              description="Hide this field from respondents"
              checked={field.hidden}
              onChange={() => onChange({ hidden: !field.hidden })}
            />
          </>
        )}
      </div>
    </>
  );
}