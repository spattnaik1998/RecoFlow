"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { ThemeCluster } from "@/types";

interface SessionDNA {
  id: string;
  created_at: string;
  themes: string[];
  books: { title: string; author: string }[];
}

interface ConstellationNode extends d3.SimulationNodeDatum {
  theme: string;
  frequency: number;
  last_seen: string;
}

interface ConstellationLink extends d3.SimulationLinkDatum<ConstellationNode> {
  weight: number;
}

interface Tooltip {
  x: number;
  y: number;
  theme: string;
  frequency: number;
}

interface ThemeConstellationProps {
  themes: ThemeCluster[];
  sessions: SessionDNA[];
  activeTheme: string | null;
  onThemeClick: (theme: string | null) => void;
}

export default function ThemeConstellation({
  themes,
  sessions,
  activeTheme,
  onThemeClick,
}: ThemeConstellationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || themes.length === 0) return;

    const width = containerRef.current.clientWidth || 600;
    const height = 320;

    // ── Build co-occurrence links ────────────────────────────────
    const themeSet = new Set(themes.map((t) => t.theme));
    const coOccurrence = new Map<string, number>();

    for (const session of sessions) {
      const sessionThemes = session.themes.filter((t) => themeSet.has(t));
      for (let i = 0; i < sessionThemes.length; i++) {
        for (let j = i + 1; j < sessionThemes.length; j++) {
          const key = [sessionThemes[i], sessionThemes[j]].sort().join("|||");
          coOccurrence.set(key, (coOccurrence.get(key) ?? 0) + 1);
        }
      }
    }

    const links: ConstellationLink[] = Array.from(coOccurrence.entries()).map(
      ([key, weight]) => {
        const [source, target] = key.split("|||");
        return { source, target, weight } as ConstellationLink;
      }
    );

    const nodes: ConstellationNode[] = themes.map((t) => ({
      theme: t.theme,
      frequency: t.frequency,
      last_seen: t.last_seen,
    }));

    // ── Scales ──────────────────────────────────────────────────
    const maxFreq = Math.max(...themes.map((t) => t.frequency), 1);
    const nodeRadius = (d: ConstellationNode) =>
      6 + ((d.frequency - 1) / Math.max(maxFreq - 1, 1)) * 10;

    const dates = themes.map((t) => new Date(t.last_seen).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const colorScale = d3
      .scaleLinear<string>()
      .domain([minDate, maxDate === minDate ? minDate + 1 : maxDate])
      .range(["#3D4F6E", "#C8A96E"]);

    // ── Run simulation synchronously ─────────────────────────────
    const simulation = d3
      .forceSimulation<ConstellationNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<ConstellationNode, ConstellationLink>(links)
          .id((d) => d.theme)
          .distance(75)
          .strength(0.25)
      )
      .force("charge", d3.forceManyBody<ConstellationNode>().strength(-130))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide<ConstellationNode>().radius((d) => nodeRadius(d) + 12)
      )
      .stop();

    for (let i = 0; i < 300; i++) simulation.tick();

    // Clamp to canvas bounds
    nodes.forEach((n) => {
      const r = nodeRadius(n) + 2;
      n.x = Math.max(r, Math.min(width - r, n.x ?? width / 2));
      n.y = Math.max(r, Math.min(height - r, n.y ?? height / 2));
    });

    // ── Render ───────────────────────────────────────────────────
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    // Background
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0A0E1A")
      .attr("rx", 10);

    // Links
    svg
      .append("g")
      .selectAll<SVGLineElement, ConstellationLink>("line")
      .data(links)
      .join("line")
      .attr("stroke", "rgba(99,135,255,0.18)")
      .attr("stroke-width", (d) => Math.sqrt(d.weight) * 1.4)
      .attr("x1", (d) => (d.source as ConstellationNode).x ?? 0)
      .attr("y1", (d) => (d.source as ConstellationNode).y ?? 0)
      .attr("x2", (d) => (d.target as ConstellationNode).x ?? 0)
      .attr("y2", (d) => (d.target as ConstellationNode).y ?? 0);

    // Node groups
    const nodeG = svg
      .append("g")
      .selectAll<SVGGElement, ConstellationNode>("g")
      .data(nodes, (d) => d.theme)
      .join("g")
      .attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
      .attr("cursor", "pointer");

    // Outer glow ring for active theme
    nodeG
      .filter((d) => d.theme === activeTheme)
      .append("circle")
      .attr("r", (d) => nodeRadius(d) + 6)
      .attr("fill", "none")
      .attr("stroke", "#C8A96E")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0.4);

    // Main circle
    nodeG
      .append("circle")
      .attr("r", (d) => nodeRadius(d))
      .attr("fill", (d) => colorScale(new Date(d.last_seen).getTime()))
      .attr("fill-opacity", (d) => (d.theme === activeTheme ? 1 : 0.75))
      .attr("stroke", (d) =>
        d.theme === activeTheme ? "#C8A96E" : "rgba(255,255,255,0.12)"
      )
      .attr("stroke-width", (d) => (d.theme === activeTheme ? 2 : 1));

    // Interactive handlers
    nodeG
      .on("mouseenter", function (event: MouseEvent, d: ConstellationNode) {
        const rect = containerRef.current!.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          theme: d.theme,
          frequency: d.frequency,
        });
        d3.select<SVGGElement, ConstellationNode>(this)
          .select("circle:last-of-type")
          .attr("fill-opacity", 1)
          .attr("stroke", "rgba(255,255,255,0.45)");
      })
      .on("mousemove", function (event: MouseEvent) {
        const rect = containerRef.current!.getBoundingClientRect();
        setTooltip((prev) =>
          prev
            ? { ...prev, x: event.clientX - rect.left, y: event.clientY - rect.top }
            : null
        );
      })
      .on("mouseleave", function (_, d: ConstellationNode) {
        setTooltip(null);
        d3.select<SVGGElement, ConstellationNode>(this)
          .select("circle:last-of-type")
          .attr("fill-opacity", d.theme === activeTheme ? 1 : 0.75)
          .attr("stroke", d.theme === activeTheme ? "#C8A96E" : "rgba(255,255,255,0.12)");
      })
      .on("click", (_, d: ConstellationNode) => {
        onThemeClick(d.theme === activeTheme ? null : d.theme);
      });

    return () => {
      simulation.stop();
    };
  }, [themes, sessions, activeTheme, onThemeClick]);

  if (themes.length === 0) {
    return (
      <div
        style={{
          height: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0E1A",
          borderRadius: "10px",
        }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Complete more sessions to populate the constellation.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <svg
        ref={svgRef}
        style={{ width: "100%", borderRadius: "10px", display: "block" }}
      />

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 14,
            top: tooltip.y - 14,
            background: "var(--bg-overlay)",
            border: "1px solid rgba(99,135,255,0.22)",
            borderRadius: "6px",
            padding: "6px 10px",
            fontSize: "0.75rem",
            color: "var(--text-primary)",
            pointerEvents: "none",
            zIndex: 20,
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "2px" }}>{tooltip.theme}</div>
          <div style={{ color: "var(--text-muted)" }}>
            {tooltip.frequency} session{tooltip.frequency !== 1 ? "s" : ""}
          </div>
          <div style={{ color: "#A8BBFF", fontSize: "0.65rem", marginTop: "2px" }}>
            Click to filter timeline
          </div>
        </div>
      )}

      {/* Legend */}
      <div
        className="flex items-center gap-4 mt-3"
        style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
      >
        <div className="flex items-center gap-1.5">
          <div
            style={{ width: 8, height: 8, borderRadius: "50%", background: "#C8A96E" }}
          />
          <span>Recent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            style={{ width: 8, height: 8, borderRadius: "50%", background: "#3D4F6E" }}
          />
          <span>Earlier</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(99,135,255,0.4)" }}
          />
          <span>Larger = more sessions</span>
        </div>
        {activeTheme && (
          <button
            onClick={() => onThemeClick(null)}
            style={{
              marginLeft: "auto",
              color: "#C8A96E",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "0.7rem",
            }}
          >
            Clear filter ×
          </button>
        )}
      </div>
    </div>
  );
}
