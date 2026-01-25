import React from "react";
import { Box, Text } from "@mantine/core";
import { Bar } from "react-chartjs-2";

interface ChartDisplayProps {
  data: Record<string, unknown>;
  selectedFields: string[];
  normalizeFieldName: (field: string) => string;
  filterData: (item: Record<string, unknown>) => Record<string, unknown>;
}

export const ChartDisplay: React.FC<ChartDisplayProps> = ({
  data,
  selectedFields,
  normalizeFieldName,
  filterData,
}) => {
  const chartData = Array.isArray(data) ? data[0] : data;
  const filtered = filterData(chartData as Record<string, unknown>);

  // Prepare data for Chart.js
  const labels: string[] = [];
  const values: number[] = [];

  Object.entries(filtered).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      labels.push(key);
      const numValue = typeof value === "number" ? value : parseFloat(String(value)) || 0;
      values.push(numValue);
    }
  });

  if (labels.length === 0) {
    return <Text c="dimmed">No data available for chart</Text>;
  }

  const chartConfig = {
    labels: labels,
    datasets: [
      {
        label: "Value",
        data: values,
        backgroundColor: "#4c6ef5",
        borderColor: "#364fc7",
        borderWidth: 2,
        borderRadius: 4,
        hoverBackgroundColor: "#364fc7",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Data Visualization",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box style={{ width: "100%", height: "400px" }}>
      <Bar data={chartConfig} options={chartOptions} />
    </Box>
  );
};
