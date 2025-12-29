import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

/* =========================
   Constants
========================= */
const DEFAULT_EMOTIONS = ["happy", "sad", "relax", "angry"];
const DEFAULT_EMOTION = "happy";

/* =========================
   Auth helpers
========================= */
function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);

    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function getUserKey() {
  const token = localStorage.getItem("token");
  if (!token) return "guest";

  const payload = decodeJwtPayload(token);
  if (payload?.id != null) return `uid:${payload.id}`;
  if (payload?.email) return `email:${payload.email}`;
  return `tok:${token}`;
}

/* =========================
   YouTube helpers
========================= */
function extractYouTubeId(input) {
  if (!input) return null;
  const s = String(input).trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;

  const patterns = [
    /v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

async function fetchYouTubeTitle(videoId) {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("無法取得影片資訊");
  const data = await res.json();
  return data.title;
}

/* =========================
   Playlist helpers
========================= */
function defaultPlaylists(emotions) {
  return emotions.reduce((acc, e) => {
    acc[e] = [];
    return acc;
  }, {});
}

function normalizePlaylists(parsed, emotions) {
  const merged = { ...defaultPlaylists(emotions), ...(parsed || {}) };

  emotions.forEach((emo) => {
    const list = merged[emo];
    merged[emo] = Array.isArray(list)
      ? list
          .map((item) => {
            if (typeof item === "string") return { id: item, title: "（尚未取得標題）" };
            if (item && typeof item === "object" && item.id) return { id: item.id, title: item.title || "（尚未取得標題）" };
            return null;
          })
          .filter(Boolean)
      : [];
  });

  return merged;
}

/* =========================
   Context
========================= */
const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  /* -------- stable userKey (最重要) -------- */
  const [userKey, setUserKey] = useState(() => getUserKey());

  useEffect(() => {
    const handler = () => setUserKey(getUserKey());
    window.addEventListener("authchange", handler);
    return () => window.removeEventListener("authchange", handler);
  }, []);

  const emotionsKey = `emotions:${userKey}`;
  const playlistsKey = `emotion_playlists:${userKey}`;

  /* -------- emotions -------- */
  const [emotions, setEmotions] = useState(() => {
    const raw = localStorage.getItem(emotionsKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_EMOTIONS;
      } catch {}
    }
    return DEFAULT_EMOTIONS;
  });

  // userKey 變了（登入/登出/換帳號）→ 重新載入 emotions
  useEffect(() => {
    const raw = localStorage.getItem(emotionsKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setEmotions(parsed);
          return;
        }
      } catch {}
    }
    setEmotions(DEFAULT_EMOTIONS);
  }, [emotionsKey]);

  // 存 emotions（一定用 emotionsKey，不要用 getUserKey()）
  useEffect(() => {
    localStorage.setItem(emotionsKey, JSON.stringify(emotions));
  }, [emotionsKey, emotions]);

  /* -------- playlists -------- */
  const [playlists, setPlaylists] = useState(() => {
    const raw = localStorage.getItem(playlistsKey);
    if (!raw) return defaultPlaylists(emotions);
    try {
      return normalizePlaylists(JSON.parse(raw), emotions);
    } catch {
      return defaultPlaylists(emotions);
    }
  });

  // userKey 變了 → 重新載入該使用者 playlists（不洗掉別人）
  useEffect(() => {
    const raw = localStorage.getItem(playlistsKey);
    if (!raw) {
      setPlaylists(defaultPlaylists(emotions));
      return;
    }
    try {
      setPlaylists(normalizePlaylists(JSON.parse(raw), emotions));
    } catch {
      setPlaylists(defaultPlaylists(emotions));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistsKey]);

  // emotions 變了 → 只補缺的 key，不覆蓋整包
  useEffect(() => {
    setPlaylists((prev) => {
      const next = { ...prev };
      emotions.forEach((e) => {
        if (!next[e]) next[e] = [];
      });
      return next;
    });
  }, [emotions]);

  // 存 playlists（一定用 playlistsKey）
  useEffect(() => {
    localStorage.setItem(playlistsKey, JSON.stringify(playlists));
  }, [playlistsKey, playlists]);

  /* -------- player state -------- */
  const [currentEmotion, setCurrentEmotion] = useState(DEFAULT_EMOTION);
  const [nowPlaying, setNowPlaying] = useState({
    emotion: DEFAULT_EMOTION,
    index: -1,
    isOpen: false,
    isPlaying: false,
  });

  const currentList = playlists[nowPlaying.emotion] || [];
  const currentSong = currentList[nowPlaying.index] || null;
  const currentSongId = currentSong?.id || null;

  /* -------- refs -------- */
  const playerRef = useRef(null);
  const readyRef = useRef(false);
  const playlistsRef = useRef(playlists);
  const playNextRef = useRef(() => {});

  useEffect(() => {
    playlistsRef.current = playlists;
  }, [playlists]);

  /* ---- play mode ---- */
  const [playMode, setPlayMode] = useState("normal"); // normal | shuffle | repeat-one
  const playModeRef = useRef("normal");
  useEffect(() => {
    playModeRef.current = playMode;
  }, [playMode]);

  /* ---- progress ---- */
  const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });

  /* ---- volume ---- */
  const [muted, setMuted] = useState(false);

  const [volume, setVolumeState] = useState(() => {
  const v = Number(localStorage.getItem("player_volume"));
  return isFinite(v) ? v : 80;
});
  /* ---- emotion background theme ---- */
  const EMOTION_BG = {
    happy: "linear-gradient(135deg, #FFE29F 0%, #FFA99F 40%, #FFD1FF 100%)",
    sad: "linear-gradient(135deg, #74ebd5 0%, #9face6 100%)",
    relax: "linear-gradient(135deg, #C2FFD8 0%, #465EFB 100%)",
    angry: "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)",
  };

  // currentEmotion 變更時：更新全站背景（用 CSS 變數）
  useEffect(() => {
    const bg = EMOTION_BG[currentEmotion] || "var(--bg)";
    document.body.dataset.emotion = currentEmotion; // 可選：讓你 CSS selector 用
    document.documentElement.style.setProperty("--emotion-bg", bg);
  }, [currentEmotion]);

  /* ---- visualizer bars (YouTube: fake but looks good) ---- */
  const BAR_COUNT = 22;
  const [vizBars, setVizBars] = useState(() => Array(BAR_COUNT).fill(0.12));

  useEffect(() => {
    // 不播放：回到低幅度（看起來像待機）
    if (!nowPlaying.isPlaying) {
      setVizBars((prev) => prev.map(() => 0.12));
      return;
    }

    // 播放中：定時更新 bar
    const t = setInterval(() => {
      setVizBars((prev) =>
        prev.map((p, i) => {
          const volFactor = Math.max(0.15, Math.min(1, volume / 100));
          const base = 0.10 + volFactor * 0.25;
          const bias = (i % 6) * 0.02;
          const target = Math.min(1, base + bias + Math.random() * 0.75);
          const eased = p * 0.60 + target * 0.40; // 平滑
          return Math.max(0.08, Math.min(1, eased));
        })
      );
    }, 120);

    return () => clearInterval(t);
  }, [nowPlaying.isPlaying, volume]);


  /* ---- YouTube init ---- */
  useEffect(() => {
    if (window.YT?.Player) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }, []);

  useEffect(() => {
    const containerId = "yt-audio-engine";
    if (!document.getElementById(containerId)) {
      const d = document.createElement("div");
      d.id = containerId;
      d.style.display = "none";
      document.body.appendChild(d);
    }

    window.onYouTubeIframeAPIReady = () => {
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player(containerId, {
        height: "0",
        width: "0",
        playerVars: { autoplay: 0, controls: 0 },
        events: {
          onReady: () => {
            readyRef.current = true;
            playerRef.current?.setVolume?.(volume);
          },
          onStateChange: (e) => {
            if (e.data === 0) playNextRef.current();
            if (e.data === 1) setNowPlaying((p) => ({ ...p, isPlaying: true }));
            if (e.data === 2) setNowPlaying((p) => ({ ...p, isPlaying: false }));
          },
        },
      });
    };

    if (window.YT?.Player) window.onYouTubeIframeAPIReady();
  }, [volume]);

  useEffect(() => {
    const t = setInterval(() => {
      if (!readyRef.current || !playerRef.current) return;
      setProgress({
        currentTime: playerRef.current.getCurrentTime?.() || 0,
        duration: playerRef.current.getDuration?.() || 0,
      });
    }, 500);
    return () => clearInterval(t);
  }, [nowPlaying.index]);

  function selectEmotion(emotion) {
    setCurrentEmotion(emotion);
  }

  function seekTo(sec) {
    if (!readyRef.current || !playerRef.current) return;
    playerRef.current.seekTo(sec, true);
  }

  function togglePlay() {
    if (!playerRef.current) return;
    nowPlaying.isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  }

  function playAt(emotion, index) {
    const song = playlists[emotion]?.[index];
    if (!song) return;

    setNowPlaying({ emotion, index, isOpen: true, isPlaying: true });
    playerRef.current?.loadVideoById?.(song.id);
  }

  function playNext() {
    setNowPlaying((p) => {
      const list = playlistsRef.current[p.emotion] || [];
      if (!list.length) return { ...p, isPlaying: false };

      const mode = playModeRef.current;
      let nextIndex = p.index;

      if (mode === "repeat-one") {
        nextIndex = p.index < 0 ? 0 : p.index;
      } else if (mode === "shuffle") {
        if (list.length === 1) nextIndex = p.index < 0 ? 0 : p.index;
        else {
          do {
            nextIndex = Math.floor(Math.random() * list.length);
          } while (nextIndex === p.index);
        }
      } else {
        nextIndex = p.index < 0 ? 0 : (p.index + 1) % list.length;
      }

      const id = list[nextIndex]?.id;
      if (id && readyRef.current && playerRef.current?.loadVideoById) {
        playerRef.current.loadVideoById(id);
        playerRef.current.playVideo?.();
      }

      return { ...p, index: nextIndex, isOpen: true, isPlaying: true };
    });
  }

  playNextRef.current = playNext;

  function playPrev() {
    setNowPlaying((p) => {
      const list = playlistsRef.current[p.emotion] || [];
      if (!list.length) return { ...p, isPlaying: false };

      const prev = p.index <= 0 ? list.length - 1 : p.index - 1;
      playerRef.current?.loadVideoById?.(list[prev].id);
      return { ...p, index: prev, isOpen: true, isPlaying: true };
    });
  }

  function addEmotion(name) {
    const key = name.trim();
    if (!key) throw new Error("情緒名稱不能為空");
    if (emotions.includes(key)) throw new Error("這個情緒已存在");

    setEmotions((prev) => [...prev, key]);
    setPlaylists((prev) => ({ ...prev, [key]: [] })); // ✅ 每個情緒獨立歌單
    setCurrentEmotion(key);
  }

  function removeEmotion(name) {
    const key = String(name || "").trim();
    if (!key) throw new Error("情緒名稱不能為空");

    // ✅ 不允許刪掉預設情緒（避免你 UI/資料整個炸掉）
    if (DEFAULT_EMOTIONS.includes(key)) {
      throw new Error("預設情緒不能刪除");
    }

    // ✅ 不存在就不用做
    if (!emotions.includes(key)) return;

    // 1) emotions 刪掉
    setEmotions((prev) => prev.filter((e) => e !== key));

    // 2) playlists 對應歌單刪掉
    setPlaylists((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    // 3) 如果目前正在看/正在播的是這個情緒 → 切回預設
    setCurrentEmotion((cur) => (cur === key ? DEFAULT_EMOTION : cur));

    setNowPlaying((p) => {
      if (p.emotion !== key) return p;
      playerRef.current?.stopVideo?.();
      return { emotion: DEFAULT_EMOTION, index: -1, isOpen: false, isPlaying: false };
    });
  }

  async function addSongToEmotion(emotion, input) {
    const id = extractYouTubeId(input);
    if (!id) throw new Error("無效 YouTube 連結");

    setPlaylists((p) => ({
      ...p,
      [emotion]: [...(p[emotion] || []), { id, title: "取得標題中…" }],
    }));

    try {
      const title = await fetchYouTubeTitle(id);
      setPlaylists((p) => {
        const list = [...(p[emotion] || [])];
        const idx = list.findIndex((s) => s?.id === id && s.title === "取得標題中…");
        if (idx >= 0) list[idx] = { ...list[idx], title };
        return { ...p, [emotion]: list };
      });
    } catch {
      // 保底不報錯
    }
  }

  function removeSongAt(emotion, index) {
    setPlaylists((prev) => {
      const list = [...(prev[emotion] || [])];
      list.splice(index, 1);
      return { ...prev, [emotion]: list };
    });

    // 如果正在播被刪的那首：停止並關閉播放器
    setNowPlaying((p) => {
      if (p.emotion !== emotion) return p;

      if (p.index === index) {
        playerRef.current?.stopVideo?.();
        return { ...p, index: -1, isOpen: false, isPlaying: false };
      }

      // 刪掉前面的歌：播放 index 往前補一格
      if (p.index > index) return { ...p, index: p.index - 1 };

      return p;
    });
  }

  function setVolume(v) {
    const vol = Math.max(0, Math.min(100, Number(v)));
    setVolumeState(vol);
    localStorage.setItem("player_volume", String(vol));
    playerRef.current?.setVolume?.(vol);
  }

  function toggleMute() {
    if (!playerRef.current) return;
    if (muted) playerRef.current.unMute?.();
    else playerRef.current.mute?.();
    setMuted((m) => !m);
  }

  function closePlayer() {
    setNowPlaying({ emotion: DEFAULT_EMOTION, index: -1, isOpen: false, isPlaying: false });
    setProgress({ currentTime: 0, duration: 0 });
    playerRef.current?.stopVideo?.();
  }

  function setPlayModeSafe(mode) {
    const allowed = ["normal", "shuffle", "repeat-one"];
    const next = allowed.includes(mode) ? mode : "normal";
    setPlayMode(next);
    playModeRef.current = next; // ✅ 立刻同步，避免 setState 還沒生效
  }

  function togglePlayMode() {
    setPlayModeSafe(
      playModeRef.current === "normal"
        ? "shuffle"
        : playModeRef.current === "shuffle"
        ? "repeat-one"
        : "normal"
    );
  }

  /* =========================
     Context value
  ========================= */
  const value = useMemo(
    () => ({
      emotions,
      playlists,
      currentEmotion,
      currentSong,
      currentSongId,
      nowPlaying,
      progress,
      volume,
      muted,
      playMode,
      removeSongAt,
      vizBars,
      // actions
      setPlayMode: setPlayModeSafe,
      selectEmotion,
      addEmotion,
      addSongToEmotion,
      playAt,
      playNext,
      playPrev,
      togglePlay,
      togglePlayMode,
      toggleMute,
      setVolume,
      seekTo,
      setPlayMode,
      closePlayer,
      removeEmotion,
    }),
    [emotions, playlists, currentEmotion, currentSong, currentSongId, nowPlaying, progress, volume, muted, playMode]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
