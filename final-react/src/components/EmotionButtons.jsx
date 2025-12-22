import { usePlayer } from "../context/PlayerContext";

const DEFAULT_EMOTIONS = ["happy", "sad", "relax", "angry"];

export default function EmotionButtons() {
  const {
    emotions,
    currentEmotion,
    selectEmotion,
    addEmotion,
    removeEmotion,
  } = usePlayer();

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
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {emotions.map((e) => (
        <div
          key={e}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <button
            onClick={() => selectEmotion(e)}
            style={{
              padding: "10px 14px",
              borderRadius: 14,
              background:
                currentEmotion === e
                  ? "rgba(255,255,255,.35)"
                  : "rgba(255,255,255,.18)",
            }}
          >
            {e}
          </button>

          {/* 🗑 只有「非預設情緒」才能刪 */}
          {!DEFAULT_EMOTIONS.includes(e) && (
            <button
              onClick={() => handleRemoveEmotion(e)}
              title="刪除歌單"
              style={{
                padding: "6px 8px",
                borderRadius: 10,
                background: "rgba(255,80,80,.25)",
                border: "none",
                cursor: "pointer",
              }}
            >
              🗑
            </button>
          )}
        </div>
      ))}

      <button
        onClick={handleAddEmotion}
        style={{
          padding: "10px 14px",
          borderRadius: 14,
          background: "rgba(120,255,120,.25)",
        }}
      >
        ➕ 新增情緒
      </button>
    </div>
  );
}
