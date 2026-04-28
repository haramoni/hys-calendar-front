export interface LogbookPersonRef {
  id: string;
  name: string;
}

export interface LogbookEntry {
  id: string;
  value: number;
  date: string;
  reason: string;
  personId: string;
  personName?: string;
  person?: LogbookPersonRef;
  people?: LogbookPersonRef;
  createdAt: string;
  updatedAt: string;
}

export interface LogbookPayload {
  value: number;
  date: string;
  reason: string;
  personId: string;
}

export interface LogbookFormValues {
  value: string;
  date: string;
  reason: string;
  personName: string;
}
