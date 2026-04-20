import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";

import {
  StandModal,
  type StandItemInput,
  type EditableStand,
} from "@/components/StandModal";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { CalendarMonth } from "@/types/event";
import { MonthTable } from "./components/MonthTables";
import { PrintButton } from "@/components/PrintButton";

const INITIAL_VISIBLE_MONTHS = 4;
const LOAD_MORE_STEP = 4;

export function CalendarPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [months, setMonths] = useState<CalendarMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [selectedStand, setSelectedStand] = useState<EditableStand | null>(
    null,
  );
  const [visibleMonthsCount, setVisibleMonthsCount] = useState(
    INITIAL_VISIBLE_MONTHS,
  );

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<CalendarMonth[]>("/api/events");
      setMonths(response.data);
      setVisibleMonthsCount(INITIAL_VISIBLE_MONTHS);
    } catch {
      setError("Erro ao carregar calendário.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  async function handleCreateStand(data: StandItemInput) {
    try {
      setSaving(true);
      setError("");
      await api.post("/api/events", data);
      await loadEvents();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar stand.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateStand(id: string, data: StandItemInput) {
    const payload = {
      standName: data.standName,
      supplierName: data.supplierName,
      location: data.location,
      days: data.days.map((day) => ({
        date: day.date,
        stage: day.stage,
      })),
    };

    try {
      setSaving(true);
      setError("");

      await api.put(`/api/events/${id}`, payload);

      setOpenModalEdit(false);
      setSelectedStand(null);

      await loadEvents();
    } catch (err) {
      console.error(err);
      setError("Erro ao atualizar stand.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  function handleOpenEdit(stand: EditableStand) {
    setSelectedStand(stand);
    setOpenModalEdit(true);
  }

  function handleLoadMore() {
    setVisibleMonthsCount((prev) => prev + LOAD_MORE_STEP);
  }

  function handleLogout() {
    localStorage.removeItem("hys_token");
    localStorage.removeItem("hys_user");
    window.location.href = "/login";
  }

  const visibleMonths = useMemo(() => {
    return months.slice(0, visibleMonthsCount);
  }, [months, visibleMonthsCount]);

  const hasMoreMonths = visibleMonthsCount < months.length;

  return (
    <div className="space-y-8 p-6" ref={containerRef}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendário</h1>
          <p className="text-sm text-muted-foreground">
            Visualize e gerencie os stands por mês
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StandModal
            onSave={handleCreateStand}
            onUpdate={handleUpdateStand}
            editingStand={selectedStand}
            openModalEdit={openModalEdit}
            onOpenModalEditChange={(open) => {
              setOpenModalEdit(open);
              if (!open) {
                setSelectedStand(null);
              }
            }}
            trigger={
              <Button
                type="button"
                disabled={saving}
                onClick={() => setSelectedStand(null)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {saving ? "Salvando..." : "Novo stand"}
              </Button>
            }
          />

          <Button type="button" variant="outline" onClick={handleLogout}>
            Sair
          </Button>

          <PrintButton containerRef={containerRef} />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl border bg-background p-6">
          <p>Carregando calendário...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {visibleMonths.map((month) => (
            <MonthTable
              key={month.monthId}
              monthData={month}
              openEdit={handleOpenEdit}
            />
          ))}

          {hasMoreMonths ? (
            <div className="flex justify-center">
              <Button type="button" variant="outline" onClick={handleLoadMore}>
                Carregar mais meses
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
