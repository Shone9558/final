const emotions = ["happy", "sad", "relax", "angry"];

const emotionText = {
  happy: "今天的你閃閃發光！",
  sad: "慢慢來，我在。",
  relax: "深呼吸，放鬆一下。",
  angry: "生氣沒關係，先冷靜。"
};

const emotionBg = {
  happy: "linear-gradient(145deg, #ffe259, #ffa751)",
  sad: "linear-gradient(145deg, #6fa8dc, #9fc5e8)",
  relax: "linear-gradient(145deg, #93c47d, #b6d7a8)",
  angry: "linear-gradient(145deg, #e06666, #f4a5a5)"
};

export default function EmotionButtons({ emotion, setEmotion }) {
  return (
    <div style={{ textAlign: "center" }}>
      {emotions.map(e => (
        <button
          key={e}
          onClick={() => {
            setEmotion(e);
            document.body.style.background = emotionBg[e];
          }}
          style={{
            margin: "5px",
            padding: "10px",
            fontWeight: emotion === e ? "bold" : "normal"
          }}
        >
          {e}
        </button>
      ))}

      {emotion && <p>{emotionText[emotion]}</p>}
    </div>
  );
}
