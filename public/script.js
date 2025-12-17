let emotionMusic = {}; // 由後端 API 填入

/* ===== 後端 API ===== */
fetch("/api/music")
  .then(res => res.json())
  .then(data => {
      data.forEach(item => {
          emotionMusic[item.emotion] = item.file;
      });
  });

/* ===== 情緒文字 ===== */
const emotionText = {
    happy: "今天的你閃閃發光！保持開心～",
    sad: "慢慢來，沒關係，我在陪你。",
    relax: "深呼吸～讓自己慢慢放鬆下來。",
    angry: "生氣也沒關係，我們一起冷靜一下。"
};

/* ===== 背景 ===== */
const emotionBg = {
    happy: "linear-gradient(145deg, #ffe259, #ffa751)",
    sad: "linear-gradient(145deg, #6fa8dc, #9fc5e8)",
    relax: "linear-gradient(145deg, #93c47d, #b6d7a8)",
    angry: "linear-gradient(145deg, #e06666, #f4a5a5)"
};

const buttons = document.querySelectorAll(".emotion-btn");
const body = document.body;
const musicPlayer = document.getElementById("musicPlayer");
const musicSource = document.getElementById("musicSource");
const text = document.getElementById("emotionText");
const waves = document.querySelectorAll(".wave");
const playerSection = document.querySelector(".player-section");

/* ===== 點擊情緒 ===== */
buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        const emotion = btn.dataset.emotion;

        /* 防呆：API 還沒回來 */
        if (!emotionMusic[emotion]) {
            text.textContent = "音樂載入中，請稍候一下 🎵";
            return;
        }

        /* 背景切換 */
        body.style.background = emotionBg[emotion];

        /* 按鈕 active 狀態 */
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        /* 換音樂 */
        musicSource.src = emotionMusic[emotion];
        musicPlayer.load();
        musicPlayer.play();

        /* 換文字 */
        text.textContent = emotionText[emotion];
    });
});

/* ===== 播放狀態控制動畫 ===== */
musicPlayer.addEventListener("play", () => {
    waves.forEach(w => w.classList.add("play"));
    playerSection.classList.add("playing");
});

musicPlayer.addEventListener("pause", () => {
    waves.forEach(w => w.classList.remove("play"));
    playerSection.classList.remove("playing");
});

musicPlayer.addEventListener("ended", () => {
    waves.forEach(w => w.classList.remove("play"));
    playerSection.classList.remove("playing");
});
