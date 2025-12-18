import React from "react";
import { WCAGAAAEnhancer } from "../accessibility/WCAGAAAEnhancer";
import { cn } from "../../lib/utils";

export function FontSizeControl() {
  const wcagEnhancer = WCAGAAAEnhancer.getInstance();
  const preferences = wcagEnhancer.getPreferences();

  const increaseFont = () => {
    const currentSize = parseInt(
      document.documentElement.style.fontSize || "16",
    );
    const newSize = Math.min(currentSize + 2, 24);
    document.documentElement.style.fontSize = `${newSize}px`;
  };

  const decreaseFont = () => {
    const currentSize = parseInt(
      document.documentElement.style.fontSize || "16",
    );
    const newSize = Math.max(currentSize - 2, 12);
    document.documentElement.style.fontSize = `${newSize}px`;
  };

  const resetFont = () => {
    document.documentElement.style.fontSize = "16px";
    wcagEnhancer.updatePreference("largeFonts", false);
  };

  return (
    <div className="font-size-controls flex gap-2">
      <button
        onClick={decreaseFont}
        className="px-3 py-1 border rounded hover:bg-gray-100"
        aria-label="Decrease font size"
      >
        A-
      </button>
      <button
        onClick={resetFont}
        className="px-3 py-1 border rounded hover:bg-gray-100"
        aria-label="Reset font size"
      >
        A
      </button>
      <button
        onClick={increaseFont}
        className="px-3 py-1 border rounded hover:bg-gray-100"
        aria-label="Increase font size"
      >
        A+
      </button>
    </div>
  );
}

export function ColorBlindModeSelector() {
  const wcagEnhancer = WCAGAAAEnhancer.getInstance();
  const preferences = wcagEnhancer.getPreferences();

  const modes = [
    { value: "none", label: "Normal Vision" },
    { value: "deuteranopia", label: "Deuteranopia (Green-Blind)" },
    { value: "protanopia", label: "Protanopia (Red-Blind)" },
    { value: "tritanopia", label: "Tritanopia (Blue-Blind)" },
  ];

  return (
    <select
      value={preferences.colorBlindMode}
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
        wcagEnhancer.updatePreference(
          "colorBlindMode",
          e.target.value as
            | "none"
            | "deuteranopia"
            | "protanopia"
            | "tritanopia",
        )
      }
      className="px-3 py-1 border rounded"
      aria-label="Select color vision mode"
    >
      {modes.map((mode) => (
        <option key={mode.value} value={mode.value}>
          {mode.label}
        </option>
      ))}
    </select>
  );
}
