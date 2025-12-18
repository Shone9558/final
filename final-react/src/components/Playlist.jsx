export default function Playlist({
  emotion,
  playlists,
  setPlaylists,
  setCurrentVideo
}) {
  if (!emotion) return null;

  const list = playlists[emotion];

  function addVideo() {
    const url = prompt("輸入 YouTube 連結");
    if (!url) return;

    const match = url.match(/v=([^&]+)/);
    if (!match) {
      alert("連結錯誤");
      return;
    }

    setPlaylists({
      ...playlists,
      [emotion]: [...list, match[1]]
    });
  }

  return (
    <div style={{ padding: "20px" }}>
      <h3>{emotion} 播放清單</h3>
      <button onClick={addVideo}>➕ 加入歌曲</button>

      <ul>
        {list.map((id, i) => (
          <li key={i}>
            歌曲 {i + 1}
            <button onClick={() => setCurrentVideo(id)}>▶</button>
            <button
              onClick={() =>
                setPlaylists({
                  ...playlists,
                  [emotion]: list.filter((_, idx) => idx !== i)
                })
              }
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
