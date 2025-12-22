export default function Card({ children, className = "" }) {
  return (
    <div
      className={
        "rounded-2xl border border-black/10 bg-white/70 backdrop-blur-md shadow-lg " +
        className
      }
    >
      {children}
    </div>
  );
}
