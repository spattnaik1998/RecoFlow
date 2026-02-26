"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  type: "dust" | "spark";
}

export default function VictorianBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function spawnParticle() {
      if (!canvas) return;
      const type = Math.random() < 0.8 ? "dust" : "spark";
      particles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.6 + 0.2),
        life: 0,
        maxLife: type === "dust" ? 180 + Math.random() * 120 : 60 + Math.random() * 60,
        size: type === "dust" ? 1 + Math.random() * 2 : 0.5 + Math.random(),
        type,
      });
    }

    let frame = 0;
    function draw() {
      if (!canvas || !ctx) return;
      frame++;

      // Spawn particles
      if (frame % 4 === 0) spawnParticle();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw library bookshelf silhouette at bottom
      ctx.fillStyle = "rgba(10,6,3,0.6)";
      const shelfH = 120;
      ctx.fillRect(0, canvas.height - shelfH, canvas.width, shelfH);

      // Books silhouette
      const bookColors = ["#1A0E06", "#150B04", "#180E07", "#120A03"];
      let bx = 0;
      while (bx < canvas.width) {
        const bw = 12 + Math.random() * 20;
        const bh = 60 + Math.random() * 50;
        ctx.fillStyle = bookColors[Math.floor(Math.random() * bookColors.length)];
        ctx.fillRect(bx, canvas.height - shelfH - bh + shelfH * 0.1, bw - 1, bh);
        bx += bw;
      }
      // Deterministic books (stable across frames)
      ctx.fillStyle = "#0D0A07";
      ctx.fillRect(0, canvas.height - shelfH + 1, canvas.width, shelfH - 1);

      // Shelf line
      const shelfY = canvas.height - shelfH;
      const grad = ctx.createLinearGradient(0, shelfY, canvas.width, shelfY);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.5, "rgba(200, 169, 110, 0.15)");
      grad.addColorStop(1, "transparent");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, shelfY);
      ctx.lineTo(canvas.width, shelfY);
      ctx.stroke();

      // Update + draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (p.life > p.maxLife || p.y < -10) {
          particles.splice(i, 1);
          continue;
        }

        const progress = p.life / p.maxLife;
        const alpha =
          progress < 0.1
            ? progress * 10
            : progress > 0.8
            ? (1 - progress) * 5
            : 1;

        if (p.type === "dust") {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 169, 110, ${alpha * 0.15})`;
          ctx.fill();
        } else {
          // Spark
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232, 200, 138, ${alpha * 0.4})`;
          ctx.fill();
          // Glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 169, 110, ${alpha * 0.05})`;
          ctx.fill();
        }
      }

      // Radial gradient overlay from top for depth
      const topGrad = ctx.createRadialGradient(
        canvas.width / 2,
        0,
        0,
        canvas.width / 2,
        canvas.height * 0.6,
        canvas.height * 0.8
      );
      topGrad.addColorStop(0, "rgba(26, 18, 8, 0.0)");
      topGrad.addColorStop(1, "rgba(13, 10, 7, 0.5)");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
