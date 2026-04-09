import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PROGRESS_DATA, PHASES } from "../data";

const CHART_OPTS = [
  { key: "pushups", label: "Push-ups", color: "#C8A96E", unit: "reps" },
  { key: "run", label: "2-Mile Run", color: "#4B5320", unit: "min" },
  { key: "plank", label: "Plank", color: "#B22222", unit: "min" },
];

export default function ProgressTab() {
  const [chartMetric, setChartMetric] = useState("pushups");
  const opt = CHART_OPTS.find(c => c.key === chartMetric);

  const currentScores = {
    pushups: { val: 63, max: 80, std: "60 (min)" },
    situps: { val: 68, max: 80, std: "65 (min)" },
    run: { val: "15:30", max: "13:00", std: "16:36 (max)" },
    plank: { val: "2:30", max: "3:20+", std: "2:09 (min)" },
    deadlift: { val: 285, max: 340, std: "140 (3RM min)" },
    sdc: { val: "1:48", max: "1:33", std: "2:09 (max)" },
  };

  const aftScore = 310;
  const aftTarget = 360;

  return (
    <>
      {/* AFT Score */}
      <div className="t-section">Army Fitness Test Score</div>
      <div className="card card-accent">
        <div className="row-between mb8">
          <div>
            <div className="t-h1" style={{ fontSize: 36 }}>{aftScore}</div>
            <div className="t-label">Current AFT Score</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="t-num" style={{ fontSize: 18 }}>{aftTarget}</div>
            <div className="t-label">Target</div>
          </div>
        </div>
        <div className="prog-bar">
          <div className="prog-fill" style={{ width: `${(aftScore / 600) * 100}%`, background: aftScore >= 300 ? "var(--ok)" : "var(--warn)" }} />
        </div>
        <div className="t-label mt8">{aftScore >= 300 ? "Passing" : "Below Standard"} \u2022 {Math.round((aftScore / aftTarget) * 100)}% of target</div>
      </div>

      {/* Score Breakdown */}
      <div className="t-section">Event Scores</div>
      <div className="card">
        {Object.entries(currentScores).map(([key, s]) => (
          <div key={key} className="score-row">
            <div>
              <div className="score-name">{key === "sdc" ? "Sprint-Drag-Carry" : key === "run" ? "2-Mile Run" : key.charAt(0).toUpperCase() + key.slice(1)}</div>
              <div className="t-label">Standard: {s.std}</div>
            </div>
            <div className="score-val">{s.val}</div>
          </div>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="t-section">Progress Trends</div>
      <div className="card">
        <div className="filter-row">
          {CHART_OPTS.map(c => (
            <button key={c.key} className={`ftag ${chartMetric === c.key ? "on" : ""}`} onClick={() => setChartMetric(c.key)}>
              {c.label}
            </button>
          ))}
        </div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PROGRESS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252525" />
              <XAxis dataKey="week" tick={{ fill: "#555", fontSize: 10 }} />
              <YAxis tick={{ fill: "#555", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#181818", border: "1px solid #252525", borderRadius: 4, fontSize: 12 }}
                labelStyle={{ color: "#C8A96E" }}
              />
              <Line type="monotone" dataKey={opt.key} stroke={opt.color} strokeWidth={2} dot={{ fill: opt.color, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Phase Milestones */}
      <div className="t-section">Phase Milestones</div>
      <div className="card">
        {PHASES.map(p => (
          <div key={p.id} className="score-row">
            <div>
              <div className="score-name">{p.emoji} {p.name}</div>
              <div className="t-label">{p.weeks}</div>
            </div>
            <span className={`badge ${p.status === "done" ? "b-ok" : p.status === "active" ? "b-tan" : "b-gray"}`}>
              {p.status === "done" ? "Complete" : p.status === "active" ? `${p.pct}%` : "Locked"}
            </span>
          </div>
        ))}
      </div>

      {/* Goals Checklist */}
      <div className="t-section">Current Phase Goals</div>
      <div className="card card-green">
        <div className="t-h3">Foundation Builder Goals</div>
        <ul className="ex-list">
          {[
            { text: "Push-ups: 60+ in 2 minutes", done: true },
            { text: "2-Mile Run: under 16:00", done: true },
            { text: "Plank: 2:30+", done: true },
            { text: "Deadlift: 300 lbs", done: false },
            { text: "AFT Score: 300+", done: true },
            { text: "Ruck 3mi under 45 min (35 lbs)", done: false },
          ].map((g, i) => (
            <li key={i} style={{ opacity: g.done ? 0.6 : 1 }}>
              <span className="ex-bullet" style={{ color: g.done ? "var(--ok)" : "var(--tan)" }}>
                {g.done ? "\u2713" : "\u25b8"}
              </span>
              <span style={{ textDecoration: g.done ? "line-through" : "none" }}>{g.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
