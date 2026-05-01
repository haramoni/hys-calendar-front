import { useMemo, useState } from "react";
import { eachDayOfInterval, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash } from "lucide-react";

import { api } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type EventStage =
  | "MONTAGEM"
  | "EVENTO"
  | "DESMONTAGEM"
  | "EVENTO_COMPLETO";

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

type MonthTableProps = {
  monthData: CalendarMonth;
  openEdit: (event: CalendarEvent) => void;
};

const stageLabelMap: Record<EventStage, string> = {
  MONTAGEM: "Montagem",
  EVENTO: "Evento",
  DESMONTAGEM: "Desmontagem",
  EVENTO_COMPLETO: "Evento completo",
};

const stageClassMap: Record<EventStage, string> = {
  MONTAGEM: "bg-[#dbeafe] text-[#1d4ed8] border-[#bfdbfe]",
  EVENTO: "bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]",
  DESMONTAGEM: "bg-[#fee2e2] text-[#dc2626] border-[#fecaca]",
  EVENTO_COMPLETO: "bg-[#fef9c3] text-[#ca8a04] border-[#fde68a]",
};

function toLocalISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toUTCISODate(dateString: string) {
  return dateString.slice(0, 10);
}

function findStageForDate(days: EventDay[], currentDate: Date) {
  const currentDateKey = toLocalISODate(currentDate);

  return days.find((day) => toUTCISODate(day.date) === currentDateKey);
}

function findFirstMatchedDayIndex(
  eventDays: EventDay[],
  dayIndexByDate: Map<string, number>,
) {
  return eventDays.reduce<number | null>((firstIndex, eventDay) => {
    const dayIndex = dayIndexByDate.get(toUTCISODate(eventDay.date));

    if (dayIndex === undefined) {
      return firstIndex;
    }

    return firstIndex === null ? dayIndex : Math.min(firstIndex, dayIndex);
  }, null);
}

export function MonthTable({ monthData, openEdit }: MonthTableProps) {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const monthStart = new Date(monthData.year, monthData.month - 1, 1);
  const monthEnd = endOfMonth(monthStart);

  const days = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  const monthTitle = format(monthStart, "MMMM yyyy", {
    locale: ptBR,
  });

  const sortedEvents = useMemo(() => {
    const dayIndexByDate = new Map(
      days.map((day, index) => [toLocalISODate(day), index]),
    );

    return monthData.events
      .map((event, index) => ({
        event,
        index,
        firstMatchedDayIndex: findFirstMatchedDayIndex(
          event.days,
          dayIndexByDate,
        ),
      }))
      .sort((a, b) => {
        if (a.firstMatchedDayIndex === null && b.firstMatchedDayIndex === null) {
          return a.index - b.index;
        }

        if (a.firstMatchedDayIndex === null) {
          return 1;
        }

        if (b.firstMatchedDayIndex === null) {
          return -1;
        }

        return a.firstMatchedDayIndex - b.firstMatchedDayIndex;
      })
      .map(({ event }) => event);
  }, [days, monthData.events]);

  function handleOpenDeleteModal(event: CalendarEvent) {
    setEventToDelete(event);
    setOpenDeleteModal(true);
  }

  async function handleDelete() {
    if (!eventToDelete) return;

    try {
      setIsDeleting(true);

      await api.delete(`/api/events/${eventToDelete.id}`);

      setOpenDeleteModal(false);
      setEventToDelete(null);

      window.location.reload();
    } catch (error) {
      console.error("Erro ao deletar evento:", error);
      alert("Erro ao deletar evento");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <section
        className="brand-panel space-y-4 rounded-[20px] p-5 sm:p-6"
        data-month={monthData.month}
        data-year={monthData.year}
      >
        <div>
          <h2 className="text-2xl font-bold capitalize text-[var(--color-primary)]">
            {monthTitle}
          </h2>
          <p className="text-sm text-muted-foreground">
            {monthData.events.length}{" "}
            {monthData.events.length === 1
              ? "stand cadastrado"
              : "stands cadastrados"}
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[rgb(228,228,228)] bg-white shadow-[0_6px_18px_rgba(0,0,0,0.03)]">
          <table className="min-w-max border-collapse">
            <thead>
              <tr className="bg-[rgb(246,246,246)]">
                <th className="sticky left-0 z-20 min-w-[260px] border bg-[rgb(250,250,250)] p-3 text-left text-black">
                  Stand
                </th>

                {days.map((day) => (
                  <th
                    key={toLocalISODate(day)}
                    className="min-w-[90px] border p-2 text-center"
                  >
                    <div className="text-xs text-muted-foreground">
                      {format(day, "EEE", { locale: ptBR })}
                    </div>
                    <div className="font-semibold text-black">
                      {format(day, "dd")}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {monthData.events.length === 0 ? (
                <tr>
                  <td
                    colSpan={days.length + 1}
                    className="p-6 text-center text-sm text-muted-foreground"
                  >
                    Nenhum evento cadastrado neste mês
                  </td>
                </tr>
              ) : (
                sortedEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="sticky left-0 z-10 border bg-white p-3 align-top">
                      <div className="relative space-y-1 pr-8">
                        <div className="absolute right-0 top-0 no-print flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(event)}
                            className="cursor-pointer text-[var(--color-secondary)] transition hover:text-[var(--color-primary)]"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(event)}
                            className="cursor-pointer text-[var(--color-secondary)] transition hover:text-[var(--color-highlight)]"
                          >
                            <Trash size={15} />
                          </button>
                        </div>

                        <div className="font-semibold text-[var(--color-primary)]">
                          {event.standName}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Fornecedor:</span>{" "}
                          {event.supplierName}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Local:</span>{" "}
                          {event.location}
                        </div>
                      </div>
                    </td>

                    {days.map((day) => {
                      const matchedDay = findStageForDate(event.days, day);

                      return (
                        <td
                          key={`${event.id}-${toLocalISODate(day)}`}
                          className={`border p-2 text-center align-middle ${
                            matchedDay ? stageClassMap[matchedDay.stage] : ""
                          }`}
                        >
                          {matchedDay ? (
                            <div className="text-xs font-medium">
                              {stageLabelMap[matchedDay.stage]}
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AlertDialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja deletar este evento?</AlertDialogTitle>
            <AlertDialogDescription>
              {eventToDelete ? (
                <>
                  Você está prestes a remover o stand{" "}
                  <strong>{eventToDelete.standName}</strong>. Essa ação não pode
                  ser desfeita.
                </>
              ) : (
                "Essa ação não pode ser desfeita."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
