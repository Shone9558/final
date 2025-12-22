import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const EMOTIONS = ["happy", "sad", "relax", "angry"];
const DEFAULT_EMOTION = "happy";

const defaultPlaylists = () =>
  EMOTIONS.reduce((acc, e) => {
    acc[e] = [];
    return acc;
  }, {});

// ---------- auth/user key ----------
function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);

    const json = atob(base64);
    return JSON.parse(json);
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

function playlistsStorageKey() {
  return `emotion_playlists:${getUserKey()}`;
}

// ---------- youtube helpers ----------
function extractYouTubeId(input) {
  if (!input) return null;
  const s = String(input).trim();

  // already an id
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

// ---------- migrate old data (string ids -> objects) ----------
function normalizePlaylistsShape(parsed) {
  const base = defaultPlaylists();
  const merged = { ...base, ...(parsed || {}) };

  // 支援舊格式：["id","id"] 轉成 [{id,title:"(未命名)"}...]
  for (const emo of EMOTIONS) {
    const list = merged[emo];
    if (!Array.isArray(list)) {
      merged[emo] = [];
      continue;
    }
    merged[emo] = list
      .map((item) => {
        if (typeof item === "string") return { id: item, title: "（尚未取得標題）" };
        if (item && typeof item === "object" && item.id) return { id: item.id, title: item.title || "（尚未取得標題）" };
        return null;
      })
      .filter(Boolean);
  }

  return merged;
}

function loadPlaylistsForCurrentUser() {
  const raw = localStorage.getItem(playlistsStorageKey());
  if (!raw) return defaultPlaylists();
  try {
    const parsed = JSON.parse(raw);
    return normalizePlaylistsShape(parsed);
  } catch {
    return defaultPlaylists();
  }
}

// ---------- context ----------
const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentEmotion, setCurrentEmotion] = useState(DEFAULT_EMOTION);

  const [playlists, setPlaylists] = useState(() => loadPlaylistsForCurrentUser());

  const [nowPlaying, setNowPlaying] = useState({
    emotion: DEFAULT_EMOTION,
    index: -1,
    isOpen: false,
    isPlaying: false,
  });

  const playerRef = useRef(null);
  const readyRef = useRef(false);

  // Load YouTube Iframe API
  useEffect(() => {
    if (window.YT?.Player) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }, []);

  // Create hidden container + init player when API ready
  useEffect(() => {
    let container = document.getElementById("yt-audio-engine");
    if (!container) {
      container = document.createElement("div");
      container.id = "yt-audio-engine";
      container.style.width = "0px";
      container.style.height = "0px";
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      document.body.appendChild(container);
    }

    window.onYouTubeIframeAPIReady = () => {
      if (playerRef.current) return;
      playerRef.current = new window.YT.Player("yt-audio-engine", {
        height: "0",
        width: "0",
        videoId: "",
        playerVars: { autoplay: 0, controls: 0 },
        events: {
          onReady: () => {
            readyRef.current = true;
          },
          onStateChange: (e) => {
            if (e.data === 1) setNowPlaying((p) => ({ ...p, isPlaying: true }));
            if (e.data === 2) setNowPlaying((p) => ({ ...p, isPlaying: false }));
            if (e.data === 0) playNext();
          },
        },
      });
    };

    if (window.YT?.Player && window.onYouTubeIframeAPIReady) {
      window.onYouTubeIframeAPIReady();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save playlists (user-scoped)
  useEffect(() => {
    localStorage.setItem(playlistsStorageKey(), JSON.stringify(playlists));
  }, [playlists]);

  // react to login/logout
  useEffect(() => {
    const handler = () => {
      setPlaylists(loadPlaylistsForCurrentUser());
      setNowPlaying({
        emotion: DEFAULT_EMOTION,
        index: -1,
        isOpen: false,
        isPlaying: false,
      });
    };

    window.addEventListener("authchange", handler);
    return () => window.removeEventListener("authchange", handler);
  }, []);

  const currentList = playlists[nowPlaying.emotion] || [];
  const currentSong = currentList[nowPlaying.index] || null;
  const currentSongId = currentSong?.id || null;

  function selectEmotion(emotion) {
    setCurrentEmotion(emotion);
  }

  async function addSongToEmotion(emotion, urlOrId) {
    const id = extractYouTubeId(urlOrId);
    if (!id) throw new Error("請輸入 YouTube 連結或 11 碼影片ID");

    // 先放入暫時標題，讓 UI 立即出現
    setPlaylists((prev) => ({
      ...prev,
      [emotion]: [...(prev[emotion] || []), { id, title: "取得標題中…" }],
    }));

    try {
      const title = await fetchYouTubeTitle(id);
      // 把最後一首（剛加的）更新成真正 title
      setPlaylists((prev) => {
        const list = [...(prev[emotion] || [])];
        const idx = list.findIndex((s) => s?.id === id && (s.title === "取得標題中…" || !s.title));
        if (idx >= 0) list[idx] = { ...list[idx], title };
        return { ...prev, [emotion]: list };
      });
    } catch {
      // 如果抓不到就保底顯示 id
      setPlaylists((prev) => {
        const list = [...(prev[emotion] || [])];
        const idx = list.findIndex((s) => s?.id === id && (s.title === "取得標題中…" || !s.title));
        if (idx >= 0) list[idx] = { ...list[idx], title: `YouTube：${id}` };
        return { ...prev, [emotion]: list };
      });
    }
  }

  function removeSongAt(emotion, index) {
    setPlaylists((prev) => {
      const list = [...(prev[emotion] || [])];
      list.splice(index, 1);
      return { ...prev, [emotion]: list };
    });

    setNowPlaying((p) => {
      if (p.emotion !== emotion) return p;
      if (p.index === index) return { ...p, index: -1, isOpen: false, isPlaying: false };
      if (p.index > index) return { ...p, index: p.index - 1 };
      return p;
    });
  }

  function playAt(emotion, index) {
    const list = playlists[emotion] || [];
    const song = list[index];
    const id = song?.id;
    if (!id) return;

    setNowPlaying({ emotion, index, isOpen: true, isPlaying: true });

    if (readyRef.current && playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(id);
      playerRef.current.playVideo();
    }
  }

  function togglePlay() {
    if (!playerRef.current) return;
    if (nowPlaying.index < 0) return;

    if (nowPlaying.isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }

  function playNext() {
    setNowPlaying((p) => {
      const list = playlists[p.emotion] || [];
      if (!list.length) return { ...p, isPlaying: false };

      const nextIndex = p.index < 0 ? 0 : (p.index + 1) % list.length;
      const id = list[nextIndex]?.id;

      if (id && readyRef.current && playerRef.current?.loadVideoById) {
        playerRef.current.loadVideoById(id);
        playerRef.current.playVideo();
      }

      return { ...p, index: nextIndex, isOpen: true, isPlaying: true };
    });
  }

  function playPrev() {
    setNowPlaying((p) => {
      const list = playlists[p.emotion] || [];
      if (!list.length) return { ...p, isPlaying: false };

      const prevIndex = p.index <= 0 ? list.length - 1 : p.index - 1;
      const id = list[prevIndex]?.id;

      if (id && readyRef.current && playerRef.current?.loadVideoById) {
        playerRef.current.loadVideoById(id);
        playerRef.current.playVideo();
      }

      return { ...p, index: prevIndex, isOpen: true, isPlaying: true };
    });
  }

  function closePlayer() {
    setNowPlaying((p) => ({ ...p, isOpen: false, isPlaying: false }));
    if (playerRef.current?.stopVideo) playerRef.current.stopVideo();
  }

  const value = useMemo(
    () => ({
      currentEmotion,
      playlists,
      nowPlaying,
      currentSong,
      currentSongId,
      selectEmotion,
      addSongToEmotion,
      removeSongAt,
      playAt,
      togglePlay,
      playNext,
      playPrev,
      closePlayer,
    }),
    [currentEmotion, playlists, nowPlaying, currentSong, currentSongId]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer 必須在 PlayerProvider 裡使用");
  return ctx;
}
