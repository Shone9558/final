import { usePlayer } from "../context/PlayerContext";

export default function Playlist() {
  const { currentEmotion, playlists, addSongToEmotion, removeSongAt, playAt } = usePlayer();
  const list = playlists[currentEmotion] || [];

  function addVideo() {
    const url = prompt("輸入 YouTube 連結或 11 碼影片ID");
    if (!url) return;

    try {
      addSongToEmotion(currentEmotion, url);
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h3>{currentEmotion} 播放清單</h3>
      <button onClick={addVideo}>➕ 加入歌曲</button>

      <ul>
              {list.map((song, i) => (
        <li key={song.id + i}>
          <span>{song.title}</span>
          <button onClick={() => playAt(currentEmotion, i)}>▶</button>
          <button onClick={() => removeSongAt(currentEmotion, i)}>❌</button>
        </li>
        ))}
      </ul>
    </div>
  );
}
