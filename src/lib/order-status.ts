export const STATUS_LABEL: Record<string, string> = {
  received: "Received",
  preparing: "Frying now",
  ready: "Ready",
  out_for_delivery: "On the way",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const nextStatus = (status: string, mode: string) =>
  status === "received" ? "preparing"
  : status === "preparing" ? "ready"
  : status === "ready" ? (mode === "delivery" ? "out_for_delivery" : "completed")
  : status === "out_for_delivery" ? "completed"
  : null;

export const stepsFor = (mode: string) =>
  mode === "delivery" ? ["received", "preparing", "ready", "out_for_delivery", "completed"] : ["received", "preparing", "ready", "completed"];

export type OrderItem = { itemId: string; name: string; price: number; qty: number; options: Record<string, string> };
