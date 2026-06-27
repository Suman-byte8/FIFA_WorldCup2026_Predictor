"use client";
import { useState, useEffect } from "react";

/* ─── Design tokens ─────────────────────────────────────────────── */
const C = {
  bg:        "#F7F8FC",
  surface:   "#FFFFFF",
  border:    "#E2E8F0",
  divider:   "#F1F5F9",
  text:      "#0F172A",
  textSub:   "#334155",
  muted:     "#64748B",
  faint:     "#94A3B8",
  xFaint:    "#CBD5E1",
  navy:      "#0F4C81",
  navyTint:  "#EBF3FF",
  inputBg:   "#FAFBFD",
  error:     "#DC2626",
} as const;

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/* ─── Reusable micro-styles ─────────────────────────────────────── */
const s = {
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: C.faint,
    marginBottom: "6px",
  } as React.CSSProperties,

  vsBadge: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: C.faint,
    backgroundColor: "#F8FAFC",
    border: `1px solid ${C.border}`,
    borderRadius: "5px",
    padding: "5px 7px",
    lineHeight: 1 as number,
  } as React.CSSProperties,

  pill: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: C.navy,
    backgroundColor: C.navyTint,
    padding: "3px 10px",
    borderRadius: "100px",
  } as React.CSSProperties,

  card: {
    backgroundColor: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: "14px",
    width: "100%",
    maxWidth: "544px",
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)",
  } as React.CSSProperties,
};

/* ─── Scoped responsive CSS ─────────────────────────────────────── */
const STYLES = `
  .team-grid {
    display: grid;
    grid-template-columns: 1fr 44px 1fr;
    gap: 10px;
    align-items: end;
  }
  .vs-cell {
    display: flex;
    justify-content: center;
    padding-bottom: 2px;
  }
  .score-card-grid {
    display: grid;
    grid-template-columns: 1fr 48px 1fr;
    align-items: center;
    gap: 8px;
  }
  @media (max-width: 479px) {
    .team-grid {
      grid-template-columns: 1fr;
      gap: 0;
    }
    .vs-cell {
      padding: 8px 0 6px;
    }
    .xg-num {
      font-size: 34px !important;
    }
    .team-nm {
      font-size: 14px !important;
    }
  }
`;

/* ─── Component ─────────────────────────────────────────────────── */
export default function Home() {
  const [teams, setTeams]       = useState<string[]>([]);
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [result, setResult]     = useState<any>(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    fetch("https://world-cup-ai-api-0c3h.onrender.com/teams")
      .then((r) => r.json())
      .then((d) => {
        setTeams(d.teams);
        setHomeTeam(d.teams[0]);
        setAwayTeam(d.teams[1]);
      });
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const r = await fetch("https://world-cup-ai-api-0c3h.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        home_team: homeTeam,
        away_team: awayTeam,
        is_neutral: true,
      }),
    });
    setResult(await r.json());
    setLoading(false);
  };

  const sameTeam = homeTeam === awayTeam;
  const isDraw   = result?.predicted_winner === "Draw (Penalties Required)";

  /* ── Shared select style ── */
  const selectSt: React.CSSProperties = {
    width: "100%",
    padding: "10px 36px 10px 12px",
    borderRadius: "8px",
    border: `1.5px solid ${C.border}`,
    backgroundColor: C.inputBg,
    fontSize: "14px",
    fontWeight: 500,
    color: C.text,
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    fontFamily: FONT,
    transition: "border-color 0.15s",
  };

  /* ── Scoreboard side panel (home / away) ── */
  const ScoreSide = ({
    role,
    name,
    xg,
    highlight,
  }: {
    role: string;
    name: string;
    xg: string;
    highlight: boolean;
  }) => (
    <div style={{ textAlign: "center" }}>
      <p style={{
        fontSize: "11px",
        fontWeight: 700,
        color: C.faint,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        margin: "0 0 8px 0",
      }}>
        {role}
      </p>
      <p
        className="team-nm"
        style={{
          fontSize: "17px",
          fontWeight: 700,
          color: C.text,
          margin: "0 0 18px 0",
          lineHeight: 1.2,
        }}
      >
        {name}
      </p>
      <p
        className="xg-num"
        style={{
          fontSize: "44px",
          fontWeight: 800,
          color: highlight ? C.navy : C.textSub,
          margin: 0,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {xg}
      </p>
      <p style={{
        fontSize: "10px",
        fontWeight: 700,
        color: C.xFaint,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        margin: "6px 0 0 0",
      }}>
        Expected Goals
      </p>
    </div>
  );

  /* ── Render ── */
  return (
    <>
      <style>{STYLES}</style>

      <main
        style={{
          minHeight: "100vh",
          backgroundColor: C.bg,
          fontFamily: FONT,
          color: C.text,
          padding: "52px 16px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >

        {/* ── HEADER ────────────────────────────────────────────── */}
        <header style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ marginBottom: "14px" }}>
            <span style={s.pill}>FIFA World Cup · 2026</span>
          </div>
          <h1
            style={{
              fontSize: "clamp(26px, 5vw, 36px)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              margin: "0 0 10px 0",
              lineHeight: 1.1,
              color: C.text,
            }}
          >
            Match Predictor
          </h1>
          <p style={{ fontSize: "14px", color: C.muted, margin: 0, lineHeight: 1.65 }}>
            Select two nations and simulate their fixture
            <br />
            using AI-driven match analysis.
          </p>
        </header>

        {/* ── FORM CARD ─────────────────────────────────────────── */}
        <form onSubmit={handlePredict} style={s.card}>

          {/* Team selection section */}
          <div style={{ padding: "28px 28px 0" }}>
            <p style={{ ...s.label, color: C.muted, marginBottom: "18px" }}>
              Choose teams
            </p>

            {/*
              Three-column grid on desktop:  [Home select] [VS] [Away select]
              Single-column stack on mobile: [Home select] / [VS] / [Away select]
              The .vs-cell naturally re-centers in a 1-col layout — no JS needed.
            */}
            <div className="team-grid">

              <div>
                <label style={s.label}>Home</label>
                <select
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  style={selectSt}
                >
                  {teams.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="vs-cell">
                <span style={s.vsBadge}>VS</span>
              </div>

              <div>
                <label style={s.label}>Away</label>
                <select
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  style={selectSt}
                >
                  {teams.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Validation */}
            <div style={{ minHeight: "28px", paddingTop: "8px" }}>
              {sameTeam && (
                <p style={{
                  fontSize: "12px",
                  color: C.error,
                  fontWeight: 500,
                  margin: 0,
                }}>
                  Both teams are the same — select two different nations.
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <hr style={{ border: "none", borderTop: `1px solid ${C.divider}`, margin: 0 }} />

          {/* Submit */}
          <div style={{ padding: "20px 28px 24px" }}>
            <button
              type="submit"
              disabled={loading || sameTeam}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: loading || sameTeam ? "#E8ECF2" : C.navy,
                color: loading || sameTeam ? C.faint : "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.01em",
                cursor: loading || sameTeam ? "not-allowed" : "pointer",
                fontFamily: FONT,
                transition: "background-color 0.2s",
              }}
            >
              {loading ? "Running simulation…" : "Predict Match Outcome"}
            </button>
          </div>

        </form>

        {/* ── RESULT CARD ───────────────────────────────────────── */}
        {result && (
          <div style={{ ...s.card, marginTop: "16px" }}>

            {/* Card header */}
            <div style={{
              padding: "14px 28px",
              borderBottom: `1px solid ${C.divider}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ ...s.label, margin: 0 }}>Simulation result</span>
              <span style={s.pill}>Complete</span>
            </div>

            {/*
              Scoreboard — broadcast-style layout:
              [Home xG] | VS | [Away xG]
              The vertical rule + VS badge acts as the pitch-centre-line motif.
            */}
            <div
              className="score-card-grid"
              style={{ padding: "32px 28px" }}
            >
              <ScoreSide
                role="Home"
                name={result.home_team}
                xg={result.home_xG}
                highlight={true}
              />

              {/* Centre divider */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}>
                <div style={{ width: "1px", height: "32px", backgroundColor: C.border }} />
                <span style={s.vsBadge}>VS</span>
                <div style={{ width: "1px", height: "32px", backgroundColor: C.border }} />
              </div>

              <ScoreSide
                role="Away"
                name={result.away_team}
                xg={result.away_xG}
                highlight={false}
              />
            </div>

            {/* Winner footer */}
            <div style={{
              padding: "15px 28px",
              borderTop: `1px solid ${C.divider}`,
              backgroundColor: isDraw ? "#F8FAFC" : C.navyTint,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
            }}>
              <span style={{
                ...s.label,
                margin: 0,
                color: isDraw ? C.faint : C.navy,
                flexShrink: 0,
              }}>
                Projected Winner
              </span>
              <span style={{
                fontSize: "15px",
                fontWeight: 700,
                color: isDraw ? C.muted : C.navy,
                textAlign: "right",
                lineHeight: 1.3,
              }}>
                {isDraw
                  ? "Draw — Penalties Required"
                  : result.predicted_winner}
              </span>
            </div>

          </div>
        )}

      </main>
    </>
  );
}