import { useState, useEffect, useCallback, useRef } from "react";

const STAGES = [
  { id: "new", label: "New", color: "#7A8A9E" },
  { id: "contacted", label: "Contacted", color: "#6A8BAA" },
  { id: "qualified", label: "Qualified", color: "#C0982A" },
  { id: "quoted", label: "Quoted", color: "#8A7AB0" },
  { id: "sold", label: "Sold", color: "#5A9A6A" },
  { id: "lost", label: "Lost", color: "#5A5550" },
];

const AGE_RANGES = ["50-60", "61-70", "71-85"];
const BUDGET_RANGES = ["Under $50/mo", "$50-$100/mo", "$100-$150/mo", "$150-$250/mo", "Not sure yet"];
const COVERAGE_RANGES = ["$10k-$25k", "$25k-$50k", "$50k-$75k", "$75k-$100k", "Not sure yet"];
const SOURCES = ["Facebook", "Instagram", "Messenger", "Audience Network", "Manual"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CARRIERS = ["Mutual of Omaha", "Corebridge", "American Amicable", "Ethos", "Transamerica", "Chubb", "Americo", "Aetna", "Other"];
const POLICY_TYPES = ["Whole Life", "Term Life", "Final Expense", "Universal Life", "Indexed Universal Life", "Other"];
const POLICY_STATUSES = [
  { id: "active", label: "Active", color: "#5A9A6A" },
  { id: "pending", label: "Pending", color: "#C0982A" },
  { id: "lapsed", label: "Lapsed", color: "#8B3A3A" },
  { id: "cancelled", label: "Cancelled", color: "#5A5550" },
];

function gid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function fmtDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear().toString().slice(2)} ${(d.getHours()%12||12)}:${d.getMinutes().toString().padStart(2,"0")} ${d.getHours()>=12?"PM":"AM"}`;
}

function timeAgo(ts) {
  if (!ts) return "";
  const m = Math.floor((Date.now()-ts)/60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h/24);
  if (d < 7) return `${d}d ago`;
  return fmtDate(ts);
}

function fmtMoney(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function Icon({ name, size = 18 }) {
  const s = { width: size, height: size, strokeWidth: 1.5, stroke: "currentColor", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    upload: <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    bar: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    dollar: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    trending: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    chevDown: <><polyline points="6 9 12 15 18 9"/></>,
    msg: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    refresh: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    menu: <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  };
  return <svg viewBox="0 0 24 24" {...s}>{icons[name]}</svg>;
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Sora:wght@300;400;500;600;700&display=swap');
:root {
  --bg-deep: #050505;
  --bg-base: #0A0A0B;
  --bg-card: #0F0F11;
  --bg-hover: #141416;
  --bg-elevated: #131315;
  --bg-input: #0B0B0D;
  --border: rgba(200,170,100,0.08);
  --border-focus: rgba(200,170,100,0.25);
  --text-1: #D4CEBF;
  --text-2: #7A7568;
  --text-3: #4A4740;
  --accent: #C0982A;
  --accent-lt: #D4AA3C;
  --accent-glow: rgba(192,152,42,0.08);
  --gold: #C0982A;
  --success: #5A9A6A;
  --warning: #C0982A;
  --danger: #8B3A3A;
}
*{margin:0;padding:0;box-sizing:border-box}
body,#root{font-family:'Sora',sans-serif;background:var(--bg-deep);color:var(--text-1);min-height:100vh}
.app{display:flex;height:100vh;overflow:hidden}

/* Sidebar */
.sb{width:210px;min-width:210px;background:var(--bg-base);border-right:1px solid var(--border);display:flex;flex-direction:column;position:relative}
.sb::after{content:'';position:absolute;top:0;right:-1px;width:1px;height:100%;background:linear-gradient(180deg,rgba(192,152,42,0.1),transparent 30%,transparent 70%,rgba(192,152,42,0.06))}
.sb-logo{padding:22px 18px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border)}
.sb-logo h1{font-family:'Outfit',sans-serif;font-weight:800;font-size:20px;letter-spacing:6px;background:linear-gradient(135deg,#D4AA3C,#C0982A,#A88520);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sb-logo small{font-size:9px;color:var(--text-3);letter-spacing:2px;text-transform:uppercase;margin-left:auto;font-family:'JetBrains Mono',monospace}
.sb-nav{padding:14px 8px;flex:1}
.nav-btn{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:6px;cursor:pointer;color:var(--text-2);font-size:12px;font-weight:500;border:none;background:none;width:100%;text-align:left;transition:all .2s;position:relative;margin-bottom:1px;letter-spacing:0.3px}
.nav-btn:hover{background:var(--accent-glow);color:var(--text-1)}
.nav-btn.on{background:var(--accent-glow);color:var(--accent-lt)}
.nav-btn.on::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:2px;height:16px;background:var(--accent-lt);border-radius:0 2px 2px 0}
.sb-stats{padding:14px 16px;border-top:1px solid var(--border)}
.sb-stat{display:flex;justify-content:space-between;padding:5px 2px;font-size:11px}
.sb-stat-l{color:var(--text-3);font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.5px}
.sb-stat-v{color:var(--text-2);font-weight:600;font-family:'Outfit',sans-serif}

/* Main area */
.mn{flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative}
.mn::before{content:'';position:absolute;top:-200px;right:-200px;width:600px;height:600px;background:radial-gradient(ellipse,rgba(192,152,42,0.02),transparent 70%);pointer-events:none}
.hd{padding:18px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);background:rgba(5,5,5,0.9);backdrop-filter:blur(12px);position:relative;z-index:5}
.hd-title{font-family:'Outfit',sans-serif;font-weight:600;font-size:18px;letter-spacing:0.5px;color:var(--text-1)}
.hd-r{display:flex;align-items:center;gap:8px}
.cnt{flex:1;overflow-y:auto;padding:22px 24px;position:relative;z-index:1}
.cnt::-webkit-scrollbar{width:5px}
.cnt::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}

/* Search */
.srch{display:flex;align-items:center;gap:8px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;padding:7px 12px;width:240px;transition:all .2s}
.srch:focus-within{border-color:var(--border-focus);box-shadow:0 0 0 3px rgba(192,152,42,0.04)}
.srch input{background:none;border:none;outline:none;color:var(--text-1);font-family:inherit;font-size:12px;width:100%}
.srch input::placeholder{color:var(--text-3)}
.srch svg{color:var(--text-3);flex-shrink:0}

/* Buttons */
.btn{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border-radius:5px;font-family:inherit;font-size:11px;font-weight:600;cursor:pointer;transition:all .2s;border:1px solid transparent;white-space:nowrap;letter-spacing:0.3px}
.btn-p{background:linear-gradient(135deg,#C0982A,#A88520);color:#0A0A0B;border-color:rgba(192,152,42,0.3);box-shadow:0 0 20px rgba(192,152,42,0.08)}
.btn-p:hover{box-shadow:0 0 30px rgba(192,152,42,0.15);transform:translateY(-1px)}
.btn-g{background:transparent;color:var(--text-2);border-color:var(--border)}
.btn-g:hover{background:var(--accent-glow);color:var(--text-1)}
.btn-d{background:rgba(139,58,58,0.1);color:#B85454;border-color:rgba(139,58,58,0.2)}
.btn-d:hover{background:rgba(139,58,58,0.2)}
.btn-s{padding:5px 10px;font-size:10px}

/* Metric cards */
.mets{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}
.met{background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:18px;position:relative;overflow:hidden;transition:all .3s}
.met:hover{border-color:var(--border-focus);box-shadow:0 0 30px var(--accent-glow)}
.met::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(192,152,42,0.12),transparent)}
.met-l{font-size:10px;color:var(--text-3);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;font-family:'JetBrains Mono',monospace}
.met-v{font-family:'Outfit',sans-serif;font-size:28px;font-weight:700}
.met-c{font-size:10px;margin-top:4px;font-weight:500}

/* Leads list */
.leads-list{display:flex;flex-direction:column;gap:10px}
.lead-row{background:var(--bg-card);border:1px solid var(--border);border-radius:8px;transition:all .2s;overflow:hidden}
.lead-row:hover{border-color:var(--border-focus);background:var(--bg-hover);box-shadow:0 2px 16px rgba(0,0,0,0.4)}
.lead-top{display:flex;gap:0;min-height:120px}
.lead-left{width:240px;min-width:240px;padding:16px 20px;border-right:1px solid var(--border);display:flex;flex-direction:column;justify-content:center;cursor:pointer}
.lead-name{font-family:'Outfit',sans-serif;font-weight:700;font-size:16px;color:var(--text-1);margin-bottom:6px;letter-spacing:0.3px}
.lead-phone{font-size:14px;color:var(--accent-lt);font-weight:600;margin-bottom:8px;letter-spacing:0.5px;display:flex;align-items:center;gap:5px;font-family:'JetBrains Mono',monospace}
.lead-meta-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:2px}
.lead-meta-tag{font-size:9px;color:var(--text-3);background:rgba(255,255,255,0.03);padding:2px 8px;border-radius:3px;display:flex;align-items:center;gap:3px;font-family:'JetBrains Mono',monospace;letter-spacing:0.3px}
.lead-notes-area{flex:1;padding:12px 16px;display:flex;flex-direction:column;position:relative;min-width:0}
.lead-notes-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.lead-notes-label{font-size:9px;color:var(--text-3);text-transform:uppercase;letter-spacing:2px;font-weight:600;font-family:'JetBrains Mono',monospace}
.lead-notepad{flex:1;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;padding:10px 12px;color:var(--text-1);font-family:'Sora',sans-serif;font-size:12px;outline:none;transition:border-color .2s;resize:none;line-height:1.6;min-height:100px;width:100%}
.lead-notepad:focus{border-color:var(--border-focus)}
.lead-notepad::placeholder{color:var(--text-3);font-style:italic}
.lead-status{position:absolute;top:12px;right:16px;display:flex;align-items:center;gap:6px}
.lead-avatar{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;font-weight:700;font-size:14px;color:#fff;flex-shrink:0}
.lead-info{flex:1;min-width:0}
.lead-name{font-weight:600;font-size:14px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lead-sub{font-size:11px;color:var(--text-3);display:flex;gap:12px;flex-wrap:wrap}
.lead-sub span{display:flex;align-items:center;gap:3px}
.lead-right{display:flex;align-items:center;gap:12px;flex-shrink:0}
.lead-time{font-size:10px;color:var(--text-3);min-width:50px;text-align:right}

/* Stage badge */
.stg{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:4px;font-size:10px;font-weight:600;letter-spacing:0.3px}
.stg-dot{width:5px;height:5px;border-radius:50%}

/* Filter row */
.filt{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;align-items:center}
.fpill{padding:4px 12px;border-radius:4px;font-size:10px;font-weight:500;cursor:pointer;transition:all .2s;background:rgba(255,255,255,0.02);color:var(--text-3);border:1px solid var(--border);letter-spacing:0.3px}
.fpill:hover{background:rgba(255,255,255,0.04);color:var(--text-2)}
.fpill.on{background:var(--accent-glow);color:var(--accent-lt);border-color:var(--border-focus)}

/* Modal */
.mo{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:100;animation:fi .2s}
@keyframes fi{from{opacity:0}to{opacity:1}}
@keyframes su{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.md{background:var(--bg-elevated);border:1px solid var(--border);border-radius:10px;width:540px;max-height:85vh;overflow-y:auto;animation:su .2s;box-shadow:0 20px 60px rgba(0,0,0,0.7),0 0 40px rgba(192,152,42,0.04)}
.md::-webkit-scrollbar{width:4px}
.md::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
.md-w{width:680px}
.md-h{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--border)}
.md-h h2{font-family:'Outfit',sans-serif;font-size:17px;font-weight:600}
.md-x{background:none;border:none;color:var(--text-3);cursor:pointer;padding:4px;border-radius:6px;display:flex;transition:all .2s}
.md-x:hover{background:rgba(255,255,255,0.05);color:var(--text-1)}
.md-b{padding:22px}
.md-f{padding:14px 22px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px}

/* Form */
.fg{margin-bottom:14px}
.fl{display:block;font-size:10px;color:var(--text-3);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;font-weight:500;font-family:'JetBrains Mono',monospace}
.fi,.fs,.ft{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:5px;padding:9px 12px;color:var(--text-1);font-family:'Sora',sans-serif;font-size:12px;transition:all .2s;outline:none}
.fi:focus,.fs:focus,.ft:focus{border-color:var(--border-focus);box-shadow:0 0 0 3px rgba(192,152,42,0.04)}
.fs{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%234A5F78' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
.fs option{background:var(--bg-card);color:var(--text-1)}
.ft{resize:vertical;min-height:70px}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:12px}

/* Detail sections */
.ds{margin-bottom:18px}
.ds-t{font-size:9px;color:var(--text-3);text-transform:uppercase;letter-spacing:2px;font-weight:600;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid var(--border);font-family:'JetBrains Mono',monospace}
.dg{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.df-l{font-size:10px;color:var(--text-3);margin-bottom:1px}
.df-v{font-size:13px;color:var(--text-1);font-weight:500}
.stg-row{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px}
.stg-btn{padding:4px 11px;border-radius:4px;font-size:10px;font-weight:600;cursor:pointer;border:1px solid transparent;transition:all .2s;background:rgba(255,255,255,0.03);color:var(--text-2);letter-spacing:0.3px}
.stg-btn:hover{background:rgba(255,255,255,0.05)}

/* Notes */
.note{padding:8px 0;border-bottom:1px solid var(--border)}
.note:last-child{border-bottom:none}
.note-t{font-size:10px;color:var(--text-3);margin-bottom:3px}
.note-tx{font-size:12px;color:var(--text-2);line-height:1.5}
.note-add{display:flex;gap:6px;margin-top:8px}
.note-add input{flex:1}

/* Production */
.prod-card{background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:22px;margin-bottom:16px}
.prod-card h3{font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;margin-bottom:14px;letter-spacing:0.5px}
.prod-table{width:100%;border-collapse:collapse}
.prod-table th{text-align:left;padding:8px 12px;font-size:9px;color:var(--text-3);text-transform:uppercase;letter-spacing:1.5px;border-bottom:1px solid var(--border);background:rgba(0,0,0,0.3);font-family:'JetBrains Mono',monospace}
.prod-table td{padding:8px 12px;font-size:12px;border-bottom:1px solid var(--border);color:var(--text-2)}
.prod-table tr:last-child td{border-bottom:none}
.prod-table tr:hover td{background:var(--accent-glow)}
.prod-table .num{font-family:'Outfit',sans-serif;font-weight:600;color:var(--text-1)}
.goal-bar-wrap{width:100%;height:8px;background:rgba(255,255,255,0.05);border-radius:4px;overflow:hidden;margin-top:6px}
.goal-bar{height:100%;border-radius:4px;transition:width .5s}

/* Import */
.imp-drop{border:1px dashed var(--border);border-radius:8px;padding:36px;text-align:center;cursor:pointer;transition:all .2s}
.imp-drop:hover{border-color:var(--border-focus);background:var(--accent-glow)}

/* Toast */
.toast{position:fixed;bottom:20px;right:20px;background:var(--bg-elevated);border:1px solid var(--border);border-radius:6px;padding:10px 18px;font-size:11px;box-shadow:0 10px 40px rgba(0,0,0,0.6);z-index:200;animation:su .3s;display:flex;align-items:center;gap:6px;letter-spacing:0.3px}
.toast svg{color:var(--accent-lt)}

/* Empty */
.empty{text-align:center;padding:50px 20px;color:var(--text-3)}
.empty h3{font-family:'Outfit',sans-serif;font-size:16px;margin-bottom:6px;color:var(--text-2)}

/* Mobile menu toggle */
.mob-toggle{display:none;background:none;border:none;color:var(--text-2);cursor:pointer;padding:6px;border-radius:6px}
.mob-toggle:hover{background:var(--accent-glow)}
.sb-overlay{display:none}

/* ═══ MOBILE ═══ */
@media(max-width:768px){
  .mob-toggle{display:flex}
  .sb{position:fixed;left:-260px;top:0;bottom:0;width:250px;z-index:50;transition:left .3s;box-shadow:none}
  .sb.open{left:0;box-shadow:8px 0 30px rgba(0,0,0,0.6)}
  .sb-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:49}
  .sb-overlay.open{display:block}
  .hd{padding:14px 16px}
  .hd-title{font-size:15px}
  .hd-r{gap:6px}
  .srch{width:140px;padding:6px 10px}
  .srch input{font-size:11px}
  .btn{padding:6px 10px;font-size:10px}
  .cnt{padding:16px}
  .mets{grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:18px}
  .met{padding:14px}
  .met-v{font-size:22px}
  .met-l{font-size:8px}
  .met-c{font-size:9px}
  .leads-list{gap:10px}
  .lead-row{border-radius:8px}
  .lead-top{flex-direction:column}
  .lead-left{width:100%;min-width:unset;padding:14px 16px 10px;border-right:none;border-bottom:1px solid var(--border)}
  .lead-name{font-size:15px}
  .lead-phone{font-size:13px}
  .lead-meta-row{gap:5px}
  .lead-meta-tag{font-size:8px;padding:2px 6px}
  .lead-notes-area{padding:10px 16px 14px}
  .lead-notepad{min-height:70px;font-size:11px}
  .lead-notes-label{font-size:8px}
  .lead-status{top:10px;right:12px;gap:4px}
  .stg{font-size:9px;padding:2px 8px}
  .prod-card{padding:16px;border-radius:8px}
  .prod-card h3{font-size:13px;margin-bottom:10px}
  .prod-table th{font-size:8px;padding:6px 8px}
  .prod-table td{font-size:11px;padding:6px 8px}
  .filt{gap:4px;margin-bottom:12px}
  .fpill{padding:3px 8px;font-size:9px}
  .goal-bar-wrap{height:6px}
  .mo{align-items:flex-end}
  .md{width:100%;max-height:90vh;border-radius:14px 14px 0 0;animation:mslide .25s}
  .md-w{width:100%}
  .md-h{padding:14px 18px}
  .md-h h2{font-size:15px}
  .md-b{padding:18px}
  .md-f{padding:12px 18px}
  .fg{margin-bottom:10px}
  .fi,.fs,.ft{padding:8px 10px;font-size:11px}
  .fl{font-size:9px}
  .fr{grid-template-columns:1fr;gap:0}
  .ds-t{font-size:8px}
  .df-l{font-size:9px}
  .df-v{font-size:12px}
  .dg{grid-template-columns:1fr 1fr;gap:8px}
  .stg-row{gap:4px}
  .stg-btn{padding:3px 9px;font-size:9px}
  .sb-stats{padding:12px 14px}
  .sb-stat{font-size:10px}
  .toast{bottom:16px;right:16px;left:16px;font-size:10px}
  .imp-drop{padding:24px}
}
@keyframes mslide{from{transform:translateY(100%)}to{transform:translateY(0)}}

@media(max-width:380px){
  .mets{grid-template-columns:1fr}
  .lead-status{position:relative;top:auto;right:auto;justify-content:flex-start;padding:0 16px 8px}
  .dg{grid-template-columns:1fr}
}
`;

export default function FlowCRM() {
  const [leads, setLeads] = useState([]);
  const [production, setProduction] = useState([]);
  const [book, setBook] = useState([]);
  const [goals, setGoals] = useState({ monthlyPolicies: 10, monthlyPremium: 15000, monthlyCommission: 5000 });
  const [view, setView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [bookSearch, setBookSearch] = useState("");
  const [bookFilter, setBookFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showProdAdd, setShowProdAdd] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showBookAdd, setShowBookAdd] = useState(false);
  const [showBookEdit, setShowBookEdit] = useState(null);
  const [sheetUrl, setSheetUrl] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [toast, setToast] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [mobMenu, setMobMenu] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const raw = localStorage.getItem("flow-crm-data");
        if (raw) {
          const d = JSON.parse(raw);
          setLeads(d.leads || []);
          setProduction(d.production || []);
          setBook(d.book || []);
          if (d.goals) setGoals(d.goals);
          if (d.sheetUrl) setSheetUrl(d.sheetUrl);
          if (d.lastSync) setLastSync(d.lastSync);
        }
      } catch (e) {}
      setLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem("flow-crm-data", JSON.stringify({ leads, production, book, goals, sheetUrl, lastSync })); } catch (e) {}
  }, [leads, production, book, goals, sheetUrl, lastSync, loaded]);

  const flash = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); }, []);

  function addLead(data) {
    const nl = {
      id: gid(), ...data, stage: "new", createdAt: Date.now(), updatedAt: Date.now(),
      notepad: data.initialNote || "",
      notes: data.initialNote ? [{ text: data.initialNote, time: Date.now() }] : [],
      activity: [{ type: "created", time: Date.now(), text: "Lead created" }],
    };
    setLeads(p => [nl, ...p]);
    flash("Lead added");
  }

  function updateLead(id, u) {
    setLeads(p => p.map(l => {
      if (l.id !== id) return l;
      const up = { ...l, ...u };
      if (!u.notepad) up.updatedAt = Date.now();
      if (u.stage && u.stage !== l.stage) {
        up.updatedAt = Date.now();
        up.activity = [{ type: "stage", time: Date.now(), text: `Moved to ${STAGES.find(s => s.id === u.stage)?.label}` }, ...(l.activity || [])];
        // Auto-create book entry when moved to sold
        if (u.stage === "sold" && l.stage !== "sold") {
          const exists = book.some(b => b.leadId === l.id);
          if (!exists) {
            addBookEntry({
              clientName: `${l.firstName} ${l.lastName}`.trim(),
              phone: l.phone || "",
              email: l.email || "",
              policyType: "Whole Life",
              carrier: "",
              premium: "",
              commission: "",
              coverageAmount: l.coverage || "",
              policyNumber: "",
              status: "pending",
              leadId: l.id,
              notepad: "",
            });
            flash("Policy added to Book of Business");
          }
        }
      }
      return up;
    }));
  }

  function addBookEntry(data) {
    const entry = { id: gid(), ...data, createdAt: Date.now(), updatedAt: Date.now() };
    setBook(p => [entry, ...p]);
  }

  function updateBookEntry(id, u) {
    setBook(p => p.map(b => b.id === id ? { ...b, ...u, updatedAt: Date.now() } : b));
  }

  function deleteBookEntry(id) {
    setBook(p => p.filter(b => b.id !== id));
    setShowBookEdit(null);
    flash("Policy removed");
  }

  function deleteLead(id) { setLeads(p => p.filter(l => l.id !== id)); setShowDetail(null); flash("Lead removed"); }

  function addNote(id, text) {
    setLeads(p => p.map(l => {
      if (l.id !== id) return l;
      return { ...l, updatedAt: Date.now(), notes: [{ text, time: Date.now() }, ...(l.notes || [])], activity: [{ type: "note", time: Date.now(), text: `Note: ${text}` }, ...(l.activity || [])] };
    }));
  }

  function updateNotepad(id, text) {
    setLeads(p => p.map(l => {
      if (l.id !== id) return l;
      return { ...l, notepad: text };
    }));
  }

  function addProd(data) {
    setProduction(p => [{ id: gid(), ...data, createdAt: Date.now() }, ...p]);
    flash("Production logged");
  }

  function deleteProd(id) { setProduction(p => p.filter(x => x.id !== id)); flash("Entry removed"); }

  function importCSV(text) {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return 0;
    const hdr = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
    let c = 0;
    for (let i = 1; i < lines.length; i++) {
      const v = lines[i].split(",").map(x => x.trim().replace(/"/g, ""));
      const r = {}; hdr.forEach((h, idx) => { r[h] = v[idx] || ""; });
      const ld = {
        firstName: r["first_name"] || r["first name"] || r["firstname"] || r["name"]?.split(" ")[0] || "",
        lastName: r["last_name"] || r["last name"] || r["lastname"] || r["name"]?.split(" ").slice(1).join(" ") || "",
        email: r["email"] || r["email address"] || "",
        phone: r["phone_number"] || r["phone number"] || r["phone"] || "",
        age: r["age"] || r["age_range"] || r["age range"] || "",
        budget: r["budget"] || r["monthly_budget"] || "",
        coverage: r["coverage"] || r["coverage_amount"] || "",
        source: r["platform"] || r["source"] || "Facebook",
        initialNote: r["notes"] || "",
      };
      if (ld.firstName || ld.email || ld.phone) { addLead(ld); c++; }
    }
    return c;
  }

  async function syncFromSheet() {
    if (!sheetUrl) { flash("No Google Sheet URL set"); return; }
    setSyncing(true);
    try {
      const res = await fetch(sheetUrl);
      const text = await res.text();
      const lines = text.trim().split("\n");
      if (lines.length < 2) { flash("No data found in sheet"); setSyncing(false); return; }
      const hdr = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
      let newCount = 0;
      const existingKeys = new Set(leads.map(l => `${(l.firstName||"").toLowerCase()}_${(l.lastName||"").toLowerCase()}_${(l.email||"").toLowerCase()}_${(l.phone||"").replace(/\D/g,"")}`));
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(",").map(x => x.trim().replace(/"/g, ""));
        const r = {}; hdr.forEach((h, idx) => { r[h] = vals[idx] || ""; });
        const ld = {
          firstName: r["first_name"] || r["first name"] || r["firstname"] || r["name"]?.split(" ")[0] || "",
          lastName: r["last_name"] || r["last name"] || r["lastname"] || r["name"]?.split(" ").slice(1).join(" ") || "",
          email: r["email"] || r["email address"] || "",
          phone: r["phone_number"] || r["phone number"] || r["phone"] || "",
          age: r["age"] || r["age_range"] || r["age range"] || "",
          budget: r["budget"] || r["monthly_budget"] || "",
          coverage: r["coverage"] || r["coverage_amount"] || "",
          source: r["platform"] || r["source"] || "Facebook",
          initialNote: r["notes"] || "",
        };
        const key = `${(ld.firstName||"").toLowerCase()}_${(ld.lastName||"").toLowerCase()}_${(ld.email||"").toLowerCase()}_${(ld.phone||"").replace(/\D/g,"")}`;
        if ((ld.firstName || ld.email || ld.phone) && !existingKeys.has(key)) {
          addLead(ld);
          existingKeys.add(key);
          newCount++;
        }
      }
      setLastSync(Date.now());
      flash(newCount > 0 ? `Synced ${newCount} new lead${newCount > 1 ? "s" : ""}` : "All leads already up to date");
    } catch (e) {
      flash("Sync failed — check your Sheet URL");
    }
    setSyncing(false);
  }

  function exportCSV() {
    const hdr = "first_name,last_name,email,phone,age,budget,coverage,source,stage,created";
    const rows = leads.map(l => `"${l.firstName}","${l.lastName}","${l.email}","${l.phone}","${l.age}","${l.budget}","${l.coverage}","${l.source}","${l.stage}","${fmtDate(l.createdAt)}"`);
    const csv = [hdr, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "flow-leads.csv"; a.click();
    URL.revokeObjectURL(url);
    flash("Exported CSV");
  }

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    const ms = !q || `${l.firstName} ${l.lastName} ${l.email} ${l.phone}`.toLowerCase().includes(q);
    const mf = stageFilter === "all" || l.stage === stageFilter;
    return ms && mf;
  });

  const sc = (sid) => leads.filter(l => l.stage === sid).length;
  const total = leads.length;
  const sold = sc("sold");
  const conv = total > 0 ? ((sold / total) * 100).toFixed(1) : "0.0";
  const week = leads.filter(l => Date.now() - l.createdAt < 7 * 86400000).length;

  // Production stats
  const now = new Date();
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();
  const monthProd = production.filter(p => { const d = new Date(p.createdAt); return d.getMonth() === curMonth && d.getFullYear() === curYear; });
  const mPolicies = monthProd.length;
  const mPremium = monthProd.reduce((s, p) => s + (parseFloat(p.premium) || 0), 0);
  const mCommission = monthProd.reduce((s, p) => s + (parseFloat(p.commission) || 0), 0);
  const policyPct = Math.min((mPolicies / goals.monthlyPolicies) * 100, 100);
  const premPct = Math.min((mPremium / goals.monthlyPremium) * 100, 100);
  const commPct = Math.min((mCommission / goals.monthlyCommission) * 100, 100);

  if (!loaded) return (
    <div style={{ background: "#050505", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{css}</style>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#C0982A", fontFamily: "Outfit,sans-serif", letterSpacing: 8, fontSize: 16, fontWeight: 800 }}>FLOW</p>
        <p style={{ color: "#4A4740", fontFamily: "JetBrains Mono,monospace", letterSpacing: 3, fontSize: 9, marginTop: 8 }}>LOADING</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className={`sb-overlay ${mobMenu ? "open" : ""}`} onClick={() => setMobMenu(false)} />
        <aside className={`sb ${mobMenu ? "open" : ""}`}>
          <div className="sb-logo">
            <h1>FLOW</h1>
            <small>CRM</small>
          </div>
          <nav className="sb-nav">
            {[
              ["dashboard", "home", "Dashboard"],
              ["leads", "user", "Leads"],
              ["book", "book", "Book of Business"],
              ["production", "trending", "Production"],
              ["import", "upload", "Sync"],
            ].map(([v, ic, lb]) => (
              <button key={v} className={`nav-btn ${view === v ? "on" : ""}`} onClick={() => { setView(v); setMobMenu(false); }}>
                <Icon name={ic} size={15} /> {lb}
              </button>
            ))}
          </nav>
          <div className="sb-stats">
            <div className="sb-stat"><span className="sb-stat-l">Total Leads</span><span className="sb-stat-v">{total}</span></div>
            <div className="sb-stat"><span className="sb-stat-l">Policies</span><span className="sb-stat-v">{book.filter(b => b.status === "active").length}</span></div>
            <div className="sb-stat"><span className="sb-stat-l">Conversion</span><span className="sb-stat-v">{conv}%</span></div>
            <div className="sb-stat"><span className="sb-stat-l">Month Sold</span><span className="sb-stat-v">{mPolicies}</span></div>
          </div>
        </aside>

        <main className="mn">
          <header className="hd">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="mob-toggle" onClick={() => setMobMenu(true)}><Icon name="menu" size={18} /></button>
              <h2 className="hd-title">
                {{ dashboard: "Dashboard", leads: "Leads", book: "Book of Business", production: "Production", import: "Sync & Import" }[view]}
              </h2>
            </div>
            <div className="hd-r">
              {view === "leads" && (
                <>
                  <div className="srch"><Icon name="search" size={14} /><input placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                  {sheetUrl && <button className="btn btn-g" onClick={syncFromSheet} disabled={syncing} style={syncing ? { opacity: 0.6 } : {}}><Icon name="refresh" size={13} /> {syncing ? "Syncing..." : "Sync"}</button>}
                  <button className="btn btn-g" onClick={exportCSV}><Icon name="download" size={13} /> Export</button>
                </>
              )}
              {view === "book" && (
                <>
                  <div className="srch"><Icon name="search" size={14} /><input placeholder="Search policies..." value={bookSearch} onChange={e => setBookSearch(e.target.value)} /></div>
                </>
              )}
              {view === "leads" && <button className="btn btn-p" onClick={() => setShowAdd(true)}><Icon name="plus" size={13} /> Add Lead</button>}
              {view === "book" && <button className="btn btn-p" onClick={() => setShowBookAdd(true)}><Icon name="plus" size={13} /> Add Policy</button>}
              {view === "production" && <button className="btn btn-p" onClick={() => setShowProdAdd(true)}><Icon name="plus" size={13} /> Log Sale</button>}
              {view === "dashboard" && <button className="btn btn-p" onClick={() => setShowAdd(true)}><Icon name="plus" size={13} /> Add Lead</button>}
            </div>
          </header>

          <div className="cnt">
            {/* ═══ DASHBOARD ═══ */}
            {view === "dashboard" && (
              <>
                <div className="mets">
                  {[
                    ["Total Leads", total, `+${week} this week`, "up"],
                    ["In Pipeline", sc("contacted") + sc("qualified") + sc("quoted"), "Active leads", ""],
                    ["Sold", sold, `${conv}% conversion`, "up"],
                    ["Monthly Premium", fmtMoney(mPremium), `${mPolicies} policies`, "up"],
                  ].map(([l, v, c, cl], i) => (
                    <div className="met" key={i}>
                      <div className="met-l">{l}</div>
                      <div className="met-v">{v}</div>
                      <div className="met-c" style={{ color: cl === "up" ? "var(--success)" : "var(--text-3)" }}>{c}</div>
                    </div>
                  ))}
                </div>

                {/* Goal Progress */}
                <div className="prod-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3>{MONTHS[curMonth]} Goals</h3>
                    <button className="btn btn-g btn-s" onClick={() => setShowGoals(true)}>Edit Goals</button>
                  </div>
                  {[
                    ["Policies", mPolicies, goals.monthlyPolicies, policyPct, "#7A8A9E"],
                    ["Premium", fmtMoney(mPremium), fmtMoney(goals.monthlyPremium), premPct, "#5A9A6A"],
                    ["Commission", fmtMoney(mCommission), fmtMoney(goals.monthlyCommission), commPct, "#C0982A"],
                  ].map(([label, cur, goal, pct, color], i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: "var(--text-2)" }}>{label}</span>
                        <span><span style={{ color: "var(--text-1)", fontWeight: 600 }}>{cur}</span><span style={{ color: "var(--text-3)" }}> / {goal}</span></span>
                      </div>
                      <div className="goal-bar-wrap">
                        <div className="goal-bar" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, boxShadow: `0 0 10px ${color}40` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pipeline */}
                <div className="prod-card">
                  <h3>Pipeline</h3>
                  <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                    {STAGES.map(s => {
                      const cnt = sc(s.id);
                      const pct = total > 0 ? (cnt / total) * 100 : 0;
                      return (
                        <div key={s.id} style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ height: 100, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 8 }}>
                            <div style={{ width: 32, height: `${Math.max(pct, 5)}%`, background: `linear-gradient(180deg, ${s.color}, ${s.color}66)`, borderRadius: "5px 5px 0 0", boxShadow: `0 0 12px ${s.color}30`, transition: "height .5s" }} />
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "Outfit,sans-serif" }}>{cnt}</div>
                          <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>{s.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent */}
                <div className="prod-card">
                  <h3>Recent Leads</h3>
                  {leads.slice(0, 5).map(l => {
                    const st = STAGES.find(s => s.id === l.stage);
                    return (
                      <div key={l.id} onClick={() => { setShowDetail(l.id); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                        <div><div style={{ fontWeight: 600, fontSize: 13 }}>{l.firstName} {l.lastName}</div><div style={{ fontSize: 11, color: "var(--text-3)" }}>{l.email || l.phone}</div></div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="stg" style={{ background: `${st?.color}18`, color: st?.color }}><span className="stg-dot" style={{ background: st?.color }} />{st?.label}</span>
                          <span style={{ fontSize: 10, color: "var(--text-3)" }}>{timeAgo(l.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {leads.length === 0 && <div className="empty" style={{ padding: 24 }}><p>No leads yet</p></div>}
                </div>
              </>
            )}

            {/* ═══ LEADS ═══ */}
            {view === "leads" && (
              <>
                <div className="filt">
                  <button className={`fpill ${stageFilter === "all" ? "on" : ""}`} onClick={() => setStageFilter("all")}>All ({total})</button>
                  {STAGES.map(s => <button key={s.id} className={`fpill ${stageFilter === s.id ? "on" : ""}`} onClick={() => setStageFilter(s.id)}>{s.label} ({sc(s.id)})</button>)}
                </div>
                <div className="leads-list">
                  {filtered.map(l => {
                    const st = STAGES.find(s => s.id === l.stage);
                    // Parse state from notes
                    const stateMatch = (l.notes || []).find(n => n.text && n.text.includes("State:"));
                    const branchMatch = (l.notes || []).find(n => n.text && n.text.includes("Branch:"));
                    let stateTag = "";
                    let branchTag = "";
                    // Check initial note for state/branch info
                    const allNoteText = (l.notes || []).map(n => n.text).join(" ");
                    const sm = allNoteText.match(/State:\s*([^|]+)/);
                    if (sm) stateTag = sm[1].trim();
                    const bm = allNoteText.match(/Branch:\s*([^|]+)/);
                    if (bm) branchTag = bm[1].trim();
                    return (
                      <div className="lead-row" key={l.id}>
                        <div className="lead-top">
                          {/* LEFT — Name, Phone, Meta */}
                          <div className="lead-left" onClick={() => setShowDetail(l.id)}>
                            <div className="lead-name">{l.firstName} {l.lastName}</div>
                            {l.phone && <div className="lead-phone"><Icon name="phone" size={13} /> {l.phone}</div>}
                            {l.email && <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}><Icon name="mail" size={11} /> {l.email}</div>}
                            <div className="lead-meta-row">
                              {stateTag && <span className="lead-meta-tag">{stateTag}</span>}
                              {l.age && <span className="lead-meta-tag">Age: {l.age}</span>}
                              {branchTag && <span className="lead-meta-tag">{branchTag}</span>}
                              {l.coverage && <span className="lead-meta-tag">{l.coverage}</span>}
                              {l.budget && <span className="lead-meta-tag">{l.budget}</span>}
                            </div>
                          </div>

                          {/* RIGHT — Notepad */}
                          <div className="lead-notes-area" onClick={e => e.stopPropagation()}>
                            <div className="lead-status">
                              <span className="stg" style={{ background: `${st?.color}18`, color: st?.color }}><span className="stg-dot" style={{ background: st?.color }} />{st?.label}</span>
                              {l.source && <span className="lead-meta-tag">{l.source}</span>}
                              <span style={{ fontSize: 10, color: "var(--text-3)" }}>{timeAgo(l.createdAt)}</span>
                            </div>
                            <div className="lead-notes-header">
                              <span className="lead-notes-label">Notes</span>
                            </div>
                            <textarea
                              className="lead-notepad"
                              placeholder="Type notes here..."
                              value={l.notepad || ""}
                              onChange={e => updateNotepad(l.id, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filtered.length === 0 && <div className="empty"><h3>No leads found</h3><p>Add your first lead or adjust your filters</p></div>}
                </div>
              </>
            )}

            {/* ═══ BOOK OF BUSINESS ═══ */}
            {view === "book" && (() => {
              const filteredBook = book.filter(b => {
                const q = bookSearch.toLowerCase();
                const ms = !q || `${b.clientName} ${b.email} ${b.phone} ${b.policyNumber} ${b.carrier}`.toLowerCase().includes(q);
                const mf = bookFilter === "all" || b.status === bookFilter;
                return ms && mf;
              });
              const activePolicies = book.filter(b => b.status === "active").length;
              const totalPremium = book.filter(b => b.status === "active").reduce((s, b) => s + (parseFloat(b.premium) || 0), 0);
              const totalCommission = book.reduce((s, b) => s + (parseFloat(b.commission) || 0), 0);
              return (
                <>
                  <div className="mets">
                    {[
                      ["Total Policies", book.length, `${activePolicies} active`, ""],
                      ["Active Premium", fmtMoney(totalPremium), "Annual", "up"],
                      ["Total Commission", fmtMoney(totalCommission), "Earned", "up"],
                      ["Pending", book.filter(b => b.status === "pending").length, "Awaiting issue", ""],
                    ].map(([l, v, c, cl], i) => (
                      <div className="met" key={i}>
                        <div className="met-l">{l}</div>
                        <div className="met-v">{v}</div>
                        <div className="met-c" style={{ color: cl === "up" ? "var(--success)" : "var(--text-3)" }}>{c}</div>
                      </div>
                    ))}
                  </div>

                  <div className="filt">
                    <button className={`fpill ${bookFilter === "all" ? "on" : ""}`} onClick={() => setBookFilter("all")}>All ({book.length})</button>
                    {POLICY_STATUSES.map(s => (
                      <button key={s.id} className={`fpill ${bookFilter === s.id ? "on" : ""}`} onClick={() => setBookFilter(s.id)}>
                        {s.label} ({book.filter(b => b.status === s.id).length})
                      </button>
                    ))}
                  </div>

                  {filteredBook.length > 0 ? (
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                      <table className="prod-table">
                        <thead>
                          <tr>
                            <th>Client</th>
                            <th>Policy #</th>
                            <th>Type</th>
                            <th>Carrier</th>
                            <th>Coverage</th>
                            <th>Premium</th>
                            <th>Commission</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBook.map(b => {
                            const ps = POLICY_STATUSES.find(s => s.id === b.status);
                            return (
                              <tr key={b.id} onClick={() => setShowBookEdit(b.id)} style={{ cursor: "pointer" }}>
                                <td>
                                  <div style={{ fontWeight: 600, color: "var(--text-1)", fontSize: 13 }}>{b.clientName}</div>
                                  <div style={{ fontSize: 10, color: "var(--text-3)" }}>{b.phone}</div>
                                </td>
                                <td style={{ fontFamily: "monospace", fontSize: 12 }}>{b.policyNumber || "—"}</td>
                                <td>{b.policyType || "—"}</td>
                                <td>{b.carrier || "—"}</td>
                                <td>{b.coverageAmount || "—"}</td>
                                <td className="num">{b.premium ? fmtMoney(b.premium) : "—"}</td>
                                <td className="num" style={{ color: "var(--success)" }}>{b.commission ? fmtMoney(b.commission) : "—"}</td>
                                <td>
                                  <span className="stg" style={{ background: `${ps?.color}18`, color: ps?.color }}>
                                    <span className="stg-dot" style={{ background: ps?.color }} />{ps?.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty">
                      <h3>No policies yet</h3>
                      <p>Add a policy manually or mark a lead as "Sold" to auto-create one</p>
                    </div>
                  )}
                </>
              );
            })()}

            {/* ═══ PRODUCTION ═══ */}
            {view === "production" && (
              <>
                <div className="mets">
                  {[
                    ["Month Policies", mPolicies, `Goal: ${goals.monthlyPolicies}`, policyPct >= 100 ? "up" : ""],
                    ["Month Premium", fmtMoney(mPremium), `Goal: ${fmtMoney(goals.monthlyPremium)}`, premPct >= 100 ? "up" : ""],
                    ["Month Commission", fmtMoney(mCommission), `Goal: ${fmtMoney(goals.monthlyCommission)}`, commPct >= 100 ? "up" : ""],
                    ["All-Time Sales", production.length, fmtMoney(production.reduce((s, p) => s + (parseFloat(p.premium) || 0), 0)) + " total", ""],
                  ].map(([l, v, c, cl], i) => (
                    <div className="met" key={i}>
                      <div className="met-l">{l}</div>
                      <div className="met-v">{v}</div>
                      <div className="met-c" style={{ color: cl === "up" ? "var(--success)" : "var(--text-3)" }}>{c}</div>
                    </div>
                  ))}
                </div>

                <div className="prod-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3>{MONTHS[curMonth]} {curYear} Goal Progress</h3>
                    <button className="btn btn-g btn-s" onClick={() => setShowGoals(true)}><Icon name="target" size={12} /> Edit Goals</button>
                  </div>
                  {[
                    ["Policies Sold", mPolicies, goals.monthlyPolicies, policyPct, "#7A8A9E"],
                    ["Total Premium", fmtMoney(mPremium), fmtMoney(goals.monthlyPremium), premPct, "#5A9A6A"],
                    ["Total Commission", fmtMoney(mCommission), fmtMoney(goals.monthlyCommission), commPct, "#C0982A"],
                  ].map(([label, cur, goal, pct, color], i) => (
                    <div key={i} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: "var(--text-2)" }}>{label}</span>
                        <span><span style={{ color: "var(--text-1)", fontWeight: 600 }}>{cur}</span><span style={{ color: "var(--text-3)" }}> / {goal}</span></span>
                      </div>
                      <div className="goal-bar-wrap"><div className="goal-bar" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}88)`, boxShadow: `0 0 10px ${color}40` }} /></div>
                    </div>
                  ))}
                </div>

                <div className="prod-card">
                  <h3>Sales Log</h3>
                  {production.length > 0 ? (
                    <table className="prod-table" style={{ marginTop: 12 }}>
                      <thead><tr><th>Date</th><th>Client</th><th>Product</th><th>Premium</th><th>Commission</th><th></th></tr></thead>
                      <tbody>
                        {production.map(p => (
                          <tr key={p.id}>
                            <td>{fmtDate(p.createdAt)}</td>
                            <td style={{ fontWeight: 600, color: "var(--text-1)" }}>{p.clientName}</td>
                            <td>{p.product || "Whole Life"}</td>
                            <td className="num">{fmtMoney(p.premium || 0)}</td>
                            <td className="num" style={{ color: "var(--success)" }}>{fmtMoney(p.commission || 0)}</td>
                            <td><button className="btn btn-d btn-s" onClick={() => deleteProd(p.id)}><Icon name="trash" size={11} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="empty" style={{ padding: 30 }}><h3>No sales logged yet</h3><p>Click "Log Sale" to start tracking production</p></div>
                  )}
                </div>
              </>
            )}

            {/* ═══ IMPORT ═══ */}
            {view === "import" && (
              <div style={{ maxWidth: 600 }}>
                {/* Google Sheet Sync */}
                <div className="prod-card" style={{ borderColor: sheetUrl ? "rgba(16,185,129,0.2)" : "var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: sheetUrl ? "var(--success)" : "var(--text-3)", boxShadow: sheetUrl ? "0 0 8px rgba(90,154,106,0.4)" : "none" }} />
                    <h3>{sheetUrl ? "Google Sheet Connected" : "Connect Google Sheet"}</h3>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, margin: "8px 0 16px" }}>
                    Paste your published Google Sheet CSV link below. Zapier sends Meta leads to the sheet, then hit Sync to pull them in. Duplicates are automatically skipped.
                  </p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <input
                      className="fi"
                      placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv"
                      value={sheetUrl}
                      onChange={e => setSheetUrl(e.target.value)}
                      style={{ flex: 1, fontSize: 12 }}
                    />
                    <button
                      className="btn btn-p"
                      onClick={syncFromSheet}
                      disabled={syncing || !sheetUrl}
                      style={syncing ? { opacity: 0.6 } : {}}
                    >
                      {syncing ? "Syncing..." : "Sync Now"}
                    </button>
                  </div>
                  {lastSync && (
                    <div style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Icon name="check" size={11} /> Last synced: {fmtDate(lastSync)}
                    </div>
                  )}
                  {sheetUrl && (
                    <div style={{ marginTop: 12, padding: 12, background: "var(--bg-input)", borderRadius: 8, fontSize: 11, color: "var(--text-2)", lineHeight: 1.7 }}>
                      <strong style={{ color: "var(--accent-lt)" }}>How it works:</strong><br />
                      1. Meta lead form submitted → Zapier catches it<br />
                      2. Zapier adds a row to your Google Sheet<br />
                      3. Click "Sync Now" here to pull new leads into Flow<br />
                      Duplicates are matched by name + email + phone and skipped automatically.
                    </div>
                  )}
                </div>

                {/* Manual CSV */}
                <div className="prod-card">
                  <h3>Or Upload CSV Manually</h3>
                  <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, margin: "8px 0 18px" }}>
                    Export leads from Ads Manager → Lead Center → Download → CSV format.
                  </p>
                  <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={e => {
                    const f = e.target.files?.[0]; if (!f) return;
                    const r = new FileReader();
                    r.onload = ev => { const c = importCSV(ev.target.result); flash(`Imported ${c} leads`); e.target.value = ""; };
                    r.readAsText(f);
                  }} />
                  <div className="imp-drop" onClick={() => fileRef.current?.click()}>
                    <Icon name="upload" size={28} />
                    <p style={{ fontSize: 13, color: "var(--text-2)", marginTop: 8 }}>Click to upload CSV</p>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>Supports Meta Lead Form exports</span>
                  </div>
                </div>

                {/* Format reference */}
                <div className="prod-card">
                  <h3>Expected Column Headers</h3>
                  <div style={{ background: "var(--bg-input)", borderRadius: 8, padding: 12, fontSize: 11, fontFamily: "monospace", color: "var(--accent-lt)", lineHeight: 1.8, marginTop: 8 }}>
                    first_name, last_name, email, phone_number,<br />age, budget, coverage, platform, notes
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ═══ ADD LEAD MODAL ═══ */}
        {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} onSave={d => { addLead(d); setShowAdd(false); }} />}

        {/* ═══ LEAD DETAIL ═══ */}
        {showDetail && (() => {
          const lead = leads.find(l => l.id === showDetail);
          if (!lead) return null;
          return <DetailModal lead={lead} onClose={() => setShowDetail(null)} onUpdate={u => updateLead(lead.id, u)} onAddNote={t => addNote(lead.id, t)} onDelete={() => deleteLead(lead.id)} />;
        })()}

        {/* ═══ LOG SALE MODAL ═══ */}
        {showProdAdd && <ProdModal onClose={() => setShowProdAdd(false)} onSave={d => { addProd(d); setShowProdAdd(false); }} />}

        {/* ═══ GOALS MODAL ═══ */}
        {showGoals && <GoalsModal goals={goals} onClose={() => setShowGoals(false)} onSave={g => { setGoals(g); setShowGoals(false); flash("Goals updated"); }} />}

        {/* ═══ BOOK ADD MODAL ═══ */}
        {showBookAdd && <BookModal onClose={() => setShowBookAdd(false)} onSave={d => { addBookEntry(d); setShowBookAdd(false); flash("Policy added"); }} />}

        {/* ═══ BOOK EDIT MODAL ═══ */}
        {showBookEdit && (() => {
          const entry = book.find(b => b.id === showBookEdit);
          if (!entry) return null;
          return <BookModal entry={entry} onClose={() => setShowBookEdit(null)} onSave={d => { updateBookEntry(entry.id, d); setShowBookEdit(null); flash("Policy updated"); }} onDelete={() => deleteBookEntry(entry.id)} />;
        })()}

        {toast && <div className="toast"><Icon name="check" size={14} />{toast}</div>}
      </div>
    </>
  );
}

function AddLeadModal({ onClose, onSave }) {
  const [f, sf] = useState({ firstName: "", lastName: "", email: "", phone: "", age: "", budget: "", coverage: "", source: "Facebook", initialNote: "" });
  const u = (k, v) => sf(p => ({ ...p, [k]: v }));
  return (
    <div className="mo" onClick={onClose}>
      <div className="md" onClick={e => e.stopPropagation()}>
        <div className="md-h"><h2>Add New Lead</h2><button className="md-x" onClick={onClose}><Icon name="x" size={18} /></button></div>
        <div className="md-b">
          <div className="fr">
            <div className="fg"><label className="fl">First Name</label><input className="fi" value={f.firstName} onChange={e => u("firstName", e.target.value)} placeholder="John" /></div>
            <div className="fg"><label className="fl">Last Name</label><input className="fi" value={f.lastName} onChange={e => u("lastName", e.target.value)} placeholder="Smith" /></div>
          </div>
          <div className="fr">
            <div className="fg"><label className="fl">Email</label><input className="fi" type="email" value={f.email} onChange={e => u("email", e.target.value)} placeholder="john@email.com" /></div>
            <div className="fg"><label className="fl">Phone</label><input className="fi" value={f.phone} onChange={e => u("phone", e.target.value)} placeholder="(555) 123-4567" /></div>
          </div>
          <div className="fr">
            <div className="fg"><label className="fl">Age Range</label><select className="fs" value={f.age} onChange={e => u("age", e.target.value)}><option value="">Select</option>{AGE_RANGES.map(a => <option key={a}>{a}</option>)}</select></div>
            <div className="fg"><label className="fl">Source</label><select className="fs" value={f.source} onChange={e => u("source", e.target.value)}>{SOURCES.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="fr">
            <div className="fg"><label className="fl">Monthly Budget</label><select className="fs" value={f.budget} onChange={e => u("budget", e.target.value)}><option value="">Select</option>{BUDGET_RANGES.map(b => <option key={b}>{b}</option>)}</select></div>
            <div className="fg"><label className="fl">Coverage Amount</label><select className="fs" value={f.coverage} onChange={e => u("coverage", e.target.value)}><option value="">Select</option>{COVERAGE_RANGES.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div className="fg"><label className="fl">Notes</label><textarea className="ft" value={f.initialNote} onChange={e => u("initialNote", e.target.value)} placeholder="Initial notes about this lead..." /></div>
        </div>
        <div className="md-f">
          <button className="btn btn-g" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={() => onSave(f)} disabled={!f.firstName && !f.email && !f.phone}>Add Lead</button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ lead, onClose, onUpdate, onAddNote, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [f, sf] = useState({ ...lead });
  const u = (k, v) => sf(p => ({ ...p, [k]: v }));
  const st = STAGES.find(s => s.id === lead.stage);
  const ini = ((lead.firstName?.[0] || "") + (lead.lastName?.[0] || "")).toUpperCase() || "?";

  function save() {
    onUpdate({ firstName: f.firstName, lastName: f.lastName, email: f.email, phone: f.phone, age: f.age, budget: f.budget, coverage: f.coverage, source: f.source });
    setEditing(false);
  }

  return (
    <div className="mo" onClick={onClose}>
      <div className="md md-w" onClick={e => e.stopPropagation()}>
        <div className="md-h">
          <h2>Lead Details</h2>
          <div style={{ display: "flex", gap: 5 }}>
            <button className="btn btn-g btn-s" onClick={() => setEditing(!editing)}><Icon name="edit" size={12} /> {editing ? "Cancel" : "Edit"}</button>
            <button className="btn btn-d btn-s" onClick={onDelete}><Icon name="trash" size={12} /></button>
            <button className="md-x" onClick={onClose}><Icon name="x" size={18} /></button>
          </div>
        </div>
        <div className="md-b">
          {/* Header */}
          <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
            <div className="lead-avatar" style={{ background: `linear-gradient(135deg, ${st?.color}88, ${st?.color}44)`, width: 48, height: 48, fontSize: 16 }}>{ini}</div>
            <div>
              {!editing ? <h3 style={{ fontFamily: "Outfit,sans-serif", fontSize: 18, fontWeight: 600, marginBottom: 3 }}>{lead.firstName} {lead.lastName}</h3> : (
                <div style={{ display: "flex", gap: 6 }}>
                  <input className="fi" value={f.firstName} onChange={e => u("firstName", e.target.value)} style={{ width: 140 }} />
                  <input className="fi" value={f.lastName} onChange={e => u("lastName", e.target.value)} style={{ width: 140 }} />
                </div>
              )}
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-3)" }}>
                {lead.email && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Icon name="mail" size={10} /> {lead.email}</span>}
                {lead.phone && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Icon name="phone" size={10} /> {lead.phone}</span>}
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Icon name="clock" size={10} /> {fmtDate(lead.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Stage */}
          <div className="ds">
            <div className="ds-t">Stage</div>
            <div className="stg-row">
              {STAGES.map(s => (
                <button key={s.id} className="stg-btn" style={lead.stage === s.id ? { background: `${s.color}30`, borderColor: `${s.color}50`, color: s.color } : {}} onClick={() => onUpdate({ stage: s.id })}>{s.label}</button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="ds">
            <div className="ds-t">Information</div>
            {!editing ? (
              <div className="dg">
                {[["Email", lead.email], ["Phone", lead.phone], ["Age Range", lead.age], ["Source", lead.source], ["Monthly Budget", lead.budget], ["Coverage", lead.coverage]].map(([l, v], i) => (
                  <div key={i}><div className="df-l">{l}</div><div className="df-v">{v || "—"}</div></div>
                ))}
              </div>
            ) : (
              <>
                <div className="fr">
                  <div className="fg"><label className="fl">Email</label><input className="fi" value={f.email} onChange={e => u("email", e.target.value)} /></div>
                  <div className="fg"><label className="fl">Phone</label><input className="fi" value={f.phone} onChange={e => u("phone", e.target.value)} /></div>
                </div>
                <div className="fr">
                  <div className="fg"><label className="fl">Age</label><select className="fs" value={f.age} onChange={e => u("age", e.target.value)}><option value="">Select</option>{AGE_RANGES.map(a => <option key={a}>{a}</option>)}</select></div>
                  <div className="fg"><label className="fl">Source</label><select className="fs" value={f.source} onChange={e => u("source", e.target.value)}>{SOURCES.map(s => <option key={s}>{s}</option>)}</select></div>
                </div>
                <div className="fr">
                  <div className="fg"><label className="fl">Budget</label><select className="fs" value={f.budget} onChange={e => u("budget", e.target.value)}><option value="">Select</option>{BUDGET_RANGES.map(b => <option key={b}>{b}</option>)}</select></div>
                  <div className="fg"><label className="fl">Coverage</label><select className="fs" value={f.coverage} onChange={e => u("coverage", e.target.value)}><option value="">Select</option>{COVERAGE_RANGES.map(c => <option key={c}>{c}</option>)}</select></div>
                </div>
                <button className="btn btn-p btn-s" onClick={save} style={{ marginTop: 6 }}><Icon name="check" size={12} /> Save</button>
              </>
            )}
          </div>

          {/* Notes */}
          <div className="ds">
            <div className="ds-t">Notes</div>
            <textarea
              className="lead-notepad"
              style={{ minHeight: 150, marginBottom: 0 }}
              placeholder="Type notes here..."
              value={lead.notepad || ""}
              onChange={e => onUpdate({ notepad: e.target.value })}
            />
          </div>

          {/* Activity */}
          <div className="ds">
            <div className="ds-t">Activity</div>
            {(lead.activity || []).slice(0, 12).map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: "1px solid var(--border)", fontSize: 11 }}>
                <span style={{ color: "var(--text-3)", minWidth: 60 }}>{timeAgo(a.time)}</span>
                <span style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, fontSize: 9, color: a.type === "stage" ? "var(--accent-lt)" : a.type === "note" ? "var(--warning)" : "var(--success)" }}>{a.type}</span>
                <span style={{ color: "var(--text-2)" }}>{a.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProdModal({ onClose, onSave }) {
  const [f, sf] = useState({ clientName: "", product: "Whole Life", premium: "", commission: "", notes: "" });
  const u = (k, v) => sf(p => ({ ...p, [k]: v }));
  return (
    <div className="mo" onClick={onClose}>
      <div className="md" onClick={e => e.stopPropagation()}>
        <div className="md-h"><h2>Log Sale</h2><button className="md-x" onClick={onClose}><Icon name="x" size={18} /></button></div>
        <div className="md-b">
          <div className="fg"><label className="fl">Client Name</label><input className="fi" value={f.clientName} onChange={e => u("clientName", e.target.value)} placeholder="John Smith" /></div>
          <div className="fg"><label className="fl">Product</label><select className="fs" value={f.product} onChange={e => u("product", e.target.value)}>
            <option>Whole Life</option><option>Term Life</option><option>Final Expense</option><option>Other</option>
          </select></div>
          <div className="fr">
            <div className="fg"><label className="fl">Annual Premium ($)</label><input className="fi" type="number" value={f.premium} onChange={e => u("premium", e.target.value)} placeholder="1200" /></div>
            <div className="fg"><label className="fl">Commission ($)</label><input className="fi" type="number" value={f.commission} onChange={e => u("commission", e.target.value)} placeholder="800" /></div>
          </div>
          <div className="fg"><label className="fl">Notes</label><textarea className="ft" value={f.notes} onChange={e => u("notes", e.target.value)} placeholder="Sale details..." /></div>
        </div>
        <div className="md-f">
          <button className="btn btn-g" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={() => onSave(f)} disabled={!f.clientName}>Log Sale</button>
        </div>
      </div>
    </div>
  );
}

function GoalsModal({ goals, onClose, onSave }) {
  const [f, sf] = useState({ ...goals });
  const u = (k, v) => sf(p => ({ ...p, [k]: parseFloat(v) || 0 }));
  return (
    <div className="mo" onClick={onClose}>
      <div className="md" onClick={e => e.stopPropagation()}>
        <div className="md-h"><h2>Monthly Goals</h2><button className="md-x" onClick={onClose}><Icon name="x" size={18} /></button></div>
        <div className="md-b">
          <div className="fg"><label className="fl">Policies per Month</label><input className="fi" type="number" value={f.monthlyPolicies} onChange={e => u("monthlyPolicies", e.target.value)} /></div>
          <div className="fg"><label className="fl">Monthly Premium Target ($)</label><input className="fi" type="number" value={f.monthlyPremium} onChange={e => u("monthlyPremium", e.target.value)} /></div>
          <div className="fg"><label className="fl">Monthly Commission Target ($)</label><input className="fi" type="number" value={f.monthlyCommission} onChange={e => u("monthlyCommission", e.target.value)} /></div>
        </div>
        <div className="md-f">
          <button className="btn btn-g" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={() => onSave(f)}>Save Goals</button>
        </div>
      </div>
    </div>
  );
}

function BookModal({ entry, onClose, onSave, onDelete }) {
  const isEdit = !!entry;
  const [f, sf] = useState(entry ? { ...entry } : {
    clientName: "", phone: "", email: "", policyType: "Whole Life", carrier: "",
    premium: "", commission: "", coverageAmount: "", policyNumber: "", status: "pending", notepad: "",
  });
  const u = (k, v) => sf(p => ({ ...p, [k]: v }));
  return (
    <div className="mo" onClick={onClose}>
      <div className="md md-w" onClick={e => e.stopPropagation()}>
        <div className="md-h">
          <h2>{isEdit ? "Edit Policy" : "Add Policy"}</h2>
          <div style={{ display: "flex", gap: 5 }}>
            {isEdit && onDelete && <button className="btn btn-d btn-s" onClick={onDelete}><Icon name="trash" size={12} /> Delete</button>}
            <button className="md-x" onClick={onClose}><Icon name="x" size={18} /></button>
          </div>
        </div>
        <div className="md-b">
          <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 10, paddingBottom: 5, borderBottom: "1px solid var(--border)" }}>Client Info</div>
          <div className="fg"><label className="fl">Client Name</label><input className="fi" value={f.clientName} onChange={e => u("clientName", e.target.value)} placeholder="John Smith" /></div>
          <div className="fr">
            <div className="fg"><label className="fl">Phone</label><input className="fi" value={f.phone} onChange={e => u("phone", e.target.value)} placeholder="(555) 123-4567" /></div>
            <div className="fg"><label className="fl">Email</label><input className="fi" value={f.email} onChange={e => u("email", e.target.value)} placeholder="john@email.com" /></div>
          </div>

          <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 10, marginTop: 16, paddingBottom: 5, borderBottom: "1px solid var(--border)" }}>Policy Details</div>
          <div className="fr">
            <div className="fg"><label className="fl">Policy Type</label>
              <select className="fs" value={f.policyType} onChange={e => u("policyType", e.target.value)}>
                {POLICY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl">Carrier</label>
              <select className="fs" value={f.carrier} onChange={e => u("carrier", e.target.value)}>
                <option value="">Select carrier</option>
                {CARRIERS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="fr">
            <div className="fg"><label className="fl">Policy Number</label><input className="fi" value={f.policyNumber} onChange={e => u("policyNumber", e.target.value)} placeholder="POL-123456" /></div>
            <div className="fg"><label className="fl">Status</label>
              <select className="fs" value={f.status} onChange={e => u("status", e.target.value)}>
                {POLICY_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="fr">
            <div className="fg"><label className="fl">Coverage Amount</label><input className="fi" value={f.coverageAmount} onChange={e => u("coverageAmount", e.target.value)} placeholder="$100,000" /></div>
            <div className="fg"><label className="fl">Annual Premium ($)</label><input className="fi" type="number" value={f.premium} onChange={e => u("premium", e.target.value)} placeholder="1200" /></div>
          </div>
          <div className="fg"><label className="fl">Commission ($)</label><input className="fi" type="number" value={f.commission} onChange={e => u("commission", e.target.value)} placeholder="800" style={{ width: "calc(50% - 6px)" }} /></div>

          <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 10, marginTop: 16, paddingBottom: 5, borderBottom: "1px solid var(--border)" }}>Notes</div>
          <textarea
            className="lead-notepad"
            style={{ minHeight: 100 }}
            placeholder="Policy notes..."
            value={f.notepad || ""}
            onChange={e => u("notepad", e.target.value)}
          />
        </div>
        <div className="md-f">
          <button className="btn btn-g" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={() => onSave(f)} disabled={!f.clientName}>{isEdit ? "Save Changes" : "Add Policy"}</button>
        </div>
      </div>
    </div>
  );
}
