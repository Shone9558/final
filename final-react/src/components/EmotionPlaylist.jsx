import { useMemo, useState } from "react";
import { usePlayer } from "../context/PlayerContext";

const EMOJI = {
  happy: "😄",
  sad: "😢",
  relax: "🍃",
  angry: "😡",
};

export default function EmotionPlaylist() {
  const { currentEmotion, playlists, addSongToEmotion, removeSongAt, playAt } = usePlayer();
  const [input, setInput] = useState("");
  const list = playlists[currentEmotion] || [];

  const placeholder = useMemo(() => "貼 YouTube 連結或 11 碼影片ID", []);

  const handleAdd = () => {
    try {
      addSongToEmotion(currentEmotion, input);
      setInput("");
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ width: "min(900px, 95vw)", margin: "16px auto" }}>
      <h2 style={{ margin: "8px 0" }}>
        {EMOJI[currentEmotion]} {currentEmotion} 播放清單
      </h2>

      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,.25)" }}
        />
        <button onClick={handleAdd} style={{ padding: "10px 14px", borderRadius: 10 }}>
          ➕ 加入
        </button>
      </div>

      {list.length === 0 ? (
        <p style={{ opacity: 0.8 }}>目前還沒有歌曲，先加一首吧！</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
          {list.map((song, idx) => (
            <li
              key={song.id + idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(255,255,255,.18)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => playAt(currentEmotion, idx)} style={{ borderRadius: 10, padding: "8px 10px" }}>
                  ▶
                </button>
                <div>
                  <div style={{ fontWeight: 700 }}>YouTube ID：{song.id}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>#{idx + 1}</div>
                </div>
              </div>

              <button onClick={() => removeSongAt(currentEmotion, idx)} style={{ borderRadius: 10, padding: "8px 10px" }}>
                🗑
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
