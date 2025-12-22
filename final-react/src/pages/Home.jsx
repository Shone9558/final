import Header from "../components/Header";
import EmotionButtons from "../components/EmotionButtons";
import PlayerSection from "../components/PlayerSection";
import Playlist from "../components/Playlist";
import MiniPlayer from "../components/MiniPlayer";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <Header />
        <div style={{marginRight:16}}>
          <button onClick={handleLogout}>登出</button>
        </div>
      </div>

      <EmotionButtons />
      <PlayerSection />
      <Playlist />
      <MiniPlayer />
    </>
  );
}
