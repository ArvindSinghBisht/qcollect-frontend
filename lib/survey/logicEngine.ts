import { LogicAction, LogicOperator, SurveyField, SurveyLogicRule } from "@/types/survey";

export interface RuntimeFieldState {
  hidden: boolean;
  readOnly: boolean;
  required: boolean;
  value?: unknown;
}

export type SurveyAnswers = Record<string, unknown>;

function isEmptyValue(value: unknown) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

function normalizeValue(value: unknown) {
  if (typeof value === "string") return value.trim().toLowerCase();
  return value;
}

function toComparableNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;

  const parsed = Number(value);

  if (Number.isNaN(parsed)) return undefined;

  return parsed;
}

export function evaluateLogicCondition(
  sourceValue: unknown,
  operator: LogicOperator,
  expectedValue?: unknown
) {
  const current = normalizeValue(sourceValue);
  const expected = normalizeValue(expectedValue);

  switch (operator) {
    case "equals":
      return current === expected;

    case "notEquals":
      return current !== expected;

    case "contains":
      if (Array.isArray(sourceValue)) {
        return sourceValue.map(normalizeValue).includes(expected);
      }

      return String(current ?? "").includes(String(expected ?? ""));

    case "notContains":
      if (Array.isArray(sourceValue)) {
        return !sourceValue.map(normalizeValue).includes(expected);
      }

      return !String(current ?? "").includes(String(expected ?? ""));

    case "greaterThan": {
      const currentNumber = toComparableNumber(sourceValue);
      const expectedNumber = toComparableNumber(expectedValue);

      if (currentNumber === undefined || expectedNumber === undefined) {
        return false;
      }

      return currentNumber > expectedNumber;
    }

    case "lessThan": {
      const currentNumber = toComparableNumber(sourceValue);
      const expectedNumber = toComparableNumber(expectedValue);

      if (currentNumber === undefined || expectedNumber === undefined) {
        return false;
      }

      return currentNumber < expectedNumber;
    }

    case "isEmpty":
      return isEmptyValue(sourceValue);

    case "isNotEmpty":
      return !isEmptyValue(sourceValue);

    default:
      return false;
  }
}

function applyAction(
  state: RuntimeFieldState,
  action: LogicAction,
  targetValue?: unknown
): RuntimeFieldState {
  switch (action) {
    case "show":
      return {
        ...state,
        hidden: false,
      };

    case "hide":
      return {
        ...state,
        hidden: true,
      };

    case "enable":
      return {
        ...state,
        readOnly: false,
      };

    case "disable":
      return {
        ...state,
        readOnly: true,
      };

    case "require":
      return {
        ...state,
        required: true,
      };

    case "optional":
      return {
        ...state,
        required: false,
      };

    case "setValue":
      return {
        ...state,
        value: targetValue,
      };

    default:
      return state;
  }
}

export function getRuntimeFieldState(
    field: SurveyField,
    answers: SurveyAnswers
  ): RuntimeFieldState {
    const activeLogicRules = (field.logic || []).filter((rule) => rule.enabled);
  
    const hasShowLogic = activeLogicRules.some((rule) => rule.action === "show");
  
    let state: RuntimeFieldState = {
      // Important:
      // If field has "show" logic, keep it hidden by default.
      // It will become visible only when condition matches.
      hidden: hasShowLogic ? true : field.hidden ?? false,
      readOnly: field.readOnly ?? false,
      required: field.required ?? false,
      value: answers[field.id] ?? field.defaultValue,
    };
  
    for (const rule of activeLogicRules) {
      const sourceValue = answers[rule.sourceFieldId];
  
      const conditionMatched = evaluateLogicCondition(
        sourceValue,
        rule.operator,
        rule.value
      );
  
      if (conditionMatched) {
        state = applyAction(state, rule.action, rule.targetValue);
      }
    }
  
    return state;
  }

export function shouldShowField(field: SurveyField, answers: SurveyAnswers) {
  return !getRuntimeFieldState(field, answers).hidden;
}

export function getRequiredFields(fields: SurveyField[], answers: SurveyAnswers) {
  return fields.filter((field) => {
    const state = getRuntimeFieldState(field, answers);
    return !state.hidden && state.required;
  });
}

export function getLogicSummary(rule: SurveyLogicRule, fields: SurveyField[]) {
  const source = fields.find((field) => field.id === rule.sourceFieldId);
  const target = fields.find((field) => field.id === rule.targetFieldId);

  return {
    sourceLabel: source?.label || "Unknown field",
    targetLabel: target?.label || "Current field",
    condition: rule.operator,
    value: rule.value,
    action: rule.action,
    targetValue: rule.targetValue,
  };
}