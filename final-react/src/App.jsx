import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import Header from "./components/Header";
import BackgroundParticles from "./components/BackgroundParticles";

export default function App() {
  return (
    <BrowserRouter>
      {/* ✅ 全域粒子背景：登入/主頁都會有 */}
      <BackgroundParticles />

      {/* ✅ 內容層：蓋在背景上面 */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Header />

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
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
