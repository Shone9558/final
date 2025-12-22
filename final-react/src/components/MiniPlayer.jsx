import { usePlayer } from "../context/PlayerContext";

export default function MiniPlayer() {
  const {
    nowPlaying,
    currentSong,
    togglePlay,
    playNext,
    playPrev,
    closePlayer,
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
        padding: "12px 14px",
        borderRadius: 18,
        background: "rgba(0,0,0,.60)",
        color: "#fff",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
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

        <div style={{ fontSize: 12, opacity: 0.8 }}>
          清單：{nowPlaying.emotion}｜第 {nowPlaying.index + 1} 首
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={playPrev} style={btn}>⏮</button>
        <button onClick={togglePlay} style={btn}>
          {nowPlaying.isPlaying ? "⏸" : "▶"}
        </button>
        <button onClick={playNext} style={btn}>⏭</button>
        <button onClick={closePlayer} style={btn}>✕</button>
      </div>
    </div>
  );
}

const btn = {
  borderRadius: 10,
  padding: "8px 10px",
};
