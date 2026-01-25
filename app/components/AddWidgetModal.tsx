"use client";

import React, { useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  Select,
  NumberInput,
  Group,
  Stack,
  Alert,
  Text,
  Checkbox,
  ScrollArea,
} from "@mantine/core";
import { IconAlertCircle, IconCheck, IconTable, IconChartBar, IconEye, IconPlus, IconX } from "@tabler/icons-react";
import { DisplayType } from "./enums";
import { flattenObject } from "./utils";

interface Widget {
  id: string;
  name: string;
  apiUrl: string;
  displayType: DisplayType;
  refreshInterval: number;
  selectedFields: string[];
  apiFields?: string[]; // Store available fields
  data?: Record<string, unknown>;
  lastUpdated?: Date;
}

interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widget: Omit<Widget, "id">) => void;
}

export const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  isOpen,
  onClose,
  onAddWidget,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    apiUrl: "",
    displayType: DisplayType.CARD,
    refreshInterval: 30,
  });

  const [apiFields, setApiFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [topLevelFieldCount, setTopLevelFieldCount] = useState<number>(0);
  const [fieldSearch, setFieldSearch] = useState<string>("");
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string>("");
  const [testSuccess, setTestSuccess] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleTestApi = async () => {
    if (!formData.apiUrl) {
      setTestError("Please enter an API URL");
      return;
    }

    setTestLoading(true);
    setTestError("");
    setTestSuccess(false);
    setApiFields([]);
    setSelectedFields([]);

    try {
      const response = await fetch(formData.apiUrl);
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();

      // Extract field names from the response
      let fields: string[] = [];
      let topLevelCount = 0;

      if (Array.isArray(data)) {
        // If data is an array, get fields from the first object
        if (data.length > 0 && typeof data[0] === "object") {
          topLevelCount = Object.keys(data[0]).length;
          fields = flattenObject(data[0]);
        }
      } else if (typeof data === "object" && data !== null) {
        // If data is an object, flatten it
        topLevelCount = Object.keys(data).length;
        fields = flattenObject(data);
      }

      if (fields.length === 0) {
        throw new Error("No fields found in API response");
      }

      setApiFields(fields);
      setTopLevelFieldCount(topLevelCount);
      setTestSuccess(true);
    } catch (error) {
      setTestError(
        error instanceof Error ? error.message : "Failed to connect to API"
      );
    } finally {
      setTestLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.name) {
      setTestError("Widget name is required");
      return;
    }
    if (!formData.apiUrl) {
      setTestError("API URL is required");
      return;
    }
    if (selectedFields.length === 0) {
      setTestError("Please select at least one field");
      return;
    }

    setSubmitLoading(true);
    try {
      const newWidget: Omit<Widget, "id"> = {
        name: formData.name,
        apiUrl: formData.apiUrl,
        displayType: formData.displayType,
        refreshInterval: formData.refreshInterval,
        selectedFields: selectedFields,
        apiFields: apiFields, // Include available fields
      };

      onAddWidget(newWidget);

      // Reset form
      setFormData({
        name: "",
        apiUrl: "",
        displayType: DisplayType.CARD,
        refreshInterval: 30,
      });
      setApiFields([]);
      setSelectedFields([]);
      setFieldSearch("");
      setTopLevelFieldCount(0);
      setTestSuccess(false);
      setTestError("");
      onClose();
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Add New Widget"
      size="lg"
      centered
      styles={{
        header: {
          backgroundColor: "#2c3e50",
          borderBottom: "1px solid #34495e",
        },
        title: {
          color: "#ffffff",
          fontWeight: 600,
          fontSize: "18px",
        },
        content: {
          backgroundColor: "#1e2936",
        },
      }}
    >
      <Stack gap="md">
        <TextInput
          label="Widget Name"
          placeholder="e.g., Bitcoin Price Tracker"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.currentTarget.value })
          }
          disabled={testLoading}
          styles={{
            label: {
              color: "#e0e0e0",
              fontWeight: 500,
            },
            input: {
              backgroundColor: "#2c3e50",
              borderColor: "#34495e",
              color: "#ffffff",
            },
          }}
        />

        <Group align="flex-end" gap="xs">
          <TextInput
            label="API URL"
            placeholder="e.g., https://api.coinbase.com/v2/exchange-rates?currency=BTC"
            style={{ flex: 1 }}
            value={formData.apiUrl}
            onChange={(e) =>
              setFormData({ ...formData, apiUrl: e.currentTarget.value })
            }
            disabled={testLoading}
            styles={{
              label: {
                color: "#e0e0e0",
                fontWeight: 500,
              },
              input: {
                backgroundColor: "#2c3e50",
                borderColor: "#34495e",
                color: "#ffffff",
              },
            }}
          />
          <Button
            onClick={handleTestApi}
            loading={testLoading}
            variant="default"
            styles={{
              root: {
                backgroundColor: "#34495e",
                color: "#ffffff",
                border: "1px solid #34495e",
              },
            }}
          >
            Test
          </Button>
        </Group>

        {testError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" styles={{
            root: {
              backgroundColor: "#3d1e1e",
              borderColor: "#c92a2a",
            },
            message: {
              color: "#ff8787",
            },
          }}>
            {testError}
          </Alert>
        )}

        {testSuccess && apiFields.length > 0 && (
          <div>
            <Alert icon={<IconEye size={16} />} color="green" mb="md" styles={{
              root: {
                backgroundColor: "#1e3d2e",
                borderColor: "#22c55e",
              },
              message: {
                color: "#86efac",
              },
            }}>
              API connection successfully! {topLevelFieldCount} top-level field{topLevelFieldCount !== 1 ? "s" : ""} found.
            </Alert>

            <NumberInput
              label="Refresh Interval (seconds)"
              placeholder="30"
              min={5}
              max={300}
              value={formData.refreshInterval}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  refreshInterval: typeof value === "number" ? value : 30,
                })
              }
              disabled={testLoading}
              styles={{
                label: {
                  color: "#e0e0e0",
                  fontWeight: 500,
                },
                input: {
                  backgroundColor: "#2c3e50",
                  borderColor: "#34495e",
                  color: "#ffffff",
                },
              }}
            />

            <Text size="sm" fw={500} mb="xs" style={{ color: "#e0e0e0" }}>
              Select Fields to Display
            </Text>
            <TextInput
              placeholder="Search fields..."
              value={fieldSearch}
              onChange={(e) => setFieldSearch(e.currentTarget.value)}
              styles={{
                input: {
                  backgroundColor: "#2c3e50",
                  borderColor: "#34495e",
                  color: "#ffffff",
                },
              }}
              mb="xs"
            />
            <div
              style={{
                backgroundColor: "#2c3e50",
                border: "1px solid #34495e",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              <ScrollArea>
                <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                  {apiFields
                    .filter((field) =>
                      field.toLowerCase().includes(fieldSearch.toLowerCase())
                    )
                    .map((field) => {
                      const isSelected = selectedFields.includes(field);
                      return (
                        <div
                          key={field}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px",
                            marginBottom: "4px",
                            backgroundColor: isSelected ? "#1e3d2e" : "transparent",
                            borderRadius: "4px",
                            border: `1px solid ${isSelected ? "#22c55e" : "transparent"}`,
                          }}
                        >
                          <Text size="sm" style={{ color: "#e0e0e0", flex: 1 }}>
                            {field}
                          </Text>
                          <Button
                            size="xs"
                            variant="subtle"
                            p={0}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedFields(
                                  selectedFields.filter((f) => f !== field)
                                );
                              } else {
                                setSelectedFields([...selectedFields, field]);
                              }
                            }}
                            style={{
                              color: "#ffffff",
                              padding: "4px 8px",
                              minWidth: "32px",
                            }}
                          >
                            {isSelected ? (
                              <IconX size={16} />
                            ) : (
                              <IconPlus size={16} />
                            )}
                          </Button>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            </div>

            {selectedFields.length > 0 && (
              <div>
                <Text size="sm" fw={500} mb="xs" style={{ color: "#e0e0e0" }}>
                  Selected Fields ({selectedFields.length})
                </Text>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {selectedFields.map((field) => (
                    <div
                      key={field}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 12px",
                        backgroundColor: "#22c55e",
                        borderRadius: "6px",
                        color: "#ffffff",
                      }}
                    >
                      <Text size="xs" fw={500}>
                        {field}
                      </Text>
                      <Button
                        size="xs"
                        variant="subtle"
                        p={0}
                        onClick={() =>
                          setSelectedFields(
                            selectedFields.filter((f) => f !== field)
                          )
                        }
                        style={{
                          color: "#ffffff",
                          padding: "2px",
                          minWidth: "auto",
                        }}
                      >
                        <IconX size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <Text size="sm" fw={500} mb="xs" style={{ color: "#e0e0e0" }}>
            Display Type
          </Text>
          <Group gap="md">
            <div
              onClick={() =>
                setFormData({
                  ...formData,
                  displayType: DisplayType.CARD,
                })
              }
              style={{
                padding: "16px 20px",
                border: `2px solid ${formData.displayType === DisplayType.CARD ? "#22c55e" : "#34495e"}`,
                borderRadius: "8px",
                backgroundColor: formData.displayType === DisplayType.CARD ? "#1e3d2e" : "#2c3e50",
                cursor: testLoading ? "not-allowed" : "pointer",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
                opacity: testLoading ? 0.6 : 1,
              }}
            >
              <IconTable size={28} color={formData.displayType === DisplayType.CARD ? "#22c55e" : "#b0d4ff"} />
              <Text size="sm" fw={500} style={{ color: "#e0e0e0" }}>
                Card
              </Text>
            </div>

            <div
              onClick={() =>
                setFormData({
                  ...formData,
                  displayType: DisplayType.TABLE,
                })
              }
              style={{
                padding: "16px 20px",
                border: `2px solid ${formData.displayType === DisplayType.TABLE ? "#22c55e" : "#34495e"}`,
                borderRadius: "8px",
                backgroundColor: formData.displayType === DisplayType.TABLE ? "#1e3d2e" : "#2c3e50",
                cursor: testLoading ? "not-allowed" : "pointer",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
                opacity: testLoading ? 0.6 : 1,
              }}
            >
              <IconTable size={28} color={formData.displayType === DisplayType.TABLE ? "#22c55e" : "#b0d4ff"} />
              <Text size="sm" fw={500} style={{ color: "#e0e0e0" }}>
                Table
              </Text>
            </div>

            <div
              onClick={() =>
                setFormData({
                  ...formData,
                  displayType: DisplayType.CHART,
                })
              }
              style={{
                padding: "16px 20px",
                border: `2px solid ${formData.displayType === DisplayType.CHART ? "#22c55e" : "#34495e"}`,
                borderRadius: "8px",
                backgroundColor: formData.displayType === DisplayType.CHART ? "#1e3d2e" : "#2c3e50",
                cursor: testLoading ? "not-allowed" : "pointer",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease",
                opacity: testLoading ? 0.6 : 1,
              }}
            >
              <IconChartBar size={28} color={formData.displayType === DisplayType.CHART ? "#22c55e" : "#b0d4ff"} />
              <Text size="sm" fw={500} style={{ color: "#e0e0e0" }}>
                Chart
              </Text>
            </div>
          </Group>
        </div>

        <Group justify="flex-end" gap="xs">
          <Button
            variant="default"
            onClick={onClose}
            disabled={testLoading}
            styles={{
              root: {
                backgroundColor: "#34495e",
                color: "#ffffff",
                border: "1px solid #34495e",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={submitLoading}
            disabled={!testSuccess || selectedFields.length === 0}
            style={{ backgroundColor: "#22c55e", color: "#ffffff", fontWeight: 600 }}
          >
            Add Widget
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
