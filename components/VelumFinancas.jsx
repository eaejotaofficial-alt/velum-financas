'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";
import {
  Home, ArrowDownCircle, ArrowUpCircle, Repeat, Layers, AlertTriangle, Target,
  ClipboardList, Bell, Settings, Search, Plus, X, Check, Edit3, Trash2, Sun, Moon,
  ChevronRight, ChevronLeft, Menu, LogOut, Sparkles, TrendingUp, TrendingDown,
  Wallet, PiggyBank, CreditCard, DollarSign, Calendar, Filter, Download, Smartphone,
  Monitor, Eye, EyeOff, Send, Loader2, Command, Keyboard, Zap, Coffee, Car, Heart,
  Cpu, Receipt, Package, Briefcase, Users, Home as HouseIcon, GraduationCap,
} from "lucide-react";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";

/* =========================================================================
   VELUM FINANÇAS — Single-file React app
   Designed for direct paste into v0/Next.js (extract sub-components as needed).
   ========================================================================= */

/* ---------- Fonts (Geist Sans + Geist Mono via Google Fonts) ---------- */
const FONT_CSS = `
.velum-mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
@keyframes velum-fade-in { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
@keyframes velum-scale-in { from { opacity: 0; transform: scale(.96) } to { opacity: 1; transform: scale(1) } }
@keyframes velum-pulse { 0%, 100% { opacity: 1; transform: scale(1) } 50% { opacity: .7; transform: scale(1.08) } }
@keyframes velum-shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
@keyframes velum-orbit { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
.velum-fade { animation: velum-fade-in .4s cubic-bezier(.2,.7,.2,1) both }
.velum-scale { animation: velum-scale-in .3s cubic-bezier(.2,.7,.2,1) both }
.velum-pulse { animation: velum-pulse 2.4s ease-in-out infinite }
.velum-shimmer { background: linear-gradient(90deg, transparent, rgba(0,0,0,.06), transparent); background-size: 200% 100%; animation: velum-shimmer 1.4s linear infinite }
.dark .velum-shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent); background-size: 200% 100% }
.velum-orbit { animation: velum-orbit 20s linear infinite }
.velum-stagger > * { animation: velum-fade-in .5s cubic-bezier(.2,.7,.2,1) both }
.velum-stagger > *:nth-child(1) { animation-delay: .02s }
.velum-stagger > *:nth-child(2) { animation-delay: .06s }
.velum-stagger > *:nth-child(3) { animation-delay: .10s }
.velum-stagger > *:nth-child(4) { animation-delay: .14s }
.velum-stagger > *:nth-child(5) { animation-delay: .18s }
.velum-stagger > *:nth-child(6) { animation-delay: .22s }
.velum-stagger > *:nth-child(7) { animation-delay: .26s }
.velum-stagger > *:nth-child(8) { animation-delay: .30s }
/* Slider */
.velum-slider { -webkit-appearance: none; appearance: none; height: 6px; border-radius: 999px; background: var(--velum-track); outline: none; }
.velum-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 999px; background: var(--velum-accent); border: 2px solid var(--velum-bg); cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: transform .15s }
.velum-slider::-webkit-slider-thumb:hover { transform: scale(1.15) }
.velum-slider::-moz-range-thumb { width: 18px; height: 18px; border-radius: 999px; background: var(--velum-accent); border: 2px solid var(--velum-bg); cursor: pointer }
/* Scrollbar */
.velum-scroll::-webkit-scrollbar { width: 8px; height: 8px }
.velum-scroll::-webkit-scrollbar-track { background: transparent }
.velum-scroll::-webkit-scrollbar-thumb { background: var(--velum-border); border-radius: 4px }
.velum-scroll::-webkit-scrollbar-thumb:hover { background: var(--velum-text-muted) }
/* Number input no spin */
.velum-num::-webkit-outer-spin-button, .velum-num::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0 }
.velum-num { -moz-appearance: textfield }
`;

/* ---------- Accent palette (light + dark variants for contrast) ---------- */
const ACCENTS = {
  orange: { light: "#FF6A00", dark: "#FF8A3D", soft: "rgba(255,106,0,.10)", softDark: "rgba(255,138,61,.14)" },
  red:    { light: "#DC2626", dark: "#F87171", soft: "rgba(220,38,38,.10)",  softDark: "rgba(248,113,113,.14)" },
  pink:   { light: "#DB2777", dark: "#F472B6", soft: "rgba(219,39,119,.10)", softDark: "rgba(244,114,182,.14)" },
  purple: { light: "#7C3AED", dark: "#A78BFA", soft: "rgba(124,58,237,.10)", softDark: "rgba(167,139,250,.14)" },
  green:  { light: "#16A34A", dark: "#4ADE80", soft: "rgba(22,163,74,.10)",  softDark: "rgba(74,222,128,.14)" },
  yellow: { light: "#CA8A04", dark: "#FACC15", soft: "rgba(202,138,4,.12)",  softDark: "rgba(250,204,21,.14)" },
  blue:   { light: "#2563EB", dark: "#60A5FA", soft: "rgba(37,99,235,.10)",  softDark: "rgba(96,165,250,.14)" },
};
const ACCENT_LABELS = {
  orange: "Laranja", red: "Vermelho", pink: "Rosa", purple: "Roxo",
  green: "Verde", yellow: "Amarelo", blue: "Azul",
};

/* ---------- Storage abstraction (localStorage) ---------- */
const storage = {
  async get(key) {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  async set(key, value) {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  },
  async del(key) {
    if (typeof window === "undefined") return;
    try { localStorage.removeItem(key); } catch {}
  },
};

/* ---------- Helpers ---------- */
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const fmtBRL = (n) =>
  (typeof n === "number" ? n : Number(n) || 0).toLocaleString("pt-BR", {
    style: "currency", currency: "BRL", minimumFractionDigits: 2,
  });
const fmtShort = (n) => {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1).replace(".0", "") + "M";
  if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(1).replace(".0", "") + "k";
  return v.toFixed(0);
};
const cls = (...a) => a.filter(Boolean).join(" ");
const todayISO = () => new Date().toISOString().slice(0, 10);
const monthLabel = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
};

/* ---------- Count-up hook for animated numbers ---------- */
function useCountUp(target, duration = 700) {
  const [val, setVal] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current; const to = target; const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

/* ---------- Theme context ---------- */
const ThemeCtx = createContext(null);
const useTheme = () => useContext(ThemeCtx);

function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light"); // 'light' | 'dark'
  const [accent, setAccent] = useState("orange");
  const [hideValues, setHideValues] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await storage.get("velum:settings");
      if (s) {
        if (s.mode) setMode(s.mode);
        if (s.accent && ACCENTS[s.accent]) setAccent(s.accent);
        if (typeof s.hideValues === "boolean") setHideValues(s.hideValues);
      } else if (typeof window !== "undefined") {
        const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
        setMode(prefersDark ? "dark" : "light");
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    storage.set("velum:settings", { mode, accent, hideValues });
  }, [mode, accent, hideValues, ready]);

  const palette = useMemo(() => {
    const isDark = mode === "dark";
    const a = ACCENTS[accent];
    return {
      isDark,
      bg:         isDark ? "#0A0A0B" : "#FFFFFF",
      surface:    isDark ? "#111113" : "#FAFAFA",
      surface2:   isDark ? "#17171A" : "#F4F4F5",
      border:     isDark ? "#27272A" : "#E4E4E7",
      borderSoft: isDark ? "#1F1F22" : "#EFEFF1",
      text:       isDark ? "#FAFAFA" : "#0A0A0B",
      textMuted:  isDark ? "#A1A1AA" : "#71717A",
      textDim:    isDark ? "#71717A" : "#A1A1AA",
      accent:     isDark ? a.dark : a.light,
      accentSoft: isDark ? a.softDark : a.soft,
      accentRaw:  a,
      success:    isDark ? "#4ADE80" : "#16A34A",
      warning:    isDark ? "#FACC15" : "#CA8A04",
      danger:     isDark ? "#F87171" : "#DC2626",
    };
  }, [mode, accent]);

  const cssVars = {
    "--velum-bg": palette.bg, "--velum-surface": palette.surface, "--velum-surface2": palette.surface2,
    "--velum-border": palette.border, "--velum-border-soft": palette.borderSoft,
    "--velum-text": palette.text, "--velum-text-muted": palette.textMuted, "--velum-text-dim": palette.textDim,
    "--velum-accent": palette.accent, "--velum-accent-soft": palette.accentSoft,
    "--velum-success": palette.success, "--velum-warning": palette.warning, "--velum-danger": palette.danger,
    "--velum-track": palette.borderSoft,
  };

  return (
    <ThemeCtx.Provider value={{ mode, setMode, accent, setAccent, hideValues, setHideValues, palette, ready, maskFmtBRL: (v) => hideValues ? "R$ ••••" : fmtBRL(v) }}>
      <div className={cls("velum-root", mode === "dark" && "dark")} style={cssVars}>
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

/* ---------- Logo components (driven by currentColor) ---------- */
function LogoMark({ size = 28, className = "" }) {
  return (
    <svg viewBox="0 0 598.41 515.4" width={size} height={(size * 515.4) / 598.41} className={className} aria-label="Velum">
      <path
        fill="currentColor"
        d="M474.61,126.34c-48.87,14.98-95.71,36.35-141.75,58.21-9,6.58-4.14,20.8,7.95,18.94,8.18-1.26,32.36-14.97,41.89-19.11,43.43-18.85,92.99-39.37,139.49-48.48,28.14-5.51,68.85-11.32,48.37,31.34-15.6,32.49-83.45,93.68-115.26,111.66-91.44,51.69-131.46-56.08-174.09-113.66C235.14,103,159.37,27.27,83.37,5.21,32.98-9.42-15.85,5.46,4.89,66.64l187.48,353.72c-44.76,14.9-96.41,33.38-144.37,28.86-41.91-3.94-22.69-34.57-6.59-55.28,12.18-15.67,28.35-30.61,43.49-43.48,5.18-4.41,27.39-19.84,29.34-23.64,3.06-5.95.06-13.78-6.6-15.13-6.64-1.35-9.33,2.03-14.16,5.37-28.91,19.98-89.2,74.76-92.09,110.82-3.48,43.53,51.08,45.21,81.47,42.44,40.89-3.73,80.48-17.44,118.91-30.83,2.29.55,19.25,35.4,22.43,40.5,28.5,45.7,91.67,47.2,123.58,4.23,24.72-33.28,44.77-72.82,69.44-106.48,5.2-11.94-7.8-20.72-17.38-12.37l-70.05,107.86c-14.41,18.24-39.47,25.52-61.4,17.56-26.16-9.5-32.5-37.62-45.99-58.95,89.67-37.48,175.95-84.03,254.29-141.56,36.73-26.97,120.42-93.92,121.7-142.24,1.56-58.75-92.66-31.25-123.78-21.71ZM393.87,322.45c-7.68.83-36.66,20.1-45.82,25.16-30.86,17.03-62.82,33.54-95,47.96-13.23,5.93-26.99,12.37-40.68,16.39L26.21,62.33c-9.17-16.38-8.2-38.18,13.93-41.38,28.53-4.12,73.99,18.27,97.77,33.68,54.57,35.38,101.34,87.58,138.29,140.6,28.07,40.28,56.59,101.78,108.17,114.73,9.57,2.4,19.31,2.67,29.07,3.92,4.49,11.98-12.65,7.81-19.56,8.56Z"
      />
    </svg>
  );
}
function LogoHorizontal({ height = 28, className = "" }) {
  return (
    <svg viewBox="0 0 1664.59 515.4" height={height} width={(height * 1664.59) / 515.4} className={className} aria-label="Velum Finanças">
      <g fill="currentColor">
        <path d="M1473,262.83c27.65-3.74,53.04,2.08,68.65,26.49l2.55-.8c15.86-26.72,54.92-32.49,81.96-21.38,56.59,23.24,32.35,103.48,37.69,151.03-2.76,12.88-17.33,14.43-21.62,1.24-3.25-31.99,3.2-69.09-.55-100.44-4.02-33.59-46.02-47.36-72.14-28.69-30.46,21.77-11.74,95.3-17.07,129.38-1.87,11.97-18.19,11.51-20.07,1.76-5.9-44.65,23.3-145.38-51.49-138.9-62.22,5.39-32.34,96.58-39.87,136.89-4.84,13.98-20.24,11.4-21.64-2.9-2.13-21.82-2.24-88.67,2.97-108.33,5.95-22.44,27.56-42.23,50.63-45.35Z"/>
        <path d="M1319.52,409.92c-34.62,34.59-99.96,24.18-118.13-23-7.96-20.68-8.53-86.85-5.92-110.22,1.92-17.25,18.9-16.64,21.54-4.69,2.62,29.92-2.24,62.71.3,92.27,3.79,44.14,58.19,60.66,87.73,30.31,25.9-26.62,6.75-92.43,14.99-126.41,11.86-9.63,19.09-3.94,20.38,10.14,2.2,24,2.19,87.33-5.98,108.61-2.65,6.91-9.7,17.81-14.89,22.99Z"/>
        <path d="M674.53,266.19l58.54,135.9,54.39-130.79c8.42-14.32,25.51-7.18,19.77,9.66l-59.52,139.14c-6.23,12.01-23.32,12.44-30.41,1.11-15.72-45.93-44.15-92.51-58.82-138.15-4.71-14.66.37-23.15,16.04-16.87Z"/>
        <path d="M1100.66,193.73c3.31-.74,7.07-1.02,9.86,1.22,3.44,3.2,3.77,6.6,4.16,10.98,6.07,66.81-4.74,142.73-.04,210.51-1.8,15.54-18.6,16.35-22.02,1.73l.05-213.88c.15-5.15,2.74-9.39,7.99-10.57Z"/>
        <path d="M474.61,126.34c-48.87,14.98-95.71,36.35-141.75,58.21-9,6.58-4.14,20.8,7.95,18.94,8.18-1.26,32.36-14.97,41.89-19.11,43.43-18.85,92.99-39.37,139.49-48.48,28.14-5.51,68.85-11.32,48.37,31.34-15.6,32.49-83.45,93.68-115.26,111.66-91.44,51.69-131.46-56.08-174.09-113.66C235.14,103,159.37,27.27,83.37,5.21,32.98-9.42-15.85,5.46,4.89,66.64l187.48,353.72c-44.76,14.9-96.41,33.38-144.37,28.86-41.91-3.94-22.69-34.57-6.59-55.28,12.18-15.67,28.35-30.61,43.49-43.48,5.18-4.41,27.39-19.84,29.34-23.64,3.06-5.95.06-13.78-6.6-15.13-6.64-1.35-9.33,2.03-14.16,5.37-28.91,19.98-89.2,74.76-92.09,110.82-3.48,43.53,51.08,45.21,81.47,42.44,40.89-3.73,80.48-17.44,118.91-30.83,2.29.55,19.25,35.4,22.43,40.5,28.5,45.7,91.67,47.2,123.58,4.23,24.72-33.28,44.77-72.82,69.44-106.48,5.2-11.94-7.8-20.72-17.38-12.37l-70.05,107.86c-14.41,18.24-39.47,25.52-61.4,17.56-26.16-9.5-32.5-37.62-45.99-58.95,89.67-37.48,175.95-84.03,254.29-141.56,36.73-26.97,120.42-93.92,121.7-142.24,1.56-58.75-92.66-31.25-123.78-21.71ZM393.87,322.45c-7.68.83-36.66,20.1-45.82,25.16-30.86,17.03-62.82,33.54-95,47.96-13.23,5.93-26.99,12.37-40.68,16.39L26.21,62.33c-9.17-16.38-8.2-38.18,13.93-41.38,28.53-4.12,73.99,18.27,97.77,33.68,54.57,35.38,101.34,87.58,138.29,140.6,28.07,40.28,56.59,101.78,108.17,114.73,9.57,2.4,19.31,2.67,29.07,3.92,4.49,11.98-12.65,7.81-19.56,8.56Z"/>
        <path d="M1012.17,306.68c-29.85-66.08-131.48-56.34-151.09,12.94-21.11,74.58,50.39,135.39,120.42,101.81,8.99-4.31,31.41-18.82,23.48-30.14-8-11.41-21.52,5.12-29.06,9.41-41.75,23.71-91.41.79-97.14-47.41h132.23c.38,0,5.38-3.88,5.93-4.61,6.19-8.22-.53-32.63-4.77-42ZM880.46,333.09c9.18-67.03,108.45-67.81,117.92,0h-117.92Z"/>
        <rect x="1092.62" y="193.19" width="23.97" height="235.44" rx="7.11" ry="7.11"/>
      </g>
    </svg>
  );
}

/* ---------- UI primitives ---------- */
function Button({ children, variant = "primary", size = "md", icon: Icon, onClick, disabled, className = "", type = "button", title }) {
  const sizes = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-3.5 py-2 text-sm gap-2",
    lg: "px-5 py-3 text-base gap-2",
  };
  const variants = {
    primary: { background: "var(--velum-accent)", color: "white", border: "1px solid var(--velum-accent)" },
    ghost:   { background: "transparent", color: "var(--velum-text)", border: "1px solid transparent" },
    outline: { background: "transparent", color: "var(--velum-text)", border: "1px solid var(--velum-border)" },
    soft:    { background: "var(--velum-accent-soft)", color: "var(--velum-accent)", border: "1px solid transparent" },
    danger:  { background: "var(--velum-danger)", color: "white", border: "1px solid var(--velum-danger)" },
    surface: { background: "var(--velum-surface2)", color: "var(--velum-text)", border: "1px solid var(--velum-border)" },
  };
  return (
    <button
      type={type} onClick={onClick} disabled={disabled} title={title}
      className={cls(
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150",
        "hover:opacity-90 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed",
        sizes[size], className
      )}
      style={variants[variant]}
    >
      {Icon && <Icon size={size === "sm" ? 14 : size === "lg" ? 18 : 16} strokeWidth={2} />}
      {children}
    </button>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", icon: Icon, suffix, autoFocus, onKeyDown, className = "" }) {
  return (
    <label className={cls("block", className)}>
      {label && <span className="block text-xs font-medium mb-1.5" style={{ color: "var(--velum-text-muted)" }}>{label}</span>}
      <div className="relative flex items-center">
        {Icon && <Icon size={15} className="absolute left-3 pointer-events-none" style={{ color: "var(--velum-text-muted)" }} />}
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder} autoFocus={autoFocus} onKeyDown={onKeyDown}
          className={cls(
            "w-full rounded-lg outline-none transition-all duration-150 text-sm",
            "focus:ring-2 focus:ring-offset-0",
            type === "number" && "velum-num",
            Icon ? "pl-9" : "pl-3", suffix ? "pr-12" : "pr-3", "py-2.5"
          )}
          style={{
            background: "var(--velum-surface)", color: "var(--velum-text)",
            border: "1px solid var(--velum-border)",
            boxShadow: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--velum-accent)")}
          onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--velum-border)")}
        />
        {suffix && <span className="absolute right-3 text-xs velum-mono" style={{ color: "var(--velum-text-muted)" }}>{suffix}</span>}
      </div>
    </label>
  );
}

function Select({ label, value, onChange, options, className = "" }) {
  return (
    <label className={cls("block", className)}>
      {label && <span className="block text-xs font-medium mb-1.5" style={{ color: "var(--velum-text-muted)" }}>{label}</span>}
      <select
        value={value} onChange={onChange}
        className="w-full px-3 py-2.5 rounded-lg outline-none transition-colors text-sm appearance-none cursor-pointer"
        style={{
          background: "var(--velum-surface)", color: "var(--velum-text)",
          border: "1px solid var(--velum-border)",
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpolyline points='3 5 6 8 9 5'/%3e%3c/svg%3e")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "32px",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function Card({ children, className = "", style = {}, hover = false }) {
  return (
    <div
      className={cls("rounded-xl transition-all duration-200", hover && "hover:-translate-y-0.5", className)}
      style={{
        background: "var(--velum-surface)",
        border: "1px solid var(--velum-border)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Modal({ open, onClose, title, children, footer, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);
  if (!open) return null;
  const widths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 velum-fade" style={{ background: "rgba(0,0,0,.5)" }} onClick={onClose}>
      <div
        className={cls("w-full rounded-2xl velum-scale", widths[size])}
        style={{ background: "var(--velum-bg)", border: "1px solid var(--velum-border)", boxShadow: "0 25px 50px -12px rgba(0,0,0,.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--velum-border-soft)" }}>
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:opacity-70" style={{ color: "var(--velum-text-muted)" }} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto velum-scroll">{children}</div>
        {footer && <div className="px-5 py-4 flex items-center justify-end gap-2" style={{ borderTop: "1px solid var(--velum-border-soft)" }}>{footer}</div>}
      </div>
    </div>
  );
}

/* =========================================================================
   STATUS — Verde / Amarelo / Vermelho com base no saldo do mês
   ========================================================================= */
function computeStatus({ incomes = [], fixed = [], variable = [], goalsSavingsPct = 0 }) {
  const totalIn = incomes.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalOutFixed = fixed.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalOutVar = variable.reduce((s, i) => s + Number(i.amount || 0), 0);
  const totalOut = totalOutFixed + totalOutVar;
  const balance = totalIn - totalOut;
  const surplusPct = totalIn > 0 ? balance / totalIn : 0;
  const targetSavings = Math.max(0.1, goalsSavingsPct / 100);
  let level = "green";
  let label = "On the track";
  if (surplusPct < 0) { level = "red"; label = "Tá no serrote!"; }
  else if (surplusPct < targetSavings) { level = "yellow"; label = "Caution Cowboy"; }
  return { level, label, balance, totalIn, totalOut, totalOutFixed, totalOutVar, surplusPct };
}

/* =========================================================================
   LOGIN SCREEN
   ========================================================================= */
function LoginScreen({ onAuth }) {
  const { palette } = useTheme();
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const submit = async (e) => {
    e?.preventDefault();
    setErr(""); setInfo("");
    if (!email || !pwd) { setErr("Preencha e-mail e senha."); return; }
    if (pwd.length < 6) { setErr("Senha precisa ter pelo menos 6 caracteres."); return; }
    setLoading(true);

    try {
      if (isSupabaseEnabled) {
        if (mode === "signup") {
          const { data, error } = await supabase.auth.signUp({ email, password: pwd });
          if (error) throw error;
          if (data.user && !data.session) {
            // Email confirmation required
            setInfo("Conta criada! Verifica seu e-mail para confirmar antes de entrar.");
            setMode("login");
            setLoading(false);
            return;
          }
          if (data.session) {
            onAuth({ email: data.user.email, id: data.user.id });
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password: pwd });
          if (error) throw error;
          onAuth({ email: data.user.email, id: data.user.id });
        }
      } else {
        // Local fallback (no Supabase configured)
        await new Promise((r) => setTimeout(r, 450));
        await storage.set("velum:auth", { email, at: Date.now() });
        onAuth({ email });
      }
    } catch (e) {
      const msg = e?.message || String(e);
      // Translate common Supabase errors to PT-BR
      if (msg.includes("Invalid login credentials")) setErr("E-mail ou senha incorretos.");
      else if (msg.includes("User already registered")) setErr("E-mail já cadastrado. Entra direto.");
      else if (msg.includes("Email not confirmed")) setErr("Você precisa confirmar o e-mail antes de entrar.");
      else setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-[1.1fr_1fr]" style={{ background: "var(--velum-bg)", color: "var(--velum-text)" }}>
      {/* Left: PUV + brand panel */}
      <div className="relative overflow-hidden hidden lg:flex flex-col justify-between p-10 xl:p-14" style={{ background: palette.accent, color: "white" }}>
        <div className="absolute inset-0 opacity-[0.07] velum-orbit" style={{ pointerEvents: "none" }}>
          <LogoMark size={900} className="absolute -right-40 -bottom-60" />
        </div>
        <div className="relative">
          <LogoHorizontal height={36} />
        </div>
        <div className="relative max-w-xl velum-fade">
          <h1 className="text-3xl xl:text-[42px] leading-[1.05] font-medium tracking-tight">
            Finanças 360 adaptada ao seu <em className="not-italic font-semibold">modo de vida</em>.
          </h1>
          <p className="mt-5 text-base xl:text-lg opacity-90 leading-relaxed">
            Sem promessas nem fórmula pronta. Só organização pessoal e otimização financeira para crescer com o que você já tem.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-3 text-[11px] uppercase tracking-wider opacity-80">
            <div><div className="text-2xl font-semibold tracking-tight opacity-100">360°</div><div className="mt-1">Cobertura</div></div>
            <div><div className="text-2xl font-semibold tracking-tight opacity-100">0</div><div className="mt-1">Fórmulas prontas</div></div>
            <div><div className="text-2xl font-semibold tracking-tight opacity-100">24h</div><div className="mt-1">Análise contínua</div></div>
          </div>
        </div>
        <div className="relative text-xs opacity-70">© Velum Finanças · feito para você crescer com o que tem.</div>
      </div>

      {/* Right: auth form */}
      <div className="flex flex-col justify-center p-6 sm:p-10">
        <div className="max-w-sm w-full mx-auto velum-fade">
          <div className="lg:hidden flex items-center mb-8" style={{ color: palette.accent }}>
            <LogoHorizontal height={28} />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {mode === "login" ? "Entre na sua conta" : "Crie sua conta"}
          </h2>
          <p className="text-sm mt-2" style={{ color: "var(--velum-text-muted)" }}>
            {mode === "login" ? "Bom te ver de volta." : "Comece pela configuração e pelo seu ritmo."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <Input label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" autoFocus />
            <div className="relative">
              <Input label="Senha" type={showPwd ? "text" : "password"} value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" suffix={null} />
              <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-[34px] p-1" style={{ color: "var(--velum-text-muted)" }} aria-label="Mostrar senha">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {err && <p className="text-xs" style={{ color: "var(--velum-danger)" }}>{err}</p>}
            {info && <p className="text-xs" style={{ color: "var(--velum-success)" }}>{info}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          {!isSupabaseEnabled && (
            <div className="mt-4 p-3 rounded-lg text-[11px] leading-relaxed" style={{ background: "var(--velum-surface2)", color: "var(--velum-text-muted)", border: "1px solid var(--velum-border-soft)" }}>
              <strong style={{ color: "var(--velum-text)" }}>Modo local ativo.</strong> Seus dados ficam só nesse dispositivo. Pra ativar login real (e acessar de qualquer aparelho), configure as variáveis <code className="velum-mono">NEXT_PUBLIC_SUPABASE_URL</code> e <code className="velum-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no painel da Vercel.
            </div>
          )}

          <div className="mt-6 flex items-center gap-3 text-xs" style={{ color: "var(--velum-text-muted)" }}>
            <div className="flex-1 h-px" style={{ background: "var(--velum-border)" }} />
            <span>ou</span>
            <div className="flex-1 h-px" style={{ background: "var(--velum-border)" }} />
          </div>

          <button
            onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
            className="mt-6 text-sm w-full text-center hover:underline"
            style={{ color: "var(--velum-text)" }}
          >
            {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
            <span style={{ color: "var(--velum-accent)", fontWeight: 500 }}>
              {mode === "login" ? "Criar agora" : "Entrar"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   ONBOARDING — Mini questionário de configurações iniciais
   ========================================================================= */
function Onboarding({ onDone }) {
  const { palette, accent, setAccent } = useTheme();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: "",
    income: 5000,
    members: 1,
    vehicles: 0,
    pets: 0,
    rent: 0,
    savingsTarget: 20,
  });

  const steps = [
    { key: "welcome", title: "Vamos te conhecer", subtitle: "Tudo isso pode ser editado depois." },
    { key: "name", title: "Como podemos te chamar?", subtitle: "Apenas seu primeiro nome." },
    { key: "income", title: "Qual sua renda mensal líquida?", subtitle: "Aproximada está ótimo. Você ajusta depois." },
    { key: "household", title: "Sua casa", subtitle: "Para a gente entender seu contexto de vida." },
    { key: "savings", title: "Meta de poupar", subtitle: "Quanto da sua renda você quer guardar todo mês?" },
    { key: "accent", title: "Escolha sua cor", subtitle: "Você pode trocar quando quiser nas Configurações." },
  ];
  const total = steps.length;
  const cur = steps[step];
  const next = () => setStep((s) => Math.min(s + 1, total - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    await storage.set("velum:profile", data);
    await storage.set("velum:onboarded", true);
    if (data.rent > 0) {
      const fx = (await storage.get("velum:fixed")) || [];
      fx.push({ id: uid(), label: "Moradia", amount: Number(data.rent), category: "housing", day: 5, active: true });
      await storage.set("velum:fixed", fx);
    }
    const inc = (await storage.get("velum:incomes")) || [];
    if (inc.length === 0 && data.income > 0) {
      inc.push({ id: uid(), label: "Renda principal", amount: Number(data.income), source: "Salário", recurring: true, date: todayISO() });
      await storage.set("velum:incomes", inc);
    }
    onDone(data);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: "var(--velum-bg)", color: "var(--velum-text)" }}>
      <Card className="w-full max-w-xl p-6 sm:p-8 velum-scale">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--velum-text-muted)" }}>
            <LogoMark size={18} className="" />
            <span className="velum-mono">{String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
          </div>
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className="h-1 rounded-full transition-all duration-300" style={{
                width: i === step ? 28 : 14,
                background: i <= step ? "var(--velum-accent)" : "var(--velum-border)",
              }} />
            ))}
          </div>
        </div>

        <div key={cur.key} className="velum-fade">
          <h2 className="text-2xl font-semibold tracking-tight">{cur.title}</h2>
          <p className="text-sm mt-2 mb-6" style={{ color: "var(--velum-text-muted)" }}>{cur.subtitle}</p>

          {cur.key === "welcome" && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed" style={{ color: "var(--velum-text)" }}>
                Em <strong>6 passos rápidos</strong> a gente monta a base do seu Velum. Você pode pular qualquer pergunta e voltar depois.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4">
                  <Wallet size={18} style={{ color: "var(--velum-accent)" }} />
                  <p className="text-sm font-medium mt-2">Renda e moradia</p>
                  <p className="text-xs mt-1" style={{ color: "var(--velum-text-muted)" }}>Base do seu pipe financeiro.</p>
                </Card>
                <Card className="p-4">
                  <Target size={18} style={{ color: "var(--velum-accent)" }} />
                  <p className="text-sm font-medium mt-2">Sua meta de poupar</p>
                  <p className="text-xs mt-1" style={{ color: "var(--velum-text-muted)" }}>Define o seu status verde.</p>
                </Card>
              </div>
            </div>
          )}

          {cur.key === "name" && (
            <Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="João" autoFocus
              onKeyDown={(e) => e.key === "Enter" && next()} />
          )}

          {cur.key === "income" && (
            <div className="space-y-4">
              <Input type="number" value={data.income}
                onChange={(e) => setData({ ...data, income: Number(e.target.value) || 0 })}
                suffix="R$" icon={DollarSign} placeholder="5000" autoFocus
                onKeyDown={(e) => e.key === "Enter" && next()} />
              <div className="text-xs velum-mono px-1" style={{ color: "var(--velum-text-muted)" }}>{fmtBRL(data.income)}</div>
            </div>
          )}

          {cur.key === "household" && (
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" label="Membros da família" value={data.members} onChange={(e) => setData({ ...data, members: Number(e.target.value) || 0 })} icon={Users} />
              <Input type="number" label="Veículos" value={data.vehicles} onChange={(e) => setData({ ...data, vehicles: Number(e.target.value) || 0 })} icon={Car} />
              <Input type="number" label="Pets" value={data.pets} onChange={(e) => setData({ ...data, pets: Number(e.target.value) || 0 })} icon={Heart} />
              <Input type="number" label="Aluguel/financiamento" value={data.rent} onChange={(e) => setData({ ...data, rent: Number(e.target.value) || 0 })} icon={HouseIcon} suffix="R$" />
            </div>
          )}

          {cur.key === "savings" && (
            <div className="space-y-5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs" style={{ color: "var(--velum-text-muted)" }}>0%</span>
                <div className="text-5xl font-semibold tracking-tight velum-mono" style={{ color: "var(--velum-accent)" }}>{data.savingsTarget}%</div>
                <span className="text-xs" style={{ color: "var(--velum-text-muted)" }}>50%</span>
              </div>
              <input
                type="range" min={0} max={50} step={5}
                value={data.savingsTarget}
                onChange={(e) => setData({ ...data, savingsTarget: Number(e.target.value) })}
                className="velum-slider w-full"
              />
              <p className="text-xs" style={{ color: "var(--velum-text-muted)" }}>
                Sobrando menos que isso no mês, seu status vira <strong style={{ color: "var(--velum-warning)" }}>Caution Cowboy</strong>.
              </p>
            </div>
          )}

          {cur.key === "accent" && (
            <div className="grid grid-cols-7 gap-2">
              {Object.entries(ACCENTS).map(([key, val]) => (
                <button key={key}
                  onClick={() => setAccent(key)}
                  className={cls("aspect-square rounded-xl flex items-center justify-center transition-all duration-150 hover:scale-110",
                    accent === key && "ring-2 ring-offset-2")}
                  style={{
                    background: val.light,
                    boxShadow: accent === key ? `0 0 0 3px ${val.light}40` : "none",
                  }}
                  aria-label={ACCENT_LABELS[key]}
                  title={ACCENT_LABELS[key]}
                >
                  {accent === key && <Check size={14} color="white" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={prev} disabled={step === 0} icon={ChevronLeft}>Voltar</Button>
          {step < total - 1 ? (
            <Button variant="primary" onClick={next} icon={ChevronRight}>Continuar</Button>
          ) : (
            <Button variant="primary" onClick={finish} icon={Check}>Concluir e entrar</Button>
          )}
        </div>
      </Card>
    </div>
  );
}

/* =========================================================================
   COMMAND PALETTE (⌘K)
   ========================================================================= */
function CommandPalette({ open, onClose, onNavigate, onAction }) {
  const [q, setQ] = useState("");
  useEffect(() => { if (open) setQ(""); }, [open]);
  const commands = useMemo(() => ([
    { id: "nav-overview", label: "Ir para Visão Geral", icon: Home, kind: "nav", target: "overview", keys: "1" },
    { id: "nav-incomes", label: "Ir para Entradas", icon: ArrowDownCircle, kind: "nav", target: "incomes", keys: "2" },
    { id: "nav-fixed", label: "Ir para Saídas Fixas", icon: Repeat, kind: "nav", target: "fixed", keys: "3" },
    { id: "nav-variable", label: "Ir para Saídas Variáveis", icon: ArrowUpCircle, kind: "nav", target: "variable", keys: "4" },
    { id: "nav-categories", label: "Ir para Categorias", icon: Layers, kind: "nav", target: "categories", keys: "5" },
    { id: "nav-debts", label: "Ir para Dívidas", icon: AlertTriangle, kind: "nav", target: "debts", keys: "6" },
    { id: "nav-goals", label: "Ir para Objetivos", icon: Target, kind: "nav", target: "goals", keys: "7" },
    { id: "nav-budgets", label: "Ir para Orçamentos", icon: ClipboardList, kind: "nav", target: "budgets", keys: "8" },
    { id: "nav-notifications", label: "Ir para Notificações", icon: Bell, kind: "nav", target: "notifications", keys: "9" },
    { id: "nav-settings", label: "Ir para Configurações", icon: Settings, kind: "nav", target: "settings", keys: "0" },
    { id: "act-new-in", label: "Nova entrada", icon: Plus, kind: "act", target: "new:income", keys: "⌘N" },
    { id: "act-new-fx", label: "Nova saída fixa", icon: Plus, kind: "act", target: "new:fixed" },
    { id: "act-new-vr", label: "Nova saída variável", icon: Plus, kind: "act", target: "new:variable" },
    { id: "act-toggle-dark", label: "Alternar modo claro/escuro", icon: Moon, kind: "act", target: "toggle:dark", keys: "⌘D" },
  ]), []);
  const filtered = commands.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] p-4 velum-fade" style={{ background: "rgba(0,0,0,.55)" }} onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl overflow-hidden velum-scale"
        style={{ background: "var(--velum-bg)", border: "1px solid var(--velum-border)", boxShadow: "0 25px 50px -12px rgba(0,0,0,.4)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid var(--velum-border-soft)" }}>
          <Search size={15} style={{ color: "var(--velum-text-muted)" }} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar comando…"
            className="flex-1 bg-transparent outline-none text-sm" style={{ color: "var(--velum-text)" }} />
          <span className="text-[10px] px-1.5 py-0.5 rounded velum-mono" style={{ background: "var(--velum-surface2)", color: "var(--velum-text-muted)" }}>ESC</span>
        </div>
        <div className="max-h-80 overflow-y-auto velum-scroll p-1">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm" style={{ color: "var(--velum-text-muted)" }}>Nada encontrado.</div>
          ) : filtered.map((c) => {
            const I = c.icon;
            return (
              <button key={c.id}
                onClick={() => { if (c.kind === "nav") onNavigate(c.target); else onAction(c.target); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:opacity-100"
                style={{ color: "var(--velum-text)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--velum-surface2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <I size={15} style={{ color: "var(--velum-text-muted)" }} />
                <span className="flex-1 text-left">{c.label}</span>
                {c.keys && <span className="text-[10px] px-1.5 py-0.5 rounded velum-mono" style={{ background: "var(--velum-surface2)", color: "var(--velum-text-muted)" }}>{c.keys}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   STATUS ORB — Verde / Amarelo / Vermelho com texto e número
   ========================================================================= */
function StatusOrb({ status, large = false, onAccent = false }) {
  const { hideValues } = useTheme();
  const colors = {
    green:  { bg: "var(--velum-success)", label: "On the track",   text: "white" },
    yellow: { bg: "var(--velum-warning)", label: "Caution Cowboy", text: "white" },
    red:    { bg: "var(--velum-danger)",  label: "Tá no serrote!", text: "white" },
  };
  const c = colors[status.level];
  const orbBg = onAccent ? "#FFFFFF" : c.bg;
  const submetricColor = onAccent ? "rgba(255,255,255,0.85)" : "var(--velum-text-muted)";
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className={cls("rounded-full velum-pulse", large ? "w-3 h-3" : "w-2.5 h-2.5")} style={{ background: orbBg }} />
        <div className="absolute inset-0 rounded-full opacity-30" style={{ background: orbBg, transform: "scale(2.2)", filter: "blur(6px)" }} />
      </div>
      <div>
        <div className={cls("font-semibold tracking-tight", large ? "text-base" : "text-sm")}>{c.label}</div>
        {large && (
          <div className="text-xs velum-mono mt-0.5" style={{ color: submetricColor }}>
            {hideValues ? "••••" : `${status.balance >= 0 ? "+" : ""}${fmtBRL(status.balance)}`} este mês
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   ANIMATED NUMBER
   ========================================================================= */
function AnimatedBRL({ value, className = "", muted = false }) {
  const v = useCountUp(value);
  const { hideValues } = useTheme();
  return (
    <span className={cls("velum-mono", className)} style={muted ? { color: "var(--velum-text-muted)" } : undefined}>
      {hideValues ? "R$ ••••" : fmtBRL(v)}
    </span>
  );
}

/* =========================================================================
   DEFAULT CATEGORIES
   ========================================================================= */
const DEFAULT_CATEGORIES = [
  { id: "leisure",    label: "Lazer",       icon: "🎬", color: "#A78BFA" },
  { id: "health",     label: "Saúde",       icon: "❤️", color: "#F87171" },
  { id: "tech",       label: "Tecnologia",  icon: "💻", color: "#60A5FA" },
  { id: "taxes",      label: "Impostos",    icon: "🧾", color: "#FACC15" },
  { id: "transport",  label: "Transporte",  icon: "🚗", color: "#34D399" },
  { id: "food",       label: "Alimentação", icon: "🍳", color: "#FB923C" },
  { id: "housing",    label: "Moradia",     icon: "🏠", color: "#94A3B8" },
  { id: "education",  label: "Educação",    icon: "📚", color: "#F472B6" },
];

/* =========================================================================
   TX FORM (entradas / saídas)
   ========================================================================= */
function TxForm({ initial, onSave, onCancel, categories, kind }) {
  const [tx, setTx] = useState(initial || {
    id: uid(), label: "", amount: 0, category: categories[0]?.id || "leisure",
    date: todayISO(), day: 5, recurring: kind === "fixed", active: true, source: "",
  });
  return (
    <div className="space-y-4">
      <Input label="Descrição" value={tx.label} onChange={(e) => setTx({ ...tx, label: e.target.value })} placeholder={kind === "income" ? "Salário, freela, dividendos..." : "Mercado, Netflix, gasolina..."} autoFocus />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Valor" type="number" value={tx.amount} onChange={(e) => setTx({ ...tx, amount: Number(e.target.value) || 0 })} suffix="R$" />
        {kind === "fixed" ? (
          <Input label="Dia do mês" type="number" value={tx.day} onChange={(e) => setTx({ ...tx, day: Math.min(31, Math.max(1, Number(e.target.value) || 1)) })} />
        ) : (
          <Input label="Data" type="date" value={tx.date} onChange={(e) => setTx({ ...tx, date: e.target.value })} />
        )}
      </div>
      {kind !== "income" && (
        <Select label="Categoria" value={tx.category} onChange={(e) => setTx({ ...tx, category: e.target.value })}
          options={categories.map((c) => ({ value: c.id, label: `${c.icon}  ${c.label}` }))} />
      )}
      {kind === "income" && (
        <Input label="Fonte" value={tx.source} onChange={(e) => setTx({ ...tx, source: e.target.value })} placeholder="CLT, PJ, freela, etc." />
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" onClick={() => onSave(tx)} disabled={!tx.label || !tx.amount}>Salvar</Button>
      </div>
    </div>
  );
}

/* =========================================================================
   TX LIST — Reutilizado para entradas / saídas fixas / saídas variáveis
   ========================================================================= */
function TxList({ items, onAdd, onEdit, onDelete, categories, kind, emptyTitle, emptyHint }) {
  const total = items.reduce((s, i) => s + Number(i.amount || 0), 0);
  return (
    <div className="space-y-4">
      <Card className="p-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider" style={{ color: "var(--velum-text-muted)" }}>Total do mês</div>
          <div className="mt-1 text-3xl font-semibold tracking-tight">
            <AnimatedBRL value={total} />
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--velum-text-muted)" }}>{items.length} {items.length === 1 ? "item" : "itens"}</div>
        </div>
        <Button variant="primary" onClick={onAdd} icon={Plus}>Novo</Button>
      </Card>

      {items.length === 0 ? (
        <Card className="p-12 text-center velum-fade">
          <div className="inline-flex p-3 rounded-xl mb-4" style={{ background: "var(--velum-accent-soft)", color: "var(--velum-accent)" }}>
            <Plus size={20} />
          </div>
          <h3 className="text-base font-medium">{emptyTitle}</h3>
          <p className="text-sm mt-1" style={{ color: "var(--velum-text-muted)" }}>{emptyHint}</p>
          <Button variant="soft" onClick={onAdd} className="mt-4" icon={Plus}>Adicionar agora</Button>
        </Card>
      ) : (
        <Card>
          <div className="divide-y velum-stagger" style={{ borderColor: "var(--velum-border-soft)" }}>
            {items.map((i) => {
              const cat = categories.find((c) => c.id === i.category);
              return (
                <div key={i.id} className="px-5 py-3.5 flex items-center gap-4 transition-colors group hover:bg-[var(--velum-surface2)]">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: (cat?.color || "var(--velum-accent)") + "22" }}>
                    {kind === "income" ? "📥" : (cat?.icon || "💸")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{i.label}</div>
                    <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: "var(--velum-text-muted)" }}>
                      {kind === "income" ? <span>{i.source || "Renda"}</span> :
                        kind === "fixed" ? <span>Todo dia {i.day}</span> : <span>{new Date(i.date + "T00:00:00").toLocaleDateString("pt-BR")}</span>}
                      {kind !== "income" && cat && <><span>·</span><span>{cat.label}</span></>}
                    </div>
                  </div>
                  <div className="velum-mono font-medium text-sm whitespace-nowrap">
                    {kind === "income" ? "+" : "−"}{fmtBRL(i.amount)}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button onClick={() => onEdit(i)} className="p-1.5 rounded hover:bg-[var(--velum-surface)]" style={{ color: "var(--velum-text-muted)" }} aria-label="Editar"><Edit3 size={14} /></button>
                    <button onClick={() => onDelete(i.id)} className="p-1.5 rounded hover:bg-[var(--velum-surface)]" style={{ color: "var(--velum-danger)" }} aria-label="Excluir"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

/* =========================================================================
   PAGES
   ========================================================================= */

/* --- Overview --- */
function PageOverview({ data, profile, status }) {
  const { palette } = useTheme();
  const cats = data.categories;
  const byCat = useMemo(() => {
    const map = {};
    [...data.fixed, ...data.variable].forEach((t) => {
      const k = t.category || "other";
      map[k] = (map[k] || 0) + Number(t.amount || 0);
    });
    return Object.entries(map).map(([id, value]) => {
      const c = cats.find((x) => x.id === id) || { label: id, color: "#888" };
      return { name: c.label, value, color: c.color };
    }).sort((a, b) => b.value - a.value);
  }, [data, cats]);

  // Simulated history for the chart (last 6 months around current totals)
  const history = useMemo(() => {
    const months = ["jan", "fev", "mar", "abr", "mai", "jun"];
    const baseIn = status.totalIn || profile.income || 5000;
    const baseOut = status.totalOut || baseIn * 0.7;
    return months.map((m, i) => {
      const f = 0.85 + (i * 0.05) + (Math.sin(i) * 0.04);
      return { mes: m, Entradas: Math.round(baseIn * f), Saídas: Math.round(baseOut * (0.9 + i * 0.04)) };
    });
  }, [status, profile]);

  const balancePct = status.totalIn > 0 ? Math.round((status.balance / status.totalIn) * 100) : 0;

  return (
    <div className="space-y-6 velum-stagger">
      {/* Hero status */}
      <Card className="p-6 sm:p-8 relative overflow-hidden" style={{ background: palette.accent, color: "white", border: "none" }}>
        <div className="absolute -right-16 -top-16 opacity-10">
          <LogoMark size={280} />
        </div>
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.15em] opacity-80">Balanço do mês</div>
          <div className="mt-2 flex items-baseline gap-3 flex-wrap">
            <div className="text-4xl sm:text-5xl font-semibold tracking-tight velum-mono">
              <AnimatedBRL value={status.balance} />
            </div>
            <div className="text-sm opacity-90">{balancePct >= 0 ? "+" : ""}{balancePct}% da renda</div>
          </div>
          <div className="mt-5"><StatusOrb status={status} large onAccent /></div>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: ArrowDownCircle, label: "Entradas", value: status.totalIn, color: palette.success },
          { icon: Repeat, label: "Fixas", value: status.totalOutFixed, color: palette.warning },
          { icon: ArrowUpCircle, label: "Variáveis", value: status.totalOutVar, color: palette.danger },
        ].map((s, i) => {
          const I = s.icon;
          return (
            <Card key={i} hover className="p-5">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md" style={{ background: s.color + "22", color: s.color }}>
                  <I size={15} />
                </div>
                <div className="text-xs uppercase tracking-wider" style={{ color: "var(--velum-text-muted)" }}>{s.label}</div>
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">
                <AnimatedBRL value={s.value} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium tracking-tight">Entradas vs. Saídas</h3>
            <span className="text-xs" style={{ color: "var(--velum-text-muted)" }}>Últimos 6 meses</span>
          </div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="velumIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.success} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={palette.success} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="velumOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.accent} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={palette.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.borderSoft} vertical={false} />
                <XAxis dataKey="mes" stroke={palette.textMuted} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke={palette.textMuted} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => "R$ " + fmtShort(v)} />
                <Tooltip
                  contentStyle={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => fmtBRL(v)}
                />
                <Area type="monotone" dataKey="Entradas" stroke={palette.success} strokeWidth={2} fill="url(#velumIn)" />
                <Area type="monotone" dataKey="Saídas" stroke={palette.accent} strokeWidth={2} fill="url(#velumOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Categories pie */}
        <Card className="p-5">
          <h3 className="text-sm font-medium tracking-tight">Por categoria</h3>
          {byCat.length === 0 ? (
            <div className="text-xs mt-6" style={{ color: "var(--velum-text-muted)" }}>Adicione saídas para ver a distribuição.</div>
          ) : (
            <>
              <div style={{ width: "100%", height: 180 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={byCat} dataKey="value" innerRadius={40} outerRadius={70} paddingAngle={2} stroke="none">
                      {byCat.map((c, idx) => <Cell key={idx} fill={c.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: palette.surface, border: `1px solid ${palette.border}`, borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => fmtBRL(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {byCat.slice(0, 5).map((c) => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="velum-mono" style={{ color: "var(--velum-text-muted)" }}>{fmtBRL(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

/* --- Categories --- */
function PageCategories({ categories, setCategories, data }) {
  const usage = useMemo(() => {
    const map = {};
    [...data.fixed, ...data.variable].forEach((t) => { map[t.category] = (map[t.category] || 0) + Number(t.amount); });
    return map;
  }, [data]);
  const [modal, setModal] = useState(null);

  return (
    <div className="space-y-4">
      <Card className="p-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Categorias</h2>
          <p className="text-xs mt-1" style={{ color: "var(--velum-text-muted)" }}>Edite, renomeie ou crie categorias para classificar suas saídas.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setModal({ id: uid(), label: "", icon: "📌", color: "#A78BFA" })}>Nova categoria</Button>
      </Card>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 velum-stagger">
        {categories.map((c) => (
          <Card key={c.id} hover className="p-4 group cursor-pointer" onClick={() => setModal(c)}>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: c.color + "22" }}>{c.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{c.label}</div>
                <div className="text-xs velum-mono mt-0.5" style={{ color: "var(--velum-text-muted)" }}>{fmtBRL(usage[c.id] || 0)}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={categories.find((x) => x.id === modal?.id) ? "Editar categoria" : "Nova categoria"}>
        {modal && (
          <div className="space-y-4">
            <Input label="Nome" value={modal.label} onChange={(e) => setModal({ ...modal, label: e.target.value })} autoFocus />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Ícone (emoji)" value={modal.icon} onChange={(e) => setModal({ ...modal, icon: e.target.value })} />
              <label className="block">
                <span className="block text-xs font-medium mb-1.5" style={{ color: "var(--velum-text-muted)" }}>Cor</span>
                <input type="color" value={modal.color} onChange={(e) => setModal({ ...modal, color: e.target.value })}
                  className="w-full h-[42px] rounded-lg cursor-pointer" style={{ border: "1px solid var(--velum-border)", background: "var(--velum-surface)" }} />
              </label>
            </div>
            <div className="flex justify-between gap-2 pt-2">
              {categories.find((x) => x.id === modal.id) ? (
                <Button variant="ghost" onClick={() => { setCategories(categories.filter((c) => c.id !== modal.id)); setModal(null); }} icon={Trash2} className="text-red-500">Excluir</Button>
              ) : <span />}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
                <Button variant="primary" onClick={() => {
                  const exists = categories.find((x) => x.id === modal.id);
                  setCategories(exists ? categories.map((c) => c.id === modal.id ? modal : c) : [...categories, modal]);
                  setModal(null);
                }}>Salvar</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* --- Debts --- */
function PageDebts({ debts, setDebts }) {
  const [modal, setModal] = useState(null);
  const totalSmall = debts.filter((d) => d.kind === "small").reduce((s, d) => s + Number(d.remaining || d.total || 0), 0);
  const totalBig = debts.filter((d) => d.kind === "big").reduce((s, d) => s + Number(d.remaining || d.total || 0), 0);

  const save = (d) => {
    setDebts(debts.find((x) => x.id === d.id) ? debts.map((x) => x.id === d.id ? d : x) : [...debts, d]);
    setModal(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider" style={{ color: "var(--velum-text-muted)" }}>Dívidas pontuais</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight"><AnimatedBRL value={totalSmall} /></div>
          <div className="text-xs mt-1" style={{ color: "var(--velum-text-muted)" }}>Cartão, fatura, parcelas curtas</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider" style={{ color: "var(--velum-text-muted)" }}>Dívidas grandes</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight"><AnimatedBRL value={totalBig} /></div>
          <div className="text-xs mt-1" style={{ color: "var(--velum-text-muted)" }}>Financiamentos, consignados, longos</div>
        </Card>
      </div>
      <Card className="p-5 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">Suas dívidas</h2>
        <Button variant="primary" icon={Plus} onClick={() => setModal({ id: uid(), label: "", total: 0, remaining: 0, monthly: 0, kind: "small", dueDay: 10 })}>Nova dívida</Button>
      </Card>
      {debts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="inline-flex p-3 rounded-xl mb-4" style={{ background: "var(--velum-accent-soft)", color: "var(--velum-accent)" }}>
            <PiggyBank size={20} />
          </div>
          <p className="text-sm">Nenhuma dívida cadastrada. Bom sinal — ou hora de mapear o que tem em aberto.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 velum-stagger">
          {debts.map((d) => {
            const pct = d.total > 0 ? Math.min(100, ((d.total - d.remaining) / d.total) * 100) : 0;
            return (
              <Card key={d.id} hover className="p-5 cursor-pointer" onClick={() => setModal(d)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-wider" style={{ color: "var(--velum-text-muted)" }}>{d.kind === "big" ? "Grande" : "Pontual"}</div>
                    <div className="mt-1 font-medium text-sm truncate">{d.label}</div>
                  </div>
                  <div className="text-right">
                    <div className="velum-mono text-sm font-semibold">{fmtBRL(d.remaining)}</div>
                    <div className="text-xs velum-mono" style={{ color: "var(--velum-text-muted)" }}>de {fmtBRL(d.total)}</div>
                  </div>
                </div>
                <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--velum-border-soft)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "var(--velum-accent)" }} />
                </div>
                <div className="flex justify-between mt-2 text-xs" style={{ color: "var(--velum-text-muted)" }}>
                  <span>{pct.toFixed(0)}% pago</span>
                  <span className="velum-mono">{fmtBRL(d.monthly)}/mês</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={!!modal} onClose={() => setModal(null)} title={debts.find((x) => x.id === modal?.id) ? "Editar dívida" : "Nova dívida"}>
        {modal && (
          <div className="space-y-4">
            <Input label="Descrição" value={modal.label} onChange={(e) => setModal({ ...modal, label: e.target.value })} placeholder="Cartão Nubank, Financiamento carro..." autoFocus />
            <Select label="Tipo" value={modal.kind} onChange={(e) => setModal({ ...modal, kind: e.target.value })}
              options={[{ value: "small", label: "Pontual (curto prazo)" }, { value: "big", label: "Grande (longo prazo)" }]} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Total" type="number" value={modal.total} onChange={(e) => setModal({ ...modal, total: Number(e.target.value) || 0 })} suffix="R$" />
              <Input label="Restante" type="number" value={modal.remaining} onChange={(e) => setModal({ ...modal, remaining: Number(e.target.value) || 0 })} suffix="R$" />
              <Input label="Parcela mensal" type="number" value={modal.monthly} onChange={(e) => setModal({ ...modal, monthly: Number(e.target.value) || 0 })} suffix="R$" />
              <Input label="Dia vencimento" type="number" value={modal.dueDay} onChange={(e) => setModal({ ...modal, dueDay: Number(e.target.value) || 1 })} />
            </div>
            <div className="flex justify-between gap-2 pt-2">
              {debts.find((x) => x.id === modal.id) ? (
                <Button variant="ghost" onClick={() => { setDebts(debts.filter((x) => x.id !== modal.id)); setModal(null); }} icon={Trash2}>Excluir</Button>
              ) : <span />}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
                <Button variant="primary" onClick={() => save(modal)}>Salvar</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* --- Goals (com LLM) --- */
function PageGoals({ goals, setGoals, financialContext }) {
  const { palette } = useTheme();
  const [modal, setModal] = useState(null);
  const [llmPlan, setLlmPlan] = useState(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmError, setLlmError] = useState("");

  const askLLM = async (goal) => {
    setLlmLoading(true); setLlmError(""); setLlmPlan(null);
    try {
      const prompt = `Você é um conselheiro financeiro objetivo, direto e sem clichês. Em PT-BR.
Contexto financeiro do usuário (mês corrente):
- Renda total: ${fmtBRL(financialContext.totalIn)}
- Saídas fixas: ${fmtBRL(financialContext.totalOutFixed)}
- Saídas variáveis: ${fmtBRL(financialContext.totalOutVar)}
- Saldo: ${fmtBRL(financialContext.balance)}
- Meta de poupar: ${financialContext.savingsTarget}% da renda
- Membros da família: ${financialContext.members || 1}
- Veículos: ${financialContext.vehicles || 0}
- Dívidas totais: ${fmtBRL(financialContext.totalDebt || 0)}

Objetivo do usuário: "${goal.label}"
Valor alvo: ${fmtBRL(goal.target)}
Já guardou: ${fmtBRL(goal.saved)}
Prazo: ${goal.deadline || "sem prazo"}

Devolva um JSON puro (sem markdown, sem cercas) com:
{
  "diagnosis": "1 parágrafo curto avaliando a viabilidade",
  "monthlyAmount": número (R$ que precisa guardar por mês),
  "actions": ["ação 1 concreta", "ação 2", "ação 3"],
  "risks": ["risco 1", "risco 2"]
}`;

      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        const msg = json.error?.message || json.error || json.detail || `HTTP ${res.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
      const txt = json?.content?.find((b) => b.type === "text")?.text || "";
      if (!txt) throw new Error("Resposta vazia da API");
      const clean = txt.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setLlmPlan({ goalId: goal.id, ...parsed });
    } catch (e) {
      setLlmError(`Erro: ${e.message}. Verifica se a ANTHROPIC_API_KEY tá configurada na Vercel.`);
    } finally {
      setLlmLoading(false);
    }
  };

  const save = (g) => {
    setGoals(goals.find((x) => x.id === g.id) ? goals.map((x) => x.id === g.id ? g : x) : [...goals, g]);
    setModal(null);
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Objetivos</h2>
          <p className="text-xs mt-1" style={{ color: "var(--velum-text-muted)" }}>Defina onde quer chegar — a gente traça o caminho com base nos seus dados reais.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setModal({ id: uid(), label: "", target: 0, saved: 0, deadline: "" })}>Novo objetivo</Button>
      </Card>

      {goals.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="inline-flex p-3 rounded-xl mb-4" style={{ background: "var(--velum-accent-soft)", color: "var(--velum-accent)" }}>
            <Target size={20} />
          </div>
          <h3 className="text-base font-medium">Sem objetivos ainda</h3>
          <p className="text-sm mt-1 max-w-sm mx-auto" style={{ color: "var(--velum-text-muted)" }}>
            Comprar um carro, ir pra Europa, montar uma reserva. Defina o que você quer e a Velum monta o plano.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 velum-stagger">
          {goals.map((g) => {
            const pct = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
            const plan = llmPlan?.goalId === g.id ? llmPlan : null;
            return (
              <Card key={g.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-wider" style={{ color: "var(--velum-text-muted)" }}>{g.deadline || "Sem prazo"}</div>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight truncate">{g.label}</h3>
                  </div>
                  <button onClick={() => setModal(g)} className="p-1.5 rounded hover:bg-[var(--velum-surface2)]" style={{ color: "var(--velum-text-muted)" }}><Edit3 size={14} /></button>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div className="velum-mono text-2xl font-semibold">{fmtBRL(g.saved)}</div>
                  <div className="velum-mono text-xs" style={{ color: "var(--velum-text-muted)" }}>de {fmtBRL(g.target)}</div>
                </div>
                <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: "var(--velum-border-soft)" }}>
                  <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: "var(--velum-accent)" }} />
                </div>
                <div className="mt-1 text-xs velum-mono" style={{ color: "var(--velum-text-muted)" }}>{pct.toFixed(0)}% completo</div>

                <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--velum-border-soft)" }}>
                  {!plan && !llmLoading && (
                    <Button variant="soft" icon={Sparkles} onClick={() => askLLM(g)} className="w-full">
                      Pedir plano à Velum AI
                    </Button>
                  )}
                  {llmLoading && (
                    <div className="flex items-center gap-2 text-sm py-2" style={{ color: "var(--velum-text-muted)" }}>
                      <Loader2 size={14} className="animate-spin" /> Analisando seus dados…
                    </div>
                  )}
                  {llmError && <div className="text-xs" style={{ color: "var(--velum-danger)" }}>{llmError}</div>}
                  {plan && (
                    <div className="space-y-3 velum-fade">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} style={{ color: palette.accent }} />
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: palette.accent }}>Plano sugerido</span>
                      </div>
                      <p className="text-sm leading-relaxed">{plan.diagnosis}</p>
                      <Card className="p-3" style={{ background: "var(--velum-accent-soft)", border: "none" }}>
                        <div className="text-xs uppercase tracking-wider opacity-80">Guardar por mês</div>
                        <div className="velum-mono text-xl font-semibold mt-0.5" style={{ color: palette.accent }}>{fmtBRL(plan.monthlyAmount)}</div>
                      </Card>
                      <div>
                        <div className="text-xs font-medium mb-1.5" style={{ color: "var(--velum-text-muted)" }}>Ações</div>
                        <ul className="space-y-1.5">
                          {plan.actions?.map((a, i) => (
                            <li key={i} className="text-sm flex gap-2"><Check size={14} className="mt-1 flex-shrink-0" style={{ color: palette.accent }} />{a}</li>
                          ))}
                        </ul>
                      </div>
                      {plan.risks?.length > 0 && (
                        <div>
                          <div className="text-xs font-medium mb-1.5" style={{ color: "var(--velum-text-muted)" }}>Riscos</div>
                          <ul className="space-y-1.5">
                            {plan.risks.map((r, i) => (
                              <li key={i} className="text-sm flex gap-2"><AlertTriangle size={14} className="mt-1 flex-shrink-0" style={{ color: palette.warning }} />{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={goals.find((x) => x.id === modal?.id) ? "Editar objetivo" : "Novo objetivo"}>
        {modal && (
          <div className="space-y-4">
            <Input label="Objetivo" value={modal.label} onChange={(e) => setModal({ ...modal, label: e.target.value })} placeholder="Reserva de emergência, viagem, carro..." autoFocus />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Valor alvo" type="number" value={modal.target} onChange={(e) => setModal({ ...modal, target: Number(e.target.value) || 0 })} suffix="R$" />
              <Input label="Já guardado" type="number" value={modal.saved} onChange={(e) => setModal({ ...modal, saved: Number(e.target.value) || 0 })} suffix="R$" />
            </div>
            <Input label="Prazo (opcional)" type="date" value={modal.deadline} onChange={(e) => setModal({ ...modal, deadline: e.target.value })} />
            <div className="flex justify-between gap-2 pt-2">
              {goals.find((x) => x.id === modal.id) ? (
                <Button variant="ghost" onClick={() => { setGoals(goals.filter((x) => x.id !== modal.id)); setModal(null); }} icon={Trash2}>Excluir</Button>
              ) : <span />}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
                <Button variant="primary" onClick={() => save(modal)}>Salvar</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* --- Budgets --- */
function PageBudgets({ budgets, setBudgets, onAccept, categories }) {
  const [modal, setModal] = useState(null);
  const groups = {
    pending: budgets.filter((b) => b.status === "pending"),
    negotiating: budgets.filter((b) => b.status === "negotiating"),
    accepted: budgets.filter((b) => b.status === "accepted"),
    denied: budgets.filter((b) => b.status === "denied"),
  };
  const setStatus = (id, status) => {
    const b = budgets.find((x) => x.id === id);
    setBudgets(budgets.map((x) => x.id === id ? { ...x, status } : x));
    if (status === "accepted" && b) onAccept(b);
  };

  const statusMeta = {
    pending: { label: "Enviados", color: "var(--velum-text-muted)" },
    negotiating: { label: "Negociando", color: "var(--velum-warning)" },
    accepted: { label: "Fechados", color: "var(--velum-success)" },
    denied: { label: "Perdidos", color: "var(--velum-danger)" },
  };

  // Total potential revenue (proposals not yet denied)
  const pipelineTotal = budgets
    .filter((b) => b.status !== "denied")
    .reduce((acc, b) => acc + (b.amount || 0), 0);
  const closedTotal = groups.accepted.reduce((acc, b) => acc + (b.amount || 0), 0);

  return (
    <div className="space-y-4">
      <Card className="p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Propostas a clientes</h2>
          <p className="text-xs mt-1" style={{ color: "var(--velum-text-muted)" }}>Orçamentos que você envia. Fechado vira entrada automaticamente. Negociando fica em hold. Perdido é arquivado.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setModal({ id: uid(), label: "", amount: 0, client: "", status: "pending", category: categories[0]?.id, notes: "" })}>Nova proposta</Button>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider" style={{ color: "var(--velum-text-muted)" }}>Pipeline ativo</div>
          <div className="mt-1 text-2xl velum-mono font-semibold">
            <AnimatedBRL value={pipelineTotal} />
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--velum-text-muted)" }}>Soma de propostas em aberto + fechadas</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wider" style={{ color: "var(--velum-text-muted)" }}>Já fechado</div>
          <div className="mt-1 text-2xl velum-mono font-semibold" style={{ color: "var(--velum-success)" }}>
            <AnimatedBRL value={closedTotal} />
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--velum-text-muted)" }}>{groups.accepted.length} propostas aceitas</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 velum-stagger">
        {Object.entries(groups).map(([key, items]) => (
          <Card key={key} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: statusMeta[key].color }} />
                <span className="text-xs font-medium uppercase tracking-wider">{statusMeta[key].label}</span>
              </div>
              <span className="text-xs velum-mono" style={{ color: "var(--velum-text-muted)" }}>{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="text-xs py-6 text-center" style={{ color: "var(--velum-text-dim)" }}>Vazio</div>
              ) : items.map((b) => (
                <Card key={b.id} className="p-3" style={{ background: "var(--velum-surface2)" }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{b.label}</div>
                      <div className="text-xs mt-0.5 velum-mono" style={{ color: "var(--velum-text-muted)" }}>{fmtBRL(b.amount)} · {b.client || b.supplier || "—"}</div>
                    </div>
                    <button onClick={() => setModal(b)} className="p-1 opacity-60 hover:opacity-100"><Edit3 size={12} /></button>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {["pending", "negotiating", "accepted", "denied"].filter((s) => s !== b.status).map((s) => (
                      <button key={s} onClick={() => setStatus(b.id, s)}
                        className="flex-1 text-[10px] py-1 rounded uppercase tracking-wider font-medium transition-opacity opacity-70 hover:opacity-100"
                        style={{ background: "var(--velum-surface)", color: statusMeta[s].color }}>
                        {s === "pending" ? "Envio" : s === "negotiating" ? "Neg" : s === "accepted" ? "Fechar" : "Perder"}
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={budgets.find((x) => x.id === modal?.id) ? "Editar proposta" : "Nova proposta"}>
        {modal && (
          <div className="space-y-4">
            <Input label="Projeto / serviço" value={modal.label} onChange={(e) => setModal({ ...modal, label: e.target.value })} placeholder="Identidade visual, site institucional, motion..." autoFocus />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Valor" type="number" value={modal.amount} onChange={(e) => setModal({ ...modal, amount: Number(e.target.value) || 0 })} suffix="R$" />
              <Input label="Cliente" value={modal.client || modal.supplier || ""} onChange={(e) => setModal({ ...modal, client: e.target.value, supplier: undefined })} placeholder="Nome ou empresa" />
            </div>
            <Select label="Status" value={modal.status} onChange={(e) => setModal({ ...modal, status: e.target.value })}
              options={[
                { value: "pending", label: "Enviado" },
                { value: "negotiating", label: "Negociando" },
                { value: "accepted", label: "Fechado (vira entrada)" },
                { value: "denied", label: "Perdido" },
              ]} />
            <div className="flex justify-between gap-2 pt-2">
              {budgets.find((x) => x.id === modal.id) ? (
                <Button variant="ghost" onClick={() => { setBudgets(budgets.filter((x) => x.id !== modal.id)); setModal(null); }} icon={Trash2}>Excluir</Button>
              ) : <span />}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
                <Button variant="primary" onClick={() => {
                  const exists = budgets.find((x) => x.id === modal.id);
                  setBudgets(exists ? budgets.map((b) => b.id === modal.id ? modal : b) : [...budgets, modal]);
                  if (modal.status === "accepted") onAccept(modal);
                  setModal(null);
                }}>Salvar</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* --- Notifications (com análise via LLM) --- */
function PageNotifications({ notifications, setNotifications, financialContext }) {
  const { palette } = useTheme();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const last = notifications[0];
  const hoursSince = last ? Math.floor((Date.now() - last.at) / 36e5) : Infinity;
  const dueForAnalysis = hoursSince >= 24;

  const runAnalysis = async () => {
    setLoading(true); setErr("");
    try {
      const prompt = `Você é a Velum AI, conselheira financeira em PT-BR. Sem clichês, direto e provocativo quando preciso.
Snapshot financeiro:
- Entradas: ${fmtBRL(financialContext.totalIn)}
- Saídas fixas: ${fmtBRL(financialContext.totalOutFixed)}
- Saídas variáveis: ${fmtBRL(financialContext.totalOutVar)}
- Saldo: ${fmtBRL(financialContext.balance)}
- Meta de poupar: ${financialContext.savingsTarget}%
- Status atual: ${financialContext.statusLevel} (${financialContext.statusLabel})
- Dívidas totais: ${fmtBRL(financialContext.totalDebt || 0)}
- Objetivos ativos: ${financialContext.activeGoals || 0}

Devolva um JSON puro (sem markdown):
{
  "headline": "1 frase curta e impactante (até 80 caracteres)",
  "tone": "warning" | "good" | "neutral",
  "body": "1 parágrafo de até 3 frases avaliando o momento",
  "tips": ["dica 1 acionável", "dica 2"]
}`;

      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 700, messages: [{ role: "user", content: prompt }] }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        const msg = json.error?.message || json.error || json.detail || `HTTP ${res.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
      const txt = json?.content?.find((b) => b.type === "text")?.text || "";
      if (!txt) throw new Error("Resposta vazia da API");
      const parsed = JSON.parse(txt.replace(/```json|```/g, "").trim());
      const newNotif = { id: uid(), at: Date.now(), ...parsed };
      setNotifications([newNotif, ...notifications].slice(0, 30));
    } catch (e) {
      setErr(`Erro: ${e.message}. Verifica a ANTHROPIC_API_KEY na Vercel.`);
    } finally {
      setLoading(false);
    }
  };

  const toneColors = {
    good: palette.success, warning: palette.warning, neutral: palette.accent,
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold tracking-tight">Análises diárias</h2>
          <p className="text-xs mt-1" style={{ color: "var(--velum-text-muted)" }}>
            A Velum AI analisa seus dados a cada 24h. Última análise: {last ? `há ${hoursSince}h` : "nunca rodou"}.
          </p>
        </div>
        <Button variant={dueForAnalysis ? "primary" : "soft"} icon={Sparkles} onClick={runAnalysis} disabled={loading}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          Analisar agora
        </Button>
      </Card>

      {err && <div className="text-xs px-3" style={{ color: palette.danger }}>{err}</div>}

      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="inline-flex p-3 rounded-xl mb-4" style={{ background: "var(--velum-accent-soft)", color: "var(--velum-accent)" }}>
            <Bell size={20} />
          </div>
          <p className="text-sm">Nenhuma análise ainda. Rode a primeira agora.</p>
        </Card>
      ) : (
        <div className="space-y-3 velum-stagger">
          {notifications.map((n) => (
            <Card key={n.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: (toneColors[n.tone] || palette.accent) + "22", color: toneColors[n.tone] || palette.accent }}>
                  <Sparkles size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-semibold tracking-tight">{n.headline}</h3>
                    <span className="text-[11px] velum-mono whitespace-nowrap" style={{ color: "var(--velum-text-muted)" }}>
                      {new Date(n.at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm mt-1.5 leading-relaxed">{n.body}</p>
                  {n.tips?.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {n.tips.map((t, i) => (
                        <li key={i} className="text-xs flex gap-2"><span style={{ color: palette.accent }}>•</span><span>{t}</span></li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   PWA INSTALLER — captures beforeinstallprompt, handles platform variations
   ========================================================================= */
function PWAInstaller({ palette }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState("unknown");
  const [iosInstructions, setIosInstructions] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent;
      if (/iPhone|iPad|iPod/.test(ua)) setPlatform("ios");
      else if (/Android/.test(ua)) setPlatform("android");
      else if (/Mac/.test(ua)) setPlatform("mac");
      else if (/Windows/.test(ua)) setPlatform("windows");
      else setPlatform("desktop");
    }

    if (typeof window !== "undefined") {
      const standalone = window.matchMedia?.("(display-mode: standalone)").matches
        || window.navigator?.standalone;
      if (standalone) setInstalled(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => { setInstalled(true); setDeferredPrompt(null); };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    } else {
      setIosInstructions(true);
    }
  };

  if (installed) {
    return (
      <Card className="p-5 flex items-center gap-3" style={{ background: "var(--velum-accent-soft)", border: `1px solid ${palette.accent}` }}>
        <Check size={18} style={{ color: palette.accent }} />
        <div>
          <div className="text-sm font-medium">Velum já está instalado!</div>
          <div className="text-xs mt-0.5" style={{ color: "var(--velum-text-muted)" }}>Você está rodando como app nativo.</div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-4">
          <Monitor size={18} style={{ color: palette.accent }} />
          <h3 className="text-sm font-medium mt-2">macOS / Desktop</h3>
          <p className="text-xs mt-1" style={{ color: "var(--velum-text-muted)" }}>
            Chrome, Edge ou Arc detectam o app automaticamente. Clique no botão pra instalar.
          </p>
          <Button variant="soft" icon={Download} className="mt-3 w-full" onClick={handleInstall}>
            {deferredPrompt ? "Instalar agora" : "Como instalar"}
          </Button>
        </Card>
        <Card className="p-4">
          <Smartphone size={18} style={{ color: palette.accent }} />
          <h3 className="text-sm font-medium mt-2">iOS / Android</h3>
          <p className="text-xs mt-1" style={{ color: "var(--velum-text-muted)" }}>
            {platform === "ios" ? "Safari → Compartilhar → Adicionar à Tela de Início." : "Chrome Android instala em 1 toque. iOS Safari precisa de passos manuais."}
          </p>
          <Button variant="soft" icon={Download} className="mt-3 w-full" onClick={handleInstall}>
            {deferredPrompt ? "Instalar agora" : "Ver passos"}
          </Button>
        </Card>
      </div>

      <Modal open={iosInstructions} onClose={() => setIosInstructions(false)} title="Como instalar">
        <div className="space-y-4 text-sm">
          <div>
            <div className="font-medium mb-2">No iPhone / iPad (Safari)</div>
            <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed" style={{ color: "var(--velum-text-muted)" }}>
              <li>Toque no botão <strong>Compartilhar</strong> (quadrado com seta pra cima) na barra inferior.</li>
              <li>Role e toque em <strong>Adicionar à Tela de Início</strong>.</li>
              <li>Confirme em <strong>Adicionar</strong>. Velum vira app na home.</li>
            </ol>
          </div>
          <div>
            <div className="font-medium mb-2">Mac (Chrome, Edge, Arc)</div>
            <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed" style={{ color: "var(--velum-text-muted)" }}>
              <li>Procure o ícone de <strong>instalar</strong> (computador + seta) à direita da barra de URL.</li>
              <li>Clique → <strong>Instalar</strong>.</li>
              <li>Ou menu <strong>⋮ → Salvar e compartilhar → Instalar Velum…</strong></li>
            </ol>
          </div>
          <div>
            <div className="font-medium mb-2">Mac (Safari 17+)</div>
            <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed" style={{ color: "var(--velum-text-muted)" }}>
              <li>Menu <strong>Arquivo → Adicionar ao Dock…</strong></li>
              <li>Confirme. Ícone permanente no Dock.</li>
            </ol>
          </div>
          <div>
            <div className="font-medium mb-2">Android (Chrome)</div>
            <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed" style={{ color: "var(--velum-text-muted)" }}>
              <li>Menu <strong>⋮ → Instalar app</strong> (ou banner automático).</li>
              <li>Confirme. App vai pra gaveta de apps.</li>
            </ol>
          </div>
        </div>
      </Modal>
    </>
  );
}

/* --- Settings --- */
function PageSettings({ profile, setProfile, onLogout, onShowShortcuts }) {
  const { mode, setMode, accent, setAccent, palette } = useTheme();
  return (
    <div className="space-y-4 max-w-3xl">
      <Card className="p-5">
        <h2 className="text-base font-semibold tracking-tight">Aparência</h2>
        <p className="text-xs mt-1 mb-5" style={{ color: "var(--velum-text-muted)" }}>Tema e cor de destaque. Tudo se adapta ao contraste.</p>

        <div className="space-y-5">
          <div>
            <div className="text-xs font-medium mb-2" style={{ color: "var(--velum-text-muted)" }}>Tema</div>
            <div className="flex gap-2">
              {[
                { id: "light", label: "Claro", icon: Sun },
                { id: "dark", label: "Escuro", icon: Moon },
              ].map((t) => {
                const I = t.icon; const active = mode === t.id;
                return (
                  <button key={t.id} onClick={() => setMode(t.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm transition-all"
                    style={{
                      border: `1px solid ${active ? palette.accent : palette.border}`,
                      background: active ? palette.accentSoft : "transparent",
                      color: active ? palette.accent : palette.text,
                    }}>
                    <I size={15} />{t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium mb-2" style={{ color: "var(--velum-text-muted)" }}>Cor de destaque</div>
            <div className="grid grid-cols-7 gap-2">
              {Object.entries(ACCENTS).map(([key, val]) => (
                <button key={key} onClick={() => setAccent(key)}
                  title={ACCENT_LABELS[key]}
                  className="aspect-square rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: mode === "dark" ? val.dark : val.light,
                    boxShadow: accent === key ? `0 0 0 3px ${(mode === "dark" ? val.dark : val.light)}40` : "none",
                  }}>
                  {accent === key && <Check size={14} color="white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-semibold tracking-tight">Seu perfil</h2>
        <p className="text-xs mt-1 mb-5" style={{ color: "var(--velum-text-muted)" }}>Dados que entram no cálculo do seu status e dos seus planos.</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nome" value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <Input label="Renda mensal" type="number" value={profile.income || 0} onChange={(e) => setProfile({ ...profile, income: Number(e.target.value) || 0 })} suffix="R$" />
          <Input label="Membros família" type="number" value={profile.members || 0} onChange={(e) => setProfile({ ...profile, members: Number(e.target.value) || 0 })} />
          <Input label="Veículos" type="number" value={profile.vehicles || 0} onChange={(e) => setProfile({ ...profile, vehicles: Number(e.target.value) || 0 })} />
        </div>
        <div className="mt-5">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: "var(--velum-text-muted)" }}>Meta de poupar mensal</span>
            <span className="text-sm velum-mono font-medium" style={{ color: palette.accent }}>{profile.savingsTarget || 0}%</span>
          </div>
          <input type="range" min={0} max={50} step={5} value={profile.savingsTarget || 0}
            onChange={(e) => setProfile({ ...profile, savingsTarget: Number(e.target.value) })} className="velum-slider w-full" />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-semibold tracking-tight">Instalar como app</h2>
        <p className="text-xs mt-1 mb-5" style={{ color: "var(--velum-text-muted)" }}>
          Velum vira app nativo no seu dispositivo. Ícone na home, abre sem barra de navegador, funciona offline.
        </p>
        <PWAInstaller palette={palette} />
        <div className="mt-4 p-4 rounded-lg flex items-start gap-3" style={{ background: "var(--velum-accent-soft)" }}>
          <Sparkles size={15} style={{ color: palette.accent, flexShrink: 0, marginTop: 2 }} />
          <div className="text-xs leading-relaxed" style={{ color: "var(--velum-text)" }}>
            <strong>Widget de status</strong>: mostra um único orbe + frase ("On the track" / "Caution Cowboy" / "Tá no serrote!") com o saldo do mês. Atualiza a cada análise diária.
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-base font-semibold tracking-tight">Atalhos & Conta</h2>
        <div className="mt-4 space-y-2">
          <Button variant="outline" icon={Keyboard} onClick={onShowShortcuts} className="w-full justify-start">Ver atalhos de teclado</Button>
          <Button variant="outline" icon={LogOut} onClick={onLogout} className="w-full justify-start">Sair</Button>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================================
   APP SHELL — Sidebar + Header + Routing
   ========================================================================= */
const NAV = [
  { id: "overview", label: "Visão Geral", icon: Home, key: "1" },
  { id: "incomes", label: "Entradas", icon: ArrowDownCircle, key: "2" },
  { id: "fixed", label: "Saídas Fixas", icon: Repeat, key: "3" },
  { id: "variable", label: "Saídas Variáveis", icon: ArrowUpCircle, key: "4" },
  { id: "categories", label: "Categorias", icon: Layers, key: "5" },
  { id: "debts", label: "Dívidas", icon: AlertTriangle, key: "6" },
  { id: "goals", label: "Objetivos", icon: Target, key: "7" },
  { id: "budgets", label: "Orçamentos", icon: ClipboardList, key: "8" },
  { id: "notifications", label: "Notificações", icon: Bell, key: "9" },
  { id: "settings", label: "Configurações", icon: Settings, key: "0" },
];

function Shell({ user, onLogout }) {
  const { mode, setMode, palette, hideValues, setHideValues } = useTheme();
  const [route, setRoute] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Data state
  const [profile, setProfile] = useState({ name: "", income: 0, members: 1, vehicles: 0, savingsTarget: 20 });
  const [incomes, setIncomes] = useState([]);
  const [fixed, setFixed] = useState([]);
  const [variable, setVariable] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [debts, setDebts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Add modal state per kind
  const [txModal, setTxModal] = useState(null); // { kind, item }

  // Load persisted data
  useEffect(() => {
    (async () => {
      const [p, i, f, v, c, d, g, b, n] = await Promise.all([
        storage.get("velum:profile"),
        storage.get("velum:incomes"),
        storage.get("velum:fixed"),
        storage.get("velum:variable"),
        storage.get("velum:categories"),
        storage.get("velum:debts"),
        storage.get("velum:goals"),
        storage.get("velum:budgets"),
        storage.get("velum:notifications"),
      ]);
      if (p) setProfile(p);
      if (i) setIncomes(i);
      if (f) setFixed(f);
      if (v) setVariable(v);
      if (c) setCategories(c);
      if (d) setDebts(d);
      if (g) setGoals(g);
      if (b) setBudgets(b);
      if (n) setNotifications(n);
      setLoaded(true);
    })();
  }, []);

  // Persist on change (debounced via microtask)
  useEffect(() => { if (loaded) storage.set("velum:profile", profile); }, [profile, loaded]);
  useEffect(() => { if (loaded) storage.set("velum:incomes", incomes); }, [incomes, loaded]);
  useEffect(() => { if (loaded) storage.set("velum:fixed", fixed); }, [fixed, loaded]);
  useEffect(() => { if (loaded) storage.set("velum:variable", variable); }, [variable, loaded]);
  useEffect(() => { if (loaded) storage.set("velum:categories", categories); }, [categories, loaded]);
  useEffect(() => { if (loaded) storage.set("velum:debts", debts); }, [debts, loaded]);
  useEffect(() => { if (loaded) storage.set("velum:goals", goals); }, [goals, loaded]);
  useEffect(() => { if (loaded) storage.set("velum:budgets", budgets); }, [budgets, loaded]);
  useEffect(() => { if (loaded) storage.set("velum:notifications", notifications); }, [notifications, loaded]);

  const status = useMemo(() => computeStatus({ incomes, fixed, variable, goalsSavingsPct: profile.savingsTarget || 20 }), [incomes, fixed, variable, profile]);

  const financialContext = useMemo(() => ({
    ...status,
    statusLevel: status.level,
    statusLabel: status.label,
    savingsTarget: profile.savingsTarget,
    members: profile.members,
    vehicles: profile.vehicles,
    totalDebt: debts.reduce((s, d) => s + Number(d.remaining || 0), 0),
    activeGoals: goals.length,
  }), [status, profile, debts, goals]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      const tag = (e.target.tagName || "").toLowerCase();
      const inField = tag === "input" || tag === "textarea" || tag === "select";
      if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdOpen(true); }
      else if (mod && e.key.toLowerCase() === "b") { e.preventDefault(); setSidebarOpen((v) => !v); }
      else if (mod && e.key.toLowerCase() === "d") { e.preventDefault(); setMode(mode === "dark" ? "light" : "dark"); }
      else if (mod && e.key.toLowerCase() === "n") { e.preventDefault(); setTxModal({ kind: route === "incomes" ? "income" : route === "fixed" ? "fixed" : "variable" }); }
      else if (e.key === "?" && !inField) { e.preventDefault(); setShortcutsOpen(true); }
      else if (!mod && !inField && /^[0-9]$/.test(e.key)) {
        const map = { "1": "overview", "2": "incomes", "3": "fixed", "4": "variable", "5": "categories", "6": "debts", "7": "goals", "8": "budgets", "9": "notifications", "0": "settings" };
        if (map[e.key]) setRoute(map[e.key]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, setMode, route]);

  const onAcceptBudget = (b) => {
    setIncomes((prev) => [...prev, {
      id: uid(), label: b.label, amount: b.amount, date: todayISO(), source: "freelance", recurring: false, client: b.client || b.supplier,
    }]);
  };

  const navigate = (id) => { setRoute(id); setMobileMenu(false); };

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--velum-bg)", color: "var(--velum-text)" }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--velum-text-muted)" }}>
          <Loader2 size={14} className="animate-spin" /> Carregando seu Velum…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--velum-bg)", color: "var(--velum-text)" }}>
      {/* Sidebar - desktop */}
      <aside
        className={cls("hidden md:flex flex-col transition-all duration-300 sticky top-0 h-screen", sidebarOpen ? "w-64" : "w-[68px]")}
        style={{ background: "var(--velum-surface)", borderRight: "1px solid var(--velum-border)" }}
      >
        <div className="flex items-center gap-2.5 h-16 px-4" style={{ color: palette.accent }}>
          {sidebarOpen ? <LogoHorizontal height={22} /> : <LogoMark size={24} />}
        </div>
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto velum-scroll">
          {NAV.map((n) => {
            const I = n.icon; const active = route === n.id;
            return (
              <button key={n.id} onClick={() => navigate(n.id)}
                className={cls("w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-all",
                  active ? "" : "hover:bg-[var(--velum-surface2)]")}
                style={active ? { background: palette.accentSoft, color: palette.accent } : { color: "var(--velum-text)" }}
                title={n.label}
              >
                <I size={16} className="flex-shrink-0" />
                {sidebarOpen && <span className="flex-1 text-left truncate">{n.label}</span>}
                {sidebarOpen && <span className="text-[10px] velum-mono opacity-50">{n.key}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-2" style={{ borderTop: "1px solid var(--velum-border-soft)" }}>
          <button onClick={() => setSidebarOpen((v) => !v)}
            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs transition-all hover:bg-[var(--velum-surface2)]"
            style={{ color: "var(--velum-text-muted)" }}>
            {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            {sidebarOpen && <span>Recolher</span>}
            {sidebarOpen && <span className="ml-auto velum-mono">⌘B</span>}
          </button>
        </div>
      </aside>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,.5)" }} onClick={() => setMobileMenu(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 flex flex-col velum-fade" style={{ background: "var(--velum-bg)", borderRight: "1px solid var(--velum-border)" }}>
            <div className="flex items-center justify-between h-16 px-4" style={{ color: palette.accent }}>
              <LogoHorizontal height={22} />
              <button onClick={() => setMobileMenu(false)} style={{ color: "var(--velum-text-muted)" }}><X size={18} /></button>
            </div>
            <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto velum-scroll">
              {NAV.map((n) => {
                const I = n.icon; const active = route === n.id;
                return (
                  <button key={n.id} onClick={() => navigate(n.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
                    style={active ? { background: palette.accentSoft, color: palette.accent } : { color: "var(--velum-text)" }}>
                    <I size={16} />{n.label}
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 h-16 px-4 sm:px-6" style={{ background: "var(--velum-bg)", borderBottom: "1px solid var(--velum-border-soft)" }}>
          <button onClick={() => setMobileMenu(true)} className="md:hidden p-1.5 -ml-1.5" style={{ color: "var(--velum-text)" }}><Menu size={18} /></button>

          <div className="flex-1 min-w-0">
            <StatusOrb status={status} />
          </div>

          <button onClick={() => setCmdOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors hover:opacity-80"
            style={{ background: "var(--velum-surface)", border: "1px solid var(--velum-border)", color: "var(--velum-text-muted)" }}
            title="Comandos (⌘K)">
            <Search size={14} />
            <span>Buscar…</span>
            <span className="velum-mono text-[10px] ml-4 px-1.5 py-0.5 rounded" style={{ background: "var(--velum-surface2)" }}>⌘K</span>
          </button>

          <button onClick={() => setHideValues(!hideValues)}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: "var(--velum-text-muted)" }} title={hideValues ? "Mostrar valores" : "Esconder valores"}>
            {hideValues ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>

          <button onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: "var(--velum-text-muted)" }} title={mode === "dark" ? "Modo claro (⌘D)" : "Modo escuro (⌘D)"}>
            {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button onClick={() => setShortcutsOpen(true)} className="p-2 rounded-lg hover:opacity-80" style={{ color: "var(--velum-text-muted)" }} title="Atalhos (?)">
            <Keyboard size={16} />
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-3" style={{ borderLeft: "1px solid var(--velum-border-soft)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: palette.accent, color: "white" }}>
              {(profile.name || user.email)[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium truncate max-w-[120px]">{profile.name || user.email}</span>
          </div>
        </header>

        {/* Page title */}
        <div className="px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">
              {NAV.find((n) => n.id === route)?.label}
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--velum-text-muted)" }}>
              {route === "overview" && (profile.name ? `Bom te ver, ${profile.name.split(" ")[0]}. ` : "") + "Seu retrato financeiro do mês."}
              {route === "incomes" && "Tudo que entra no seu caixa."}
              {route === "fixed" && "Compromissos mensais que se repetem."}
              {route === "variable" && "Gastos pontuais e flexíveis do mês."}
              {route === "categories" && "Como você classifica suas saídas."}
              {route === "debts" && "Pontuais (curtas) e grandes (longas)."}
              {route === "goals" && "Onde você quer chegar — com plano da Velum AI."}
              {route === "budgets" && "Aceito vira saída, negado some, negociado aguarda."}
              {route === "notifications" && "Análises diárias da Velum AI sobre seus passos."}
              {route === "settings" && "Personalize Velum do seu jeito."}
            </p>
          </div>
        </div>

        {/* Routes */}
        <div className="px-4 sm:px-6 pb-10 pt-2 flex-1">
          <div key={route} className="velum-fade">
            {route === "overview" && <PageOverview data={{ incomes, fixed, variable, categories }} profile={profile} status={status} />}
            {route === "incomes" && (
              <TxList items={incomes} kind="income" categories={categories}
                emptyTitle="Sem entradas ainda" emptyHint="Adicione salário, freelas, dividendos."
                onAdd={() => setTxModal({ kind: "income" })}
                onEdit={(t) => setTxModal({ kind: "income", item: t })}
                onDelete={(id) => setIncomes(incomes.filter((x) => x.id !== id))} />
            )}
            {route === "fixed" && (
              <TxList items={fixed} kind="fixed" categories={categories}
                emptyTitle="Sem saídas fixas" emptyHint="Aluguel, internet, plano de saúde, assinaturas."
                onAdd={() => setTxModal({ kind: "fixed" })}
                onEdit={(t) => setTxModal({ kind: "fixed", item: t })}
                onDelete={(id) => setFixed(fixed.filter((x) => x.id !== id))} />
            )}
            {route === "variable" && (
              <TxList items={variable} kind="variable" categories={categories}
                emptyTitle="Sem saídas variáveis" emptyHint="Mercado, restaurante, gasolina, etc."
                onAdd={() => setTxModal({ kind: "variable" })}
                onEdit={(t) => setTxModal({ kind: "variable", item: t })}
                onDelete={(id) => setVariable(variable.filter((x) => x.id !== id))} />
            )}
            {route === "categories" && <PageCategories categories={categories} setCategories={setCategories} data={{ fixed, variable }} />}
            {route === "debts" && <PageDebts debts={debts} setDebts={setDebts} />}
            {route === "goals" && <PageGoals goals={goals} setGoals={setGoals} financialContext={financialContext} />}
            {route === "budgets" && <PageBudgets budgets={budgets} setBudgets={setBudgets} categories={categories} onAccept={onAcceptBudget} />}
            {route === "notifications" && <PageNotifications notifications={notifications} setNotifications={setNotifications} financialContext={financialContext} />}
            {route === "settings" && <PageSettings profile={profile} setProfile={setProfile} onLogout={onLogout} onShowShortcuts={() => setShortcutsOpen(true)} />}
          </div>
        </div>
      </main>

      {/* Tx modal */}
      <Modal open={!!txModal} onClose={() => setTxModal(null)}
        title={txModal?.item ? "Editar" : `Nova ${txModal?.kind === "income" ? "entrada" : txModal?.kind === "fixed" ? "saída fixa" : "saída variável"}`}>
        {txModal && (
          <TxForm initial={txModal.item} kind={txModal.kind} categories={categories}
            onCancel={() => setTxModal(null)}
            onSave={(tx) => {
              const setter = txModal.kind === "income" ? setIncomes : txModal.kind === "fixed" ? setFixed : setVariable;
              setter((prev) => prev.find((x) => x.id === tx.id) ? prev.map((x) => x.id === tx.id ? tx : x) : [...prev, tx]);
              setTxModal(null);
            }} />
        )}
      </Modal>

      {/* Cmd palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)}
        onNavigate={(t) => setRoute(t)}
        onAction={(t) => {
          if (t.startsWith("new:")) setTxModal({ kind: t.split(":")[1] });
          if (t === "toggle:dark") setMode(mode === "dark" ? "light" : "dark");
        }}
      />

      {/* Shortcuts */}
      <Modal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} title="Atalhos de teclado">
        <div className="space-y-3 text-sm">
          {[
            ["Abrir comandos", "⌘K"],
            ["Recolher menu", "⌘B"],
            ["Alternar tema", "⌘D"],
            ["Nova transação", "⌘N"],
            ["Visão Geral", "1"],
            ["Entradas", "2"],
            ["Saídas Fixas", "3"],
            ["Saídas Variáveis", "4"],
            ["Categorias", "5"],
            ["Dívidas", "6"],
            ["Objetivos", "7"],
            ["Orçamentos", "8"],
            ["Notificações", "9"],
            ["Configurações", "0"],
            ["Mostrar atalhos", "?"],
            ["Fechar modal", "ESC"],
          ].map(([label, key]) => (
            <div key={label} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid var(--velum-border-soft)" }}>
              <span>{label}</span>
              <span className="velum-mono text-xs px-2 py-0.5 rounded" style={{ background: "var(--velum-surface2)", color: "var(--velum-text-muted)" }}>{key}</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

/* =========================================================================
   ROOT
   ========================================================================= */
export default function VelumFinancas() {
  const [auth, setAuth] = useState(null);
  const [onboarded, setOnboarded] = useState(null); // null = loading
  const [styleInjected, setStyleInjected] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined" && !styleInjected) {
      const style = document.createElement("style");
      style.textContent = FONT_CSS;
      style.dataset.velum = "true";
      document.head.appendChild(style);
      setStyleInjected(true);
    }
  }, [styleInjected]);

  // Auth bootstrap — Supabase when enabled, localStorage otherwise.
  useEffect(() => {
    let unsub = null;

    (async () => {
      const o = await storage.get("velum:onboarded");
      setOnboarded(!!o);

      if (isSupabaseEnabled) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setAuth({ email: session.user.email, id: session.user.id });
        } else {
          setAuth(false);
        }
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setAuth({ email: session.user.email, id: session.user.id });
          } else {
            setAuth(false);
          }
        });
        unsub = () => listener.subscription.unsubscribe();
      } else {
        const a = await storage.get("velum:auth");
        setAuth(a || false);
      }
    })();

    return () => { if (unsub) unsub(); };
  }, []);

  const handleLogout = async () => {
    if (isSupabaseEnabled) {
      await supabase.auth.signOut();
    } else {
      await storage.del("velum:auth");
      setAuth(false);
    }
  };

  return (
    <ThemeProvider>
      {auth === null || onboarded === null ? (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--velum-bg)", color: "var(--velum-text)" }}>
          <Loader2 size={18} className="animate-spin" />
        </div>
      ) : !auth ? (
        <LoginScreen onAuth={(u) => setAuth(u)} />
      ) : !onboarded ? (
        <Onboarding onDone={() => setOnboarded(true)} />
      ) : (
        <Shell user={auth} onLogout={handleLogout} />
      )}
    </ThemeProvider>
  );
}
