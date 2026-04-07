import { useEffect, useState } from "react";

const messages = [
  "Understanding your wish…",
  "Finding your core intentions…",
  "Shaping your Kriyashakti…",
  "Creating your visualization…",
];

export default function LoadingScreen() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="kriya-loader">
      {/* Background gradient matching the app */}
      <div className="kriya-loader__bg" />

      {/* Floating ambient blobs */}
      <div className="kriya-blob kriya-blob--1" />
      <div className="kriya-blob kriya-blob--2" />
      <div className="kriya-blob kriya-blob--3" />

      {/* 3D orbital system */}
      <div className="kriya-scene">
        <div className="kriya-sphere-wrap">
          {/* Inner glowing orb */}
          <div className="kriya-orb-core" />

          {/* 3D rings — each tilted on a different axis */}
          <div className="kriya-ring kriya-ring--1">
            <div className="kriya-ring__track">
              <div className="kriya-ring__dot" />
            </div>
          </div>
          <div className="kriya-ring kriya-ring--2">
            <div className="kriya-ring__track">
              <div className="kriya-ring__dot" />
            </div>
          </div>
          <div className="kriya-ring kriya-ring--3">
            <div className="kriya-ring__track">
              <div className="kriya-ring__dot" />
            </div>
          </div>

          {/* Particle sparks */}
          <div className="kriya-spark kriya-spark--1" />
          <div className="kriya-spark kriya-spark--2" />
          <div className="kriya-spark kriya-spark--3" />
          <div className="kriya-spark kriya-spark--4" />
          <div className="kriya-spark kriya-spark--5" />
          <div className="kriya-spark kriya-spark--6" />
        </div>
      </div>

      {/* Text */}
      <div className="kriya-loader__copy">
        <h1 className="kriya-loader__title">Kriyashakti AI</h1>
        <p className="kriya-loader__tagline">
          Say it however it comes. We&apos;ll shape it into a clear Kriyashakti.
        </p>
        <p
          className="kriya-loader__status"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {messages[index]}
        </p>

        {/* Progress dots */}
        <div className="kriya-dots">
          {messages.map((_, i) => (
            <span
              key={i}
              className={`kriya-dot ${i === index ? "kriya-dot--active" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
