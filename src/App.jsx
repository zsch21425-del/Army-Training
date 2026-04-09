import { useState, useRef } from "react";
import { STYLES } from "./styles";
import DashboardTab from "./components/DashboardTab";
import WorkoutTab from "./components/WorkoutTab";
import NutritionTab from "./components/NutritionTab";
import MentalTab from "./components/MentalTab";
import ProgressTab from "./components/ProgressTab";

const TABS = [
  { id: "dash",     icon: "\u2302",     label: "Home" },
  { id: "workout",  icon: "\ud83d\udcaa", label: "Train" },
  { id: "nutrition", icon: "\ud83c\udf57", label: "Fuel" },
  { id: "mental",   icon: "\ud83e\udde0", label: "Mind" },
  { id: "progress", icon: "\ud83d\udcc8", label: "Stats" },
];

export default function App() {
  const [tab, setTab] = useState("dash");
  const scrollRef = useRef(null);

  const switchTab = (id) => {
    setTab(id);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="app-shell">
        {/* Header */}
        <header className="app-header">
          <div>
            <div className="header-logo">Army Fit</div>
            <div className="header-sub">Ranger Training System</div>
          </div>
          <div className="header-right">
            <span className="header-badge">Phase 2</span>
            <span className="header-name">SPC Rivera</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="scroll-area" ref={scrollRef}>
          {tab === "dash" && <DashboardTab />}
          {tab === "workout" && <WorkoutTab />}
          {tab === "nutrition" && <NutritionTab />}
          {tab === "mental" && <MentalTab />}
          {tab === "progress" && <ProgressTab />}
        </div>

        {/* Bottom Nav */}
        <nav className="bottom-nav">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`nav-item ${tab === t.id ? "active" : ""}`}
              onClick={() => switchTab(t.id)}
            >
              <span className="icon">{t.icon}</span>
              <span className="label">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
