import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { MEALS, MACROS, SUPPLEMENTS } from "../data";

const PIE_COLORS = ["#C8A96E", "#4B5320", "#B22222", "#6B7280"];

export default function NutritionTab() {
  const [filter, setFilter] = useState("all");

  const pieData = [
    { name: "Protein", value: MACROS.protein * 4 },
    { name: "Carbs", value: MACROS.carbs * 4 },
    { name: "Fat", value: MACROS.fat * 9 },
  ];

  const mealKeys = Object.keys(MEALS);

  return (
    <>
      {/* Macro Overview */}
      <div className="t-section">Daily Macros</div>
      <div className="card card-accent">
        <div className="row-between mb8">
          <div className="t-h3" style={{ marginBottom: 0 }}>Target Intake</div>
          <span className="t-num">{MACROS.calories} cal</span>
        </div>

        <div style={{ height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="macro-row">
          <div className="macro-pill">
            <div className="macro-num">{MACROS.protein}</div>
            <div className="macro-unit">Protein (g)</div>
          </div>
          <div className="macro-pill">
            <div className="macro-num">{MACROS.carbs}</div>
            <div className="macro-unit">Carbs (g)</div>
          </div>
          <div className="macro-pill">
            <div className="macro-num">{MACROS.fat}</div>
            <div className="macro-unit">Fat (g)</div>
          </div>
        </div>
      </div>

      {/* Meal Plan */}
      <div className="t-section">Meal Plan</div>
      <div className="card">
        {mealKeys.map(key => {
          const meal = MEALS[key];
          return (
            <div key={key} className="meal-block">
              <div className="row-between">
                <div className="meal-time">{meal.name}</div>
                <span className="t-label">{meal.time}</span>
              </div>
              <ul className="ex-list" style={{ marginTop: 4 }}>
                {meal.items.map((item, i) => (
                  <li key={i}>
                    <span className="ex-bullet">{"\u25b8"}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Supplements */}
      <div className="t-section">Supplements</div>
      <div className="card">
        <div className="filter-row">
          {["all", "ok", "warn", "ban"].map(f => (
            <button key={f} className={`ftag ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "ok" ? "Approved" : f === "warn" ? "Caution" : "Banned"}
            </button>
          ))}
        </div>
        {SUPPLEMENTS.filter(s => filter === "all" || s.status === filter).map((s, i) => (
          <div key={i} className={`supp-card supp-${s.status}`}>
            <div className="row-between">
              <div style={{ fontWeight: 500, fontSize: 13 }}>{s.name}</div>
              <span className={`badge ${s.status === "ok" ? "b-ok" : s.status === "warn" ? "b-warn" : "b-red"}`}>
                {s.status === "ok" ? "Approved" : s.status === "warn" ? "Caution" : "Banned"}
              </span>
            </div>
            <div className="t-label mt8">{s.dose}</div>
            <div style={{ fontSize: 11, color: "var(--txt3)", marginTop: 4 }}>{s.note}</div>
          </div>
        ))}
      </div>

      {/* Hydration Reminder */}
      <div className="card card-green">
        <div className="row" style={{ gap: 10 }}>
          <span style={{ fontSize: 22 }}>{"\ud83d\udca7"}</span>
          <div>
            <div className="t-h3" style={{ marginBottom: 2 }}>Hydration Target</div>
            <div className="t-body">Minimum 100 oz / day. Add 16 oz per hour of training. Monitor urine color.</div>
          </div>
        </div>
      </div>
    </>
  );
}
