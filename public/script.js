let emotionMusic = {}; // 由後端 API 填入

// 導入後端 API 的音樂清單
fetch("/api/music")
  .then(res => res.json())
  .then(data => {
      data.forEach(item => {
          emotionMusic[item.emotion] = item.file;
      });
  });

const emotionText = {
    happy: "今天的你閃閃發光！保持開心～",
    sad: "慢慢來，沒關係，我在陪你。",
    relax: "深呼吸～讓自己慢慢放鬆下來。",
    angry: "生氣也沒關係，我們一起冷靜一下。"
};

const emotionBg = {
    happy: "linear-gradient(135deg, #ffeb99, #ffd84d)",
    sad: "linear-gradient(135deg, #6fa8dc, #9fc5e8)",
    relax: "linear-gradient(135deg, #b7e1a1, #93c47d)",
    angry: "linear-gradient(135deg, #f4b3b3, #e06666)"
};

const buttons = document.querySelectorAll(".emotion-btn");
const body = document.body;
const musicPlayer = document.getElementById("musicPlayer");
const musicSource = document.getElementById("musicSource");
const text = document.getElementById("emotionText");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        const emotion = btn.dataset.emotion;

        // 換背景
        body.style.background = emotionBg[emotion];

        // 換音樂（從後端 API 抓到的）
        musicSource.src = emotionMusic[emotion];
        musicPlayer.load();
        musicPlayer.play();

        // 換文字
        text.textContent = emotionText[emotion];
    });
});
