import React from "react";

export const ShimmerButton = React.forwardRef(function ShimmerButton(
  {
    shimmerColor = "#ffffff",
    shimmerSize = "0.05em",
    borderRadius = "100px",
    shimmerDuration = "3s",
    background = "rgba(0, 0, 0, 1)",
    className,
    children,
    style,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      {...props}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius,
        background,
        border: "none",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
        ...style, // ✅ 讓外面傳進來的 style 生效
      }}
    >
      {/* shimmer layer */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `linear-gradient(
            120deg,
            rgba(255,255,255,0) 0%,
            ${shimmerColor} 50%,
            rgba(255,255,255,0) 100%
          )`,
          transform: "translateX(-120%)",
          animation: `shimmer ${shimmerDuration} linear infinite`,
          filter: "blur(0px)",
          opacity: 0.55,
        }}
      />

      {/* ✅ 內容永遠在最上層，不會被蓋住 */}
      <span
        style={{
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem",
        }}
      >
        {children}
      </span>

      {/* keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
    </button>
  );
});
