import { Navigate, Route, Routes } from "react-router-dom";
import { LoginForm } from "./Pages/Login";
import { CalendarPage } from "./Pages/Calendar";
import { LogBookPage } from "./Pages/LogBook";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/calendar" replace />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/logbook" element={<LogBookPage />} />
      </Route>
      <Route path="/login" element={<LoginForm />} />
    </Routes>
  );
}
