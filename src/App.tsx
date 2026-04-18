import { Routes, Route } from "react-router-dom";
import { LoginForm } from "./Pages/Login";
import { CalendarPage } from "./Pages/Calendar";
import { ProtectedRoute } from "./routes/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<LoginForm />} />
    </Routes>
  );
}
