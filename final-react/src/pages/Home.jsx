import EmotionButtons from "../components/EmotionButtons";
import Playlist from "../components/Playlist";
import MiniPlayer from "../components/MiniPlayer";

const SLIDE_URL =
  "https://www.canva.com/design/DAG8N0TxxGw/mEss-p3tGNDEM922SZMZKQ/view?utm_content=DAG8N0TxxGw&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=hb6f8467f03";

export default function Home() {
  return (
    <>
      {/* 🔥 簡報顯眼區塊 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 28,
        }}
      >
        <a
          href={SLIDE_URL}
          target="_blank"
          rel="noreferrer"
          style={{
            textDecoration: "none",
            padding: "18px 28px",
            borderRadius: 18,
            background: "linear-gradient(180deg, #111, #000)",
            color: "#fff",
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "2px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
          }}
        >
          📊 簡報
        </a>
      </div>

      {/* 原本功能 */}
      <EmotionButtons />
      <Playlist />
      <MiniPlayer />
    </>
  );
}
