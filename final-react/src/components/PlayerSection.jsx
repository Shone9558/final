import { useEffect, useRef } from "react";

export default function PlayerSection({ emotion }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!emotion) return;
    // 之後可接 API 或 playlist
  }, [emotion]);

  return (
    <div style={{ display: "none" }}>
      <iframe
        ref={iframeRef}
        title="youtube"
        width="0"
        height="0"
        allow="autoplay"
      />
    </div>
  );
}