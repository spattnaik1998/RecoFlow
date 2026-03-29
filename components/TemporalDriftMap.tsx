"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SessionDNA {
  id: string;
  created_at: string;
  themes: string[];
  books: { title: string; author: string }[];
}

interface DriftPoint {
  x: number;       // Unix timestamp
  y: number;       // Theme index
  theme: string;
  displayDate: string;
  bookTitles: string[];
}

interface TemporalDriftMapProps {
  sessions: SessionDNA[];
  filterTheme: string | null;
}

interface TooltipPayload {
  payload: DriftPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.[0]?.payload) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "var(--bg-overlay)",
        border: "1px solid rgba(99,135,255,0.2)",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "0.75rem",
        maxWidth: 220,
      }}
    >
      <div
        style={{
          fontWeight: 600,
          marginBottom: "4px",
          color: "#C8A96E",
          fontSize: "0.8rem",
        }}
      >
        {d.theme}
      </div>
      <div style={{ color: "var(--text-muted)", marginBottom: "6px" }}>
        {d.displayDate}
      </div>
      {d.bookTitles.map((title) => (
        <div
          key={title}
          style={{
            color: "var(--text-secondary)",
            marginBottom: "2px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
      ))}
    </div>
  );
}

// Custom dot — gold circle with subtle glow ring
function GoldDot(props: { cx?: number; cy?: number; active?: boolean }) {
  const { cx = 0, cy = 0, active } = props;
  return (
    <g>
      {active && (
        <circle cx={cx} cy={cy} r={10} fill="none" stroke="#C8A96E" strokeWidth={1} strokeOpacity={0.4} />
      )}
      <circle cx={cx} cy={cy} r={5} fill="#C8A96E" fillOpacity={0.85} />
    </g>
  );
}

export default function TemporalDriftMap({ sessions, filterTheme }: TemporalDriftMapProps) {
  if (sessions.length === 0) {
    return (
      <div
        style={{
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No session data yet.
        </p>
      </div>
    );
  }

  // Build sorted theme list by frequency
  const themeFreq = new Map<string, number>();
  for (const session of sessions) {
    for (const theme of session.themes) {
      themeFreq.set(theme, (themeFreq.get(theme) ?? 0) + 1);
    }
  }
  const sortedThemes = Array.from(themeFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([theme]) => theme)
    .slice(0, 10);

  // Filter sessions if a theme is selected
  const visibleSessions = filterTheme
    ? sessions.filter((s) => s.themes.includes(filterTheme))
    : sessions;

  // Build scatter points
  const data: DriftPoint[] = visibleSessions.flatMap((session) => {
    const sessionThemes = session.themes.filter((t) => sortedThemes.includes(t));
    return sessionThemes.map((theme) => ({
      x: new Date(session.created_at).getTime(),
      y: sortedThemes.indexOf(theme),
      theme,
      displayDate: new Date(session.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      bookTitles: session.books.slice(0, 3).map((b) => b.title),
    }));
  });

  if (data.length === 0) {
    return (
      <div
        style={{
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No sessions contain &ldquo;{filterTheme}&rdquo;.
        </p>
      </div>
    );
  }

  const allDates = data.map((d) => d.x);
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);
  // Add 10% padding to date range
  const datePad = (maxDate - minDate) * 0.1 || 86400000 * 3;

  const ticks = sortedThemes.map((_, i) => i);

  return (
    <div style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 16, bottom: 40, left: 8 }}>
          <CartesianGrid stroke="rgba(99,135,255,0.06)" strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[minDate - datePad, maxDate + datePad]}
            tickFormatter={(ts: number) =>
              new Date(ts).toLocaleDateString("en-US", {
                month: "short",
                year: "2-digit",
              })
            }
            tick={{ fill: "#3D4F6E", fontSize: 10 }}
            axisLine={{ stroke: "rgba(99,135,255,0.10)" }}
            tickLine={false}
            name="Date"
          />
          <YAxis
            dataKey="y"
            type="number"
            domain={[-0.5, sortedThemes.length - 0.5]}
            ticks={ticks}
            tickFormatter={(i: number) => {
              const theme = sortedThemes[i] ?? "";
              return theme.length > 16 ? theme.slice(0, 14) + "…" : theme;
            }}
            tick={{ fill: "#6B7FA3", fontSize: 10 }}
            axisLine={{ stroke: "rgba(99,135,255,0.10)" }}
            tickLine={false}
            width={120}
            name="Theme"
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "rgba(99,135,255,0.15)" }}
          />
          <Scatter
            data={data}
            shape={(props: { cx?: number; cy?: number }) => <GoldDot {...props} />}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
