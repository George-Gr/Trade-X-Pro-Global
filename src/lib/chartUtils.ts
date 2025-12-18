/**
 * Formats a tooltip value for display in charts.
 * Handles numbers, strings, arrays, and other types with configurable fraction digits.
 *
 * @param value - The value to format (can be number, string, array, or other types)
 * @param fractionDigits - Number of decimal places to display (default: 2)
 * @returns Formatted string representation of the value
 */
export const formatTooltipValue = (
  value: unknown,
  fractionDigits: number = 2,
): string => {
  // Recharts tooltip value can be number, string, array or other shapes depending on payload.
  if (typeof value === "number") {
    return `${Number(value).toLocaleString(undefined, { maximumFractionDigits: fractionDigits })}`;
  }

  if (typeof value === "string") {
    const n = Number(value);
    if (!Number.isNaN(n))
      return `${n.toLocaleString(undefined, { maximumFractionDigits: fractionDigits })}`;
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === "number" || typeof first === "string") {
      const n = Number(first);
      if (!Number.isNaN(n))
        return `${n.toLocaleString(undefined, { maximumFractionDigits: fractionDigits })}`;
      return String(first);
    }
  }

  return String(value ?? "");
};
