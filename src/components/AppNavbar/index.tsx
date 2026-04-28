import { useState } from "react";
import { BookOpenText, CalendarDays, LogOut, Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/calendar", label: "Calendário", icon: CalendarDays },
  { to: "/logbook", label: "LogBook", icon: BookOpenText },
];

function getLinkClass(isActive: boolean) {
  return [
    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
    isActive
      ? "bg-[var(--color-primary)] text-white shadow-[0_8px_20px_rgba(210,7,56,0.22)]"
      : "text-[var(--color-background)] hover:bg-[rgb(245,245,245)] hover:text-[var(--color-primary)]",
  ].join(" ");
}

export function AppNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("hys_token");
    localStorage.removeItem("hys_user");
    navigate("/login", { replace: true });
  }

  function handleCloseMenu() {
    setIsOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(228,228,228)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgb(248,248,248)]">
            <img
              src="/icon-hys.jpg"
              alt="HYS"
              className="h-full w-full rounded-2xl object-cover"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-secondary)]">
              CENTRAL
            </p>
            <p className="text-lg font-bold text-[var(--color-primary)]">HYS</p>
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => getLinkClass(isActive)}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button type="button" variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[rgb(228,228,228)] bg-white text-[var(--color-primary)] md:hidden"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-[rgb(228,228,228)] bg-white md:hidden">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-4 sm:px-6">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={handleCloseMenu}
                className={({ isActive }) => getLinkClass(isActive)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="mt-2"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
