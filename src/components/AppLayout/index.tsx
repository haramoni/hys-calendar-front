import { Outlet } from "react-router-dom";

import { AppNavbar } from "@/components/AppNavbar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-white">
      <AppNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
