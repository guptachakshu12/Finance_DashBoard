import React from "react";
import { Stack, Text } from "@mantine/core";

interface CardDisplayProps {
  data: Record<string, unknown>;
  selectedFields: string[];
  normalizeFieldName: (field: string) => string;
  filterData: (item: Record<string, unknown>) => Record<string, unknown>;
}

export const CardDisplay: React.FC<CardDisplayProps> = ({
  data,
  selectedFields,
  normalizeFieldName,
  filterData,
}) => {
  const filtered = filterData(data as Record<string, unknown>);

  return (
    <Stack gap="xs">
      {Object.entries(filtered).map(([key, value]) => (
        <div key={key} style={{ paddingBottom: "8px" }}>
          <Text size="xs" c="dimmed" fw={500}>
            {key}
          </Text>
          <Text size="sm" fw={600}>
            {typeof value === "object" ? JSON.stringify(value) : String(value)}
          </Text>
        </div>
      ))}
    </Stack>
  );
};
