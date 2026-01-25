"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Container,
  Grid,
  Stack,
  Text,
  Center,
  Box,
  Title,
  Button,
} from "@mantine/core";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DisplayType } from "./enums";
import { IconPlus } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addWidget,
  removeWidget,
  updateWidget,
  reorderWidgets,
  initializeWidgets,
  type WidgetData,
} from "@/lib/store";

// Lazy load components
const AddWidgetModal = dynamic(() => import("./AddWidgetModal").then(mod => ({ default: mod.AddWidgetModal })));
const Widget = dynamic(() => import("./Widget").then(mod => ({ default: mod.Widget })));
const SortableWidgetWrapper = dynamic(() => import("./SortableWidgetWrapper").then(mod => ({ default: mod.SortableWidgetWrapper })));
const DashboardHeader = dynamic(() => import("./DashboardHeader").then(mod => ({ default: mod.DashboardHeader })));

export const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const widgets = useSelector((state: any) => state.widgets.widgets);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load widgets from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("finboard_widgets");
      if (saved) {
        const parsedWidgets = JSON.parse(saved);
        dispatch(initializeWidgets(parsedWidgets));
      }
    } catch (error) {
      console.error("Failed to load widgets from localStorage:", error);
    }
  }, [dispatch]);

  // Save widgets to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("finboard_widgets", JSON.stringify(widgets));
    } catch (error) {
      console.error("Failed to save widgets to localStorage:", error);
    }
  }, [widgets]);

  const handleAddWidget = (widget: Omit<WidgetData, "id">) => {
    const newWidget: WidgetData = {
      ...widget,
      id: String(Date.now()),
    };
    dispatch(addWidget(newWidget));
  };

  const handleRemoveWidget = (id: string) => {
    dispatch(removeWidget(id));
  };

  const handleUpdateWidget = (id: string, updates: Partial<WidgetData>) => {
    dispatch(updateWidget({ id, updates }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w: any) => w.id === active.id);
      const newIndex = widgets.findIndex((w: any) => w.id === over.id);

      const reorderedWidgets: any = arrayMove(widgets, oldIndex, newIndex);
      dispatch(reorderWidgets(reorderedWidgets));
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>
      {/* Header */}
      <DashboardHeader onAddWidgetClick={() => setIsModalOpen(true)} />

      {/* Main Content */}
      <Container size="xl" py="xl">
        {widgets.length === 0 ? (
          <Center style={{ minHeight: "400px" }}>
            <Stack align="center" gap="md">
              <div style={{ textAlign: "center" }}>
                <Title order={2} size="h3" style={{ color: "#ffffff", marginBottom: "8px" }}>
                  No widgets yet
                </Title>
                <Text size="sm" c="#b0d4ff">
                  Add your first widget to get started. Connect to any API and create custom data visualizations.
                </Text>
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                leftSection={<IconPlus size={18} />}
                size="md"
                style={{
                  backgroundColor: "var(--primary-green)",
                  color: "#ffffff",
                  fontWeight: 600,
                }}
              >
                Add Your First Widget
              </Button>
            </Stack>
          </Center>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={widgets.map((w: any) => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <Grid gutter="md">
                {widgets.map((widget: any) => {
                  // Give table type widgets more space
                  const colSpan = widget.displayType === DisplayType.TABLE
                    ? { base: 12, sm: 12, md: 6 }
                    : { base: 12, sm: 6, md: 4 };

                  return (
                    <Grid.Col key={widget.id} span={colSpan}>
                      <SortableWidgetWrapper id={widget.id}>
                        <Widget
                          id={widget.id}
                        />
                      </SortableWidgetWrapper>
                    </Grid.Col>
                  );
                })}
              </Grid>
            </SortableContext>
          </DndContext>
        )}
      </Container>

      {/* Add Widget Modal */}
      <AddWidgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWidget={handleAddWidget}
      />
    </div>
  );
};
