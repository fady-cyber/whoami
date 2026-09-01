"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkle: number;
  depth: number;
  offset: number;
  drift: number;
  hue: number;
};

type Meteor = {
  startX: number;
  startY: number;
  length: number;
  travel: number;
  thickness: number;
  duration: number;
  progress: number;
  delayUntil: number;
  angle: number;
  hue: number;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * خلفية تفاعلية واقعية:
 * - نفس الخلفية الحالية كما هي
 * - نجوم Canvas بتلألؤ وحركة خفيفة واقعية
 * - شهب متحركة دوريًا فوق السماء
 * - Parallax بسيط مع الماوس والتمرير
 */
export default function InteractiveBackground() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let scrollProgress = 0;
    let frame = 0;
    let width = 0;
    let height = 0;
    let ratio = 1;
    let lastTime = 0;

    let stars: Star[] = [];
    let meteors: Meteor[] = [];

    const setVars = () => {
      root.style.setProperty("--mx", pointer.x.toFixed(4));
      root.style.setProperty("--my", pointer.y.toFixed(4));
      root.style.setProperty("--scroll-depth", scrollProgress.toFixed(4));
    };

    const updateScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress = Math.min(1, Math.max(0, window.scrollY / max));
      if (reduceMotion) {
        root.style.setProperty("--scroll-depth", scrollProgress.toFixed(4));
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const nx = event.clientX / window.innerWidth;
      const ny = event.clientY / window.innerHeight;
      target.x = nx * 2 - 1;
      target.y = ny * 2 - 1;
      root.style.setProperty("--spot-x", `${(nx * 100).toFixed(2)}%`);
      root.style.setProperty("--spot-y", `${(ny * 100).toFixed(2)}%`);
    };

    const handlePointerLeave = () => {
      target.x = 0;
      target.y = 0;
      root.style.setProperty("--spot-x", "50%");
      root.style.setProperty("--spot-y", "30%");
    };

    const createStars = () => {
      const density = Math.max(120, Math.min(280, Math.round((width * height) / 9500)));
      stars = Array.from({ length: density }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        size: Math.random() < 0.12 ? rand(1.4, 2.6) : rand(0.45, 1.4),
        alpha: rand(0.2, 0.92),
        twinkle: rand(0.6, 2.2),
        depth: rand(0.15, 1),
        offset: rand(0, Math.PI * 2),
        drift: rand(0.4, 3.2),
        hue: Math.random() < 0.18 ? rand(190, 225) : Math.random() < 0.14 ? rand(285, 330) : rand(0, 30),
      }));
    };

    const resetMeteor = (meteor: Meteor, now: number, initial = false) => {
      meteor.startX = rand(width * 0.58, width * 1.02);
      meteor.startY = rand(-height * 0.04, height * 0.34);
      meteor.length = rand(110, 240);
      meteor.travel = rand(width * 0.16, width * 0.34);
      meteor.thickness = rand(1.1, 2.4);
      meteor.duration = rand(850, 1700);
      meteor.progress = 0;
      meteor.delayUntil = now + (initial ? rand(500, 4500) : rand(2500, 9000));
      meteor.angle = rand(2.4, 2.62);
      meteor.hue = Math.random() < 0.65 ? rand(190, 215) : rand(300, 335);
    };

    const createMeteors = () => {
      const count = reduceMotion ? 2 : width < 768 ? 3 : 5;
      const now = performance.now();
      meteors = Array.from({ length: count }, () => {
        const meteor: Meteor = {
          startX: 0,
          startY: 0,
          length: 0,
          travel: 0,
          thickness: 0,
          duration: 0,
          progress: 0,
          delayUntil: 0,
          angle: 0,
          hue: 0,
        };
        resetMeteor(meteor, now, true);
        return meteor;
      });
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      createStars();
      createMeteors();
    };

    const drawStar = (star: Star, time: number) => {
      const driftX = Math.sin(time * 0.00012 * star.twinkle + star.offset) * star.drift;
      const driftY = Math.cos(time * 0.0001 * star.twinkle + star.offset) * star.drift * 0.7;
      const x = star.x + driftX + pointer.x * star.depth * 14;
      const y = star.y + driftY + pointer.y * star.depth * 12 + scrollProgress * star.depth * 10;

      if (x < -20 || x > width + 20 || y < -20 || y > height + 20) return;

      const pulse = 0.72 + Math.sin(time * 0.0012 * star.twinkle + star.offset) * 0.28;
      const alpha = Math.max(0.06, Math.min(1, star.alpha * pulse));
      const glow = star.size > 1.2 ? star.size * 7 : star.size * 3.5;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glow);
      gradient.addColorStop(0, `hsla(${star.hue} 100% 92% / ${alpha})`);
      gradient.addColorStop(0.32, `hsla(${star.hue} 95% 80% / ${alpha * 0.4})`);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, glow, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha + 0.15)})`;
      ctx.beginPath();
      ctx.arc(x, y, star.size, 0, Math.PI * 2);
      ctx.fill();

      if (star.size > 1.7 && !reduceMotion) {
        ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.22})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(x - star.size * 3, y);
        ctx.lineTo(x + star.size * 3, y);
        ctx.moveTo(x, y - star.size * 3);
        ctx.lineTo(x, y + star.size * 3);
        ctx.stroke();
      }
    };

    const drawMeteor = (meteor: Meteor, time: number, dt: number) => {
      if (time < meteor.delayUntil) return;

      meteor.progress += dt / meteor.duration;
      if (meteor.progress >= 1) {
        resetMeteor(meteor, time, false);
        return;
      }

      const t = easeOutCubic(meteor.progress);
      const distance = meteor.travel * t;
      const headX = meteor.startX + Math.cos(meteor.angle) * distance + pointer.x * 18;
      const headY = meteor.startY + Math.sin(meteor.angle) * distance + pointer.y * 10;
      const tailX = headX - Math.cos(meteor.angle) * meteor.length;
      const tailY = headY - Math.sin(meteor.angle) * meteor.length;
      const opacity = meteor.progress < 0.18 ? meteor.progress / 0.18 : 1 - Math.max(0, meteor.progress - 0.72) / 0.28;

      const trail = ctx.createLinearGradient(headX, headY, tailX, tailY);
      trail.addColorStop(0, `hsla(${meteor.hue} 100% 92% / ${0.95 * opacity})`);
      trail.addColorStop(0.15, `hsla(${meteor.hue} 100% 80% / ${0.6 * opacity})`);
      trail.addColorStop(0.55, `rgba(255,255,255,${0.22 * opacity})`);
      trail.addColorStop(1, "transparent");

      ctx.strokeStyle = trail;
      ctx.lineWidth = meteor.thickness * (1 - meteor.progress * 0.45);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(headX, headY);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      const glow = ctx.createRadialGradient(headX, headY, 0, headX, headY, 18);
      glow.addColorStop(0, `rgba(255,255,255,${0.95 * opacity})`);
      glow.addColorStop(0.35, `hsla(${meteor.hue} 100% 78% / ${0.55 * opacity})`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(headX, headY, 18, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = (time: number) => {
      const dt = Math.min(32, lastTime ? time - lastTime : 16);
      lastTime = time;

      const ease = reduceMotion ? 0.06 : 0.042;
      pointer.x += (target.x - pointer.x) * ease;
      pointer.y += (target.y - pointer.y) * ease;
      setVars();

      ctx.clearRect(0, 0, width, height);
      for (const star of stars) drawStar(star, time);
      for (const meteor of meteors) drawMeteor(meteor, time, dt);

      frame = window.requestAnimationFrame(animate);
    };

    root.style.setProperty("--spot-x", "50%");
    root.style.setProperty("--spot-y", "30%");
    setVars();
    updateScroll();
    resize();

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", resize);
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="interactive-bg fixed inset-0 pointer-events-none overflow-hidden"
    >
      <div className="interactive-bg__image" />
      <canvas ref={canvasRef} className="interactive-bg__canvas" />
      <div className="interactive-bg__nebula interactive-bg__nebula--one" />
      <div className="interactive-bg__nebula interactive-bg__nebula--two" />
      <div className="interactive-bg__grid" />
      <div className="interactive-bg__spotlight" />
      <div className="interactive-bg__vignette" />
    </div>
  );
}
