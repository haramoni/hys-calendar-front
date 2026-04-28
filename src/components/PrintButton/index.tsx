import html2canvas from "html2canvas";
import type { RefObject } from "react";
import { Button } from "../ui/button";

type PrintButtonProps = {
  containerRef: RefObject<HTMLDivElement | null>;
};

export function PrintButton({ containerRef }: PrintButtonProps) {
  async function handlePrint() {
    if (!containerRef.current) {
      alert("Ref não encontrada");
      return;
    }

    const original = containerRef.current;
    const clone = original.cloneNode(true) as HTMLDivElement;
    const today = new Date();
    const currentMonthIndex =
      today.getFullYear() * 12 + today.getMonth();

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
          sectionMonthIndex >= currentMonthIndex - 1 &&
          sectionMonthIndex <= currentMonthIndex + 1;

        if (!isVisibleInPrint) {
          section.remove();
        }
      });

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
      link.download = "cronograma.png";
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
    <Button type="button" onClick={handlePrint} className="no-print">
      Exportar data
    </Button>
  );
}
