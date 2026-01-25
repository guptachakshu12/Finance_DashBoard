// Utility functions for Widget component

// Transform AlphaVantage response format to normalized format
export const transformAlphaVantageData = (rawData: Record<string, unknown>) => {
  console.log("transformAlphaVantageData - Input:", rawData);
  if ("Global Quote" in rawData && typeof rawData["Global Quote"] === "object") {
    const globalQuote = rawData["Global Quote"] as Record<string, unknown>;
    console.log("Global Quote object:", globalQuote);
    const transformed: Record<string, unknown> = {};

    // Transform field names by removing numbered prefixes (e.g., "01. symbol" -> "symbol")
    Object.entries(globalQuote).forEach(([key, value]) => {
      const cleanKey = key.replace(/^\d+\.\s*/, "").trim();
      console.log("Transforming:", key, "->", cleanKey, "value:", value);
      transformed[cleanKey] = value;
    });

    console.log("Transformed object keys and values:", transformed);
    return transformed;
  }
  console.log("No Global Quote found, returning rawData as is");
  return rawData;
};

// Normalize field names for AlphaVantage format (remove "Global Quote." prefix and number prefix)
export const normalizeFieldName = (field: string) => {
  return field.replace(/^Global Quote\.\s*/, "").replace(/^\d+\.\s*/, "").trim();
};

// Flatten nested objects and get all possible field paths
export const flattenObject = (obj: any, prefix = ""): string[] => {
  const fields: string[] = [];

  if (obj === null || obj === undefined) {
    return fields;
  }

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const fullPath = prefix ? `${prefix}.${key}` : key;

      // If value is an object (but not an array or date), recurse
      if (typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
        fields.push(...flattenObject(value, fullPath));
      } else {
        // Leaf node - add this path
        fields.push(fullPath);
      }
    }
  }

  return fields;
};

// Format date to time string
export const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Filter object by selected fields with nested field support
export const filterData = (
  obj: Record<string, unknown>,
  selectedFields: string[],
  normalizeFieldNameFn: (field: string) => string
) => {
  console.log("filterData - Input object:", obj);
  console.log("filterData - Object keys:", Object.keys(obj));
  const filtered: Record<string, unknown> = {};
  selectedFields.forEach((field) => {
    // Normalize field name to handle AlphaVantage format
    const normalizedField = normalizeFieldNameFn(field);
    console.log("Processing field:", field, "-> Normalized:", normalizedField);
    console.log("Looking for key in object:", normalizedField, "exists?", normalizedField in obj);

    // Handle nested fields with dot notation (e.g., "data.rates.BGN")
    const keys = normalizedField.split(".");
    let value: unknown = obj;

    for (const key of keys) {
      console.log("Checking key:", key, "in current value:", typeof value === "object" ? Object.keys(value as object) : value);
      if (typeof value === "object" && value !== null && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        console.log("Key not found:", key);
        value = undefined;
        break;
      }
    }

    console.log("Field value:", normalizedField, "=", value);
    // Use normalized field name as the key
    filtered[normalizedField] = value;
  });
  console.log("Filtered Data:", filtered);
  return filtered;
};
