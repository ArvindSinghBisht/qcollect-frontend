"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, MouseEvent, TouchEvent } from "react";
import ComponentPalette from "@/components/survey/ComponentPalette";
import { createFieldFromComponent } from "@/lib/survey/componentRegistry";
import type { SurveyField, SurveySchema, SurveyFieldType } from "@/types/survey";
import { createDefaultSurveySchema } from "@/types/survey";
import FieldPropertiesPanel from "@/components/survey/FieldPropertiesPanel";
import FieldLogicPanel from "@/components/survey/FieldLogicPanel";
import { getRuntimeFieldState } from "@/lib/survey/logicEngine";
import {
  validateSchemaBeforePublish,
  validateSurveyAnswers,
} from "@/lib/survey/validationEngine";

function getDroppedFieldType(event: DragEvent<HTMLElement>) {
  return (
    event.dataTransfer.getData("application/qcollect-component") ||
    event.dataTransfer.getData("type") ||
    event.dataTransfer.getData("text/plain")
  );
}

function mapGroupedChildren(
  groupedChildren: Record<string, SurveyField[]> | undefined,
  mapper: (fields: SurveyField[]) => SurveyField[]
) {
  if (!groupedChildren) return groupedChildren;

  return Object.keys(groupedChildren).reduce<Record<string, SurveyField[]>>(
    (result, groupKey) => {
      result[groupKey] = mapper(groupedChildren[groupKey] || []);
      return result;
    },
    {}
  );
}

function mapColumnChildren(
  columnChildren: Record<string, SurveyField[]> | undefined,
  mapper: (fields: SurveyField[]) => SurveyField[]
) {
  return mapGroupedChildren(columnChildren, mapper);
}

function mapTabChildren(
  tabChildren: Record<string, SurveyField[]> | undefined,
  mapper: (fields: SurveyField[]) => SurveyField[]
) {
  return mapGroupedChildren(tabChildren, mapper);
}

function findFieldInList(
  fields: SurveyField[],
  fieldId: string
): SurveyField | undefined {
  for (const item of fields) {
    if (item.id === fieldId) {
      return item;
    }

    const childMatch = findFieldInList(item.children || [], fieldId);

    if (childMatch) {
      return childMatch;
    }

    for (const columnFields of Object.values(item.columnChildren || {})) {
      const columnMatch = findFieldInList(columnFields || [], fieldId);

      if (columnMatch) {
        return columnMatch;
      }
    }

    for (const tabFields of Object.values(item.tabChildren || {})) {
      const tabMatch = findFieldInList(tabFields || [], fieldId);

      if (tabMatch) {
        return tabMatch;
      }
    }
  }

  return undefined;
}

function flattenFields(fields: SurveyField[]): SurveyField[] {
  return fields.flatMap((field) => {
    const childFields = flattenFields(field.children || []);

    const columnFields = Object.values(field.columnChildren || {}).flatMap(
      (columnList) => flattenFields(columnList || [])
    );

    const tabFields = Object.values(field.tabChildren || {}).flatMap((tabList) =>
      flattenFields(tabList || [])
    );

    return [field, ...childFields, ...columnFields, ...tabFields];
  });
}

function updateFieldInList(
  fields: SurveyField[],
  fieldId: string,
  patch: Partial<SurveyField>
): SurveyField[] {
  return fields.map((item) => {
    if (item.id === fieldId) {
      return {
        ...item,
        ...patch,
      };
    }

    return {
      ...item,
      children: item.children
        ? updateFieldInList(item.children, fieldId, patch)
        : item.children,
      columnChildren: mapColumnChildren(item.columnChildren, (columnFields) =>
        updateFieldInList(columnFields, fieldId, patch)
      ),
      tabChildren: mapTabChildren(item.tabChildren, (tabFields) =>
        updateFieldInList(tabFields, fieldId, patch)
      ),
    };
  });
}

function removeFieldFromList(
  fields: SurveyField[],
  fieldId: string
): SurveyField[] {
  return fields
    .filter((item) => item.id !== fieldId)
    .map((item) => ({
      ...item,
      children: item.children
        ? removeFieldFromList(item.children, fieldId)
        : item.children,
      columnChildren: mapColumnChildren(item.columnChildren, (columnFields) =>
        removeFieldFromList(columnFields, fieldId)
      ),
      tabChildren: mapTabChildren(item.tabChildren, (tabFields) =>
        removeFieldFromList(tabFields, fieldId)
      ),
    }));
}

function duplicateFieldInList(
  fields: SurveyField[],
  fieldId: string
): { fields: SurveyField[]; copy?: SurveyField } {
  const index = fields.findIndex((item) => item.id === fieldId);

  if (index >= 0) {
    const copy: SurveyField = {
      ...fields[index],
      id: `field-${Date.now()}`,
      label: `${fields[index].label} copy`,
    };

    const nextFields = [...fields];
    nextFields.splice(index + 1, 0, copy);

    return {
      fields: nextFields,
      copy,
    };
  }

  let copiedField: SurveyField | undefined;

  const nextFields = fields.map((item) => {
    const childResult = duplicateFieldInList(item.children || [], fieldId);

    if (childResult.copy) {
      copiedField = childResult.copy;

      return {
        ...item,
        children: childResult.fields,
      };
    }

    let columnCopiedField: SurveyField | undefined;

    const nextColumnChildren = mapColumnChildren(
      item.columnChildren,
      (columnFields) => {
        const columnResult = duplicateFieldInList(columnFields, fieldId);

        if (columnResult.copy) {
          columnCopiedField = columnResult.copy;
        }

        return columnResult.fields;
      }
    );

    if (columnCopiedField) {
      copiedField = columnCopiedField;

      return {
        ...item,
        columnChildren: nextColumnChildren,
      };
    }

    let tabCopiedField: SurveyField | undefined;

    const nextTabChildren = mapTabChildren(item.tabChildren, (tabFields) => {
      const tabResult = duplicateFieldInList(tabFields, fieldId);

      if (tabResult.copy) {
        tabCopiedField = tabResult.copy;
      }

      return tabResult.fields;
    });

    if (tabCopiedField) {
      copiedField = tabCopiedField;

      return {
        ...item,
        tabChildren: nextTabChildren,
      };
    }

    return item;
  });

  return {
    fields: nextFields,
    copy: copiedField,
  };
}

function moveFieldInList(
  fields: SurveyField[],
  fieldId: string,
  direction: -1 | 1
): SurveyField[] {
  const index = fields.findIndex((item) => item.id === fieldId);
  const target = index + direction;

  if (index >= 0) {
    if (target < 0 || target >= fields.length) {
      return fields;
    }

    const nextFields = [...fields];

    [nextFields[index], nextFields[target]] = [
      nextFields[target],
      nextFields[index],
    ];

    return nextFields;
  }

  return fields.map((item) => ({
    ...item,
    children: item.children
      ? moveFieldInList(item.children, fieldId, direction)
      : item.children,
    columnChildren: mapColumnChildren(item.columnChildren, (columnFields) =>
      moveFieldInList(columnFields, fieldId, direction)
    ),
    tabChildren: mapTabChildren(item.tabChildren, (tabFields) =>
      moveFieldInList(tabFields, fieldId, direction)
    ),
  }));
}

interface SurveyBuilderProps {
  initialSchema?: SurveySchema;
  formName?: string;
  published?: boolean;
  version?: number;
  backHref?: string;
  fillHref?: string;
  reviewHref?: string;
  onSaveDraft: (schema: SurveySchema) => Promise<void>;
  onPublish: (schema: SurveySchema) => Promise<void>;
}

export default function SurveyBuilder({
  initialSchema,
  formName = "Untitled form",
  published = false,
  version,
  backHref = "/projects",
  fillHref,
  reviewHref = "/submissions/pending",
  onSaveDraft,
  onPublish,
}: SurveyBuilderProps) {
  const [schema, setSchema] = useState<SurveySchema>(initialSchema || createDefaultSurveySchema(formName));
  const [pageId, setPageId] = useState(schema.pages[0]?.id || "page-1");
  const [selected, setSelected] = useState(schema.pages[0]?.fields[0]?.id || "");
  const [rightTab, setRightTab] = useState("Properties");
  const [bottom, setBottom] = useState("JSON");
  const [bottomOpen, setBottomOpen] = useState(true);
  const [dark, setDark] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [preview, setPreview] = useState(false);
const [device, setDevice] = useState("Desktop");
  const [status, setStatus] = useState("All changes saved locally");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [jsonText, setJsonText] = useState(JSON.stringify(schema, null, 2));
  const [jsonError, setJsonError] = useState("");
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, unknown>>({});
  const [previewErrors, setPreviewErrors] = useState<Record<string, string>>({});

  const history = useRef<SurveySchema[]>([]);
  const future = useRef<SurveySchema[]>([]);

  const page = schema.pages.find((p) => p.id === pageId) || schema.pages[0] || { id: "page-1", title: "Page 1", fields: [] };
  const field = findFieldInList(page.fields || [], selected);
  const allFields = schema.pages.flatMap((p) => flattenFields(p.fields || []));

  useEffect(() => {
    const next = initialSchema || createDefaultSurveySchema(formName);
    setSchema(next);
    setPageId(next.pages[0]?.id || "page-1");
    setSelected(next.pages[0]?.fields[0]?.id || "");
    setJsonText(JSON.stringify(next, null, 2));
  }, [initialSchema, formName]);

  function commit(next: SurveySchema) {
    history.current.push(schema);
    future.current = [];
    setSchema(next);
    setStatus("Unsaved changes");
  }

  useEffect(() => {
    setJsonText(JSON.stringify(schema, null, 2));
  }, [schema]);

  function updateSchemaTitle(title: string) {
    commit({ ...schema, title });
  }

  function updatePageTitle(title: string) {
    commit({ ...schema, pages: schema.pages.map((p) => (p.id === page.id ? { ...p, title } : p)) });
  }

  function updateField(patch: Partial<SurveyField>) {
    if (!field) return;
  
    commit({
      ...schema,
      pages: schema.pages.map((p) =>
        p.id === page.id
          ? {
              ...p,
              fields: updateFieldInList(p.fields, selected, patch),
            }
          : p
      ),
    });
  }

  function addField(type: SurveyFieldType | string, index?: number) {
    const newField = createFieldFromComponent(type);
  
    const fields = [...(page.fields || [])];
    fields.splice(index ?? fields.length, 0, newField);
  
    commit({
      ...schema,
      pages: schema.pages.map((p) =>
        p.id === page.id
          ? {
              ...p,
              fields,
            }
          : p
      ),
    });
  
    setSelected(newField.id);
  }

  function addChildField(parentFieldId: string, type: SurveyFieldType | string) {
    const newField = createFieldFromComponent(type);
  
    function appendChild(fields: SurveyField[]): SurveyField[] {
      return fields.map((item) => {
        if (item.id === parentFieldId) {
          return {
            ...item,
            children: [...(item.children || []), newField],
          };
        }
  
        return {
          ...item,
          children: item.children ? appendChild(item.children) : item.children,
          columnChildren: mapColumnChildren(item.columnChildren, (columnFields) =>
            appendChild(columnFields)
          ),
          tabChildren: mapTabChildren(item.tabChildren, (tabFields) =>
            appendChild(tabFields)
          ),
        };
      });
    }
  
    commit({
      ...schema,
      pages: schema.pages.map((p) =>
        p.id === page.id
          ? {
              ...p,
              fields: appendChild(p.fields),
            }
          : p
      ),
    });
  
    setSelected(newField.id);
  }

  function addColumnChildField(
    parentFieldId: string,
    columnKey: string,
    type: SurveyFieldType | string
  ) {
    const newField = createFieldFromComponent(type);
  
    function appendColumnChild(fields: SurveyField[]): SurveyField[] {
      return fields.map((item) => {
        if (item.id === parentFieldId) {
          const currentColumnChildren = item.columnChildren || {};
  
          return {
            ...item,
            columnChildren: {
              ...currentColumnChildren,
              [columnKey]: [...(currentColumnChildren[columnKey] || []), newField],
            },
          };
        }
  
        return {
          ...item,
          children: item.children
            ? appendColumnChild(item.children)
            : item.children,
          columnChildren: mapColumnChildren(item.columnChildren, (columnFields) =>
            appendColumnChild(columnFields)
          ),
          tabChildren: mapTabChildren(item.tabChildren, (tabFields) =>
            appendColumnChild(tabFields)
          ),
        };
      });
    }
  
    commit({
      ...schema,
      pages: schema.pages.map((p) =>
        p.id === page.id
          ? {
              ...p,
              fields: appendColumnChild(p.fields),
            }
          : p
      ),
    });
  
    setSelected(newField.id);
  }

  function addTabChildField(
    parentFieldId: string,
    tabKey: string,
    type: SurveyFieldType | string
  ) {
    const newField = createFieldFromComponent(type);
  
    function appendTabChild(fields: SurveyField[]): SurveyField[] {
      return fields.map((item) => {
        if (item.id === parentFieldId) {
          const currentTabChildren = item.tabChildren || {};
  
          return {
            ...item,
            tabChildren: {
              ...currentTabChildren,
              [tabKey]: [...(currentTabChildren[tabKey] || []), newField],
            },
          };
        }
  
        return {
          ...item,
          children: item.children ? appendTabChild(item.children) : item.children,
          columnChildren: mapColumnChildren(item.columnChildren, (columnFields) =>
            appendTabChild(columnFields)
          ),
          tabChildren: mapTabChildren(item.tabChildren, (tabFields) =>
            appendTabChild(tabFields)
          ),
        };
      });
    }
  
    commit({
      ...schema,
      pages: schema.pages.map((p) =>
        p.id === page.id
          ? {
              ...p,
              fields: appendTabChild(p.fields),
            }
          : p
      ),
    });
  
    setSelected(newField.id);
  }

  function removeField() {
    if (!field) return;
  
    commit({
      ...schema,
      pages: schema.pages.map((p) =>
        p.id === page.id
          ? {
              ...p,
              fields: removeFieldFromList(p.fields, field.id),
            }
          : p
      ),
    });
  
    setSelected("");
  }

  function duplicateField() {
    if (!field) return;
  
    const result = duplicateFieldInList(page.fields, field.id);
  
    commit({
      ...schema,
      pages: schema.pages.map((p) =>
        p.id === page.id
          ? {
              ...p,
              fields: result.fields,
            }
          : p
      ),
    });
  
    if (result.copy) {
      setSelected(result.copy.id);
    }
  }

  function moveField(fieldId: string, direction: -1 | 1) {
    commit({
      ...schema,
      pages: schema.pages.map((p) =>
        p.id === page.id
          ? {
              ...p,
              fields: moveFieldInList(p.fields, fieldId, direction),
            }
          : p
      ),
    });
  }

  function undo() {
    const previous = history.current.pop();
    if (previous) {
      future.current.push(schema);
      setSchema(previous);
      setStatus("Unsaved changes");
    }
  }

  function redo() {
    const next = future.current.pop();
    if (next) {
      history.current.push(schema);
      setSchema(next);
      setStatus("Unsaved changes");
    }
  }

  useEffect(() => {
    function keyHandler(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
      }
      const target = event.target;
      if ((event.key === "Delete" || event.key === "Backspace") && !(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) {
        removeField();
      }
    }
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  });

  function onJson(value: string) {
    setJsonText(value);
    try {
      const next = JSON.parse(value) as SurveySchema;
      if (!next.title || !Array.isArray(next.pages)) throw new Error("Invalid schema");
      setJsonError("");
      setSchema(next);
      setStatus("Unsaved changes");
    } catch {
      setJsonError("Invalid schema — fix JSON to apply changes");
    }
  }

  async function handleSaveDraft() {
    try {
      setSaving(true);
      setStatus("Saving draft…");
      await onSaveDraft(schema);
      setStatus("Draft saved");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Draft save failed");
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    try {
      const schemaIssues = validateSchemaBeforePublish(schema);

if (schemaIssues.length > 0) {
  setStatus(`Fix ${schemaIssues.length} issue(s) before publishing`);
  alert(schemaIssues.join("\n"));
  return;
}
      setPublishing(true);
      setStatus("Publishing…");
      await onSaveDraft(schema);
      await onPublish(schema);
      setStatus("Published successfully");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Publish failed");
      throw error;
    } finally {
      setPublishing(false);
    }
  }

  function handlePreviewValidation() {
    const result = validateSurveyAnswers(schema, previewAnswers);
  
    setPreviewErrors(result.errors);
  
    if (result.valid) {
      setStatus("Preview validation passed");
    } else {
      setStatus(`Preview has ${Object.keys(result.errors).length} validation issue(s)`);
    }
  }

  const deviceWidth = device === "Mobile" ? 390 : device === "Tablet" ? 768 : 900;

  return (
    <main className={dark ? "survey-app dark" : "survey-app"}>
      <header className="topbar">
      <div className="builder-title">
  <div>
    <span className="eyebrow">Form Builder</span>
    <input
      className="formname-input"
      value={schema.title}
      onChange={(e) => updateSchemaTitle(e.target.value)}
      aria-label="Form title"
    />
  </div>

  <span className="badge">
    {published
      ? `Published${version ? ` v${version}` : ""}`
      : version
        ? `Draft v${version}`
        : "Draft"}
  </span>
</div>
        <div className="top-actions">
          <span className="saved"><i /> {status}</span>
          {fillHref ? <Link href={fillHref}>Open live ↗</Link> : null}
          <Link href={reviewHref}>Submissions</Link>
          <Link href={backHref}>Back</Link>
          <button className="iconbtn" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? "☀" : "☾"}</button>
          <button className="preview" onClick={() => setPreview(!preview)}>▷ Preview</button>
          <button className="save" disabled={saving || publishing} onClick={handleSaveDraft}>{saving ? "Saving…" : "Save draft"}</button>
          <button className="publish" disabled={publishing || saving} onClick={handlePublish}>{publishing ? "Publishing…" : "Publish"}</button>
        </div>
      </header>

      <nav className="toolbar">
        <div className="toolset">
          <button title="Undo" onClick={undo} disabled={!history.current.length}>↶</button>
          <button title="Redo" onClick={redo} disabled={!future.current.length}>↷</button>
          <span />
          <button
  type="button"
  onClick={() => navigator.clipboard?.writeText(JSON.stringify(schema, null, 2))}
>
  Copy schema
</button>
        </div>
        <div className="viewtools">
  

  <div className="zoom">
    <button type="button" onClick={() => setZoom(Math.max(25, zoom - 10))}>
      −
    </button>
    <b>{zoom}%</b>
    <button type="button" onClick={() => setZoom(Math.min(160, zoom + 10))}>
      +
    </button>
  </div>
</div>
      </nav>

      <section className="workspace">
      <aside className="left">
  <ComponentPalette onAddField={addField} />
</aside>

        <div className="page-rail">
          <button className="rail-title">Pages <span>＋</span></button>
          {schema.pages.map((p, index) => (
            <button onClick={() => { setPageId(p.id); setSelected(""); }} className={p.id === pageId ? "active" : ""} key={p.id}>
              <b>{index + 1}</b><span>{p.title}<small>{p.fields.length} components</small></span><i>⋮</i>
            </button>
          ))}
          <button className="add-page" onClick={() => { const p = { id: `page-${Date.now()}`, title: "Untitled page", fields: [] }; commit({ ...schema, pages: [...schema.pages, p] }); setPageId(p.id); }}>＋ Add page</button>
        </div>

        <section className="canvas-wrap">
          <div className="canvas-head">
            <span>Page {schema.pages.indexOf(page) + 1} of {schema.pages.length}</span>
            <div className="device-switcher">
  {preview &&
    ["Desktop", "Tablet", "Mobile"].map((d) => (
      <button
        type="button"
        className={device === d ? "active" : ""}
        onClick={() => setDevice(d)}
        key={d}
      >
        {d === "Desktop" ? "Desktop" : d === "Tablet" ? "Tablet" : "Mobile"}
      </button>
    ))}
</div>
            <span>Canvas · {device}</span>
          </div>
          <div className="canvas-scroll">
          <div
  className="canvas"
  style={{
    width: preview ? deviceWidth : 760,
    transform: `scale(${Math.min(zoom, 130) / 100})`,
    transformOrigin: "top center",
  }}
  onDragOver={(e) => e.preventDefault()}
onDrop={(e) => {
  e.preventDefault();

  const type = getDroppedFieldType(e).trim();

  if (type) {
    addField(type);
  }
}}>
              <div className="page-card">
                <div className="form-head"><span className="mini-logo">Q</span><div><h1>{schema.title}</h1><p>{page.title} · Fields marked <em>*</em> are required</p></div><button>•••</button></div>
                <div className="fields">
                  {page.fields.length === 0 && <div className="empty">＋<b>Drop components here</b><span>or double-click a component in the library</span></div>}
                  {page.fields.map((f, index) => {
  const runtimeState = getRuntimeFieldState(f, previewAnswers);

  if (preview && runtimeState.hidden) {
    return null;
  }

  return (
    <BuilderFieldView
  key={f.id}
  field={{
    ...f,
    required: runtimeState.required,
    readOnly: runtimeState.readOnly,
  }}
  value={previewAnswers[f.id]}
  error={previewErrors[f.id]}
  selected={selected === f.id && !preview}
  preview={preview}
  onValueChange={(value) => {
    setPreviewAnswers((current) => ({
      ...current,
      [f.id]: value,
    }));

    setPreviewErrors((current) => {
      const next = { ...current };
      delete next[f.id];
      return next;
    });
  }}
  onSelect={() => setSelected(f.id)}
  onDuplicate={duplicateField}
  onDelete={removeField}
  onMoveUp={() => moveField(selected || f.id, -1)}
onMoveDown={() => moveField(selected || f.id, 1)}
onDrop={(type) => addField(type, index)}
selectedId={selected}
previewAnswers={previewAnswers}
previewErrors={previewErrors}
onAnswerChange={(fieldId, value) => {
  setPreviewAnswers((current) => ({
    ...current,
    [fieldId]: value,
  }));

  setPreviewErrors((current) => {
    const next = { ...current };
    delete next[fieldId];
    return next;
  });
}}
onSelectField={setSelected}
onAddChildField={addChildField}
onAddColumnChildField={addColumnChildField}
onAddTabChildField={addTabChildField}
/>
  );
})}
                </div>
                <div className="form-footer">
  <span>
    Powered by <b>QCollect</b>
  </span>

  <div>
    <button disabled={schema.pages.indexOf(page) === 0}>
      Back
    </button>

    {preview && (
      <button type="button" className="save" onClick={handlePreviewValidation}>
        Validate
      </button>
    )}

    <button
      className="next"
      onClick={() => {
        const i = schema.pages.indexOf(page);
        if (i < schema.pages.length - 1) {
          setPageId(schema.pages[i + 1].id);
        }
      }}
    >
      Next →
    </button>
  </div>
</div>
              </div>
            </div>
          </div>
        </section>

        <aside className="right">
  <div className="right-tabs">
    {["Properties", "Logic", "Design"].map((tab) => (
      <button
        className={rightTab === tab ? "active" : ""}
        onClick={() => setRightTab(tab)}
        key={tab}
      >
        {tab}
      </button>
    ))}
  </div>

  {field ? (
    rightTab === "Properties" ? (
      <FieldPropertiesPanel
        field={field}
        page={page}
        onChange={updateField}
        onPageTitleChange={updatePageTitle}
        onDuplicate={duplicateField}
        onDelete={removeField}
      />
    ) : rightTab === "Logic" ? (
      <FieldLogicPanel
        field={field}
        allFields={allFields}
        onChange={updateField}
      />
    ) : (
      <div className="no-selection">
        <b>Design settings coming next</b>
        <span>
          Here we will add spacing, alignment, field style, section style,
          and mobile layout settings.
        </span>
      </div>
    )
  ) : (
    <div className="no-selection">
      Select a component to edit its properties.
    </div>
  )}
</aside>
      </section>

      <section className={bottomOpen ? "bottom" : "bottom closed"}>
        <div className="bottom-tabs">{["JSON", "Logic", "Variables", "Events", "API", "Console"].map((tab) => <button className={bottom === tab ? "active" : ""} onClick={() => { setBottom(tab); setBottomOpen(true); }} key={tab}>{tab === "JSON" ? "{} " : ""}{tab}</button>)}<span /><button onClick={() => setBottomOpen(!bottomOpen)}>{bottomOpen ? "⌄" : "⌃"}</button></div>
        {bottomOpen && <div className="bottom-body">{bottom === "JSON" ? <><div className="code-gutter">1<br />2<br />3<br />4<br />5<br />6<br />7</div><textarea spellCheck={false} value={jsonText} onChange={(e) => onJson(e.target.value)} /><div className="json-actions"><button onClick={() => setJsonText(JSON.stringify(schema, null, 2))}>Format</button><button onClick={() => navigator.clipboard?.writeText(jsonText)}>Copy</button><button onClick={() => { const blob = new Blob([jsonText], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "qcollect-schema.json"; a.click(); }}>Export</button></div>{jsonError && <span className="json-error">{jsonError}</span>}</> : <div className="panel-message"><b>{bottom} workspace</b><span>Configure {bottom.toLowerCase()} for the selected component and form.</span><button>＋ Add</button></div>}</div>}
      </section>
    </main>
  );
}

function BuilderFieldView({
  field,
  value,
  error,
  selected,
  preview,
  onValueChange,
  onSelect,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDrop,
selectedId,
previewAnswers,
previewErrors,
onAnswerChange,
onSelectField,
onAddChildField,
onAddColumnChildField,
onAddTabChildField,
}: {
  field: SurveyField;
  value?: unknown;
  error?: string;
  selected: boolean;
  preview?: boolean;
  onValueChange?: (value: unknown) => void;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDrop: (type: string) => void;
  selectedId?: string;
previewAnswers?: Record<string, unknown>;
previewErrors?: Record<string, string>;
onAnswerChange?: (fieldId: string, value: unknown) => void;
onSelectField?: (fieldId: string) => void;
onAddChildField?: (parentFieldId: string, type: SurveyFieldType | string) => void;
onAddColumnChildField?: (
  parentFieldId: string,
  columnKey: string,
  type: SurveyFieldType | string
) => void;
onAddTabChildField?: (
  parentFieldId: string,
  tabKey: string,
  type: SurveyFieldType | string
) => void;
}) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [geoError, setGeoError] = useState("");
  const [tracking, setTracking] = useState(false);
  const [photo, setPhoto] = useState("");
  const watch = useRef<number | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
const [isSigning, setIsSigning] = useState(false);

  const selectedOptions = Array.isArray(value) ? value.map(String) : [];

  function stopTracking() {
    if (watch.current !== null) {
      navigator.geolocation.clearWatch(watch.current);
    }

    watch.current = null;
    setTracking(false);
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      setGeoError("Location is not supported on this device.");
      return;
    }

    setGeoError("");

    const success = (pos: GeolocationPosition) => {
      setPosition(pos);

      onValueChange?.({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: new Date(pos.timestamp).toISOString(),
      });

      if (!field.continuousTracking) {
        setTracking(false);
      }
    };

    const fail = (error: GeolocationPositionError) => {
      setGeoError(
        error.code === 1
          ? "Location permission was denied."
          : "Unable to determine location."
      );
      setTracking(false);
    };

    if (field.continuousTracking) {
      setTracking(true);
      watch.current = navigator.geolocation.watchPosition(success, fail, {
        enableHighAccuracy: field.highAccuracy,
        maximumAge: 0,
      });
    } else {
      navigator.geolocation.getCurrentPosition(success, fail, {
        enableHighAccuracy: field.highAccuracy,
        maximumAge: 0,
      });
    }
  }

  useEffect(() => {
    const canvas = signatureCanvasRef.current;
  
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
  
      canvas.width = Math.max(500, Math.floor(rect.width || 500));
      canvas.height = 180;
  
      const context = canvas.getContext("2d");
  
      if (context) {
        context.lineWidth = 2.5;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = "#0f172a";
      }
    }
  
    return () => {
      if (watch.current !== null) {
        navigator.geolocation.clearWatch(watch.current);
      }
    };
  }, []);

  function takePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    const apply = (pos?: GeolocationPosition) => {
      if (pos) {
        setPosition(pos);
      }

      setPhoto(previewUrl);
      setGeoError("");

      onValueChange?.({
        fileName: file.name,
        fileType: file.type,
        size: file.size,
        previewUrl,
        latitude: pos?.coords.latitude,
        longitude: pos?.coords.longitude,
        accuracy: pos?.coords.accuracy,
        timestamp: new Date(pos?.timestamp || Date.now()).toISOString(),
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        apply,
        (error) => {
          if (field.geotagRequired) {
            setGeoError(
              error.code === 1
                ? "Allow location access to attach a geotag."
                : "A GPS fix is required before capture."
            );
            event.target.value = "";
          } else {
            apply();
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
      apply();
    }
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
  
    if (files.length === 0) return;
  
    const mappedFiles = files.map((file) => ({
      fileName: file.name,
      fileType: file.type,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
    }));
  
    if (field.multipleFiles) {
      onValueChange?.(mappedFiles);
    } else {
      onValueChange?.(mappedFiles[0]);
    }
  }

  function getSignaturePoint(
    event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
  ) {
    const canvas = signatureCanvasRef.current;
  
    if (!canvas) return null;
  
    const rect = canvas.getBoundingClientRect();
  
    let clientX = 0;
    let clientY = 0;
  
    if ("touches" in event) {
      const touch = event.touches[0] || event.changedTouches[0];
  
      if (!touch) return null;
  
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
  
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  }
  
  function startSignature(
    event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
  ) {
    if (!preview || field.readOnly) return;
  
    event.preventDefault();
  
    const canvas = signatureCanvasRef.current;
  
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
  
      if (canvas.width !== Math.floor(rect.width || 500)) {
        canvas.width = Math.max(500, Math.floor(rect.width || 500));
        canvas.height = 180;
      }
  
      const context = canvas.getContext("2d");
  
      if (context) {
        context.lineWidth = 2.5;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = "#0f172a";
      }
    }
  
    const point = getSignaturePoint(event);
  
    if (!canvas || !point) return;
  
    const context = canvas.getContext("2d");
  
    if (!context) return;
  
    context.beginPath();
    context.moveTo(point.x, point.y);
    setIsSigning(true);
  }
  
  function drawSignature(
    event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
  ) {
    if (!isSigning || !preview || field.readOnly) return;
  
    event.preventDefault();
  
    const canvas = signatureCanvasRef.current;
    const point = getSignaturePoint(event);
  
    if (!canvas || !point) return;
  
    const context = canvas.getContext("2d");
  
    if (!context) return;
  
    context.lineTo(point.x, point.y);
    context.stroke();
  }
  
  function endSignature() {
    if (!isSigning) return;
  
    setIsSigning(false);
  
    const canvas = signatureCanvasRef.current;
  
    if (!canvas) return;
  
    onValueChange?.({
      signatureDataUrl: canvas.toDataURL("image/png"),
      timestamp: new Date().toISOString(),
    });
  }
  
  function clearSignature() {
    const canvas = signatureCanvasRef.current;
  
    if (!canvas) return;
  
    const context = canvas.getContext("2d");
  
    if (!context) return;
  
    context.clearRect(0, 0, canvas.width, canvas.height);
  
    onValueChange?.("");
  }

  function getRepeaterRows() {
    return Array.isArray(value)
      ? (value as Record<string, unknown>[])
      : [];
  }
  
  function getRepeaterFields() {
    if (field.repeaterFields && field.repeaterFields.length > 0) {
      return field.repeaterFields;
    }
  
    return [
      {
        id: "repeater-text",
        type: "Text",
        label: "Item detail",
        placeholder: "Enter detail",
        width: "100%",
        required: false,
        readOnly: false,
      },
    ] as SurveyField[];
  }
  
  function addRepeaterRow() {
    const rows = getRepeaterRows();
  
    if (field.maxRepeats && rows.length >= field.maxRepeats) {
      return;
    }
  
    onValueChange?.([...rows, {}]);
  }
  
  function removeRepeaterRow(rowIndex: number) {
    const rows = getRepeaterRows();
  
    if (field.minRepeats && rows.length <= field.minRepeats) {
      return;
    }
  
    onValueChange?.(rows.filter((_, index) => index !== rowIndex));
  }
  
  function updateRepeaterValue(
    rowIndex: number,
    childFieldId: string,
    childValue: unknown
  ) {
    const rows = getRepeaterRows();
    const nextRows = [...rows];
  
    nextRows[rowIndex] = {
      ...(nextRows[rowIndex] || {}),
      [childFieldId]: childValue,
    };
  
    onValueChange?.(nextRows);
  }

  function renderFieldBody() {
    if (field.type === "Heading") {
      return (
        <>
          <h2>{field.label}</h2>
          {field.help && <p>{field.help}</p>}
        </>
      );
    }

    if (field.type === "Paragraph") {
      return (
        <>
          <p>{field.label}</p>
          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "Divider") {
      return <hr />;
    }

    if (field.type === "Section") {
      const style = field.sectionStyle || "card";
      const childFields = field.children || [];
    
      return (
        <div
          style={{
            border:
              style === "plain"
                ? "0"
                : style === "highlight"
                  ? "1px solid #c4b5fd"
                  : "1px solid #e2e8f0",
            background:
              style === "highlight"
                ? "#f5f3ff"
                : style === "plain"
                  ? "transparent"
                  : "#ffffff",
            borderRadius: style === "plain" ? 0 : 18,
            padding: style === "plain" ? "4px 0" : 16,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
            {field.label}
          </h3>
    
          {field.help && (
            <p style={{ marginTop: 6, color: "#64748b", fontSize: 13 }}>
              {field.help}
            </p>
          )}
    
          <div
            style={{
              marginTop: 14,
              display: "grid",
              gap: 12,
              minHeight: childFields.length ? undefined : 90,
              border: childFields.length ? "0" : "1px dashed #cbd5e1",
              borderRadius: 14,
              padding: childFields.length ? 0 : 14,
              background: childFields.length ? "transparent" : "#f8fafc",
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
            
              const type = getDroppedFieldType(event).trim();
            
              if (type) {
                onAddChildField?.(field.id, type);
              }
            }}
          >
            {childFields.length === 0 ? (
              <div style={{ color: "#64748b", fontSize: 13 }}>
                Drop fields inside this section
              </div>
            ) : (
              childFields.map((childField) => {
                const runtimeState = getRuntimeFieldState(
                  childField,
                  previewAnswers || {}
                );
    
                if (preview && runtimeState.hidden) {
                  return null;
                }
    
                return (
                  <BuilderFieldView
                    key={childField.id}
                    field={{
                      ...childField,
                      required: runtimeState.required,
                      readOnly: runtimeState.readOnly,
                    }}
                    value={previewAnswers?.[childField.id]}
                    error={previewErrors?.[childField.id]}
                    selected={selectedId === childField.id && !preview}
                    selectedId={selectedId}
                    preview={preview}
                    previewAnswers={previewAnswers}
                    previewErrors={previewErrors}
                    onAnswerChange={onAnswerChange}
                    onValueChange={(nextValue) =>
                      onAnswerChange?.(childField.id, nextValue)
                    }
                    onSelect={() => onSelectField?.(childField.id)}
                    onSelectField={onSelectField}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                    onMoveUp={onMoveUp}
                    onMoveDown={onMoveDown}
                    onDrop={(type) => onAddChildField?.(field.id, type)}
                    onAddChildField={onAddChildField}
                    onAddColumnChildField={onAddColumnChildField}
                    onAddTabChildField={onAddTabChildField}
                  />
                );
              })
            )}
          </div>
        </div>
      );
    }
    
    if (field.type === "Columns") {
      const count = field.columnCount || 2;
    
      const labels =
        field.columnLabels && field.columnLabels.length > 0
          ? field.columnLabels
          : Array.from({ length: count }).map((_, index) => `Column ${index + 1}`);
    
      const columns = Array.from({ length: count }).map((_, index) => ({
        key: `column-${index}`,
        label: labels[index] || `Column ${index + 1}`,
      }));
    
      return (
        <>
          <label>{field.label}</label>
    
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
              gap: field.columnGap || 12,
            }}
          >
            {columns.map((column) => {
              const childFields = field.columnChildren?.[column.key] || [];
    
              return (
                <div
                  key={column.key}
                  style={{
                    minHeight: 140,
                    border: "1px dashed #cbd5e1",
                    borderRadius: 16,
                    background: "#f8fafc",
                    padding: 14,
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  
                    const type = getDroppedFieldType(event).trim();
                  
                    if (type) {
                      onAddColumnChildField?.(field.id, column.key, type);
                    }
                  }}
                >
                  <b style={{ display: "block", marginBottom: 8 }}>
                    {column.label}
                  </b>
    
                  {childFields.length === 0 ? (
                    <small style={{ color: "#64748b" }}>
                      Drop fields inside this column
                    </small>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gap: 12,
                      }}
                    >
                      {childFields.map((childField) => {
                        const runtimeState = getRuntimeFieldState(
                          childField,
                          previewAnswers || {}
                        );
    
                        if (preview && runtimeState.hidden) {
                          return null;
                        }
    
                        return (
                          <BuilderFieldView
                            key={childField.id}
                            field={{
                              ...childField,
                              required: runtimeState.required,
                              readOnly: runtimeState.readOnly,
                            }}
                            value={previewAnswers?.[childField.id]}
                            error={previewErrors?.[childField.id]}
                            selected={selectedId === childField.id && !preview}
                            selectedId={selectedId}
                            preview={preview}
                            previewAnswers={previewAnswers}
                            previewErrors={previewErrors}
                            onAnswerChange={onAnswerChange}
                            onValueChange={(nextValue) =>
                              onAnswerChange?.(childField.id, nextValue)
                            }
                            onSelect={() => onSelectField?.(childField.id)}
                            onSelectField={onSelectField}
                            onDuplicate={onDuplicate}
                            onDelete={onDelete}
                            onMoveUp={onMoveUp}
                            onMoveDown={onMoveDown}
                            onDrop={(type) =>
                              onAddColumnChildField?.(field.id, column.key, type)
                            }
                            onAddChildField={onAddChildField}
                            onAddColumnChildField={onAddColumnChildField}
                            onAddTabChildField={onAddTabChildField}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
    
          {field.help && <small>{field.help}</small>}
        </>
      );
    }
    
    if (field.type === "Tabs") {
      const tabs =
        field.tabLabels && field.tabLabels.length > 0
          ? field.tabLabels
          : ["Tab 1", "Tab 2"];
    
      const activeTab = String(value || field.defaultActiveTab || tabs[0]);
      const activeTabIndex = Math.max(tabs.indexOf(activeTab), 0);
      const activeTabKey = `tab-${activeTabIndex}`;
      const childFields = field.tabChildren?.[activeTabKey] || [];
    
      return (
        <>
          <label>{field.label}</label>
    
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 18,
              background: "#ffffff",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 4,
                borderBottom: "1px solid #e2e8f0",
                background: "#f8fafc",
                padding: 8,
              }}
            >
              {tabs.map((tab) => {
                const active = activeTab === tab;
    
                return (
                  <button
                    key={tab}
                    type="button"
                    disabled={!preview}
                    onClick={() => onValueChange?.(tab)}
                    style={{
                      border: "0",
                      borderRadius: 12,
                      padding: "8px 12px",
                      fontWeight: 800,
                      background: active ? "#ede9fe" : "transparent",
                      color: active ? "#6d28d9" : "#64748b",
                      cursor: preview ? "pointer" : "default",
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
    
            <div
              style={{
                padding: 16,
                minHeight: childFields.length ? undefined : 120,
                background: "#ffffff",
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
    
                const type = getDroppedFieldType(event).trim();
    
                if (type) {
                  onAddTabChildField?.(field.id, activeTabKey, type);
                }
              }}
            >
              <b>{activeTab}</b>
    
              {childFields.length === 0 ? (
                <p style={{ marginTop: 8, color: "#64748b", fontSize: 13 }}>
                  Drop fields inside this tab.
                </p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  {childFields.map((childField) => {
                    const runtimeState = getRuntimeFieldState(
                      childField,
                      previewAnswers || {}
                    );
    
                    if (preview && runtimeState.hidden) {
                      return null;
                    }
    
                    return (
                      <BuilderFieldView
                        key={childField.id}
                        field={{
                          ...childField,
                          required: runtimeState.required,
                          readOnly: runtimeState.readOnly,
                        }}
                        value={previewAnswers?.[childField.id]}
                        error={previewErrors?.[childField.id]}
                        selected={selectedId === childField.id && !preview}
                        selectedId={selectedId}
                        preview={preview}
                        previewAnswers={previewAnswers}
                        previewErrors={previewErrors}
                        onAnswerChange={onAnswerChange}
                        onValueChange={(nextValue) =>
                          onAnswerChange?.(childField.id, nextValue)
                        }
                        onSelect={() => onSelectField?.(childField.id)}
                        onSelectField={onSelectField}
                        onDuplicate={onDuplicate}
                        onDelete={onDelete}
                        onMoveUp={onMoveUp}
                        onMoveDown={onMoveDown}
                        onDrop={(type) =>
                          onAddTabChildField?.(field.id, activeTabKey, type)
                        }
                        onAddChildField={onAddChildField}
                        onAddColumnChildField={onAddColumnChildField}
                        onAddTabChildField={onAddTabChildField}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
    
          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "Long text") {
      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>

          {preview ? (
            <textarea
              placeholder={field.placeholder}
              value={String(value ?? "")}
              readOnly={field.readOnly}
              onChange={(event) => onValueChange?.(event.target.value)}
            />
          ) : (
            <textarea placeholder={field.placeholder} readOnly />
          )}

          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "Dropdown") {
      const options =
        field.options && field.options.length > 0
          ? field.options
          : ["Option 1", "Option 2", "Option 3"];
    
      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>
    
          <select
            className="fake-input field-control"
            value={preview ? String(value ?? "") : ""}
            disabled={!preview || field.readOnly}
            onChange={(event) => onValueChange?.(event.target.value)}
          >
            <option value="">Select option</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
    
          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "Radio group") {
      const options =
        field.options && field.options.length > 0
          ? field.options
          : ["Option 1", "Option 2", "Option 3"];
    
      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>
    
          <div className="choice-list">
            {options.map((option) => (
              <label key={option} className="choice-option">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  disabled={!preview || field.readOnly}
                  onChange={() => onValueChange?.(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
    
          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "Checkbox") {
      const options =
        field.options && field.options.length > 0
          ? field.options
          : ["Option 1", "Option 2", "Option 3"];
    
      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>
    
          <div className="choice-list">
            {options.map((option) => (
              <label key={option} className="choice-option">
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedOptions.includes(option)}
                  disabled={!preview || field.readOnly}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onValueChange?.([...selectedOptions, option]);
                    } else {
                      onValueChange?.(
                        selectedOptions.filter((item) => item !== option)
                      );
                    }
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
    
          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "Date") {
      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>
    
          <input
            className="fake-input field-control"
            type="date"
            value={preview ? String(value ?? "") : ""}
            disabled={!preview || field.readOnly}
            min={field.minDate}
            max={field.maxDate}
            onChange={(event) => onValueChange?.(event.target.value)}
          />
    
          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "Signature") {
      const hasSignature = Boolean(
        value &&
          typeof value === "object" &&
          (value as Record<string, unknown>).signatureDataUrl
      );
    
      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>
    
          {preview ? (
            <div className="photo-capture">
              <canvas
                ref={signatureCanvasRef}
                onMouseDown={startSignature}
                onMouseMove={drawSignature}
                onMouseUp={endSignature}
                onMouseLeave={endSignature}
                onTouchStart={startSignature}
                onTouchMove={drawSignature}
                onTouchEnd={endSignature}
                style={{
                  width: "100%",
                  height: 180,
                  border: "1px dashed #cbd5e1",
                  borderRadius: 16,
                  background: "#ffffff",
                  cursor: field.readOnly ? "not-allowed" : "crosshair",
                  touchAction: "none",
                }}
              />
    
              <div className="row">
                <button
                  type="button"
                  className="save"
                  disabled={field.readOnly}
                  onClick={clearSignature}
                >
                  Clear signature
                </button>
    
                {hasSignature && (
                  <span className="saved">
                    <i /> Signature captured
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              className="fake-input"
              style={{
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderStyle: "dashed",
              }}
            >
              Signature pad
            </div>
          )}
    
          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "Rating") {
      const ratingScale = field.ratingScale || 5;
      const currentRating = Number(value || 0);

      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>

          <div className="rating">
            {Array.from({ length: ratingScale }).map((_, index) => {
              const score = index + 1;

              return (
                <button
                  type="button"
                  key={score}
                  disabled={!preview || field.readOnly}
                  onClick={() => onValueChange?.(score)}
                >
                  {currentRating >= score ? "★" : "☆"}
                </button>
              );
            })}
          </div>

          <div className="rating-label">
            <span>Very poor</span>
            <span>Excellent</span>
          </div>

          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "NPS score") {
      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>

          <div className="rating">
            {Array.from({ length: 11 }).map((_, index) => (
              <button
                type="button"
                key={index}
                className={value === index ? "active" : ""}
                disabled={!preview || field.readOnly}
                onClick={() => onValueChange?.(index)}
              >
                {index}
              </button>
            ))}
          </div>

          <div className="rating-label">
            <span>{field.npsMinLabel || "Not likely"}</span>
            <span>{field.npsMaxLabel || "Very likely"}</span>
          </div>

          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "Number" || field.type === "Currency") {
      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>
    
          <div className="money-control">
            {field.type === "Currency" && (
              <span>{field.prefix || "₹"}</span>
            )}
    
            <input
              type="number"
              value={preview ? String(value ?? "") : ""}
              placeholder={field.placeholder || "Enter value"}
              disabled={!preview || field.readOnly}
              min={field.min}
              max={field.max}
              step={field.step}
              onChange={(event) => onValueChange?.(event.target.value)}
            />
    
            {field.suffix && <span>{field.suffix}</span>}
          </div>
    
          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "Email") {
      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>

          {preview ? (
            <input
              className="fake-input"
              type="email"
              value={String(value ?? "")}
              placeholder={field.placeholder}
              readOnly={field.readOnly}
              onChange={(event) => onValueChange?.(event.target.value)}
            />
          ) : (
            <div className="fake-input">
              @ {field.placeholder || "Enter email address"}
            </div>
          )}

          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "Address") {
      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>

          {preview ? (
            <textarea
              value={String(value ?? "")}
              placeholder={field.placeholder || "Enter address"}
              readOnly={field.readOnly}
              onChange={(event) => onValueChange?.(event.target.value)}
            />
          ) : (
            <div className="fake-input">
              {field.placeholder || "Enter address"}
            </div>
          )}

          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "Repeater") {
      const rows = getRepeaterRows();
      const childFields = getRepeaterFields();
    
      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>
    
          <div className="space-y-3">
            {rows.length === 0 && (
              <div className="fake-input">
                No repeated item added yet.
              </div>
            )}
    
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: 14,
                  background: "#ffffff",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <b>Item {rowIndex + 1}</b>
    
                  {preview && (
                    <button
                      type="button"
                      className="publish"
                      disabled={
                        Boolean(field.minRepeats) &&
                        rows.length <= Number(field.minRepeats)
                      }
                      onClick={() => removeRepeaterRow(rowIndex)}
                    >
                      Remove
                    </button>
                  )}
                </div>
    
                <div className="fields">
                  {childFields.map((childField) => (
                    <div
                      key={childField.id}
                      className="field"
                      style={{ width: childField.width || "100%" }}
                    >
                      <label>
                        {childField.label} {childField.required && <em>*</em>}
                      </label>
    
                      {preview ? (
  childField.type === "Dropdown" ? (
    <select
      className="fake-input"
      value={String(row[childField.id] ?? "")}
      disabled={field.readOnly || childField.readOnly}
      onChange={(event) =>
        updateRepeaterValue(
          rowIndex,
          childField.id,
          event.target.value
        )
      }
    >
      <option value="">Select option</option>
      {(childField.options || []).map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  ) : childField.type === "Long text" ? (
                          <textarea
                            value={String(row[childField.id] ?? "")}
                            placeholder={childField.placeholder}
                            readOnly={field.readOnly || childField.readOnly}
                            onChange={(event) =>
                              updateRepeaterValue(
                                rowIndex,
                                childField.id,
                                event.target.value
                              )
                            }
                          />
                        ) : childField.type === "Number" ? (
                          <input
                            className="fake-input"
                            type="number"
                            value={String(row[childField.id] ?? "")}
                            placeholder={childField.placeholder}
                            readOnly={field.readOnly || childField.readOnly}
                            onChange={(event) =>
                              updateRepeaterValue(
                                rowIndex,
                                childField.id,
                                event.target.value
                              )
                            }
                          />
                        ) : childField.type === "Date" ? (
                          <input
                            className="fake-input"
                            type="date"
                            value={String(row[childField.id] ?? "")}
                            readOnly={field.readOnly || childField.readOnly}
                            onChange={(event) =>
                              updateRepeaterValue(
                                rowIndex,
                                childField.id,
                                event.target.value
                              )
                            }
                          />
                        ) : (
                          <input
                            className="fake-input"
                            type="text"
                            value={String(row[childField.id] ?? "")}
                            placeholder={childField.placeholder}
                            readOnly={field.readOnly || childField.readOnly}
                            onChange={(event) =>
                              updateRepeaterValue(
                                rowIndex,
                                childField.id,
                                event.target.value
                              )
                            }
                          />
                        )
                      ) : (
                        <div className="fake-input">
                          {childField.placeholder || `Enter ${childField.label}`}
                        </div>
                      )}
    
                      {childField.help && <small>{childField.help}</small>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
    
            {preview && (
              <button
                type="button"
                className="save"
                disabled={
                  Boolean(field.maxRepeats) &&
                  rows.length >= Number(field.maxRepeats)
                }
                onClick={addRepeaterRow}
              >
                ＋ Add item
              </button>
            )}
          </div>
    
          {field.minRepeats || field.maxRepeats ? (
            <small>
              {field.minRepeats ? `Minimum ${field.minRepeats} item(s). ` : ""}
              {field.maxRepeats ? `Maximum ${field.maxRepeats} item(s).` : ""}
            </small>
          ) : null}
    
          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "Matrix") {
      const rows =
        field.matrixRows && field.matrixRows.length > 0
          ? field.matrixRows
          : [
              { id: "row-1", label: "Row 1" },
              { id: "row-2", label: "Row 2" },
            ];
    
      const columns =
        field.matrixColumns && field.matrixColumns.length > 0
          ? field.matrixColumns
          : [
              { id: "column-1", label: "Column 1" },
              { id: "column-2", label: "Column 2" },
            ];
    
      const matrixValue =
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as Record<string, string>)
          : {};
    
      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>
    
          <div
            style={{
              overflowX: "auto",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              background: "#ffffff",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      minWidth: 160,
                      padding: 12,
                      textAlign: "left",
                      borderBottom: "1px solid #e2e8f0",
                      background: "#f8fafc",
                    }}
                  >
                    Parameter
                  </th>
    
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      style={{
                        minWidth: 110,
                        padding: 12,
                        textAlign: "center",
                        borderBottom: "1px solid #e2e8f0",
                        background: "#f8fafc",
                      }}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
    
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td
                      style={{
                        padding: 12,
                        borderBottom: "1px solid #f1f5f9",
                        fontWeight: 700,
                      }}
                    >
                      {row.label}
                    </td>
    
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        style={{
                          padding: 12,
                          textAlign: "center",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {preview ? (
                          <input
                            type="radio"
                            name={`${field.id}-${row.id}`}
                            value={column.label}
                            checked={matrixValue[row.id] === column.label}
                            disabled={field.readOnly}
                            onChange={() =>
                              onValueChange?.({
                                ...matrixValue,
                                [row.id]: column.label,
                              })
                            }
                          />
                        ) : (
                          <span style={{ color: "#94a3b8" }}>○</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
    
          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "File upload") {
      const fileValues = Array.isArray(value)
  ? (value as Record<string, unknown>[])
  : value && typeof value === "object"
    ? [value as Record<string, unknown>]
    : [];

      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>

          {preview ? (
            <div className="photo-capture">
              <label className="camera-button">
                ↑ Choose file
                <input
                  type="file"
                  disabled={field.readOnly}
                  multiple={field.multipleFiles}
                  accept={
                    field.allowedFileTypes?.length
                      ? field.allowedFileTypes
                          .map((type) => `.${type.replace(".", "")}`)
                          .join(",")
                      : undefined
                  }
                  onChange={handleFileUpload}
                />
              </label>

              {fileValues.length > 0 && (
  <div className="geotag">
    <b>{fileValues.length} file(s) selected</b>

    {fileValues.map((fileValue, fileIndex) => (
      <span key={`${String(fileValue.fileName)}-${fileIndex}`}>
        {String(fileValue.fileName)}
        {fileValue.size
          ? ` · ${(Number(fileValue.size) / (1024 * 1024)).toFixed(2)} MB`
          : ""}
      </span>
    ))}
  </div>
)}
            </div>
          ) : (
            <div className="fake-input">Upload file</div>
          )}

          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "Live location") {
      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>

          <div className="geo-capture">
            <div className={tracking ? "geo-pulse active" : "geo-pulse"}>
              ⌖
            </div>

            {position ? (
              <div className="geo-result">
                <b>
                  {position.coords.latitude.toFixed(6)},{" "}
                  {position.coords.longitude.toFixed(6)}
                </b>
                <span>
                  Accuracy ±{Math.round(position.coords.accuracy)} m · Updated{" "}
                  {new Date(position.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ) : (
              <div className="geo-result">
                <b>Location not captured</b>
                <span>GPS coordinates and accuracy will appear here</span>
              </div>
            )}

            <button
              type="button"
              disabled={!preview || field.readOnly}
              onClick={tracking ? stopTracking : captureLocation}
            >
              {tracking ? "Stop tracking" : "Capture location"}
            </button>
          </div>

          {geoError && <small className="capture-error">{geoError}</small>}
          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    if (field.type === "Geotagged photo") {
      return (
        <>
          <label>
            {field.label} {field.required && <em>*</em>}
          </label>

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
                disabled={!preview || field.readOnly}
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

          {geoError && <small className="capture-error">{geoError}</small>}
          {field.help && <small>{field.help}</small>}
        </>
      );
    }

    return (
      <>
        <label>
          {field.label} {field.required && <em>*</em>}
        </label>

        <input
  className="fake-input field-control"
  type="text"
  value={preview ? String(value ?? "") : ""}
  disabled={!preview || field.readOnly}
  placeholder={field.placeholder || `Enter ${field.type.toLowerCase()}`}
  onChange={(event) => onValueChange?.(event.target.value)}
/>

        {field.help && <small>{field.help}</small>}
      </>
    );
  }

  return (
    <div
      className={selected ? "field selected" : "field"}
      style={{ width: field.width || "100%" }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
      
        const type = getDroppedFieldType(event).trim();
      
        if (type) {
          onDrop(type);
        }
      }}
    >
      <div className="drag-handle">⠿</div>

      {selected && !preview && (
        <div className="floating">
          <button type="button" onClick={onMoveUp}>
            ↑
          </button>
          <button type="button" onClick={onMoveDown}>
            ↓
          </button>
          <button type="button" onClick={onDuplicate}>
            ⎘
          </button>
          <button type="button" onClick={onDelete}>
            ⌫
          </button>
        </div>
      )}

      {renderFieldBody()}

      {error && <small className="capture-error">{error}</small>}
    </div>
  );

}
