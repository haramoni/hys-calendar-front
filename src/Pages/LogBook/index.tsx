import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Plus, Trash } from "lucide-react";

import { LogBookModal } from "@/components/LogBookModal";
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
import { Button } from "@/components/ui/button";
import {
  createLogbook,
  deleteLogbook,
  getLogbooks,
  updateLogbook,
} from "@/services/logbook";
import { createPerson, getPeople } from "@/services/people";
import type {
  LogbookEntry,
  LogbookFormValues,
  LogbookPayload,
} from "@/types/logbook";
import type { Person } from "@/types/people";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function getPersonName(entry: LogbookEntry) {
  return entry.personName ?? entry.person?.name ?? entry.people?.name ?? "-";
}

export function LogBookPage() {
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LogbookEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<LogbookEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [logbooksData, peopleData] = await Promise.all([
          getLogbooks(),
          getPeople(),
        ]);
        setEntries(logbooksData);
        setPeople(peopleData);
      } catch {
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalValues = useMemo(() => {
    return entries.reduce((acc, count) => {
      return acc + count.value;
    }, 0);
  }, [entries]);

  async function resolvePersonId(personName: string) {
    const normalizedName = personName.trim().toLowerCase();
    const existingPerson = people.find(
      (person) => person.name.trim().toLowerCase() === normalizedName,
    );

    if (existingPerson) {
      return existingPerson.id;
    }

    const createdPerson = await createPerson(personName.trim());
    setPeople((prev) =>
      [...prev, createdPerson].sort((a, b) => a.name.localeCompare(b.name)),
    );
    return createdPerson.id;
  }

  async function handleCreateOrUpdate(values: LogbookFormValues) {
    try {
      setSaving(true);
      setError("");

      const personId = await resolvePersonId(values.personName);
      const payload: LogbookPayload = {
        value: Number(values.value),
        date: values.date,
        reason: values.reason,
        personId,
      };

      if (editingEntry) {
        await updateLogbook(editingEntry.id, payload);
      } else {
        await createLogbook(payload);
      }

      setModalOpen(false);
      setEditingEntry(null);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar lançamento.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!entryToDelete) return;

    try {
      setDeleting(true);
      await deleteLogbook(entryToDelete.id);
      setEntryToDelete(null);
      const fetchData = async () => {
        try {
          setLoading(true);
          setError("");

          const [logbooksData, peopleData] = await Promise.all([
            getLogbooks(),
            getPeople(),
          ]);
          setEntries(logbooksData);
          setPeople(peopleData);
        } catch {
          return;
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir lançamento.");
    } finally {
      setDeleting(false);
    }
  }

  function handleNewEntry() {
    setEditingEntry(null);
    setModalOpen(true);
  }

  function handleEdit(entry: LogbookEntry) {
    setEditingEntry(entry);
    setModalOpen(true);
  }

  return (
    <div className="brand-page min-h-screen p-4 sm:p-6">
      <div className="mx-auto space-y-8">
        <section className="brand-panel rounded-[24px] p-6 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-primary)]">
                LogBook
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Controle entradas e saídas com histórico de pessoa, motivo e
                data.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-[rgb(228,228,228)] bg-[rgb(248,248,248)] px-4 py-3 text-sm">
                Log de valores:{" "}
                <strong>{currencyFormatter.format(totalValues)}</strong>
              </div>

              <Button type="button" onClick={handleNewEntry} disabled={saving}>
                <Plus className="mr-2 h-4 w-4" />
                Novo lançamento
              </Button>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <section className="brand-panel rounded-[20px] p-0">
          {loading ? (
            <div className="p-6">
              <p>Carregando logbook...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center">
              <h2 className="text-xl font-semibold text-[var(--color-primary)]">
                Nenhum lançamento ainda
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Crie o primeiro registro para começar a preencher o logbook.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-[rgb(246,246,246)] text-left">
                    <th className="border-b border-[rgb(228,228,228)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)]">
                      Pessoa
                    </th>
                    <th className="border-b border-[rgb(228,228,228)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)]">
                      Valor
                    </th>
                    <th className="min-w-[320px] border-b border-[rgb(228,228,228)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)]">
                      Motivo
                    </th>
                    <th className="border-b border-[rgb(228,228,228)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)]">
                      Data
                    </th>
                    <th className="border-b border-[rgb(228,228,228)] px-4 py-3 text-right text-sm font-semibold text-[var(--color-primary)]">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[rgb(250,250,250)]">
                      <td className="border-b border-[rgb(238,238,238)] px-4 py-4 text-sm font-medium text-[var(--color-background)]">
                        {getPersonName(entry)}
                      </td>
                      <td
                        className={`border-b border-[rgb(238,238,238)] px-4 py-4 text-sm font-semibold`}
                      >
                        {currencyFormatter.format(entry.value)}
                      </td>

                      <td className="border-b border-[rgb(238,238,238)] px-4 py-4 text-sm text-[var(--color-background)]">
                        {entry.reason}
                      </td>
                      <td className="border-b border-[rgb(238,238,238)] px-4 py-4 text-sm text-muted-foreground">
                        {format(
                          new Date(`${entry.date.slice(0, 10)}T00:00:00`),
                          "dd/MM/yyyy",
                          {
                            locale: ptBR,
                          },
                        )}
                      </td>
                      <td className="border-b border-[rgb(238,238,238)] px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(entry)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setEntryToDelete(entry)}
                          >
                            <Trash className="h-4 w-4 text-[var(--color-highlight)]" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <LogBookModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setEditingEntry(null);
          }
        }}
        onSave={handleCreateOrUpdate}
        people={people}
        editingEntry={editingEntry}
      />

      <AlertDialog
        open={!!entryToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setEntryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>
              {entryToDelete
                ? `Você vai remover o lançamento de ${getPersonName(entryToDelete)}.`
                : "Essa ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
