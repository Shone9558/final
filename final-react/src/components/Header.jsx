import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // 讓 Header 會即時跟著登入/登出更新
  useEffect(() => {
    const sync = () => setToken(localStorage.getItem("token"));
    sync();
    window.addEventListener("authchange", sync);
    return () => window.removeEventListener("authchange", sync);
  }, []);

  // 換頁也同步一次（保險）
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, [location.pathname]);

  function handleLogout() {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("authchange"));
    navigate("/login?mode=login", { replace: true });
  }

  return (
    <div style={wrap}>
      <header style={bar}>
        <div
          style={left}
          onClick={() => navigate(token ? "/" : "/login?mode=login")}
        >
          <div style={logoDot} />
          <div style={brand}>
            情緒音樂盒
            <div style={subTitle}>Mood Playlist</div>
          </div>
        </div>

        {/* ✅ 只在「登入後」顯示登出 */}
        {token ? (
          <button onClick={handleLogout} style={btnLogout}>
            登出
          </button>
        ) : (
          <div style={{ width: 1 }} />
        )}
      </header>
    </div>
  );
}

/* ===== styles ===== */

// ✅ 清除 Header 下方「色塊」：外層 wrap 改透明、不要 blur/底線
const wrap = {
  position: "sticky",
  top: 0,
  zIndex: 9999,
  width: "100%",
  display: "flex",
  justifyContent: "center",
  padding: "12px 14px",

  background: "transparent",     // ✅ 關鍵：不要外層底色
  backdropFilter: "none",        // ✅ 關鍵：不要霧面層
  borderBottom: "none",          // ✅ 關鍵：不要分隔線
};

// Header 本體維持好看的卡片
const bar = {
  width: "min(980px, 96vw)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
  padding: "10px 12px",
  borderRadius: 16,

  background: "rgba(255,255,255,0.88)",
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
};

const left = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  cursor: "pointer",
  flex: 1,
};

const logoDot = {
  width: 12,
  height: 12,
  borderRadius: 999,
  background: "linear-gradient(180deg, #111, #000)",
  boxShadow: "0 4px 14px rgba(0,0,0,0.20)",
};

const brand = {
  fontWeight: 900,
  letterSpacing: "0.5px",
  whiteSpace: "nowrap",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  lineHeight: 1.1,
  fontSize: 22,
};

const subTitle = {
  fontSize: 13,
  fontWeight: 700,
  opacity: 0.6,
  marginTop: 4,
  textAlign: "center",
};

const btnLogout = {
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer",
  border: "1px solid rgba(255,0,0,0.18)",
  background: "rgba(255,0,0,0.06)",
};
