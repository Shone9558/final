import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthCard from "./components/AuthCard";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ mode 由網址控制：/login?mode=login or /login?mode=register
  const mode = useMemo(() => {
    const m = searchParams.get("mode");
    return m === "register" ? "register" : "login";
  }, [searchParams]);

  const isRegister = mode === "register";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 如果使用者直接打 /login（沒有 mode），補上預設
  useEffect(() => {
    if (!searchParams.get("mode")) {
      setSearchParams({ mode: "login" }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    const endpoint = isRegister ? "/auth/register" : "/auth/login";

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseResponse(res);

      if (!res.ok) {
        setError((data && (data.error || data.message)) || `${res.status} ${res.statusText}`);
        return;
      }

      // ✅ 你後端 register 如果「沒有直接回 token」，就註冊成功後自動再登入一次
      if (isRegister && !data?.token) {
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await parseResponse(loginRes);

        if (!loginRes.ok) {
          setError((loginData && (loginData.error || loginData.message)) || `${loginRes.status} ${loginRes.statusText}`);
          return;
        }

        if (!loginData?.token) {
          setError("Register succeeded but login returned no token");
          return;
        }

        localStorage.setItem("token", loginData.token);
      } else {
        // login 或 register 有回 token 的情況
        if (!data?.token) {
          setError(`${isRegister ? "Register" : "Login"} succeeded but no token returned`);
          return;
        }
        localStorage.setItem("token", data.token);
      }

      window.dispatchEvent(new Event("authchange"));
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  // 切換模式：會改網址，畫面自然切換
  function switchMode(next) {
    setError("");
    setSearchParams({ mode: next }, { replace: true });
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
    <AuthCard
      title={isRegister ? "Register" : "Login"}
      subtitle={isRegister ? "Create an account to start using the app" : "Enter your credentials to access your account"}
    >
      {/* ✅ 你也可以在卡片內加一個切換小按鈕（更直覺） */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => switchMode("login")}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,.12)",
            background: !isRegister ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)",
            color: !isRegister ? "#fff" : "#111",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          登入
        </button>

        <button
          type="button"
          onClick={() => switchMode("register")}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,.12)",
            background: isRegister ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)",
            color: isRegister ? "#fff" : "#111",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          註冊
        </button>
      </div>

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
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        {error && <div style={{ color: "#d33", fontSize: 13, marginBottom: 12 }}>{error}</div>}

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
          {isRegister ? "Create Account" : "Sign In"}
        </button>
      </form>
    </AuthCard>
  );
}
