import { useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LogbookEntry, LogbookFormValues } from "@/types/logbook";
import type { Person } from "@/types/people";

type LogBookModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: LogbookFormValues) => Promise<void>;
  people: Person[];
  editingEntry?: LogbookEntry | null;
};

type LogBookModalContentProps = {
  initialValues: LogbookFormValues;
  onOpenChange: (open: boolean) => void;
  onSave: (values: LogbookFormValues) => Promise<void>;
  people: Person[];
  isEditing: boolean;
};

const EMPTY_VALUES: LogbookFormValues = {
  value: "",
  date: "",
  reason: "",
  personName: "",
};

export function LogBookModal({
  open,
  onOpenChange,
  onSave,
  people,
  editingEntry,
}: LogBookModalProps) {
  const isEditing = !!editingEntry;

  const initialValues = useMemo<LogbookFormValues>(() => {
    if (!editingEntry) return EMPTY_VALUES;

    return {
      value: String(editingEntry.value),
      date: editingEntry.date.slice(0, 10),
      reason: editingEntry.reason,
      personName:
        editingEntry.personName ??
        editingEntry.person?.name ??
        editingEntry.people?.name ??
        "",
    };
  }, [editingEntry]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <LogBookModalContent
          key={editingEntry?.id ?? "new"}
          initialValues={initialValues}
          onOpenChange={onOpenChange}
          onSave={onSave}
          people={people}
          isEditing={isEditing}
        />
      ) : null}
    </Dialog>
  );
}

function LogBookModalContent({
  initialValues,
  onOpenChange,
  onSave,
  people,
  isEditing,
}: LogBookModalContentProps) {
  const [values, setValues] = useState<LogbookFormValues>(initialValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LogbookFormValues, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);

  const peopleSuggestions = useMemo(() => {
    const query = values.personName.trim().toLowerCase();

    if (!query) {
      return people.slice(0, 8);
    }

    return people
      .filter((person) => person.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [people, values.personName]);

  function updateField<K extends keyof LogbookFormValues>(
    field: K,
    nextValue: LogbookFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: nextValue }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const nextErrors: Partial<Record<keyof LogbookFormValues, string>> = {};

    if (!values.personName.trim()) {
      nextErrors.personName = "Informe a pessoa.";
    }

    if (!values.value.trim()) {
      nextErrors.value = "Informe o valor.";
    }

    if (!Number(values.value) || Number(values.value) <= 0) {
      nextErrors.value = "Informe um valor maior que zero.";
    }

    if (!values.date) {
      nextErrors.date = "Informe a data.";
    }

    if (!values.reason.trim()) {
      nextErrors.reason = "Informe o motivo.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    try {
      setSubmitting(true);

      await onSave({
        value: values.value,
        date: values.date,
        reason: values.reason.trim(),
        personName: values.personName.trim(),
      });

      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DialogContent className="border-[rgb(228,228,228)] bg-white sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-[var(--color-primary)]">
          {isEditing ? "Editar lançamento" : "Novo lançamento"}
        </DialogTitle>

        <DialogDescription>
          Escolha uma pessoa existente ou digite um novo nome para cadastrar
          automaticamente.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="personName">Pessoa</Label>

          <Input
            id="personName"
            list="people-suggestions"
            value={values.personName}
            onChange={(event) => updateField("personName", event.target.value)}
            placeholder="Digite o nome da pessoa"
            className="h-11 border-[rgb(228,228,228)]"
          />

          <datalist id="people-suggestions">
            {peopleSuggestions.map((person) => (
              <option key={person.id} value={person.name} />
            ))}
          </datalist>

          <span className="text-xs text-muted-foreground">
            Se o nome não existir, ele será criado ao salvar.
          </span>

          {errors.personName ? (
            <span className="text-sm text-red-500">{errors.personName}</span>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="value">Valor</Label>

            <Input
              id="value"
              type="number"
              min="0"
              step="0.01"
              value={values.value}
              onChange={(event) => updateField("value", event.target.value)}
              placeholder="0.00"
              className="h-11 border-[rgb(228,228,228)]"
            />

            {errors.value ? (
              <span className="text-sm text-red-500">{errors.value}</span>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Data</Label>

            <Input
              id="date"
              type="date"
              value={values.date}
              onChange={(event) => updateField("date", event.target.value)}
              className="h-11 border-[rgb(228,228,228)]"
            />

            {errors.date ? (
              <span className="text-sm text-red-500">{errors.date}</span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="reason">Motivo</Label>

          <textarea
            id="reason"
            value={values.reason}
            onChange={(event) => updateField("reason", event.target.value)}
            placeholder="Descreva o motivo do lançamento"
            className="min-h-28 rounded-md border border-[rgb(228,228,228)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[rgba(210,7,56,0.18)]"
          />

          {errors.reason ? (
            <span className="text-sm text-red-500">{errors.reason}</span>
          ) : null}
        </div>
      </div>

      <DialogFooter className="mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={submitting}
        >
          Cancelar
        </Button>

        <Button type="button" onClick={handleSubmit} disabled={submitting}>
          {submitting
            ? "Salvando..."
            : isEditing
              ? "Salvar alterações"
              : "Registrar lançamento"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
