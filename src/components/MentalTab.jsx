import { useState, useEffect, useRef, useCallback } from "react";
import { MENTAL_SKILLS } from "../data";

const BREATH_PHASES = [
  { name: "Inhale", dur: 4000, cls: "inhale" },
  { name: "Hold", dur: 4000, cls: "hold" },
  { name: "Exhale", dur: 4000, cls: "exhale" },
  { name: "Hold", dur: 4000, cls: "hold" },
];

export default function MentalTab() {
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [journalText, setJournalText] = useState("");
  const [journalEntries, setJournalEntries] = useState([
    { date: "2026-04-07", text: "Pushed through the last mile when everything said stop. Proved I can override the quit signal." },
    { date: "2026-04-05", text: "Ruck felt heavy today. Focused on one step at a time. Finished 2 min under target." },
  ]);
  const timerRef = useRef(null);

  const startBreathing = useCallback(() => {
    setBreathing(true);
    setBreathPhase(0);
    setBreathCount(0);
  }, []);

  const stopBreathing = useCallback(() => {
    setBreathing(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!breathing) return;
    const phase = BREATH_PHASES[breathPhase];
    timerRef.current = setTimeout(() => {
      const next = (breathPhase + 1) % BREATH_PHASES.length;
      setBreathPhase(next);
      if (next === 0) setBreathCount(c => c + 1);
    }, phase.dur);
    return () => clearTimeout(timerRef.current);
  }, [breathing, breathPhase]);

  const addJournalEntry = () => {
    if (!journalText.trim()) return;
    setJournalEntries(prev => [
      { date: new Date().toISOString().split("T")[0], text: journalText.trim() },
      ...prev,
    ]);
    setJournalText("");
  };

  return (
    <>
      {/* Box Breathing */}
      <div className="t-section">Box Breathing</div>
      <div className="card card-green">
        <div className="breath-outer">
          <div
            className={`breath-ring ${breathing ? BREATH_PHASES[breathPhase].cls : ""}`}
            onClick={breathing ? stopBreathing : startBreathing}
          >
            <div className="breath-label">
              {breathing ? BREATH_PHASES[breathPhase].name : "Tap to Start"}
              {breathing && <div style={{ fontSize: 9, marginTop: 4, color: "var(--txt3)" }}>Cycle {breathCount + 1}</div>}
            </div>
          </div>
          <div className="breath-hint" style={{ marginTop: 14 }}>
            {breathing ? "Tap ring to stop" : "4-4-4-4 Navy SEAL Protocol"}
          </div>
        </div>
      </div>

      {/* Mental Skills */}
      <div className="t-section">Mental Performance Skills</div>
      {MENTAL_SKILLS.map((skill, i) => (
        <div key={i} className="skill-card">
          <div className="skill-icon">{skill.icon}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{skill.name}</div>
            <div className="t-body">{skill.desc}</div>
          </div>
        </div>
      ))}

      {/* Journal */}
      <div className="t-section">Training Journal</div>
      <div className="card">
        <div className="form-row">
          <label className="form-label">New Entry</label>
          <textarea
            className="inp"
            placeholder="What did you learn today? What was hard? What will you do differently?"
            value={journalText}
            onChange={e => setJournalText(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={addJournalEntry}>
          Save Entry
        </button>

        <div className="divider" />

        {journalEntries.map((entry, i) => (
          <div key={i} className="journal-entry">
            <div className="journal-date">{entry.date}</div>
            <div className="t-body">{entry.text}</div>
          </div>
        ))}
      </div>

      {/* Stress Inoculation Tips */}
      <div className="card card-red">
        <div className="t-h3">Stress Inoculation Protocol</div>
        <ul className="ex-list">
          <li><span className="ex-bullet">{"\u25b8"}</span><span>Train in uncomfortable conditions (heat, cold, rain)</span></li>
          <li><span className="ex-bullet">{"\u25b8"}</span><span>Add time pressure to workouts periodically</span></li>
          <li><span className="ex-bullet">{"\u25b8"}</span><span>Practice decision-making while physically fatigued</span></li>
          <li><span className="ex-bullet">{"\u25b8"}</span><span>Simulate sleep deprivation (safely, with a buddy)</span></li>
          <li><span className="ex-bullet">{"\u25b8"}</span><span>Cold water exposure: 2-min cold shower post-workout</span></li>
        </ul>
      </div>
    </>
  );
}
