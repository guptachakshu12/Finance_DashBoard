export { store } from "./store";
export { default as widgetReducer } from "./widgetSlice";
export {
  addWidget,
  removeWidget,
  updateWidget,
  reorderWidgets,
  resetWidgets,
  initializeWidgets,
  type WidgetData,
} from "./widgetSlice";
export type { RootState, AppDispatch } from "./store";
