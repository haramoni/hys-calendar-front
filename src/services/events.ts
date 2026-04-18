import { api } from "@/lib/api";
import type { CalendarMonth } from "@/types/event";

export async function getEvents(): Promise<CalendarMonth[]> {
  const response = await api.get<CalendarMonth[]>("/api/events");
  return response.data;
}
