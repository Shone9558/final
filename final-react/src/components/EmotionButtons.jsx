import { usePlayer } from "../context/PlayerContext";
import { ShimmerButton } from "./ui/shimmer-button";

const DEFAULT_EMOTIONS = ["happy", "sad", "relax", "angry"];

function bgForEmotion(e, selected) {
  // ✅ 未選中：更明顯一點（不要太白）
  if (!selected) return "rgba(0,0,0,.06)";

  switch (e) {
    case "happy":
      return "linear-gradient(135deg, #ffeb99, #ffd84d)";
    case "sad":
      return "linear-gradient(135deg, #6fa8dc, #9fc5e8)";
    case "relax":
      return "linear-gradient(135deg, #b7e1a1, #93c47d)";
    case "angry":
      return "linear-gradient(135deg, #f4b3b3, #e06666)";
    default:
      return "rgba(0,0,0,.08)";
  }
}


export default function EmotionButtons() {
  const { emotions, currentEmotion, selectEmotion, addEmotion, removeEmotion } =
    usePlayer();

  function handleAddEmotion() {
    const name = prompt("輸入新的情緒名稱");
    if (!name) return;
    try {
      addEmotion(name);
    } catch (e) {
      alert(e.message);
    }
  }

  function handleRemoveEmotion(e) {
    if (!confirm(`確定要刪除「${e}」這個歌單嗎？`)) return;
    try {
      removeEmotion(e);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        // ✅ 橫向排列，但會自動換行 → 全部按鈕都看得到
        flexWrap: "wrap",
        gap: 10,
        padding: "10px 6px",
      }}
    >
      {emotions.map((e) => {
        const selected = currentEmotion === e;
        const canDelete = !DEFAULT_EMOTIONS.includes(e);

        return (
          <div
            key={e}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ShimmerButton
              onClick={() => selectEmotion(e)}
              shimmerColor={selected ? "#ffffff" : "rgba(255,255,255,0)"}
              shimmerSize={selected ? "0.14em" : "0.01em"}
              shimmerDuration={selected ? "2s" : "999s"}
              borderRadius="999px"
              background={bgForEmotion(e, selected)}
              style={{
                padding: "10px 16px",
                fontWeight: 700,
                letterSpacing: "0.2px",

                // ✅ 更像按鈕：邊框+手感
                border: selected
                ? "1px solid rgba(0,0,0,.12)"
                : "1px solid rgba(0,0,0,.14)",
                boxShadow: "none",
                cursor: "pointer",

                // ✅ 文字清楚
                color: selected ? "#111" : "#111827",

                // ✅ 讓按鈕至少有大小，不會像純文字
                minHeight: 40,
              }}
            >
              {e}
            </ShimmerButton>

            {canDelete && (
              <button
                onClick={() => handleRemoveEmotion(e)}
                title="刪除歌單"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  border: "1px solid rgba(255,80,80,.35)",
                  background: "rgba(255,80,80,.16)",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                🗑
              </button>
            )}
          </div>
        );
      })}

      <ShimmerButton
        onClick={handleAddEmotion}
        shimmerColor="#ffffff"
        shimmerSize="0.12em"
        shimmerDuration="2s"
        borderRadius="999px"
        background="linear-gradient(135deg, rgba(34,197,94,.95), rgba(16,185,129,.95))"
        style={{
          padding: "10px 16px",
          fontWeight: 800,
          cursor: "pointer",
          border: "1px solid rgba(255,255,255,.25)",
          boxShadow: "none",
          color: "#fff",
          minHeight: 40,
        }}
      >
        新增情緒
      </ShimmerButton>
    </div>
  );
}
