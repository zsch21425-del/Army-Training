import { useState, useCallback } from "react";
import { WEEK_SCHEDULE, DAY_ICONS } from "../data";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function DiffStars({ n }) {
  return (
    <span className="diff-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= n ? "on" : "off"}>{"\u2605"}</span>
      ))}
    </span>
  );
}

export default function WorkoutTab() {
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0
  const [selDay, setSelDay] = useState(DAYS[todayIdx]);
  const [completedExercises, setCompletedExercises] = useState({});
  const [completedDays, setCompletedDays] = useState({});

  const workout = WEEK_SCHEDULE[selDay];

  const toggleExercise = useCallback((section, idx) => {
    const key = `${selDay}-${section}-${idx}`;
    setCompletedExercises(prev => ({ ...prev, [key]: !prev[key] }));
  }, [selDay]);

  const allMain = workout.main.every((_, i) => completedExercises[`${selDay}-main-${i}`]);

  const markDayComplete = () => {
    setCompletedDays(prev => ({ ...prev, [selDay]: true }));
  };

  return (
    <>
      <div className="t-section">Week Schedule</div>

      {/* Day selector grid */}
      <div className="week-grid">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className={`wday ${d === selDay ? "sel" : ""} ${i === todayIdx ? "today" : ""}`}
            onClick={() => setSelDay(d)}
          >
            <div className="wd-name">{d}</div>
            <div className="wd-icon">{DAY_ICONS[WEEK_SCHEDULE[d].type]}</div>
            {completedDays[d] && <div className="wd-done">{"\u2713"}</div>}
          </div>
        ))}
      </div>

      {/* Selected day workout */}
      <div className="card card-accent">
        <div className="row-between mb8">
          <div>
            <div className="t-h2" style={{ marginBottom: 2 }}>{workout.name}</div>
            <div className="row" style={{ gap: 12 }}>
              <span className="t-label">{workout.dur}</span>
              <DiffStars n={workout.diff} />
            </div>
          </div>
          <span className="badge b-tan">{workout.type}</span>
        </div>

        {completedDays[selDay] && (
          <div className="complete-chip mb8">{"\u2713"} Completed</div>
        )}

        {/* Warm-up */}
        <div className="t-h3 mt12">Warm-Up</div>
        <ul className="ex-list mb12">
          {workout.warmup.map((ex, i) => (
            <li key={i} onClick={() => toggleExercise("warmup", i)} style={{ cursor: "pointer", opacity: completedExercises[`${selDay}-warmup-${i}`] ? 0.5 : 1 }}>
              <span className="ex-bullet">{completedExercises[`${selDay}-warmup-${i}`] ? "\u2713" : "\u25b8"}</span>
              <span>{ex}</span>
            </li>
          ))}
        </ul>

        {/* Main */}
        <div className="t-h3">Main Workout</div>
        <ul className="ex-list mb12">
          {workout.main.map((ex, i) => (
            <li key={i} onClick={() => toggleExercise("main", i)} style={{ cursor: "pointer", opacity: completedExercises[`${selDay}-main-${i}`] ? 0.5 : 1 }}>
              <span className="ex-bullet">{completedExercises[`${selDay}-main-${i}`] ? "\u2713" : "\u25b8"}</span>
              <span>{ex}</span>
            </li>
          ))}
        </ul>

        {/* Cooldown */}
        <div className="t-h3">Cool-Down</div>
        <ul className="ex-list">
          {workout.cooldown.map((ex, i) => (
            <li key={i} onClick={() => toggleExercise("cooldown", i)} style={{ cursor: "pointer", opacity: completedExercises[`${selDay}-cooldown-${i}`] ? 0.5 : 1 }}>
              <span className="ex-bullet">{completedExercises[`${selDay}-cooldown-${i}`] ? "\u2713" : "\u25b8"}</span>
              <span>{ex}</span>
            </li>
          ))}
        </ul>

        {!completedDays[selDay] && allMain && (
          <button className="btn btn-primary btn-full mt12" onClick={markDayComplete}>
            Mark Day Complete
          </button>
        )}
      </div>

      {/* Weekly Progress */}
      <div className="t-section">Weekly Progress</div>
      <div className="card">
        <div className="row-between mb8">
          <span className="t-label">Days Completed</span>
          <span className="t-num">{Object.keys(completedDays).length} / 7</span>
        </div>
        <div className="prog-bar">
          <div className="prog-fill" style={{ width: `${(Object.keys(completedDays).length / 7) * 100}%`, background: "var(--green)" }} />
        </div>
      </div>
    </>
  );
}
