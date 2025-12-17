const express = require("express");
const path = require("path");
const app = express();

// 提供 public 資料夾為靜態資源
app.use(express.static(path.join(__dirname, "public")));

// 音樂 API
app.get("/api/music", (req, res) => {
    res.json([
        { emotion: "happy", file: "music/happy.mp3" },
        { emotion: "sad", file: "music/sad.mp3" },
        { emotion: "relax", file: "music/relax.mp3" },
        { emotion: "angry", file: "music/angry.mp3" }
    ]);
});

// 啟動 server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`後端伺服器啟動成功：http://localhost:${PORT}`);
});

const emotionBg = {
    happy: "linear-gradient(135deg, #ffeb99, #ffd84d)",
    sad: "linear-gradient(135deg, #6fa8dc, #9fc5e8)",
    relax: "linear-gradient(135deg, #b7e1a1, #93c47d)",
    angry: "linear-gradient(135deg, #f4b3b3, #e06666)"
};
