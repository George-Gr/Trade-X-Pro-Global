import React from "react";
import type { FormAccessibilityType, FormField } from "../types";

export interface AriaLabelsTabProps {
  formAccessibility: FormAccessibilityType;
}

export function AriaLabelsTab({ formAccessibility }: AriaLabelsTabProps) {
  return (
    <div className="space-y-6">
      {/* Form Fields */}
      <div className="bg-card rounded-lg p-6 border">
        <h4 className="font-semibold mb-4">Enhanced Form Fields</h4>
        <div className="space-y-3">
          {formAccessibility.formFields
            .slice(0, 10)
            .map((field: FormField, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 border rounded"
              >
                <div>
                  <p className="font-medium">{field.label}</p>
                  {field.description && (
                    <p className="text-sm text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {field.required && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm">
                      Required
                    </span>
                  )}
                  {field.readonly && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      Read-only
                    </span>
                  )}
                  {field.disabled && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      Disabled
                    </span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ARIA Labeling Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Form Fields</h4>
          <p className="text-2xl font-bold">
            {formAccessibility.formFields.length}
          </p>
          <p className="text-sm text-muted-foreground">Enhanced with ARIA</p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Labels</h4>
          <p className="text-2xl font-bold">
            {
              formAccessibility.formFields.filter((f: FormField) => f.label)
                .length
            }
          </p>
          <p className="text-sm text-muted-foreground">With proper labels</p>
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <h4 className="font-semibold mb-2">Required Fields</h4>
          <p className="text-2xl font-bold">
            {
              formAccessibility.formFields.filter((f: FormField) => f.required)
                .length
            }
          </p>
          <p className="text-sm text-muted-foreground">Marked as required</p>
        </div>
      </div>
    </div>
  );
}
