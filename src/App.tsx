import { Routes, Route } from "react-router-dom";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CalendarPage />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
