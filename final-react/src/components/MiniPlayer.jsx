import { usePlayer } from "../context/PlayerContext";

export default function MiniPlayer() {
  const {
    nowPlaying,
    currentSong,
    progress,
    seekTo,
    volume,
    muted,
    setVolume,
    toggleMute,
    playMode,
    togglePlayMode,
    togglePlay,
    playNext,
    playPrev,
    closePlayer,

    // ✅ NEW: 來自 PlayerContext
    vizBars,
  } = usePlayer();

  if (!nowPlaying.isOpen || !currentSong) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 9999,
        padding: "14px 16px",
        borderRadius: 18,
        background: "rgba(0,0,0,.60)",
        color: "#fff",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* 歌名 */}
      <div
        style={{
          fontWeight: 800,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        正在播放：{currentSong.title}
      </div>

      {/* ✅ NEW: 音量動畫（播放中會跳） */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 5,
          height: 36,
          padding: "6px 10px",
          borderRadius: 12,
          background: "rgba(255,255,255,.10)",
          border: "1px solid rgba(255,255,255,.10)",
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        {(vizBars || Array.from({ length: 22 }, () => 0.12)).map((b, i) => (
          <span
            key={i}
            style={{
              width: 5,
              borderRadius: 999,
              background: "rgba(255,255,255,.85)",
              height: `${Math.round(6 + (nowPlaying.isPlaying ? b : 0.12) * 28)}px`,
              transition: "height 120ms linear",
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      {/* 進度條 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12 }}>{formatTime(progress.currentTime)}</span>

        <input
          type="range"
          min={0}
          max={progress.duration || 0}
          value={Math.min(progress.currentTime, progress.duration || 0)}
          onChange={(e) => seekTo(Number(e.target.value))}
          style={{ flex: 1 }}
        />

        <span style={{ fontSize: 12 }}>{formatTime(progress.duration)}</span>
      </div>

      {/* 控制列 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          清單：{nowPlaying.emotion}｜第 {nowPlaying.index + 1} 首
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={togglePlayMode} style={btn} title="播放模式">
            {playMode === "normal" && "▶️"}
            {playMode === "shuffle" && "🔀"}
            {playMode === "repeat-one" && "🔁"}
          </button>
          <button onClick={playPrev} style={btn}>⏮</button>
          <button onClick={togglePlay} style={btn}>
            {nowPlaying.isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={playNext} style={btn}>⏭</button>
          <button onClick={closePlayer} style={btn}>✕</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={toggleMute} style={btn}>
            {muted || volume === 0 ? "🔇" : volume < 50 ? "🔉" : "🔊"}
          </button>

          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: 80 }}
          />
        </div>
      </div>
    </div>
  );
}

const btn = {
  borderRadius: 10,
  padding: "6px 10px",
  background: "rgba(255,255,255,.15)",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

function formatTime(sec = 0) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
