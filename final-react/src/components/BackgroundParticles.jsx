import { Particles } from "./ui/particles";

export default function BackgroundParticles() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,              // top/right/bottom/left = 0
        zIndex: 0,
        pointerEvents: "none", // ✅ 不擋按鈕點擊
        overflow: "hidden",
      }}
    >
      <Particles
        quantity={90}
        staticity={40}
        ease={60}
        size={0.6}
        color="#ffffff"
      />
    </div>
  );
}
