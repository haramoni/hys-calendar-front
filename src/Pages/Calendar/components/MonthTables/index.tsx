import { eachDayOfInterval, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil } from "lucide-react";

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
  openEdit: any;
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

export function MonthTable({ monthData, openEdit }: MonthTableProps) {
  // monta o mês localmente usando year e month da API
  const monthStart = new Date(monthData.year, monthData.month - 1, 1);
  const monthEnd = endOfMonth(monthStart);

  const days = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  const monthTitle = format(monthStart, "MMMM yyyy", {
    locale: ptBR,
  });

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold capitalize">{monthTitle}</h2>
        <p className="text-sm text-muted-foreground">
          {monthData.events.length}{" "}
          {monthData.events.length === 1
            ? "stand cadastrado"
            : "stands cadastrados"}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-background shadow-sm">
        <table className="min-w-max border-collapse">
          <thead>
            <tr className="bg-muted">
              <th className="sticky left-0 z-20 min-w-[260px] border bg-background p-3 text-left">
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
                  <div className="font-semibold">{format(day, "dd")}</div>
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
              monthData.events.map((event) => (
                <tr key={event.id}>
                  <td className="sticky left-0 z-10 border bg-background p-3 align-top">
                    <div className="space-y-1">
                      <div className="absolute right-3 no-print">
                        <button
                          type="button"
                          onClick={() => openEdit(event)}
                          className="cursor-pointer"
                        >
                          <Pencil />
                        </button>
                      </div>
                      <div className="font-semibold">{event.standName}</div>

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
  );
}
