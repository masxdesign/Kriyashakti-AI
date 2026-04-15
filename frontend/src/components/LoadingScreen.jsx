import { useEffect, useState } from "react";
import { isKriya } from '@/lib/mode.js'

const messages = [
  "Understanding your wish…",
  "Finding your core intentions…",
  isKriya ? "Shaping your Kriyashakti…" : "Shaping your statement…",
  "Creating your visualization…",
];

// 7 chakras root→crown, rendered bottom→top
// petalCount matches traditional petal counts (simplified for even symmetry)
// inner/outer: two concentric petal rings like in the reference
const CHAKRAS = [
  {
    name: "Basic",
    outerColor: "#ef4444",
    innerColor: "#fca5a5",
    centerColor: "#fff",
    glowColor: "rgba(239,68,68,0.5)",
    outerPetals: 8,
    innerPetals: 4,
    spinSpeed: 7,
    size: 56,
  },
  {
    name: "Navel",
    outerColor: "#f97316",
    innerColor: "#fdba74",
    centerColor: "#fff7ed",
    glowColor: "rgba(249,115,22,0.5)",
    outerPetals: 8,
    innerPetals: 4,
    spinSpeed: 6,
    size: 58,
  },
  {
    name: "Solar Plexus",
    outerColor: "#eab308",
    innerColor: "#fde047",
    centerColor: "#fefce8",
    glowColor: "rgba(234,179,8,0.5)",
    outerPetals: 10,
    innerPetals: 5,
    spinSpeed: 5.5,
    size: 62,
  },
  {
    name: "Heart",
    outerColor: "#22c55e",
    innerColor: "#86efac",
    centerColor: "#f0fdf4",
    glowColor: "rgba(34,197,94,0.5)",
    outerPetals: 12,
    innerPetals: 6,
    spinSpeed: 6,
    size: 64,
  },
  {
    name: "Throat",
    outerColor: "#06b6d4",
    innerColor: "#67e8f9",
    centerColor: "#ecfeff",
    glowColor: "rgba(6,182,212,0.5)",
    outerPetals: 10,
    innerPetals: 5,
    spinSpeed: 5,
    size: 60,
  },
  {
    name: "Ajna",
    outerColor: "#6366f1",
    innerColor: "#a5b4fc",
    centerColor: "#eef2ff",
    glowColor: "rgba(99,102,241,0.5)",
    outerPetals: 8,
    innerPetals: 4,
    spinSpeed: 4.5,
    size: 58,
  },
  {
    name: "Crown",
    outerColor: "#a855f7",
    innerColor: "#d8b4fe",
    centerColor: "#faf5ff",
    glowColor: "rgba(168,85,247,0.6)",
    outerPetals: 12,
    innerPetals: 6,
    spinSpeed: 4,
    size: 68,
  },
];

function ChakraWheel({ chakra, index }) {
  const total = CHAKRAS.length;
  // stagger delay so energy appears to rise from root to crown
  const delay = index * 0.15;
  const { outerColor, innerColor, centerColor, glowColor, outerPetals, innerPetals, spinSpeed, size } = chakra;

  const cx = 50;
  const cy = 50;

  // Build outer petal path: pointed ellipses radiating from center
  function petalPath(count, rx, ry) {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (360 / count) * i;
      return (
        <ellipse
          key={i}
          cx={cx}
          cy={cy - ry / 2}
          rx={rx}
          ry={ry}
          transform={`rotate(${angle} ${cx} ${cy})`}
        />
      );
    });
  }

  return (
    <div
      className="chakra-node"
      style={{
        width: size,
        height: size,
        "--chakra-glow": glowColor,
        "--spin-dur": `${spinSpeed}s`,
        "--delay": `${delay}s`,
      }}
    >
      {/* Outer petal ring — slow clockwise */}
      <svg className="chakra-svg chakra-svg--outer" viewBox="0 0 100 100">
        <g fill={outerColor} opacity="0.65">
          {petalPath(outerPetals, 7, 24)}
        </g>
      </svg>

      {/* Inner petal ring — faster counter-clockwise */}
      <svg className="chakra-svg chakra-svg--inner" viewBox="0 0 100 100">
        <g fill={innerColor} opacity="0.80">
          {petalPath(innerPetals, 5, 16)}
        </g>
      </svg>

      {/* Concentric halo rings */}
      <svg className="chakra-svg chakra-svg--static" viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={38} fill="none" stroke={outerColor} strokeWidth="0.8" opacity="0.30" />
        <circle cx={cx} cy={cy} r={28} fill="none" stroke={innerColor} strokeWidth="0.8" opacity="0.35" />
        <circle cx={cx} cy={cy} r={18} fill="none" stroke={innerColor} strokeWidth="1" opacity="0.45" />
        {/* Center disc */}
        <circle cx={cx} cy={cy} r={9} fill={outerColor} opacity="0.9" />
        <circle cx={cx} cy={cy} r={5} fill={centerColor} opacity="1" />
      </svg>

      {/* Glow aura */}
      <div className="chakra-aura" />
    </div>
  );
}

export default function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="kriya-loader">
      <div className="kriya-loader__bg" />
      <div className="kriya-blob kriya-blob--1" />
      <div className="kriya-blob kriya-blob--2" />

      {/* Chakra column — crown at top, root at bottom */}
      <div className="chakra-column">
        <div className="chakra-channel" />
        {[...CHAKRAS].reverse().map((c, i) => (
          <ChakraWheel key={c.name} chakra={c} index={CHAKRAS.length - 1 - i} />
        ))}
      </div>

      {/* Text */}
      <div className="kriya-loader__copy">
        <h1 className="kriya-loader__title">{isKriya ? 'Kriyashakti AI' : 'Shape My Wish'}</h1>
        <p className="kriya-loader__tagline">
          {isKriya
            ? "Say it however it comes. We\u2019ll shape it into a clear Kriyashakti."
            : "Say it however it comes. We\u2019ll shape it into a clear present-tense statement."}
        </p>
        <p className="kriya-loader__status" style={{ opacity: visible ? 1 : 0 }}>
          {messages[msgIndex]}
        </p>
        <div className="kriya-dots">
          {messages.map((_, i) => (
            <span key={i} className={`kriya-dot ${i === msgIndex ? "kriya-dot--active" : ""}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
