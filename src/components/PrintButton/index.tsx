import html2canvas from "html2canvas";
import { useState, type RefObject } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type PrintButtonProps = {
  containerRef: RefObject<HTMLDivElement | null>;
};

function toMonthInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function toMonthIndex(monthInputValue: string) {
  const [yearValue, monthValue] = monthInputValue.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);

  if (!year || !month || month < 1 || month > 12) {
    return null;
  }

  return year * 12 + (month - 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function PrintButton({ containerRef }: PrintButtonProps) {
  const [startPeriod, setStartPeriod] = useState(() =>
    toMonthInputValue(addMonths(new Date(), -1)),
  );
  const [endPeriod, setEndPeriod] = useState(() =>
    toMonthInputValue(addMonths(new Date(), 1)),
  );

  async function handlePrint() {
    if (!containerRef.current) {
      alert("Ref não encontrada");
      return;
    }

    const startMonthIndex = toMonthIndex(startPeriod);
    const endMonthIndex = toMonthIndex(endPeriod);

    if (startMonthIndex === null || endMonthIndex === null) {
      alert("Selecione um mês/ano válido para início e final.");
      return;
    }

    if (startMonthIndex > endMonthIndex) {
      alert("O início do período não pode ser depois do final.");
      return;
    }

    const original = containerRef.current;
    const clone = original.cloneNode(true) as HTMLDivElement;
    let visibleSectionCount = 0;

    clone
      .querySelectorAll<HTMLElement>("section[data-month][data-year]")
      .forEach((section) => {
        const month = Number(section.dataset.month);
        const year = Number(section.dataset.year);

        if (!month || !year) {
          return;
        }

        const sectionMonthIndex = year * 12 + (month - 1);
        const isVisibleInPrint =
          sectionMonthIndex >= startMonthIndex &&
          sectionMonthIndex <= endMonthIndex;

        if (!isVisibleInPrint) {
          section.remove();
          return;
        }

        visibleSectionCount += 1;
      });

    if (visibleSectionCount === 0) {
      alert(
        "Nenhum mês do período selecionado está disponível para exportar. Carregue mais meses e tente novamente.",
      );
      return;
    }

    clone.classList.add("print-mode");
    clone.style.position = "fixed";
    clone.style.left = "0";
    clone.style.top = "0";
    clone.style.zIndex = "-1";
    clone.style.background = "#fff";
    clone.style.padding = "24px";
    clone.style.width = "max-content";
    clone.style.maxWidth = "none";
    clone.style.height = "auto";

    document.body.appendChild(clone);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const fullWidth = clone.scrollWidth;
    const fullHeight = clone.scrollHeight;

    const maxWidth = 1800;
    const maxHeight = 1000;

    const scaleX = maxWidth / fullWidth;
    const scaleY = maxHeight / fullHeight;
    const fitScale = Math.min(scaleX, scaleY, 1);

    clone.style.transform = `scale(${fitScale})`;
    clone.style.transformOrigin = "top left";

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(clone, {
        useCORS: true,
        backgroundColor: "#ffffff",
        scale: 1,
        width: fullWidth * fitScale,
        height: fullHeight * fitScale,
        windowWidth: fullWidth * fitScale,
        windowHeight: fullHeight * fitScale,
      });

      const image = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = image;
      link.download = `cronograma-${startPeriod}-a-${endPeriod}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("erro ao gerar print", error);
      alert("Erro ao gerar print. Veja o console.");
    } finally {
      clone.remove();
    }
  }

  return (
    <div className="no-print flex flex-wrap items-end gap-2">
      <div className="grid gap-1">
        <Label htmlFor="print-start-period">Início</Label>
        <Input
          id="print-start-period"
          type="month"
          value={startPeriod}
          onChange={(event) => setStartPeriod(event.target.value)}
          className="w-[160px]"
        />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="print-end-period">Final</Label>
        <Input
          id="print-end-period"
          type="month"
          value={endPeriod}
          onChange={(event) => setEndPeriod(event.target.value)}
          className="w-[160px]"
        />
      </div>

      <Button type="button" onClick={handlePrint}>
        Exportar data
      </Button>
    </div>
  );
}
