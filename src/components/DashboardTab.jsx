import { useState } from "react";
import { QUOTES, PHASES, WEEK_SCHEDULE, DAY_ICONS } from "../data";

export default function DashboardTab() {
  const [expandedPhase, setExpandedPhase] = useState(1);
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const today = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];
  const todayWorkout = WEEK_SCHEDULE[today];
  const activePhase = PHASES.find(p => p.status === "active");

  return (
    <>
      {/* Quote */}
      <div className="quote-wrap">
        <div className="quote-text">"{quote.t}"</div>
        {quote.a && <div className="quote-author">\u2014 {quote.a}</div>}
      </div>

      {/* Today's Snapshot */}
      <div className="t-section">Today's Mission</div>
      <div className="card card-accent">
        <div className="row-between mb8">
          <div>
            <div className="t-h3" style={{ marginBottom: 2 }}>{todayWorkout?.name || "Rest Day"}</div>
            <div className="t-label">{today} \u2022 {todayWorkout?.dur || "Recovery"}</div>
          </div>
          <span style={{ fontSize: 28 }}>{DAY_ICONS[todayWorkout?.type] || "\ud83e\uddd8"}</span>
        </div>
        {todayWorkout && (
          <div className="prog-bar mt8">
            <div className="prog-fill" style={{ width: "0%", background: "var(--green)" }} />
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="t-section">Current Stats</div>
      <div className="stat-grid">
        <div className="stat-cell">
          <div className="stat-val">63</div>
          <div className="stat-lbl">Push-ups (2 min)</div>
        </div>
        <div className="stat-cell">
          <div className="stat-val">15:30</div>
          <div className="stat-lbl">2-Mile Run</div>
        </div>
        <div className="stat-cell">
          <div className="stat-val">2:30</div>
          <div className="stat-lbl">Plank (min)</div>
        </div>
        <div className="stat-cell">
          <div className="stat-val">285</div>
          <div className="stat-lbl">Deadlift (lbs)</div>
        </div>
      </div>

      {/* Phase Progress */}
      <div className="t-section">Training Phases</div>
      <div className="card">
        {activePhase && (
          <div className="row-between mb12">
            <div>
              <span className="badge b-green">{activePhase.badge}</span>
              <span className="t-label" style={{ marginLeft: 8 }}>Phase {activePhase.id + 1} of {PHASES.length}</span>
            </div>
            <span className="t-num">{activePhase.pct}%</span>
          </div>
        )}
        <div className="prog-bar mb12">
          <div className="prog-fill" style={{ width: `${activePhase?.pct || 0}%`, background: "var(--tan)" }} />
        </div>

        <div className="timeline">
          {PHASES.map((p, i) => (
            <div key={p.id} className="tl-item" onClick={() => setExpandedPhase(expandedPhase === p.id ? -1 : p.id)}>
              <div className="tl-left">
                <div className={`tl-dot ${p.status}`}>{p.emoji}</div>
                {i < PHASES.length - 1 && <div className={`tl-line ${p.status === "done" ? "done" : ""}`} />}
              </div>
              <div className="tl-body">
                <div className="tl-name" style={{ color: p.status === "locked" ? "var(--txt3)" : "var(--txt)" }}>{p.name}</div>
                <div className="tl-sub">{p.weeks} \u2022 {p.badge}</div>
                {expandedPhase === p.id && (
                  <div className="tl-expand">
                    <div className="tl-detail-row">
                      <span className="tl-detail-lbl">Goal</span>
                      {p.goal}
                    </div>
                    <div className="tl-detail-row">
                      <span className="tl-detail-lbl">Focus</span>
                      {p.focus}
                    </div>
                    <div className="tl-detail-row">
                      <span className="tl-detail-lbl">Milestone</span>
                      {p.milestone}
                    </div>
                    {p.status !== "locked" && (
                      <div style={{ marginTop: 8 }}>
                        <div className="prog-bar">
                          <div className="prog-fill" style={{ width: `${p.pct}%`, background: p.color }} />
                        </div>
                        <div className="t-label mt8">{p.pct}% Complete</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
