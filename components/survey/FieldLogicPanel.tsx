"use client";

import { SurveyField, SurveyLogicRule, LogicAction, LogicOperator } from "@/types/survey";

interface FieldLogicPanelProps {
  field: SurveyField;
  allFields: SurveyField[];
  onChange: (patch: Partial<SurveyField>) => void;
}

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const operators: { label: string; value: LogicOperator }[] = [
  { label: "Equals", value: "equals" },
  { label: "Does not equal", value: "notEquals" },
  { label: "Contains", value: "contains" },
  { label: "Does not contain", value: "notContains" },
  { label: "Greater than", value: "greaterThan" },
  { label: "Less than", value: "lessThan" },
  { label: "Is empty", value: "isEmpty" },
  { label: "Is not empty", value: "isNotEmpty" },
];

const actions: { label: string; value: LogicAction }[] = [
  { label: "Show this field", value: "show" },
  { label: "Hide this field", value: "hide" },
  { label: "Enable this field", value: "enable" },
  { label: "Disable this field", value: "disable" },
  { label: "Make this field required", value: "require" },
  { label: "Make this field optional", value: "optional" },
  { label: "Set value", value: "setValue" },
];

export default function FieldLogicPanel({
  field,
  allFields,
  onChange,
}: FieldLogicPanelProps) {
  const logicRules = field.logic || [];

  const sourceFields = allFields.filter((item) => item.id !== field.id);

  function addRule() {
    const sourceField = sourceFields[0];

    const newRule: SurveyLogicRule = {
      id: makeId("logic"),
      enabled: true,
      sourceFieldId: sourceField?.id || "",
      operator: "equals",
      value: "",
      action: "show",
      targetFieldId: field.id,
      targetValue: "",
    };

    onChange({
      logic: [...logicRules, newRule],
    });
  }

  function updateRule(ruleId: string, patch: Partial<SurveyLogicRule>) {
    onChange({
      logic: logicRules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              ...patch,
              targetFieldId: field.id,
            }
          : rule
      ),
    });
  }

  function deleteRule(ruleId: string) {
    onChange({
      logic: logicRules.filter((rule) => rule.id !== ruleId),
    });
  }

  if (sourceFields.length === 0) {
    return (
      <div className="no-selection">
        <b>Logic needs at least two fields</b>
        <span>
          Add one more question first. Then you can create conditions like:
          show this field only when another field has a specific answer.
        </span>
      </div>
    );
  }

  return (
    <div className="props">
      <div className="panel-message">
        <b>Field logic</b>
        <span>
          Control when <strong>{field.label}</strong> should show, hide, become
          required, or change value.
        </span>
        <button type="button" className="logic-add-button" onClick={addRule}>
          Add logic rule
          </button>
      </div>

      {logicRules.length === 0 && (
        <div className="no-selection">
          No logic added yet. Click “Add logic rule” to create your first rule.
        </div>
      )}

      {logicRules.map((rule, index) => {
        const selectedOperator = rule.operator;
        const showValueInput =
          selectedOperator !== "isEmpty" && selectedOperator !== "isNotEmpty";

        return (
          <div
            key={rule.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            style={{ marginBottom: 12 }}
          >
            <div className="row">
              <label>
                Rule
                <input value={`Rule ${index + 1}`} readOnly />
              </label>

              <label>
                Status
                <select
                  value={rule.enabled ? "enabled" : "disabled"}
                  onChange={(event) =>
                    updateRule(rule.id, {
                      enabled: event.target.value === "enabled",
                    })
                  }
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </label>
            </div>

            <label>
              When this field
              <select
                value={rule.sourceFieldId}
                onChange={(event) =>
                  updateRule(rule.id, {
                    sourceFieldId: event.target.value,
                  })
                }
              >
                {sourceFields.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} ({item.type})
                  </option>
                ))}
              </select>
            </label>

            <div className="row">
              <label>
                Condition
                <select
                  value={rule.operator}
                  onChange={(event) =>
                    updateRule(rule.id, {
                      operator: event.target.value as LogicOperator,
                    })
                  }
                >
                  {operators.map((operator) => (
                    <option key={operator.value} value={operator.value}>
                      {operator.label}
                    </option>
                  ))}
                </select>
              </label>

              {showValueInput && (
                <label>
                  Value
                  <input
                    value={String(rule.value ?? "")}
                    onChange={(event) =>
                      updateRule(rule.id, {
                        value: event.target.value,
                      })
                    }
                    placeholder="Enter comparison value"
                  />
                </label>
              )}
            </div>

            <label>
              Then
              <select
                value={rule.action}
                onChange={(event) =>
                  updateRule(rule.id, {
                    action: event.target.value as LogicAction,
                  })
                }
              >
                {actions.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>
            </label>

            {rule.action === "setValue" && (
              <label>
                Value to set
                <input
                  value={String(rule.targetValue ?? "")}
                  onChange={(event) =>
                    updateRule(rule.id, {
                      targetValue: event.target.value,
                    })
                  }
                  placeholder="Auto-filled value"
                />
              </label>
            )}

            <div className="row">
              <button
                type="button"
                className="save"
                onClick={() =>
                  updateRule(rule.id, {
                    enabled: !rule.enabled,
                  })
                }
              >
                {rule.enabled ? "Disable rule" : "Enable rule"}
              </button>

              <button
                type="button"
                className="publish"
                onClick={() => deleteRule(rule.id)}
              >
                Delete rule
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}