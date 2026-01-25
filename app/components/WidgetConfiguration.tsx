"use client";

import React from "react";
import {
  Modal,
  Stack,
  TextInput,
  MultiSelect,
  Button,
  Group,
} from "@mantine/core";

interface WidgetConfigurationProps {
  opened: boolean;
  onClose: () => void;
  configName: string;
  setConfigName: (name: string) => void;
  configFields: string[];
  setConfigFields: (fields: string[]) => void;
  availableFields: string[];
  handleSaveConfig: () => void;
  normalizeFieldName: (field: string) => string;
}

export const WidgetConfiguration: React.FC<WidgetConfigurationProps> = ({
  opened,
  onClose,
  configName,
  setConfigName,
  configFields,
  setConfigFields,
  availableFields,
  handleSaveConfig,
  normalizeFieldName,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Widget Configuration"
      centered
      styles={{
        title: {
          color: "#2c3e50",
          fontWeight: 600,
        },
      }}
    >
      <Stack gap="md">
        <TextInput
          label="Widget Title"
          placeholder="Enter widget title"
          value={configName}
          onChange={(e) => setConfigName(e.currentTarget.value)}
          styles={{
            label: {
              color: "#2c3e50",
              fontWeight: 600,
            },
          }}
        />
        <MultiSelect
          label="Selected Fields"
          placeholder={configFields.length === 0 ? "Select fields to display" : ""}
          data={availableFields.map((field) => ({
            value: field,
            label: normalizeFieldName(field),
          }))}
          value={configFields}
          onChange={setConfigFields}
          searchable
          clearable
          styles={{
            label: {
              color: "#ffffff",
              fontWeight: 600,
            },
            input: {
              backgroundColor: "#2c3e50",
              borderColor: "#34495e",
              color: "#ffffff",
              "&::placeholder": {
                color: "#868e96",
              },
            },
            dropdown: {
              backgroundColor: "#2c3e50",
              borderColor: "#34495e",
            },
            option: {
              backgroundColor: "#34495e",
              color: "#ffffff",
              padding: "10px 12px",
              "&:hover": {
                backgroundColor: "#3d5a7f",
              },
            },
          }}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveConfig}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
