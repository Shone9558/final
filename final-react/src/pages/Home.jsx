import Header from "../components/Header";
import EmotionButtons from "../components/EmotionButtons";
import PlayerSection from "../components/PlayerSection";
import Playlist from "../components/Playlist";
import MiniPlayer from "../components/MiniPlayer";

export default function Home() {
  return (
    <>
      <Header />
      <EmotionButtons />
      <PlayerSection />
      <Playlist />
      <MiniPlayer />
    </>
  );
}
