export const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --green:       #4B5320;
    --green-l:     #5c6628;
    --green-d:     #3a4118;
    --bg:          #080808;
    --bg1:         #111111;
    --bg2:         #181818;
    --bg3:         #202020;
    --tan:         #C8A96E;
    --tan-d:       #a88848;
    --tan-faint:   #c8a96e22;
    --red:         #B22222;
    --red-l:       #cc2727;
    --red-faint:   #b2222218;
    --txt:         #EBEBEB;
    --txt2:        #999;
    --txt3:        #555;
    --border:      #252525;
    --border2:     #303030;
    --ok:          #34c759;
    --warn:        #f0a500;
    --shadow:      0 4px 24px rgba(0,0,0,.6);
  }

  html, body { background: var(--bg); color: var(--txt); font-family: 'Barlow', sans-serif; height: 100%; overflow: hidden; }
  #root { height: 100%; }

  .app-shell { display: flex; flex-direction: column; height: 100vh; max-width: 480px; margin: 0 auto; background: var(--bg); position: relative; border-left: 1px solid var(--border); border-right: 1px solid var(--border); }
  .app-header { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 14px 18px 10px; background: var(--bg); border-bottom: 1px solid var(--border); position: relative; z-index: 20; }
  .header-logo { font-family: 'Oswald', sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 3px; color: var(--tan); text-transform: uppercase; line-height: 1; }
  .header-sub  { font-size: 9px; letter-spacing: 2.5px; color: var(--txt3); text-transform: uppercase; margin-top: 2px; font-family: 'Barlow Condensed', sans-serif; }
  .header-right { display: flex; align-items: center; gap: 10px; }
  .header-badge { font-family: 'Oswald', sans-serif; font-size: 10px; letter-spacing: 1.5px; background: var(--green); color: #fff; padding: 3px 8px; border-radius: 2px; text-transform: uppercase; }
  .header-name { font-size: 12px; color: var(--txt2); font-weight: 500; }

  .scroll-area { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 16px 16px 8px; scroll-behavior: smooth; }
  .scroll-area::-webkit-scrollbar { width: 3px; }
  .scroll-area::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }

  .bottom-nav { flex-shrink: 0; display: flex; background: var(--bg1); border-top: 1px solid var(--border); padding: 0; }
  .nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 4px 8px; cursor: pointer; border: none; background: none; color: var(--txt3); transition: color .2s; position: relative; min-height: 58px; }
  .nav-item.active { color: var(--tan); }
  .nav-item.active::after { content: ''; position: absolute; top: 0; left: 20%; right: 20%; height: 2px; background: var(--tan); border-radius: 0 0 2px 2px; }
  .nav-item span.icon { font-size: 19px; line-height: 1; }
  .nav-item span.label { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px; font-weight: 600; }

  .card { background: var(--bg1); border: 1px solid var(--border); border-radius: 6px; padding: 14px 15px; margin-bottom: 12px; }
  .card-accent { border-top: 2px solid var(--tan); }
  .card-red    { border-top: 2px solid var(--red); }
  .card-green  { border-top: 2px solid var(--green); }
  .card-inner  { background: var(--bg2); border: 1px solid var(--border); border-radius: 4px; padding: 11px 13px; }

  .t-section { font-family: 'Oswald', sans-serif; font-size: 10px; letter-spacing: 3px; color: var(--txt3); text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
  .t-section::before, .t-section::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .t-h1  { font-family: 'Oswald', sans-serif; font-size: 24px; font-weight: 700; letter-spacing: 2px; color: var(--tan); text-transform: uppercase; line-height: 1.1; }
  .t-h2  { font-family: 'Oswald', sans-serif; font-size: 17px; font-weight: 600; letter-spacing: 1.5px; color: var(--txt); text-transform: uppercase; margin-bottom: 14px; }
  .t-h3  { font-family: 'Oswald', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 1.5px; color: var(--txt); text-transform: uppercase; margin-bottom: 8px; }
  .t-label { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 1.5px; color: var(--txt3); text-transform: uppercase; font-weight: 600; }
  .t-body  { font-size: 13px; color: var(--txt2); line-height: 1.6; }
  .t-num   { font-family: 'Oswald', sans-serif; font-weight: 600; color: var(--tan); }

  .badge { display: inline-block; font-family: 'Oswald', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; padding: 2px 7px; border-radius: 2px; }
  .b-green  { background: var(--green);     color: #fff; }
  .b-tan    { background: var(--tan-faint); color: var(--tan); border: 1px solid #c8a96e44; }
  .b-red    { background: var(--red-faint); color: var(--red); border: 1px solid #b2222233; }
  .b-gray   { background: var(--bg3); color: var(--txt3); border: 1px solid var(--border); }
  .b-ok     { background: #0d2b18; color: var(--ok); border: 1px solid #34c75944; }
  .b-warn   { background: #2b1e00; color: var(--warn); border: 1px solid #f0a50044; }

  .btn { font-family: 'Oswald', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; border: none; border-radius: 3px; cursor: pointer; padding: 9px 18px; transition: all .15s; display: inline-flex; align-items: center; gap: 6px; }
  .btn-primary { background: var(--green); color: #fff; }
  .btn-primary:hover { background: var(--green-l); }
  .btn-red     { background: var(--red); color: #fff; }
  .btn-red:hover { background: var(--red-l); }
  .btn-outline { background: transparent; color: var(--tan); border: 1px solid var(--tan); }
  .btn-outline:hover { background: var(--tan-faint); }
  .btn-ghost { background: transparent; color: var(--txt2); border: 1px solid var(--border2); font-size: 10px; padding: 6px 12px; }
  .btn-ghost:hover { border-color: var(--tan); color: var(--tan); }
  .btn-full { width: 100%; justify-content: center; }
  .btn-sm { font-size: 10px; padding: 6px 12px; }

  .inp { width: 100%; background: var(--bg2); border: 1px solid var(--border2); border-radius: 3px; padding: 9px 12px; color: var(--txt); font-family: 'Barlow', sans-serif; font-size: 13px; outline: none; transition: border-color .15s; }
  .inp:focus { border-color: var(--tan); }
  .inp::placeholder { color: var(--txt3); }
  select.inp option { background: var(--bg2); }
  textarea.inp { resize: vertical; min-height: 80px; line-height: 1.5; }
  .form-row { margin-bottom: 12px; }
  .form-label { display: block; font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 1.5px; color: var(--txt3); text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }

  .prog-bar { height: 5px; background: var(--bg3); border-radius: 3px; overflow: hidden; }
  .prog-fill { height: 100%; border-radius: 3px; transition: width .5s ease; }

  .filter-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .ftag { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; padding: 5px 11px; border: 1px solid var(--border2); border-radius: 20px; cursor: pointer; color: var(--txt3); background: transparent; transition: all .15s; }
  .ftag.on { background: var(--green); color: #fff; border-color: var(--green); }
  .ftag:hover:not(.on) { border-color: var(--border2); color: var(--txt); }

  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
  .stat-cell { background: var(--bg2); border: 1px solid var(--border); border-radius: 5px; padding: 12px 13px; }
  .stat-val  { font-family: 'Oswald', sans-serif; font-size: 26px; font-weight: 600; color: var(--tan); line-height: 1; }
  .stat-lbl  { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--txt3); margin-top: 3px; font-weight: 600; }

  .quote-wrap { background: linear-gradient(135deg, var(--bg2) 0%, var(--bg1) 100%); border: 1px solid var(--border); border-left: 3px solid var(--tan); border-radius: 4px; padding: 14px 16px; margin-bottom: 12px; }
  .quote-text { font-family: 'Oswald', sans-serif; font-size: 14px; font-weight: 400; color: var(--txt); line-height: 1.55; }
  .quote-author { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 1.5px; color: var(--tan); text-transform: uppercase; margin-top: 7px; }

  .timeline { position: relative; }
  .tl-item { display: flex; gap: 14px; padding-bottom: 20px; cursor: pointer; }
  .tl-item:last-child { padding-bottom: 0; }
  .tl-left { display: flex; flex-direction: column; align-items: center; width: 36px; flex-shrink: 0; }
  .tl-dot { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; border: 2px solid var(--border); transition: all .3s; }
  .tl-dot.done  { background: var(--green); border-color: var(--green); box-shadow: 0 0 12px var(--green); }
  .tl-dot.active { background: var(--bg2); border-color: var(--tan); box-shadow: 0 0 14px var(--tan-faint); }
  .tl-dot.locked { background: var(--bg2); border-color: var(--border); opacity: .5; }
  .tl-line { width: 2px; flex: 1; background: var(--border); margin-top: 4px; min-height: 16px; }
  .tl-line.done { background: var(--green); }
  .tl-body { flex: 1; padding-top: 4px; }
  .tl-name { font-family: 'Oswald', sans-serif; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; }
  .tl-sub  { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; letter-spacing: 1px; color: var(--txt3); text-transform: uppercase; margin-top: 1px; }
  .tl-expand { background: var(--bg2); border: 1px solid var(--border); border-radius: 4px; padding: 12px; margin-top: 10px; }
  .tl-detail-row { font-size: 12px; color: var(--txt2); padding: 5px 0; border-bottom: 1px solid var(--border); line-height: 1.5; }
  .tl-detail-row:last-child { border-bottom: none; }
  .tl-detail-lbl { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 1.5px; color: var(--tan); text-transform: uppercase; display: block; margin-bottom: 2px; font-weight: 600; }

  .ex-list { list-style: none; }
  .ex-list li { display: flex; align-items: flex-start; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--border); font-size: 13px; color: var(--txt2); line-height: 1.4; }
  .ex-list li:last-child { border-bottom: none; }
  .ex-bullet { color: var(--tan); font-size: 11px; margin-top: 2px; flex-shrink: 0; }
  .week-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; margin-bottom: 14px; }
  .wday { background: var(--bg2); border: 1px solid var(--border); border-radius: 4px; padding: 8px 4px; text-align: center; cursor: pointer; transition: all .15s; }
  .wday.sel { border-color: var(--tan); background: #1e1a0e; }
  .wday.today { border-color: var(--green); }
  .wday .wd-name { font-family: 'Oswald', sans-serif; font-size: 10px; letter-spacing: 1px; color: var(--txt2); }
  .wday .wd-icon { font-size: 13px; margin-top: 3px; }
  .wday .wd-done { font-size: 9px; color: var(--ok); margin-top: 2px; }
  .diff-stars span.on { color: var(--tan); } .diff-stars span.off { color: var(--bg3); }

  .ex-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 4px; padding: 11px 13px; margin-bottom: 8px; transition: border-color .15s; }
  .ex-card:hover { border-color: var(--border2); }

  .meal-block { border-left: 2px solid var(--green); background: var(--bg2); padding: 9px 12px; border-radius: 0 4px 4px 0; margin-bottom: 7px; }
  .meal-time { font-family: 'Oswald', sans-serif; font-size: 10px; letter-spacing: 1.5px; color: var(--tan); text-transform: uppercase; }
  .macro-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .macro-pill { flex: 1; min-width: 70px; background: var(--bg2); border: 1px solid var(--border); border-radius: 4px; padding: 10px 10px; text-align: center; }
  .macro-num { font-family: 'Oswald', sans-serif; font-size: 22px; color: var(--tan); line-height: 1; }
  .macro-unit { font-family: 'Barlow Condensed', sans-serif; font-size: 9px; letter-spacing: 1px; color: var(--txt3); text-transform: uppercase; margin-top: 2px; }
  .supp-card { border-radius: 4px; padding: 11px 13px; margin-bottom: 8px; background: var(--bg2); border: 1px solid var(--border); }
  .supp-ok   { border-left: 3px solid var(--ok); }
  .supp-warn { border-left: 3px solid var(--warn); }
  .supp-ban  { border-left: 3px solid var(--red); }

  .breath-outer { display: flex; flex-direction: column; align-items: center; padding: 20px 0 10px; }
  .breath-ring { width: 130px; height: 130px; border-radius: 50%; border: 2px solid var(--green); background: radial-gradient(circle, #1e2a0c, #0f1508); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform .6s ease, border-color .4s, box-shadow .4s; }
  .breath-ring.inhale { transform: scale(1.32); border-color: var(--tan); box-shadow: 0 0 30px #c8a96e44; }
  .breath-ring.hold   { border-color: var(--txt3); }
  .breath-ring.exhale { transform: scale(.82); }
  .breath-label { font-family: 'Oswald', sans-serif; font-size: 11px; letter-spacing: 2px; color: var(--tan); text-transform: uppercase; text-align: center; }
  .breath-hint { font-size: 10px; color: var(--txt3); margin-top: 8px; letter-spacing: 1px; font-family: 'Barlow Condensed', sans-serif; text-transform: uppercase; }
  .journal-entry { background: var(--bg2); border: 1px solid var(--border); border-radius: 4px; padding: 10px 12px; margin-bottom: 8px; }
  .journal-date { font-family: 'Oswald', sans-serif; font-size: 9px; letter-spacing: 1.5px; color: var(--txt3); text-transform: uppercase; margin-bottom: 4px; }
  .skill-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 4px; padding: 13px; margin-bottom: 8px; display: flex; gap: 12px; }
  .skill-icon { font-size: 22px; flex-shrink: 0; }

  .res-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 5px; padding: 13px; margin-bottom: 10px; transition: border-color .15s; }
  .res-card:hover { border-color: var(--border2); }
  .res-card.art  { border-top: 2px solid var(--green); }
  .res-card.pod  { border-top: 2px solid var(--tan); }
  .res-card.vid  { border-top: 2px solid var(--red); }
  .res-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
  .res-title { font-size: 13px; color: var(--txt); line-height: 1.4; font-weight: 500; }
  .res-meta { font-family: 'Barlow Condensed', sans-serif; font-size: 10px; color: var(--txt3); margin-top: 3px; letter-spacing: .5px; }
  .res-desc { font-size: 12px; color: var(--txt3); margin-top: 6px; line-height: 1.5; }
  .res-actions { display: flex; gap: 6px; margin-top: 10px; align-items: center; flex-wrap: wrap; }
  .save-btn { background: none; border: none; font-size: 20px; cursor: pointer; line-height: 1; padding: 0 2px; color: var(--txt3); flex-shrink: 0; transition: color .15s; }
  .save-btn.saved { color: var(--tan); }

  .score-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 1px solid var(--border); }
  .score-row:last-child { border-bottom: none; }
  .score-name { font-size: 13px; }
  .score-val  { font-family: 'Oswald', sans-serif; font-size: 15px; color: var(--tan); }

  @keyframes complete-pop { 0%{ opacity:0; transform:scale(.7); } 60%{ opacity:1; transform:scale(1.1); } 100%{ transform:scale(1); } }
  .complete-chip { display:inline-flex; align-items:center; gap:5px; background:#0a2010; border:1px solid var(--ok); color:var(--ok); font-family:'Oswald',sans-serif; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; padding:5px 11px; border-radius:3px; animation:complete-pop .35s ease forwards; }

  @keyframes badge-glow { 0%,100%{ box-shadow:0 0 8px var(--tan); } 50%{ box-shadow:0 0 22px var(--tan), 0 0 40px #c8a96e55; } }
  .badge-earned { animation: badge-glow 1.8s ease-in-out infinite; }

  @keyframes unlock-in { 0%{ opacity:0; transform:scale(.6); } 70%{ opacity:1; transform:scale(1.05); } 100%{ transform:scale(1); } }
  .unlock-banner { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:50; background:var(--green); color:#fff; font-family:'Oswald',sans-serif; font-size:16px; letter-spacing:3px; text-transform:uppercase; padding:12px 28px; border-radius:4px; animation:unlock-in .4s ease forwards; pointer-events:none; }

  .divider { height:1px; background:var(--border); margin:12px 0; }
  .tag-row { display:flex; gap:5px; flex-wrap:wrap; margin-top:6px; }
  .text-tan { color:var(--tan); }
  .text-red { color:var(--red); }
  .text-ok  { color:var(--ok); }
  .mb4  { margin-bottom:4px; }
  .mb8  { margin-bottom:8px; }
  .mb12 { margin-bottom:12px; }
  .mt8  { margin-top:8px; }
  .mt12 { margin-top:12px; }
  .mt16 { margin-top:16px; }
  .row  { display:flex; align-items:center; gap:8px; }
  .row-between { display:flex; justify-content:space-between; align-items:center; }
  .flex-wrap { flex-wrap:wrap; }
`;
