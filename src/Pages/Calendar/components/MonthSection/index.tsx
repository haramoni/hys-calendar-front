import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CalendarMonth } from "@/types/event";
import { CalendarTable } from "../Table";

type Props = {
  monthData: CalendarMonth;
};

export function MonthSection({ monthData }: Props) {
  const title = format(new Date(monthData.startsAt), "MMMM yyyy", {
    locale: ptBR,
  });

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold capitalize">{title}</h2>
      <CalendarTable monthData={monthData} />
    </section>
  );
}
