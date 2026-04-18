export type EventStage = "MONTAGEM" | "EVENTO" | "DESMONTAGEM";

export interface EventDay {
  id: string;
  date: string;
  stage: EventStage;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  standName: string;
  supplierName: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  days: EventDay[];
}

export interface CalendarMonth {
  monthId: string;
  year: number;
  month: number;
  startsAt: string;
  endsAt: string;
  events: CalendarEvent[];
}
