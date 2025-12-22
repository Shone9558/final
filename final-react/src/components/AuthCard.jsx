export default function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div
        style={{
          width: 420,
          border: "1px solid rgba(0,0,0,.08)",
          borderRadius: 16,
          background: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,.06)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "22px 22px 16px 22px" }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{title}</div>
          <div style={{ color: "rgba(0,0,0,.55)", fontSize: 13 }}>{subtitle}</div>
        </div>

        <div style={{ borderTop: "1px solid rgba(0,0,0,.06)" }} />

        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </div>
  );
}
