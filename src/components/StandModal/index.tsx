import { useEffect, useMemo, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EventStage =
  | "MONTAGEM"
  | "EVENTO"
  | "DESMONTAGEM"
  | "EVENTO_COMPLETO";

export type StandDay = {
  id?: string;
  date: string;
  stage: EventStage;
  createdAt?: string;
  updatedAt?: string;
};

export type StandItemInput = {
  standName: string;
  supplierName: string;
  location: string;
  days: StandDay[];
};

export type EditableStand = StandItemInput & {
  id: string;
};

type StandModalProps = {
  onSave: (data: StandItemInput) => void | Promise<void>;
  onUpdate?: (id: string, data: StandItemInput) => void | Promise<void>;
  editingStand?: EditableStand | null;
  trigger?: ReactNode;
  openModalEdit?: boolean;
  onOpenModalEditChange?: (open: boolean) => void;
};

const STAGE_OPTIONS: { label: string; value: EventStage }[] = [
  { label: "Montagem", value: "MONTAGEM" },
  { label: "Evento", value: "EVENTO" },
  { label: "Desmontagem", value: "DESMONTAGEM" },
  { label: "Evento completo", value: "EVENTO_COMPLETO" },
];

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeDateString(date: string) {
  if (!date) return "";
  return date.slice(0, 10);
}

function fromISODate(date: string) {
  const normalized = normalizeDateString(date);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return new Date("");
  }

  const [year, month, day] = normalized.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function StandModal({
  onSave,
  onUpdate,
  editingStand,
  trigger,
  openModalEdit,
  onOpenModalEditChange,
}: StandModalProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [standName, setStandName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [location, setLocation] = useState("");
  const [days, setDays] = useState<StandDay[]>([]);

  const [errors, setErrors] = useState<{
    standName?: string;
    supplierName?: string;
    location?: string;
    days?: string;
  }>({});

  const isEditing = !!editingStand;

  const stageDates = useMemo<Record<EventStage, string[]>>(() => {
    const grouped = {
      MONTAGEM: [],
      EVENTO: [],
      DESMONTAGEM: [],
      EVENTO_COMPLETO: [],
    } satisfies Record<EventStage, string[]>;

    for (const day of days) {
      const normalizedDate = normalizeDateString(day.date);

      if (!normalizedDate) continue;

      grouped[day.stage].push(normalizedDate as never);
    }

    return grouped;
  }, [days]);

  useEffect(() => {
    if (openModalEdit) {
      setOpen(true);
    }
  }, [openModalEdit]);

  useEffect(() => {
    if (!open) return;

    if (editingStand) {
      setStandName(editingStand.standName ?? "");
      setSupplierName(editingStand.supplierName ?? "");
      setLocation(editingStand.location ?? "");

      const normalizedDays = editingStand.days.reduce<StandDay[]>(
        (acc, day) => {
          const normalizedDate = normalizeDateString(day.date);

          if (!normalizedDate) return acc;
          if (acc.some((item) => item.date === normalizedDate)) return acc;

          acc.push({
            id: day.id,
            createdAt: day.createdAt,
            updatedAt: day.updatedAt,
            date: normalizedDate,
            stage: day.stage,
          });

          return acc;
        },
        [],
      );

      setDays(normalizedDays.sort((a, b) => a.date.localeCompare(b.date)));
      setErrors({});
      return;
    }

    resetForm();
  }, [editingStand, open]);

  function resetForm() {
    setStandName("");
    setSupplierName("");
    setLocation("");
    setDays([]);
    setErrors({});
  }

  function setStageCalendar(stage: EventStage, dates: Date[] | undefined) {
    const nextStageDates = (dates ?? []).map(toISODate);
    const nextSelectedDates = new Set(nextStageDates);

    setDays((prev) => {
      const metaByDate = new Map(
        prev.map((item) => [
          normalizeDateString(item.date),
          {
            id: item.id,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          },
        ]),
      );

      const remainingDays = prev.filter((item) => {
        const normalizedDate = normalizeDateString(item.date);

        if (item.stage === stage) {
          return false;
        }

        if (nextSelectedDates.has(normalizedDate)) {
          return false;
        }

        return true;
      });

      const updatedStageDays = nextStageDates.map((date) => {
        const previousMeta = metaByDate.get(date);

        return {
          id: previousMeta?.id,
          createdAt: previousMeta?.createdAt,
          updatedAt: previousMeta?.updatedAt,
          date,
          stage,
        };
      });

      return [...remainingDays, ...updatedStageDays].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
    });

    setErrors((prev) => ({ ...prev, days: undefined }));
  }

  function removeDay(date: string) {
    const normalizedDate = normalizeDateString(date);

    setDays((prev) =>
      prev.filter((item) => normalizeDateString(item.date) !== normalizedDate),
    );
  }

  function validate() {
    const nextErrors: {
      standName?: string;
      supplierName?: string;
      location?: string;
      days?: string;
    } = {};

    if (!standName.trim()) nextErrors.standName = "Informe o nome do stand.";
    if (!supplierName.trim()) nextErrors.supplierName = "Informe o fornecedor.";
    if (!location.trim()) nextErrors.location = "Informe o local.";
    if (!days.length) nextErrors.days = "Selecione pelo menos um dia.";

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    try {
      setSubmitting(true);

      const uniqueDaysMap = new Map<string, StandDay>();

      for (const day of days) {
        const normalizedDate = normalizeDateString(day.date);

        if (!normalizedDate) continue;

        uniqueDaysMap.set(normalizedDate, {
          date: normalizedDate,
          stage: day.stage,
        });
      }

      const payload: StandItemInput = {
        standName: standName.trim(),
        supplierName: supplierName.trim(),
        location: location.trim(),
        days: Array.from(uniqueDaysMap.values()).sort((a, b) =>
          a.date.localeCompare(b.date),
        ),
      };

      if (isEditing && editingStand && onUpdate) {
        await onUpdate(editingStand.id, payload);
      } else {
        await onSave(payload);
      }

      resetForm();
      handleOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    onOpenModalEditChange?.(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar stand" : "Criar novo stand"}
          </DialogTitle>

          <DialogDescription>
            Selecione os dias diretamente no calendario de cada etapa. Cada dia
            pode pertencer a apenas uma etapa por vez.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="standName">Nome do stand</Label>
              <Input
                id="standName"
                placeholder="Ex: Stand HYS"
                value={standName}
                onChange={(e) => {
                  setStandName(e.target.value);
                  setErrors((prev) => ({ ...prev, standName: undefined }));
                }}
              />
              {errors.standName ? (
                <span className="text-sm text-red-500">{errors.standName}</span>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="supplierName">Fornecedor</Label>
              <Input
                id="supplierName"
                placeholder="Ex: Fornecedor XPTO"
                value={supplierName}
                onChange={(e) => {
                  setSupplierName(e.target.value);
                  setErrors((prev) => ({ ...prev, supplierName: undefined }));
                }}
              />
              {errors.supplierName ? (
                <span className="text-sm text-red-500">
                  {errors.supplierName}
                </span>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                placeholder="Ex: Pavilhão A"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setErrors((prev) => ({ ...prev, location: undefined }));
                }}
              />
              {errors.location ? (
                <span className="text-sm text-red-500">{errors.location}</span>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 justify-items-center">
            {STAGE_OPTIONS.map((stageOption) => (
              <div
                key={stageOption.value}
                className="rounded-2xl border p-4 w-fit"
              >
                <div className="mb-3 flex items-center gap-2 font-medium">
                  <CalendarIcon className="h-4 w-4" />
                  {stageOption.label}
                </div>

                <Calendar
                  mode="multiple"
                  locale={ptBR}
                  selected={stageDates[stageOption.value].map(fromISODate)}
                  onSelect={(selected) =>
                    setStageCalendar(stageOption.value, selected)
                  }
                  className="rounded-md border"
                />
              </div>
            ))}
          </div>

          {errors.days ? (
            <span className="text-sm text-red-500">{errors.days}</span>
          ) : null}

          <div className="rounded-2xl border p-4">
            <div className="mb-3 font-medium">Resumo dos dias selecionados</div>

            {!days.length ? (
              <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                Nenhum dia selecionado ainda.
              </div>
            ) : (
              <div className="max-h-[400px] space-y-3 overflow-auto">
                {[...days]
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((day) => {
                    const parsedDate = fromISODate(day.date);
                    const isValidDate = !Number.isNaN(parsedDate.getTime());
                    const stageLabel =
                      STAGE_OPTIONS.find((option) => option.value === day.stage)
                        ?.label ?? day.stage;

                    return (
                      <div
                        key={day.id ?? day.date}
                        className="grid gap-3 rounded-xl border p-3 md:grid-cols-[minmax(0,1fr)_180px_44px]"
                      >
                        <div className="flex items-center text-sm font-medium">
                          {isValidDate
                            ? format(parsedDate, "dd/MM/yyyy - EEEE", {
                                locale: ptBR,
                              })
                            : "Data inválida"}
                        </div>

                        <div className="flex items-center rounded-md border px-3 text-sm text-muted-foreground">
                          {stageLabel}
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeDay(day.date)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>

          <Button type="button" onClick={handleSave} disabled={submitting}>
            {submitting
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Salvar stand"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
