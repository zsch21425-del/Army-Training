export const QUOTES = [
  { t: "The more you sweat in training, the less you bleed in combat.", a: "General George S. Patton" },
  { t: "Rangers lead the way.", a: "Ranger Creed" },
  { t: "Only those who risk going too far can possibly find out how far they can go.", a: "T.S. Eliot" },
  { t: "Pain is temporary. Quitting lasts forever.", a: "Lance Armstrong" },
  { t: "Suffer the pain of discipline or suffer the pain of regret.", a: "Jim Rohn" },
  { t: "Iron sharpens iron.", a: "Proverbs 27:17" },
  { t: "You don't rise to the level of your expectations, you fall to the level of your training.", a: "Archilochus" },
  { t: "Mental strength is the most important component of combat effectiveness.", a: "U.S. Army" },
  { t: "Do something today that your future self will thank you for.", a: "" },
  { t: "The will to win means nothing without the will to prepare.", a: "Juma Ikangaa" },
  { t: "Embrace the suck.", a: "Military Saying" },
  { t: "First in, last out.", a: "Infantry motto" },
  { t: "Under pressure, you don't rise to the occasion \u2014 you sink to the level of your training.", a: "Navy SEAL saying" },
  { t: "Be the hardest worker in the room.", a: "" },
  { t: "Every rep is a vote for who you want to become.", a: "" },
  { t: "Discipline equals freedom.", a: "Jocko Willink" },
  { t: "Good enough isn't.", a: "Ranger Creed spirit" },
  { t: "Make your body your weapon.", a: "" },
  { t: "The standard is the standard.", a: "Mike Tomlin" },
  { t: "A Ranger exists to perform difficult missions that others cannot.", a: "U.S. Army Ranger Handbook" },
];

export const PHASES = [
  { id: 0, name: "Pre-Assessment", weeks: "Weeks 1\u20132", emoji: "\u2692\ufe0f", badge: "Grinder", color: "#6B7280", status: "done", pct: 100,
    goal: "Establish baselines and identify weaknesses",
    focus: "Benchmark run time, push-ups, sit-ups, deadlift, plank",
    milestone: "Army Fitness Test (AFT) baseline test completed" },
  { id: 1, name: "Foundation Builder", weeks: "Weeks 3\u20138", emoji: "\ud83e\udd7e", badge: "Boot Forged", color: "#4B5320", status: "active", pct: 45,
    goal: "Build aerobic base, body armor (injury prevention), and base strength",
    focus: "3\u20134 runs/week, calisthenics 4\u00d7/week, mobility work daily",
    milestone: "Pass simulated AFT with 300+ score" },
  { id: 2, name: "Boot Camp Ready", weeks: "Weeks 9\u201316", emoji: "\u2694\ufe0f", badge: "Battle Ready", color: "#C8A96E", status: "locked", pct: 0,
    goal: "Meet and exceed all Army Boot Camp physical standards",
    focus: "Progressive overload, ruck marching, obstacle-style training, heat acclimation",
    milestone: "AFT 350+, 2-mile under 15:30 (M) / 18:00 (F), ruck 35 lbs under 45 min" },
  { id: 3, name: "Ranger Candidate", weeks: "Weeks 17\u201328", emoji: "\ud83c\udfaf", badge: "Tab Seeker", color: "#B22222", status: "locked", pct: 0,
    goal: "Meet RASP and Ranger School RPA 2.0 standards",
    focus: "High-intensity intervals, loaded carries, SKEDCO drills, 4-mile timed runs, chin-up volume",
    milestone: "RPA 2.0 circuit < 14 min + 4-mile < 32 min + 6 chin-ups" },
  { id: 4, name: "Ranger School Elite", weeks: "Weeks 29\u201336", emoji: "\ud83c\udf96\ufe0f", badge: "Ranger Ready", color: "#7C3AED", status: "locked", pct: 0,
    goal: "Build physical and mental reserves for Ranger School's three phases",
    focus: "Sleep deprivation training, multi-day rucking, mission load, decision-making under fatigue",
    milestone: "Maintain performance across 5+ consecutive days of training" },
];

export const WEEK_SCHEDULE = {
  Mon: { name: "Strength + Calisthenics", type: "strength", dur: "55 min", diff: 3,
    warmup: ["Army H2F Movement Prep \u2014 10 min", "Arm circles + shoulder rolls \u2014 60s", "Hip opener + leg swings \u2014 90s"],
    main:   ["Hand-Release Push-ups 4\u00d720", "Dead-Stop Push-ups 3\u00d715 (Ranger standard)", "Pull-ups 4\u00d78 (full extension)", "Plank 3\u00d760s", "Hex Bar Deadlift 3\u00d75", "Goblet Squat 3\u00d712"],
    cooldown: ["Foam roll \u2014 glutes, IT band, calves", "Hip flexor stretch 2\u00d745s", "Child's pose 60s"] },
  Tue: { name: "Interval Run", type: "run", dur: "45 min", diff: 4,
    warmup: ["10-min easy jog warm-up", "Dynamic leg swings \u2014 60s each", "High knees + butt kicks \u2014 30s"],
    main:   ["6 \u00d7 800m at 6:30/mile pace", "2 min rest between each interval", "Focus: controlled breathing, heel-to-toe"],
    cooldown: ["5-min easy cool-down jog", "Standing quad + calf stretches \u2014 2 min", "Drink 24 oz water"] },
  Wed: { name: "Calisthenics + Core", type: "strength", dur: "50 min", diff: 3,
    warmup: ["H2F Prep drills \u2014 8 min", "Shoulder mobility circles \u2014 60s", "Thoracic rotations \u2014 60s"],
    main:   ["V-ups 4\u00d720", "Flutter kicks 3\u00d730s", "Diamond Push-ups 4\u00d715", "Inverted rows 3\u00d712", "Step-ups 3\u00d715 ea", "Mountain climbers 3\u00d730s"],
    cooldown: ["Foam roll \u2014 upper back + lats", "Pigeon pose \u2014 60s each side", "Wrist + forearm stretch"] },
  Thu: { name: "Ruck March \u2014 3mi", type: "ruck", dur: "50 min", diff: 4,
    warmup: ["5-min easy walk warm-up", "Hip flexor + ankle mobility", "Check pack weight: 35 lbs"],
    main:   ["3-mile ruck with 35 lbs", "Target: complete under 45 minutes", "Focus: posture, foot strike, breathing", "Track pace every mile"],
    cooldown: ["5 min mobility walk cool-down", "Hip flexor stretch \u2014 45s each", "Remove boots, elevate feet 5 min"] },
  Fri: { name: "Strength + Calisthenics", type: "strength", dur: "60 min", diff: 4,
    warmup: ["H2F Movement Prep \u2014 10 min", "Band pull-aparts \u2014 2\u00d715", "Activation: glute bridges \u2014 20 reps"],
    main:   ["Chin-ups 5\u00d76 (Ranger standard \u2014 full extension)", "Jump squats 4\u00d715", "Wide push-ups 4\u00d720", "Farmer's carry 2\u00d7100ft (40 lbs each)", "Sprint-drag-carry simulation", "Plank 3\u00d790s"],
    cooldown: ["Full body foam roll \u2014 10 min", "Hip + hamstring stretch", "Box breathing 3 cycles"] },
  Sat: { name: "Long Run + Mental Challenge", type: "run", dur: "75 min", diff: 5,
    warmup: ["Easy 5-min walk", "Dynamic leg swings, hip circles", "Mental prep: set your intention for the run"],
    main:   ["4-mile tempo run at 8:00/mile pace", "NO headphones \u2014 own your thoughts", "Finish: 100 push-ups in sets of 25", "Journal: what did you prove today?"],
    cooldown: ["10-min slow walk", "Full body stretch \u2014 10 min", "Hydrate + refuel within 30 min"] },
  Sun: { name: "Active Recovery", type: "rest", dur: "30 min", diff: 1,
    warmup: ["5-min easy walk"],
    main:   ["20-min yoga or mobility flow", "Foam roll entire body", "Light walking \u2014 20 min", "Meditation \u2014 10 min"],
    cooldown: ["Gratitude journaling", "Prep gear for the week", "Sleep 8+ hours"] },
};

export const MEALS = {
  breakfast: { time: "0530", name: "Pre-Training Fuel", items: ["4 egg whites + 1 whole egg scramble", "1 cup oatmeal w/ banana", "Black coffee or green tea", "8 oz water"] },
  midMorning: { time: "0930", name: "Mid-Morning Refuel", items: ["Protein shake (30g whey)", "1 apple + 2 tbsp almond butter", "8 oz water"] },
  lunch: { time: "1200", name: "Mission Fuel", items: ["8 oz grilled chicken breast", "1.5 cups brown rice", "Steamed broccoli + spinach", "Side salad w/ olive oil"] },
  afternoon: { time: "1500", name: "Afternoon Snack", items: ["Greek yogurt (plain, nonfat)", "Mixed nuts \u2014 1/4 cup", "Beef jerky \u2014 1 oz"] },
  dinner: { time: "1830", name: "Recovery Meal", items: ["6 oz salmon or lean beef", "Sweet potato \u2014 1 medium", "Roasted vegetables", "8 oz water"] },
  evening: { time: "2030", name: "Night Fuel", items: ["Casein protein shake", "1 tbsp peanut butter", "Lights out by 2130"] },
};

export const MACROS = { calories: 3200, protein: 210, carbs: 380, fat: 85 };

export const SUPPLEMENTS = [
  { name: "Whey Protein", dose: "30g post-workout", status: "ok", note: "NSF Certified for Sport" },
  { name: "Creatine Monohydrate", dose: "5g daily", status: "ok", note: "Proven safe, improves power output" },
  { name: "Fish Oil", dose: "2g EPA/DHA daily", status: "ok", note: "Joint health + recovery" },
  { name: "Vitamin D3", dose: "4000 IU daily", status: "ok", note: "Supports bone + immune health" },
  { name: "Caffeine", dose: "200mg pre-workout", status: "warn", note: "Limit to 400mg/day total. No energy drinks." },
  { name: "Pre-Workout (proprietary)", dose: "N/A", status: "ban", note: "Risk of banned substances. Use NSF-certified only." },
];

export const RESOURCES = [
  { id: 1, type: "art", title: "Army H2F System: Complete Guide", meta: "Army.mil \u2022 12 min read", desc: "Official Holistic Health and Fitness overview covering all five domains.", tags: ["official", "h2f"] },
  { id: 2, type: "art", title: "Ranger Assessment & Selection Program (RASP)", meta: "GoArmy.com \u2022 8 min read", desc: "What to expect during RASP 1 and RASP 2. Physical standards and timeline.", tags: ["ranger", "selection"] },
  { id: 3, type: "pod", title: "Jocko Podcast #128: Ranger School Lessons", meta: "Jocko Willink \u2022 2h 15m", desc: "Deep dive on mental toughness lessons from Ranger School graduates.", tags: ["mental", "podcast"] },
  { id: 4, type: "vid", title: "Proper Ruck March Form & Technique", meta: "YouTube \u2022 18 min", desc: "Foot strike, posture, pack adjustment, and blister prevention for loaded marches.", tags: ["ruck", "technique"] },
  { id: 5, type: "art", title: "ACFT Scoring Standards 2024", meta: "Army PRT \u2022 6 min read", desc: "Complete scoring breakdown for all six ACFT events by age and gender.", tags: ["acft", "standards"] },
  { id: 6, type: "vid", title: "Box Breathing for Combat Stress", meta: "YouTube \u2022 10 min", desc: "Navy SEAL technique for controlling stress response under pressure.", tags: ["mental", "breathing"] },
  { id: 7, type: "pod", title: "The Ranger Mindset with Col. Danny McKnight", meta: "Cleared Hot Podcast \u2022 1h 45m", desc: "Lessons from Black Hawk Down and building resilience through adversity.", tags: ["ranger", "mindset"] },
  { id: 8, type: "art", title: "Nutrition for High-Intensity Military Training", meta: "NSCA Journal \u2022 15 min read", desc: "Evidence-based nutrition strategies for soldiers in demanding training pipelines.", tags: ["nutrition", "science"] },
];

export const MENTAL_SKILLS = [
  { icon: "\ud83c\udfaf", name: "Goal Setting", desc: "Define clear, measurable objectives for each training phase." },
  { icon: "\ud83e\udde0", name: "Visualization", desc: "Mentally rehearse successful completion of events before executing." },
  { icon: "\ud83d\udcac", name: "Self-Talk", desc: "Replace negative thoughts with mission-focused cues." },
  { icon: "\u23f1\ufe0f", name: "Stress Inoculation", desc: "Gradually expose yourself to controlled stressors during training." },
];

export const PROGRESS_DATA = [
  { week: "W1", pushups: 42, run: 17.2, plank: 1.5 },
  { week: "W2", pushups: 48, run: 16.8, plank: 1.7 },
  { week: "W3", pushups: 52, run: 16.4, plank: 2.0 },
  { week: "W4", pushups: 58, run: 16.0, plank: 2.2 },
  { week: "W5", pushups: 63, run: 15.5, plank: 2.5 },
];

export const DAY_ICONS = {
  strength: "\ud83d\udcaa",
  run: "\ud83c\udfc3",
  ruck: "\ud83c\udf92",
  rest: "\ud83e\uddd8",
};
