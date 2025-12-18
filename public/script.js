// === 情緒文字與背景 ===
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

// === 情緒切換 ===
const buttons = document.querySelectorAll(".emotion-btn");
const body = document.body;
const text = document.getElementById("emotionText");

let playlists = {
    happy: [],
    sad: [],
    relax: [],
    angry: []
};

let currentEmotion = null;

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        currentEmotion = btn.dataset.emotion;

        body.style.background = emotionBg[currentEmotion];
        text.textContent = emotionText[currentEmotion];

        renderPlaylist(); // 換清單
    });
});

// === YouTube ID 擷取 ===
function extractYouTubeID(url) {
    const reg = /v=([^&]+)/;
    const match = url.match(reg);
    return match ? match[1] : null;
}

// === DOM ===
const youtubeInput = document.getElementById("youtubeInput");
const addMusicBtn = document.getElementById("addMusicBtn");
const playlistEl = document.getElementById("playlist");
const randomBtn = document.getElementById("randomPlay");

// === 加入播放清單 ===
addMusicBtn.addEventListener("click", () => {
    if (!currentEmotion) {
        alert("請先選擇情緒！");
        return;
    }

    const url = youtubeInput.value.trim();
    const videoId = extractYouTubeID(url);

    if (!videoId) {
        alert("請輸入正確的 YouTube 連結！");
        return;
    }

    playlists[currentEmotion].push(videoId);

    youtubeInput.value = "";
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

        // 播放
        li.querySelector(".play-btn").onclick = () => {
            player.loadVideoById(id);
            player.playVideo();
            showMiniPlayer(`播放清單歌曲 ${index + 1}`);
        };

        // 刪除
        li.querySelector(".delete-btn").onclick = () => {
            playlists[currentEmotion].splice(index, 1);
            renderPlaylist();
        };

        playlistEl.appendChild(li);
    });
}

// === 隨機播放 ===
randomBtn.addEventListener("click", () => {
    if (!currentEmotion) {
        alert("請先選擇情緒！");
        return;
    }

    const list = playlists[currentEmotion];

    if (list.length === 0) {
        alert("此情緒還沒有歌曲！");
        return;
    }

    const randomId = list[Math.floor(Math.random() * list.length)];
    player.loadVideoById(randomId);
    player.playVideo();

    showMiniPlayer(`隨機播放`);
});

// === 迷你播放器 ===
const miniPlayer = document.getElementById("miniPlayer");
const miniTitle = document.getElementById("miniTitle");
const miniPlayPause = document.getElementById("miniPlayPause");
const miniClose = document.getElementById("miniClose");

let isPlaying = false;

function showMiniPlayer(titleText) {
    miniTitle.textContent = `正在播放：${titleText}`;
    miniPlayer.classList.remove("hidden");
    isPlaying = true;
    miniPlayPause.textContent = "⏸";
}

function hideMiniPlayer() {
    miniPlayer.classList.add("hidden");
}

miniPlayPause.addEventListener("click", () => {
    if (isPlaying) {
        player.pauseVideo();
        miniPlayPause.textContent = "▶";
    } else {
        player.playVideo();
        miniPlayPause.textContent = "⏸";
    }
    isPlaying = !isPlaying;
});

miniClose.addEventListener("click", () => {
    hideMiniPlayer();
    player.stopVideo();
});