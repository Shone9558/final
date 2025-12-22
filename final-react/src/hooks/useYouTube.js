import { useEffect, useState } from "react";

export default function useYouTube() {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => {
      setPlayer(
        new YT.Player("youtubePlayer", {
          height: "0",
          width: "0",
          playerVars: { autoplay: 1 }
        })
      );
    };
  }, []);

  return player;
}