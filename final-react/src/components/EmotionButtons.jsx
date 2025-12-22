import { usePlayer } from "../context/PlayerContext";

const emotions = [
  { key: "happy", label: "開心 😄" },
  { key: "sad", label: "難過 😢" },
  { key: "relax", label: "放鬆 🍃" },
  { key: "angry", label: "生氣 😡" },
];

export default function EmotionButtons() {
  const { currentEmotion, selectEmotion } = usePlayer();

  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
      {emotions.map((e) => (
        <button
          key={e.key}
          onClick={() => selectEmotion(e.key)}
          style={{
            padding: "10px 14px",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,.2)",
            background: currentEmotion === e.key ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.18)",
            backdropFilter: "blur(10px)",
          }}
        >
          {e.label}
        </button>
      ))}
    </div>
  );
}
