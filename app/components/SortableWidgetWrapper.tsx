"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@mantine/core";
import { IconGripVertical } from "@tabler/icons-react";

interface SortableWidgetWrapperProps {
    id: string;
    children: React.ReactNode;
}

export const SortableWidgetWrapper: React.FC<SortableWidgetWrapperProps> = ({
    id,
    children,
}) => {
    const {
        setNodeRef,
        transform,
        transition,
        isDragging,
        attributes,
        listeners,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Box
            ref={setNodeRef}
            style={style}
            pos="relative"
        >
            {/* Drag handle - ONLY this element is draggable */}
            <button
                {...listeners}
                {...attributes}
                style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    zIndex: 10,
                    padding: "4px",
                    borderRadius: "4px",
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: isDragging ? "grabbing" : "grab",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(34, 197, 94, 0.1)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
                title="Drag to reorder"
            >
                <IconGripVertical size={18} style={{ color: "#22c55e", opacity: 0.6 }} />
            </button>
            {children}
        </Box>
    );
};
