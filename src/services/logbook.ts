import { api } from "@/lib/api";
import type { LogbookEntry, LogbookPayload } from "@/types/logbook";

type LogbookWriteResponse = {
  message: string;
  data: LogbookEntry;
};

export async function getLogbooks(): Promise<LogbookEntry[]> {
  const response = await api.get<LogbookEntry[]>("/api/logbooks");
  return response.data;
}

export async function createLogbook(
  payload: LogbookPayload,
): Promise<LogbookEntry> {
  const response = await api.post<LogbookWriteResponse>("/api/logbooks", payload);
  return response.data.data;
}

export async function updateLogbook(
  id: string,
  payload: LogbookPayload,
): Promise<LogbookEntry> {
  const response = await api.put<LogbookWriteResponse>(
    `/api/logbooks/${id}`,
    payload,
  );
  return response.data.data;
}

export async function deleteLogbook(id: string): Promise<void> {
  await api.delete(`/api/logbooks/${id}`);
}
