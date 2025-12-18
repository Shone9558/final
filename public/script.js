// === 情緒文字 ===
const emotionText = {
  happy: "今天的你閃閃發光！保持開心～",
  sad: "慢慢來，沒關係，我在陪你。",
  relax: "深呼吸～讓自己慢慢放鬆下來。",
  angry: "生氣也沒關係，我們一起冷靜一下。"
};

// === 背景 ===
const emotionBg = {
  happy: "linear-gradient(145deg, #ffe259, #ffa751)",
  sad: "linear-gradient(145deg, #6fa8dc, #9fc5e8)",
  relax: "linear-gradient(145deg, #93c47d, #b6d7a8)",
  angry: "linear-gradient(145deg, #e06666, #f4a5a5)"
};

// === YouTube 播放器 ===
let player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("youtubePlayer", {
    height: "0",
    width: "0",
    videoId: "",
    playerVars: { autoplay: 1 }
  });
}

// === 播放清單 ===
let playlists = {
  happy: [],
  sad: [],
  relax: [],
  angry: []
};

let currentEmotion = null;

// 從後端載入
fetch("/api/getPlaylist")
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      playlists = data.playlists;
    }
  });

function savePlaylist() {
  fetch("/api/savePlaylist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playlists })
  });
}

// === DOM ===
const buttons = document.querySelectorAll(".emotion-btn");
const body = document.body;
const text = document.getElementById("emotionText");
const youtubeInput = document.getElementById("youtubeInput");
const addMusicBtn = document.getElementById("addMusicBtn");
const playlistEl = document.getElementById("playlist");
const randomBtn = document.getElementById("randomPlay");

// === 情緒切換 ===
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentEmotion = btn.dataset.emotion;
    body.style.background = emotionBg[currentEmotion];
    text.textContent = emotionText[currentEmotion];
    renderPlaylist();
  });
});

// === 解析 YouTube ID ===
function extractYouTubeID(url) {
  const match = url.match(/v=([^&]+)/);
  return match ? match[1] : null;
}

// === 加入歌曲 ===
addMusicBtn.addEventListener("click", () => {
  if (!currentEmotion) return alert("請先選擇情緒！");
  const id = extractYouTubeID(youtubeInput.value.trim());
  if (!id) return alert("請輸入正確的 YouTube 連結");

  playlists[currentEmotion].push(id);
  youtubeInput.value = "";
  savePlaylist();
  renderPlaylist();
});

// === 渲染播放清單 ===
function renderPlaylist() {
  playlistEl.innerHTML = "";
  if (!currentEmotion) return;

  playlists[currentEmotion].forEach((id, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>歌曲 ${index + 1}</span>
      <button class="play-btn">▶</button>
      <button class="delete-btn">❌</button>
    `;

    li.querySelector(".play-btn").onclick = () => {
      player.loadVideoById(id);
      showMiniPlayer(`歌曲 ${index + 1}`);
    };

    li.querySelector(".delete-btn").onclick = () => {
      playlists[currentEmotion].splice(index, 1);
      savePlaylist();
      renderPlaylist();
    };

    playlistEl.appendChild(li);
  });
}

// === 隨機播放 ===
randomBtn.addEventListener("click", () => {
  if (!currentEmotion) return alert("請先選擇情緒！");
  const list = playlists[currentEmotion];
  if (!list.length) return alert("這個情緒還沒有歌");

  const id = list[Math.floor(Math.random() * list.length)];
  player.loadVideoById(id);
  showMiniPlayer("隨機播放");
});

// === Mini Player ===
const miniPlayer = document.getElementById("miniPlayer");
const miniTitle = document.getElementById("miniTitle");
const miniPlayPause = document.getElementById("miniPlayPause");
const miniClose = document.getElementById("miniClose");

let isPlaying = true;

function showMiniPlayer(title) {
  miniTitle.textContent = "正在播放：" + title;
  miniPlayer.classList.remove("hidden");
  miniPlayPause.textContent = "⏸";
}

miniPlayPause.onclick = () => {
  if (isPlaying) {
    player.pauseVideo();
    miniPlayPause.textContent = "▶";
  } else {
    player.playVideo();
    miniPlayPause.textContent = "⏸";
  }
  isPlaying = !isPlaying;
};

miniClose.onclick = () => {
  miniPlayer.classList.add("hidden");
  player.stopVideo();
};
