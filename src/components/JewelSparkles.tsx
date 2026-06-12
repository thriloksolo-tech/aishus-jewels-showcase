import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: "diamond" | "star" | "dot";
}

function generateSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 4,
    type: (["diamond", "star", "dot"] as const)[Math.floor(Math.random() * 3)],
  }));
}

function Diamond({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L2 9l10 13 10-13L12 2z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M12 2L7 9h10L12 2z"
        fill="white"
        opacity="0.5"
      />
    </svg>
  );
}

function Star({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0l3.09 6.26L22 7.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 12.14 2 7.27l6.91-1.01L12 0z" />
    </svg>
  );
}

function Dot({ size }: { size: number }) {
  return (
    <div
      className="rounded-full"
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(218,165,32,0.4) 60%, transparent 100%)",
        boxShadow: "0 0 6px 2px rgba(218,165,32,0.3)",
      }}
    />
  );
}

export function JewelSparkles({
  count = 25,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    setSparkles(generateSparkles(count));
  }, [count]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <AnimatePresence>
        {sparkles.map((s) => {
          const Component = s.type === "diamond" ? Diamond : s.type === "star" ? Star : Dot;
          return (
            <motion.div
              key={s.id}
              className="absolute text-[oklch(0.78_0.13_80)]"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0.6, 1, 0],
                scale: [0, 1, 1.2, 0.8, 0],
                y: [0, -30, -60, -40, -80],
              }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Component size={s.size} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function ShimmerGold({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)",
        }}
        initial={{ x: "-200%" }}
        animate={{ x: "200%" }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
