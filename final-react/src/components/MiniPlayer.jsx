export default function MiniPlayer({ videoId, setCurrentVideo }) {
  if (!videoId) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#000",
      padding: "10px"
    }}>
      <iframe
        width="100%"
        height="200"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        allow="autoplay"
        title="player"
      />
      <button onClick={() => setCurrentVideo(null)}>關閉</button>
    </div>
  );
}
