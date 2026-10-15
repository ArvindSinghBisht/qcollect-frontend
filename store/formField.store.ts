import { create } from "zustand";
import { FormField } from "@/types/formField";

interface FormFieldStore {
  fields: FormField[];

  setFields: (fields: FormField[]) => void;

  addField: (field: FormField) => void;

  updateField: (field: FormField) => void;

  removeField: (id: string) => void;
}

export const useFormFieldStore =
  create<FormFieldStore>((set) => ({

    fields: [],

    setFields: (fields) =>
      set({
        fields,
      }),

    addField: (field) =>
      set((state) => ({
        fields: [...state.fields, field],
      })),

    updateField: (field) =>
      set((state) => ({
        fields: state.fields.map((f) =>
          f.id === field.id ? field : f
        ),
      })),

    removeField: (id) =>
      set((state) => ({
        fields: state.fields.filter(
          (f) => f.id !== id
        ),
      })),
  }));