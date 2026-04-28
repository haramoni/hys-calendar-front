import { api } from "@/lib/api";
import type { Person } from "@/types/people";

type CreatePersonResponse = {
  message: string;
  data: Person;
};

export async function getPeople(): Promise<Person[]> {
  const response = await api.get<Person[]>("/api/people");
  return response.data;
}

export async function createPerson(name: string): Promise<Person> {
  const response = await api.post<CreatePersonResponse>("/api/people", { name });
  return response.data.data;
}
