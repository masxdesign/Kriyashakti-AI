import { useEffect, useState } from "react";
import { isKriya } from '@/lib/mode.js'

const MESSAGES = [
  "Understanding your wish…",
  "Finding your core intentions…",
  isKriya ? "Shaping your Kriyashakti…" : "Shaping your statement…",
  "Creating your visualization…",
];

// 7 chakras root→crown
const CHAKRAS = [
  { name: "Root",        outerColor: "#ef4444", innerColor: "#fca5a5", centerColor: "#fff",    glowColor: "rgba(239,68,68,0.5)",    outerPetals: 8,  innerPetals: 4, spinSpeed: 7,   size: 44 },
  { name: "Sacral",      outerColor: "#f97316", innerColor: "#fdba74", centerColor: "#fff7ed", glowColor: "rgba(249,115,22,0.5)",   outerPetals: 8,  innerPetals: 4, spinSpeed: 6,   size: 46 },
  { name: "Solar",       outerColor: "#eab308", innerColor: "#fde047", centerColor: "#fefce8", glowColor: "rgba(234,179,8,0.5)",    outerPetals: 10, innerPetals: 5, spinSpeed: 5.5, size: 50 },
  { name: "Heart",       outerColor: "#22c55e", innerColor: "#86efac", centerColor: "#f0fdf4", glowColor: "rgba(34,197,94,0.5)",    outerPetals: 12, innerPetals: 6, spinSpeed: 6,   size: 52 },
  { name: "Throat",      outerColor: "#06b6d4", innerColor: "#67e8f9", centerColor: "#ecfeff", glowColor: "rgba(6,182,212,0.5)",    outerPetals: 10, innerPetals: 5, spinSpeed: 5,   size: 48 },
  { name: "Ajna",        outerColor: "#6366f1", innerColor: "#a5b4fc", centerColor: "#eef2ff", glowColor: "rgba(99,102,241,0.5)",   outerPetals: 8,  innerPetals: 4, spinSpeed: 4.5, size: 46 },
  { name: "Crown",       outerColor: "#a855f7", innerColor: "#d8b4fe", centerColor: "#faf5ff", glowColor: "rgba(168,85,247,0.6)",   outerPetals: 12, innerPetals: 6, spinSpeed: 4,   size: 54 },
];

function petalPath(cx, cy, count, rx, ry) {
  return Array.from({ length: count }).map((_, i) => (
    <ellipse
      key={i}
      cx={cx}
      cy={cy - ry / 2}
      rx={rx}
      ry={ry}
      transform={`rotate(${(360 / count) * i} ${cx} ${cy})`}
    />
  ));
}

function ChakraWheel({ chakra, index }) {
  const delay = index * 0.14;
  const { outerColor, innerColor, centerColor, outerPetals, innerPetals, spinSpeed, size } = chakra;
  const cx = 50; const cy = 50;

  return (
    <div
      className="chakra-node"
      style={{
        width: size,
        height: size,
        "--chakra-glow": chakra.glowColor,
        "--spin-dur": `${spinSpeed}s`,
        "--delay": `${delay}s`,
      }}
    >
      <svg className="chakra-svg chakra-svg--outer" viewBox="0 0 100 100">
        <g fill={outerColor} opacity="0.6">{petalPath(cx, cy, outerPetals, 7, 24)}</g>
      </svg>
      <svg className="chakra-svg chakra-svg--inner" viewBox="0 0 100 100">
        <g fill={innerColor} opacity="0.8">{petalPath(cx, cy, innerPetals, 5, 16)}</g>
      </svg>
      <svg className="chakra-svg chakra-svg--static" viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={38} fill="none" stroke={outerColor} strokeWidth="0.7" opacity="0.25" />
        <circle cx={cx} cy={cy} r={26} fill="none" stroke={innerColor} strokeWidth="0.7" opacity="0.30" />
        <circle cx={cx} cy={cy} r={16} fill="none" stroke={innerColor} strokeWidth="0.9" opacity="0.40" />
        <circle cx={cx} cy={cy} r={8}  fill={outerColor} opacity="0.92" />
        <circle cx={cx} cy={cy} r={4}  fill={centerColor} />
      </svg>
      <div className="chakra-aura" />
    </div>
  );
}

export default function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  // Cycle messages
  useEffect(() => {
    const id = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
        setMsgVisible(true);
      }, 350);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  // Smooth progress bar — advances to ~90% then stalls waiting for real completion
  useEffect(() => {
    let raf;
    let start = null;
    const duration = 9000; // ms to reach ~90%
    function tick(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      // Ease-out curve — fast then slows near 90%
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.min(eased * 90, 90));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="loader-shell">
      {/* Fixed ambient orbs — GPU-safe, pointer-events-none */}
      <div className="loader-orb loader-orb--1" aria-hidden />
      <div className="loader-orb loader-orb--2" aria-hidden />
      <div className="loader-orb loader-orb--3" aria-hidden />

      {/* ── Central composition ── */}
      <div className="loader-stage">

        {/* Double-Bezel chakra vessel */}
        <div className="loader-vessel-shell">
          <div className="loader-vessel-inner">
            {/* Sushumna channel */}
            <div className="loader-channel" aria-hidden />

            {/* Chakras: crown first (top), root last (bottom) */}
            <div className="loader-chakra-col">
              {[...CHAKRAS].reverse().map((c, i) => (
                <ChakraWheel key={c.name} chakra={c} index={CHAKRAS.length - 1 - i} />
              ))}
            </div>
          </div>
        </div>

        {/* Text block */}
        <div className="loader-copy">
          {/* Eyebrow */}
          <span className="loader-eyebrow">
            {isKriya ? 'Kriyashakti' : 'Intention Setting'}
          </span>

          {/* Title */}
          <h1 className="loader-title">
            {isKriya ? 'Shaping your\nKriyashakti' : 'Shaping your\nwish'}
          </h1>

          {/* Cycling status */}
          <p
            className="loader-status"
            style={{
              opacity: msgVisible ? 1 : 0,
              transform: msgVisible ? 'translateY(0)' : 'translateY(4px)',
              transition: 'opacity 0.35s cubic-bezier(0.32,0.72,0,1), transform 0.35s cubic-bezier(0.32,0.72,0,1)',
            }}
          >
            {MESSAGES[msgIndex]}
          </p>

          {/* Progress runway — Double-Bezel pill track */}
          <div className="loader-track-shell" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <div className="loader-track-inner">
              <div
                className="loader-track-fill"
                style={{ transform: `scaleX(${progress / 100})` }}
              />
            </div>
          </div>

          {/* Step dots */}
          <div className="loader-dots" aria-hidden>
            {MESSAGES.map((_, i) => (
              <span
                key={i}
                className="loader-dot"
                style={{
                  '--dot-active': i === msgIndex ? '1' : '0',
                  transition: 'transform 0.5s cubic-bezier(0.32,0.72,0,1), background 0.5s cubic-bezier(0.32,0.72,0,1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
