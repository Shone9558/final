export default function YouTubePlayer({ videoId }) {
  if (!videoId) return null;

  return (
    <div className="player">
      <iframe
        width="0"
        height="0"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        allow="autoplay"
      />
    </div>
  );
}

