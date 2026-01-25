import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DisplayType } from "@/app/components/enums";

export interface WidgetData {
  id: string;
  name: string;
  apiUrl: string;
  displayType: DisplayType;
  refreshInterval: number;
  selectedFields: string[];
  apiFields?: string[];
  data?: Record<string, unknown>;
  lastUpdated?: Date;
}

interface WidgetState {
  widgets: WidgetData[];
}

const initialState: WidgetState = {
  widgets: [],
};

const widgetSlice = createSlice({
  name: "widgets",
  initialState,
  reducers: {
    addWidget: (state, action: PayloadAction<WidgetData>) => {
      state.widgets.push(action.payload);
    },
    removeWidget: (state, action: PayloadAction<string>) => {
      state.widgets = state.widgets.filter((w) => w.id !== action.payload);
    },
    updateWidget: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<WidgetData> }>
    ) => {
      const widget = state.widgets.find((w) => w.id === action.payload.id);
      if (widget) {
        Object.assign(widget, action.payload.updates);
      }
    },
    reorderWidgets: (state, action: PayloadAction<WidgetData[]>) => {
      state.widgets = action.payload;
    },
    resetWidgets: (state) => {
      state.widgets = [];
    },
    initializeWidgets: (state, action: PayloadAction<WidgetData[]>) => {
      state.widgets = action.payload;
    },
  },
});

export const {
  addWidget,
  removeWidget,
  updateWidget,
  reorderWidgets,
  resetWidgets,
  initializeWidgets,
} = widgetSlice.actions;

export default widgetSlice.reducer;
