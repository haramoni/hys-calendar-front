import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CalendarMonth, EventDay } from "@/types/event";

type Props = {
  monthData: CalendarMonth;
};

const stageLabelMap = {
  MONTAGEM: "Montagem",
  EVENTO: "Evento",
  DESMONTAGEM: "Desmontagem",
};

const stageClassMap = {
  MONTAGEM: "bg-blue-100 text-blue-700",
  EVENTO: "bg-green-100 text-green-700",
  DESMONTAGEM: "bg-red-100 text-red-700",
};

function findStageByDate(days: EventDay[], currentDate: Date) {
  return days.find((day) => isSameDay(new Date(day.date), currentDate));
}

export function CalendarTable({ monthData }: Props) {
  const monthStart = startOfMonth(new Date(monthData.startsAt));
  const monthEnd = endOfMonth(new Date(monthData.startsAt));

  const days = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-max border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 min-w-[260px] border bg-white p-3 text-left">
              Stand
            </th>

            {days.map((day) => (
              <th
                key={day.toISOString()}
                className="min-w-[90px] border p-2 text-center"
              >
                <div className="text-xs text-neutral-500">
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
                className="p-6 text-center text-sm text-neutral-500"
              >
                Nenhum evento neste mês
              </td>
            </tr>
          ) : (
            monthData.events.map((event) => (
              <tr key={event.id}>
                <td className="sticky left-0 border bg-white p-3 align-top">
                  <div className="font-semibold">{event.standName}</div>
                  <div className="text-sm text-neutral-500">
                    {event.supplierName}
                  </div>
                  <div className="text-sm text-neutral-500">
                    {event.location}
                  </div>
                </td>

                {days.map((day) => {
                  const matched = findStageByDate(event.days, day);

                  return (
                    <td
                      key={`${event.id}-${day.toISOString()}`}
                      className="border p-2 text-center"
                    >
                      {matched ? (
                        <span
                          className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${stageClassMap[matched.stage]}`}
                        >
                          {stageLabelMap[matched.stage]}
                        </span>
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
  );
}
