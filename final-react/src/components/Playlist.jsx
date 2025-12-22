import { usePlayer } from "../context/PlayerContext";

export default function Playlist() {
  const { currentEmotion, playlists, addSongToEmotion, removeSongAt, playAt } = usePlayer();
  const list = playlists[currentEmotion] || [];

  async function addVideo() {
    const url = prompt("輸入 YouTube 連結或 11 碼影片ID");
    if (!url) return;

    try {
      await addSongToEmotion(currentEmotion, url);
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div style={{ padding: 20, width: "min(900px, 96vw)" }}>
      <div style={headerRow}>
        <h3 style={{ margin: 0 }}>{currentEmotion} 播放清單</h3>
        <button onClick={addVideo} style={addBtn}>➕ 加入歌曲</button>
      </div>

      {list.length === 0 ? (
        <div style={emptyBox}>這個情緒還沒有歌曲，先新增一首吧～</div>
      ) : (
        <ul style={ulStyle}>
          {list.map((song, i) => (
            <li key={`${song.id}-${i}`} style={itemStyle}>
              {/* 左邊：歌名 */}
              <div style={titleWrap}>
                <div style={titleStyle} title={song.title}>
                  {song.title || `YouTube：${song.id}`}
                </div>
                <div style={subStyle}>#{i + 1} · {song.id}</div>
              </div>

              {/* 右邊：按鈕（水平排列 + 同一列） */}
              <div style={actions}>
                <button onClick={() => playAt(currentEmotion, i)} style={{ ...iconBtn, ...playBtn }}>
                  ▶ 播放
                </button>
                <button onClick={() => removeSongAt(currentEmotion, i)} style={{ ...iconBtn, ...delBtn }}>
                  ✕ 刪除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ===== Styles ===== */

const headerRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 14,
};

const addBtn = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "rgba(255,255,255,0.9)",
  cursor: "pointer",
  fontWeight: 700,
};

const emptyBox = {
  padding: 16,
  borderRadius: 14,
  border: "1px dashed rgba(0,0,0,0.18)",
  background: "rgba(255,255,255,0.6)",
  opacity: 0.9,
};

const ulStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 12, // ✅ 每首歌之間更明顯的間隔
};

const itemStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "14px 14px",
  borderRadius: 14,
  border: "1px solid rgba(0,0,0,0.12)",   // ✅ 框住
  background: "rgba(255,255,255,0.85)",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
};

const titleWrap = {
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  gap: 4,
  flex: 1, // ✅ 左邊撐開，右邊按鈕固定
};

const titleStyle = {
  fontWeight: 800,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const subStyle = {
  fontSize: 12,
  opacity: 0.65,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const actions = {
  display: "flex",
  alignItems: "center",
  gap: 10, // ✅ 播放/刪除按鈕平行且有距離
  flexShrink: 0,
};

const iconBtn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  cursor: "pointer",
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const playBtn = {
  background: "rgba(0,0,0,0.06)",
};

const delBtn = {
  background: "rgba(255,0,0,0.06)",
};
