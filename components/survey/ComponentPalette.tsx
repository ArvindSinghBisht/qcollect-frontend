"use client";

import { useMemo, useState } from "react";
import type { DragEvent } from "react";
import {
  COMPONENT_CATEGORIES,
  getComponentsByCategory,
} from "@/lib/survey/componentRegistry";
import type { ComponentCategory } from "@/lib/survey/componentRegistry";
import type { SurveyFieldType } from "@/types/survey";

interface ComponentPaletteProps {
  onAddField: (type: SurveyFieldType | string) => void;
}

const CATEGORY_META: Record<
  ComponentCategory,
  {
    title: string;
    subtitle: string;
    icon: string;
  }
> = {
  "Basic fields": {
    title: "Basic Fields",
    subtitle: "Common inputs used in most forms",
    icon: "⌘",
  },
  Advanced: {
    title: "Advanced",
    subtitle: "Ratings, matrix, repeatable fields",
    icon: "✦",
  },
  "Location & Capture": {
    title: "Location & Capture",
    subtitle: "GPS, photo, file and signature fields",
    icon: "⌖",
  },
  Layout: {
    title: "Layout",
    subtitle: "Sections, columns, tabs and dividers",
    icon: "▦",
  },
};

export default function ComponentPalette({ onAddField }: ComponentPaletteProps) {
  const [query, setQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<ComponentCategory[]>([]);

  const search = query.trim().toLowerCase();

  const groupedComponents = useMemo(() => {
    return COMPONENT_CATEGORIES.map((category) => {
      const components = getComponentsByCategory(category);

      const visibleComponents = search
        ? components.filter((component) => {
            return (
              component.label.toLowerCase().includes(search) ||
              component.description.toLowerCase().includes(search) ||
              component.type.toLowerCase().includes(search)
            );
          })
        : components;

      return {
        category,
        components: visibleComponents,
      };
    }).filter((group) => group.components.length > 0);
  }, [search]);

  function startDrag(
    event: DragEvent<HTMLDivElement>,
    type: SurveyFieldType | string
  ) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("type", type);
    event.dataTransfer.setData("text/plain", type);
    event.dataTransfer.setData("application/qcollect-component", type);
  }

  function toggleCategory(category: ComponentCategory) {
    setOpenCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  }

  function isCategoryOpen(category: ComponentCategory) {
    return search ? true : openCategories.includes(category);
  }

  return (
    <div className="palette">
      <div className="palette-head">
        <div>
          <b>Components</b>
          <span>Drag a component to the form canvas</span>
        </div>
      </div>

      <input
        className="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search fields, layout, photo..."
      />

      <div className="palette-groups">
        {groupedComponents.map(({ category, components }) => {
          const meta = CATEGORY_META[category];
          const open = isCategoryOpen(category);

          return (
            <section className="palette-category" key={category}>
              <button
                type="button"
                className="palette-category-head"
                onClick={() => toggleCategory(category)}
              >
                <span className="palette-category-icon">{meta.icon}</span>

                <span className="palette-category-copy">
                  <b>{meta.title}</b>
                  <small>{meta.subtitle}</small>
                </span>

                <span className="palette-category-count">
                  {components.length}
                </span>

                <span className={open ? "chevron open" : "chevron"}>⌄</span>
              </button>

              {open && (
                <div className="component-list">
                  {components.map((component) => (
                    <div
                      key={component.type}
                      className="component-card"
                      draggable
                      role="button"
                      tabIndex={0}
                      title="Drag to canvas or click to add"
                      onDragStart={(event) => startDrag(event, component.type)}
                      onClick={() => onAddField(component.type)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onAddField(component.type);
                        }
                      }}
                    >
                      <i>{component.icon}</i>

                      <div>
                        <b>{component.label}</b>
                        <span>{component.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {groupedComponents.length === 0 && (
          <div className="no-selection">
            <b>No component found</b>
            <span>Try searching text, dropdown, photo, location or layout.</span>
          </div>
        )}
      </div>
    </div>
  );
}