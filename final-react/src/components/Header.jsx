import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Header() {
  const location = useLocation();
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    // 每次換頁就重新讀 token（登入 navigate("/") 會觸發）
    setToken(localStorage.getItem("token"));
  }, [location.pathname]);

  function handleLogout() {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authchange"));
    window.location.href = "/login"; // 你要保留刷新也行（更乾淨）
  }

  return (
    <header style={headerStyle}>
      {!token ? (
        <>
          <Link to="/login"><button style={btnStyle}>登入</button></Link>
          <Link to="/login"><button style={btnStyle}>註冊</button></Link>
        </>
      ) : (
        <button onClick={handleLogout} style={btnStyle}>登出</button>
      )}
    </header>
  );
}

const headerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: "0 24px",
  gap: 12,
  zIndex: 10000,
  background: "rgba(0,0,0,0.25)",
  backdropFilter: "blur(10px)",
};

const btnStyle = {
  padding: "8px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.3)",
  background: "rgba(255,255,255,.2)",
  color: "#fff",
  cursor: "pointer",
};
