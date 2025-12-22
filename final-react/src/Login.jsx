import { useState } from "react";
import { useNavigate } from "react-router-dom";

// use Vite env variable if provided, otherwise use relative paths so dev proxy works
const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await parseResponse(res);
      if (!res.ok) {
        setError((data && (data.error || data.message)) || `${res.status} ${res.statusText}`);
        return;
      }
      if (!data || !data.token) {
        setError("Login succeeded but no token returned");
        return;
      }
      localStorage.setItem("token", data.token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  async function register(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await parseResponse(res);
      if (!res.ok) {
        setError((data && (data.error || data.message)) || `${res.status} ${res.statusText}`);
        return;
      }
      // auto-login after register
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const loginData = await parseResponse(loginRes);
      if (!loginRes.ok) {
        setError((loginData && (loginData.error || loginData.message)) || `${loginRes.status} ${loginRes.statusText}`);
        return;
      }
      if (!loginData || !loginData.token) {
        setError("Login after register succeeded but no token returned");
        return;
      }
      localStorage.setItem("token", loginData.token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  async function parseResponse(res) {
    const ct = res.headers.get("content-type") || "";
    if (res.status === 204) return null;
    if (ct.includes("application/json")) {
      try {
        return await res.json();
      } catch (e) {
        return null;
      }
    }
    // fallback to text
    try {
      const text = await res.text();
      if (!text) return null;
      try {
        return JSON.parse(text);
      } catch (e) {
        return { message: text };
      }
    } catch (e) {
      return null;
    }
  }

  return (
    <div style={{maxWidth:400, margin:"40px auto", padding:20,border:"1px solid #ddd",borderRadius:8}}>
      <h2>登入</h2>
      <form onSubmit={submit}>
        <div style={{marginBottom:8}}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            style={{width:"100%",padding:8}}
          />
        </div>
        <div style={{marginBottom:8}}>
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            style={{width:"100%",padding:8}}
          />
        </div>
        {error && <div style={{color:"red",marginBottom:8}}>{error}</div>}
        <div style={{display:"flex",gap:8}}>
          <button type="submit">登入</button>
          <button type="button" onClick={register}>註冊</button>
        </div>
      </form>
    </div>
  );
}
