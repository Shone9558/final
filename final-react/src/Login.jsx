import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "./components/AuthCard";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function parseResponse(res) {
    const ct = res.headers.get("content-type") || "";
    if (res.status === 204) return null;
    if (ct.includes("application/json")) {
      try {
        return await res.json();
      } catch {
        return null;
      }
    }
    try {
      const text = await res.text();
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch {
        return { message: text };
      }
    } catch {
      return null;
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseResponse(res);

      if (!res.ok) {
        setError((data && (data.error || data.message)) || `${res.status} ${res.statusText}`);
        return;
      }
      if (!data?.token) {
        setError("Login succeeded but no token returned");
        return;
      }
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("authchange"));
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  const labelStyle = { fontSize: 13, fontWeight: 700, marginBottom: 6 };
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(0,0,0,.12)",
    outline: "none",
    fontSize: 14,
  };

  return (
    <AuthCard title="Login" subtitle="Enter your credentials to access your account">
      <form onSubmit={submit}>
        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>Email</div>
          <input
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>Password</div>
          <input
            placeholder=""
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ color: "#d33", fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(180deg, #111, #000)",
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Sign In
        </button>
      </form>
    </AuthCard>
  );
}
