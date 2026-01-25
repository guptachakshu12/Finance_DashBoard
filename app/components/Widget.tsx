"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Text,
  Group,
  Badge,
  Stack,
  Loader,
  Alert,
  ActionIcon,
} from "@mantine/core";
import { IconAlertCircle, IconX, IconClock, IconRefresh, IconSettings } from "@tabler/icons-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from "chart.js";
import { CardDisplay } from "./CardDisplay";
import { TableDisplay } from "./TableDisplay";
import { ChartDisplay } from "./ChartDisplay";
import { WidgetConfiguration } from "./WidgetConfiguration";
import {
  transformAlphaVantageData,
  normalizeFieldName,
  flattenObject,
  formatTime,
  filterData as utilFilterData,
} from "./utils";
import { DisplayType } from "./enums";
import { useDispatch, useSelector } from "react-redux";
import { removeWidget, updateWidget, type WidgetData } from "@/lib/store";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface WidgetProps {
  id: string;
}

export const Widget: React.FC<WidgetProps> = ({ id }) => {
  const dispatch = useDispatch();
  const widget = useSelector(
    (state: any) =>
      state.widgets.widgets.find((w: any) => w.id === id) as WidgetData | undefined
  );
  if (!widget) {
    return (
      <Card style={{ backgroundColor: "#2c3e50", borderColor: "#34495e" }}>
        <Text style={{ color: "#ff8787" }}>Widget not found</Text>
      </Card>
    );
  }

  const {
    name,
    apiUrl,
    displayType,
    refreshInterval,
    selectedFields,
    apiFields,
  } = widget;
  const [data, setData] = useState<Record<string, unknown> | Record<string, unknown>[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [configModalOpened, setConfigModalOpened] = useState(false);
  const [configName, setConfigName] = useState(name);
  const [configFields, setConfigFields] = useState<string[]>(selectedFields);
  const [availableFields, setAvailableFields] = useState<string[]>(apiFields || []);
  const itemsPerPage = 6;

  // Update configFields when selectedFields prop changes
  useEffect(() => {
    setConfigFields(selectedFields);
  }, [selectedFields]);

  // Update configName when name prop changes
  useEffect(() => {
    setConfigName(name);
  }, [name]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      const result = await response.json();
      console.log("Raw API Response:", result);
      const transformedData = transformAlphaVantageData(result);
      console.log("Transformed Data:", transformedData);
      setData(transformedData);
      setLastUpdated(new Date());

      // Extract all available fields from the API response
      const fieldsSet = new Set<string>();

      if (Array.isArray(transformedData)) {
        // If data is an array, get all unique keys from all items
        transformedData.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            const itemFields = flattenObject(item);
            itemFields.forEach((field) => fieldsSet.add(field));
          }
        });
      } else if (typeof transformedData === "object" && transformedData !== null) {
        // If data is an object, flatten it and get all paths
        const objFields = flattenObject(transformedData);
        objFields.forEach((field) => fieldsSet.add(field));
      }

      const fields = Array.from(fieldsSet);
      console.log("Available fields:", fields);
      setAvailableFields(fields);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch data");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [apiUrl, refreshInterval]);

  const handleSaveConfig = () => {
    dispatch(updateWidget({ 
      id, 
      updates: {
        name: configName,
        selectedFields: configFields,
      }
    }));
    setConfigModalOpened(false);
  };

  const filterData = (obj: Record<string, unknown>) => {
    return utilFilterData(obj, selectedFields, normalizeFieldName);
  };

  const renderContent = () => {
    if (loading && !data) {
      return (
        <Stack align="center" justify="center" style={{ minHeight: "150px" }}>
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Loading data...
          </Text>
        </Stack>
      );
    }

    if (error) {
      return (
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          {error}
        </Alert>
      );
    }

    if (!data) {
      return <Text c="dimmed">No data available</Text>;
    }

    if (displayType === DisplayType.CARD) {
      const cardData = Array.isArray(data) ? data[0] : data;
      return (
        <CardDisplay
          data={cardData as Record<string, unknown>}
          selectedFields={selectedFields}
          normalizeFieldName={normalizeFieldName}
          filterData={filterData}
        />
      );
    }

    if (displayType === DisplayType.TABLE) {
      const tableData = Array.isArray(data) ? data : [data];
      return (
        <TableDisplay
          data={tableData as Record<string, unknown>[]}
          selectedFields={selectedFields}
          normalizeFieldName={normalizeFieldName}
          filterData={filterData}
          itemsPerPage={itemsPerPage}
        />
      );
    }

    if (displayType === DisplayType.CHART) {
      return (
        <ChartDisplay
          data={data as Record<string, unknown>}
          selectedFields={selectedFields}
          normalizeFieldName={normalizeFieldName}
          filterData={filterData}
        />
      );
    }
  };

  return (
    <Card withBorder shadow="sm" radius="md" style={{ height: "100%" }}>
      <Card.Section withBorder inheritPadding py="md">
        <Group justify="space-between" align="center">
          <div>
            <Text fw={600} size="md">
              {configName}
            </Text>
            <Group gap={12} mt={8}>
              <Group gap={4}>
                <IconClock size={12} style={{ color: "#868e96" }} />
                <Text size="xs" c="dimmed">
                  Last Updated: {formatTime(lastUpdated)}
                </Text>
              </Group>
              <Badge size="sm" variant="light">
                {refreshInterval}s
              </Badge>
              {loading && (
                <Badge size="sm" variant="light" color="blue">
                  Updating...
                </Badge>
              )}
            </Group>
          </div>
          <Group gap={8}>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="blue"
              onClick={fetchData}
              loading={loading}
              title="Refresh"
            >
              <IconRefresh size={16} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="gray"
              onClick={() => setConfigModalOpened(true)}
              title="Settings"
            >
              <IconSettings size={16} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="red"
              onClick={() => dispatch(removeWidget(id))}
              title="Delete"
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Card.Section>

      <Card.Section inheritPadding py="md">
        {renderContent()}
      </Card.Section>

      <WidgetConfiguration
        opened={configModalOpened}
        onClose={() => setConfigModalOpened(false)}
        configName={configName}
        setConfigName={setConfigName}
        configFields={configFields}
        setConfigFields={setConfigFields}
        availableFields={availableFields}
        handleSaveConfig={handleSaveConfig}
        normalizeFieldName={normalizeFieldName}
      />
    </Card>
  );
};
