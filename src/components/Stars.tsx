const STARS = [
  { top: "8%", left: "8%", size: 3, delay: "0s" },
  { top: "14%", left: "78%", size: 4, delay: "0.7s" },
  { top: "22%", left: "30%", size: 2, delay: "1.4s" },
  { top: "30%", left: "88%", size: 3, delay: "0.3s" },
  { top: "38%", left: "12%", size: 2, delay: "1.9s" },
  { top: "12%", left: "52%", size: 3, delay: "2.4s" },
  { top: "45%", left: "70%", size: 2, delay: "0.9s" },
  { top: "55%", left: "20%", size: 3, delay: "1.1s" },
  { top: "62%", left: "82%", size: 2, delay: "2.8s" },
  { top: "70%", left: "42%", size: 3, delay: "0.5s" },
  { top: "78%", left: "65%", size: 2, delay: "1.6s" },
  { top: "85%", left: "15%", size: 3, delay: "2.1s" },
  { top: "18%", left: "92%", size: 2, delay: "3s" },
  { top: "50%", left: "50%", size: 2, delay: "2.5s" },
];

export default function Stars() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {STARS.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
          }}
        />
      ))}
      <span
        className="absolute top-[16%] right-[12%] w-28 h-[3px] rounded-full rotate-[-18deg]"
        style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,255,255,0))",
          boxShadow: "0 0 24px rgba(255,255,255,0.9)",
          animation: "twinkle 4.5s ease-in-out infinite",
        }}
      />
    </div>
  );
}
