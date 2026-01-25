import React, { useState } from "react";
import { Stack, TextInput, Table, Group, Text, Pagination } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

interface TableDisplayProps {
  data: Record<string, unknown>[];
  selectedFields: string[];
  normalizeFieldName: (field: string) => string;
  filterData: (item: Record<string, unknown>) => Record<string, unknown>;
  itemsPerPage?: number;
}

export const TableDisplay: React.FC<TableDisplayProps> = ({
  data,
  selectedFields,
  normalizeFieldName,
  filterData,
  itemsPerPage = 10,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Format value - round numbers and display cleanly
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    
    if (typeof value === "number") {
      // Round to 6 decimal places for financial data
      return parseFloat(value.toFixed(6)).toString();
    }
    
    if (typeof value === "string") {
      // Try to parse as number and round if it is one
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        return parseFloat(numValue.toFixed(6)).toString();
      }
      return value;
    }
    
    return String(value);
  };

  // Transform Coinbase format data to simple 3-column table
  // Input: { "data": { "currency": "USD", "rates": { "00": "value", "1INCH": "value" } } }
  // Output: [{ currency: "USD", rate: "00", value: "value" }, ...]
  const transformCoinbaseData = (
    items: Record<string, unknown>[]
  ): Record<string, unknown>[] => {
    const rows: Record<string, unknown>[] = [];

    // Extract rate keys from selectedFields (e.g., "data.rates.1INCH" -> "1INCH")
    const selectedRates = new Set<string>();
    selectedFields.forEach((field) => {
      if (field.startsWith("data.rates.")) {
        const rateKey = field.replace("data.rates.", "");
        selectedRates.add(rateKey);
      }
    });

    items.forEach((item) => {
      // Check if item has 'data' property with currency and rates
      let dataObj = item;
      if (item.data && typeof item.data === "object") {
        dataObj = item.data as Record<string, unknown>;
      }

      const currency = dataObj.currency;
      const rates = dataObj.rates;

      // If we have currency and rates object, transform it
      if (currency && rates && typeof rates === "object") {
        Object.entries(rates).forEach(([rateKey, value]) => {
          // Only include if rate is selected (or no specific rates selected)
          if (selectedRates.size === 0 || selectedRates.has(rateKey)) {
            rows.push({
              currency: currency,
              rate: rateKey,
              value: value,
            });
          }
        });
      } else {
        // Not Coinbase format, keep original
        rows.push(item);
      }
    });

    return rows;
  };

  // Get nested value from object using dot notation
  const getNestedValue = (
    obj: Record<string, unknown>,
    path: string
  ): unknown => {
    const keys = path.split(".");
    let value: unknown = obj;

    for (const key of keys) {
      if (
        typeof value === "object" &&
        value !== null &&
        key in (value as Record<string, unknown>)
      ) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return value;
  };

  const filterDataBySearch = (
    items: Record<string, unknown>[],
    isCoinbase: boolean = false,
    isAlphaVantage: boolean = false
  ): Record<string, unknown>[] => {
    if (!searchQuery.trim()) return items;

    return items.filter((item) => {
      if (isCoinbase) {
        // For Coinbase format, search across currency, rate, and value
        const currency = String(item.currency || "").toLowerCase();
        const rate = String(item.rate || "").toLowerCase();
        const value = String(item.value || "").toLowerCase();

        return (
          currency.includes(searchQuery.toLowerCase()) ||
          rate.includes(searchQuery.toLowerCase()) ||
          value.includes(searchQuery.toLowerCase())
        );
      } else if (isAlphaVantage) {
        // For AlphaVantage format, search across all values
        return Object.values(item).some((val) => {
          const searchValue = String(val || "").toLowerCase();
          return searchValue.includes(searchQuery.toLowerCase());
        });
      } else {
        // For other formats, search across selectedFields
        return selectedFields.some((field) => {
          // Try to get value using the field path directly
          let value = getNestedValue(item, field);

          // If not found, try normalized version
          if (value === undefined) {
            const normalizedField = normalizeFieldName(field);
            value = getNestedValue(item, normalizedField);
          }

          const searchValue = String(value || "").toLowerCase();
          return searchValue.includes(searchQuery.toLowerCase());
        });
      }
    });
  };

  const tableData = Array.isArray(data) ? data : [data];
  const transformedData = transformCoinbaseData(tableData as Record<string, unknown>[]);

  // Detect if this is Coinbase format early
  const isCoinbaseFormat =
    transformedData.length > 0 &&
    "currency" in transformedData[0] &&
    "rate" in transformedData[0] &&
    "value" in transformedData[0];

  // Detect if this is AlphaVantage format (single object with numeric prefixed keys)
  const isAlphaVantageFormat =
    transformedData.length === 1 &&
    Object.keys(transformedData[0]).some((key) => key.match(/^\d+\./));

  const filteredData = filterDataBySearch(transformedData, isCoinbaseFormat, isAlphaVantageFormat);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIdx, startIdx + itemsPerPage);

  // Use transformed field names for Coinbase format, otherwise use selectedFields
  const displayFields = isCoinbaseFormat
    ? ["currency", "rate", "value"]
    : selectedFields;

  const rows = paginatedData.map((row, idx) => {
    return (
      <Table.Tr key={startIdx + idx}>
        {displayFields.map((field) => {
          let value: unknown;

          // For AlphaVantage format, try to match field name with numeric prefixed keys
          if (isAlphaVantageFormat) {
            // Look for key that ends with the field name (e.g., "01. symbol" matches "symbol")
            const matchingKey = Object.keys(row).find(
              (key) => key.replace(/^\d+\.\s*/, "").trim().toLowerCase() === field.toLowerCase()
            );
            value = matchingKey ? (row as Record<string, unknown>)[matchingKey] : undefined;
          } else {
            value = getNestedValue(row, field);
          }

          return (
            <Table.Td key={field}>
              <Text size="xs">
                {typeof value === "object"
                  ? JSON.stringify(value)
                  : formatValue(value)}
              </Text>
            </Table.Td>
          );
        })}
      </Table.Tr>
    );
  });

  return (
    <Stack gap="md">
      <TextInput
        placeholder="Search table..."
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.currentTarget.value);
          setCurrentPage(1);
        }}
        size="sm"
      />
      <div style={{ overflowX: "auto", width: "100%", maxWidth: "100%" }}>
        <Table striped highlightOnHover style={{ minWidth: "600px", width: "100%" }}>
          <Table.Thead>
            <Table.Tr>
              {displayFields.map((field) => (
                <Table.Th key={field}>
                  <Text size="xs" fw={600}>
                    {normalizeFieldName(field)}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </div>
      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">
          {filteredData.length > 0
            ? `${startIdx + 1} of ${filteredData.length} items`
            : "No items found"}
        </Text>
        {totalPages > 1 && (
          <Pagination
            value={currentPage}
            onChange={setCurrentPage}
            total={totalPages}
            size="sm"
          />
        )}
      </Group>
    </Stack>
  );
};
