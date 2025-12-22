import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import Header from "./components/Header";

export default function App() {
  return (
    <BrowserRouter>
      <Header /> {/* 👈 永遠顯示在右上角 */}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
