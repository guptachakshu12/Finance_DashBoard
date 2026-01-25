"use client";

import React from "react";
import { Container, Button, Title, Box } from "@mantine/core";
import { IconPlus, IconChartBar } from "@tabler/icons-react";

interface DashboardHeaderProps {
    onAddWidgetClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
    onAddWidgetClick,
}) => {
    return (
        <Box
            component="header"
            data-test="dashboard-header"
            style={{
                height: "80px",
                backgroundColor: "#2c5aa0",
                borderBottom: "1px solid #1a3a5f",
                display: "flex",
                alignItems: "center",
            }}
        >
            <Container
                size="xl"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <div data-test="dashboard-title-section">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <IconChartBar size={32} style={{ color: "var(--primary-green)" }} />
                        <Title order={1} size="h2" data-test="dashboard-main-title" style={{ color: "#ffffff", margin: 0 }}>
                            Finance Dashboard
                        </Title>
                    </div>
                    <Title
                        order={3}
                        size="h5"
                        data-test="dashboard-subtitle"
                        style={{ color: "#b0d4ff", fontWeight: 400, margin: "2px 0 0 0" }}
                    >
                        Monitor your financial data in real-time
                    </Title>
                </div>
                <Button
                    onClick={onAddWidgetClick}
                    data-test="add-widget-button"
                    leftSection={<IconPlus size={18} />}
                    style={{
                        backgroundColor: "var(--primary-green)",
                        color: "#ffffff",
                        fontWeight: 600,
                    }}
                >
                    Add Widget
                </Button>
            </Container>
        </Box>
    );
};
