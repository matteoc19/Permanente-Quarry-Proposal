import { useState } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const SCENARIOS = [
  {
    id: "fill",
    name: "Fill / Reclamation to Grade",
    tier: "act",
    timeline: "Obligated; underway on approval",
    basis: "42 mcy mandated backfill, of which 31.2 mcy imported (RPA Table 5)",
    note: "The only candidate the site is already legally required to perform. Every other use waits on ownership transfer, funding, or contamination cleanup that does not yet exist. Carried forward to Pass 02.",
    carried: true,
  },
  {
    id: "openspace",
    name: "Open Space + Trail Corridor",
    tier: "long",
    timeline: "2065+",
    basis: "Adjacent to 65,000 ac Midpen greenbelt; trail to Rancho San Antonio",
    note: "The most desirable long-term outcome and the most likely eventual one. But private ownership runs to 2065 and no public agency has committed acquisition funding. Strong on destination, absent on mechanism.",
  },
  {
    id: "water",
    name: "Groundwater Recharge",
    tier: "long",
    timeline: "Post-2040",
    basis: "Santa Clara Valley is a critically overdrafted basin",
    note: "A sealed post-remediation pit at elevation could be the county's largest upland recharge asset. Gated entirely on selenium and nickel reaching non-detectable — placing it decades out.",
  },
  {
    id: "solar",
    name: "Overburden Solar",
    tier: "long",
    timeline: "2030s",
    basis: "WMSA 210 ac + EMSA 65 ac, already graded, off the ridgeline",
    note: "Bridge revenue during reclamation rather than an end state. Much of the WMSA is excavated for backfill, shrinking the durable plateau. Still reads as industrial under hillside zoning.",
  },
  {
    id: "research",
    name: "Ecological Research Campus",
    tier: "long",
    timeline: "Post-2040",
    basis: "Seamount limestone (~100M yr); rare metallophyte communities on contaminated soils",
    note: "Scientifically compelling and institutionally unclaimed. No proponent identified; the 2065 completion horizon is too distant for any institution to plan around.",
  },
  {
    id: "hydro",
    name: "Pumped Hydro Storage",
    tier: "blocked",
    timeline: "Foreclosed",
    basis: "~1,200 ft head (1,750 ft high point → 550 ft floor), comparable to Bath County, VA",
    note: "The physical case is real — 200,000 m³ upper reservoir yields ~144 MWh. But the fill mandate exists precisely because the open pit leaches selenium. Retaining the void as a reservoir would require renegotiating the entire reclamation plan.",
  },
];

const TIER = {
  act: { label: "Carried forward", color: "#2B4A3F", bg: "#e2ebe6" },
  long: { label: "Long-horizon", color: "#7a6a3a", bg: "#eee8d8" },
  blocked: { label: "Foreclosed", color: "#8a5a4a", bg: "#eaddd6" },
};

const SITE_STATS = [
  { val: "198 ac", label: "Pit footprint", note: "RPA; GE-corroborated within ~10%" },
  { val: "~1,200 ft", label: "Depth", note: "1,750 ft high point → 550 ft floor" },
  { val: "42 mcy", label: "Mandated backfill", note: "31.2 mcy of it imported" },
  { val: "Dec 2065", label: "Reclamation target", note: "Early phases within 5 yr of approval" },
];

const SPOIL_ROWS = [
  { project: "BART SV Phase II (tunnel + 3 stations)", board: "VTA", volume: "~2.5M yd³", status: "DERIVED", note: "EIR: muck destination unresolved" },
  { project: "Caltrain grade separations (7, three cities)", board: "Caltrain", volume: "~2.2M yd³", status: "ASSUMED", note: "Typological; staggered late-2020s–mid-2030s" },
  { project: "Highway / SCVWD capital projects", board: "—", volume: "~3.5–5M yd³", status: "ASSUMED", note: "Rolling, undated" },
  { project: "Total identified regional supply", board: "—", volume: "~8–10M yd³", status: "", note: "vs. 31.2 mcy imported need", total: true },
];

const CALC_ROWS = [
  ["Tunnel length", "5 mi = 26,400 ft"],
  ["TBM excavated diameter", "~48 ft  (43 ft internal + lining)"],
  ["Cross-section", "π × 24² = 1,810 ft²"],
  ["Tunnel volume (bank)", "1,810 × 26,400 ÷ 27 = 1,770,000 yd³"],
  ["3 station boxes (800×80×50 ft ea.)", "355,000 yd³"],
  ["Swell factor (alluvial clay)", "× 1.25  bank → loose"],
  ["Total (loose)", "≈ 2,780,000 yd³  ·  reported as ~2.5M (conservative)"],
];

const PASS3_FINDINGS = [
  {
    n: "01",
    head: "The mechanism is already codified",
    body: "California's Inert Debris Engineered Fill Operation (14 CCR 17388.3) is a named permit class that lets a quarry accept imported fill and charge tipping fees — and can continue operating after a SMARA reclamation plan closes. The financial mechanism modeled from first principles in Pass 02 is existing statute.",
  },
  {
    n: "02",
    head: "The operator is not outside the supply",
    body: "Heidelberg Materials sells aggregate, cement, and ready-mix to the contractors building these projects; aggregate operations at Permanente continue today. Their own RPA carries a commissioned four-county regional soil-supply study estimating 500k–1M yd³/yr receivable. This is not a party lacking visibility into regional material flows.",
  },
  {
    n: "03",
    head: "The binding constraint sits upstream of all of it",
    body: "The RPA is not yet approved. Until Santa Clara County approves it, Permanente cannot legally receive imported fill at all — no soils management plan, no IDEFO, no receiving operation. Meanwhile VTA's tunneling contract is let before boring begins in 2027, and contractors commit spoil destinations at bid.",
  },
];

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────

function PassHeader({ num, title, purpose, method }) {
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "0.9rem" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", color: "var(--accent)", letterSpacing: "0.14em", fontWeight: 500 }}>
          PASS {num}
        </span>
        <div style={{ flex: 1, height: 2, background: "var(--ink)" }} />
      </div>
      <h2 style={{ fontFamily: "var(--display)", fontSize: "1.6rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.01em", marginBottom: "0.9rem", lineHeight: 1.15 }}>
        {title}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--rule)", border: "1px solid var(--rule)" }}>
        <div style={{ background: "var(--white)", padding: "0.85rem 1rem" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--light)", marginBottom: "0.35rem" }}>
            Purpose
          </div>
          <div style={{ fontFamily: "var(--body)", fontSize: "0.86rem", color: "var(--ink)", lineHeight: 1.6 }}>{purpose}</div>
        </div>
        <div style={{ background: "#f4f6f4", padding: "0.85rem 1rem" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--accent)", marginBottom: "0.35rem" }}>
            Method — Claude
          </div>
          <div style={{ fontFamily: "var(--body)", fontSize: "0.86rem", color: "var(--mid)", lineHeight: 1.6, fontStyle: "italic" }}>{method}</div>
        </div>
      </div>
    </div>
  );
}

function Finding({ children }) {
  return (
    <div style={{ borderLeft: "3px solid var(--accent)", paddingLeft: "1rem", margin: "1.75rem 0 2.75rem" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--accent)", marginBottom: "0.4rem" }}>
        Finding
      </div>
      <div style={{ fontFamily: "var(--body)", fontSize: "0.95rem", color: "var(--ink)", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function Figure({ number, sheet, title, src, alt }) {
  return (
    <div style={{ marginBottom: "2.25rem" }}>
      <div style={{ border: "1.5px solid var(--ink)", background: "var(--white)", position: "relative" }}>
        {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i)=>(
          <div key={i} style={{ position:"absolute", [v]:-1, [h]:-1, width:12, height:12,
            borderTop: v==="top"?"1.5px solid var(--ink)":"none", borderBottom: v==="bottom"?"1.5px solid var(--ink)":"none",
            borderLeft: h==="left"?"1.5px solid var(--ink)":"none", borderRight: h==="right"?"1.5px solid var(--ink)":"none" }} />
        ))}
        <div style={{ padding: "0.8rem 0.9rem 0" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.5rem", color: "var(--accent)", letterSpacing: "0.14em" }}>{sheet}</div>
        </div>
        <img src={src} alt={alt} style={{ width: "100%", height: "auto", display: "block", padding: "0.6rem 0.9rem 0.9rem" }} />
      </div>
      <div style={{ border: "1.5px solid var(--ink)", borderTop: "none", display: "grid", gridTemplateColumns: "1fr auto",
        fontFamily: "var(--mono)", fontSize: "0.48rem", color: "var(--light)" }}>
        <div style={{ padding: "0.35rem 0.7rem", letterSpacing: "0.08em" }}>PERMANENTE QUARRY · {title}</div>
        <div style={{ padding: "0.35rem 0.7rem", borderLeft: "1px solid var(--rule)", letterSpacing: "0.08em" }}>SHEET {number}/2</div>
      </div>
    </div>
  );
}

function ScenarioRow({ sc }) {
  const [open, setOpen] = useState(!!sc.carried);
  const t = TIER[sc.tier];
  const locked = !!sc.carried;
  return (
    <div
      onClick={() => { if (!locked) setOpen(o => !o); }}
      style={{
        cursor: locked ? "default" : "pointer",
        borderBottom: "1px solid var(--rule)",
        background: sc.carried ? "var(--white)" : "transparent",
        border: sc.carried ? "1.5px solid var(--accent)" : undefined,
        marginBottom: sc.carried ? "0.75rem" : 0,
        padding: sc.carried ? "0 1rem" : 0,
      }}
    >
      <div style={{ padding: "0.85rem 0", display: "grid", gridTemplateColumns: "1fr 130px 20px", gap: "1rem", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--body)", fontSize: "0.92rem", color: "var(--ink)", fontWeight: sc.carried ? 600 : 400, marginBottom: "0.2rem" }}>
            {sc.name}
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.52rem", color: "var(--light)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {sc.timeline}
          </div>
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: "0.54rem", color: t.color, background: t.bg, padding: "3px 8px", letterSpacing: "0.05em", textAlign: "center" }}>
          {t.label}
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", color: "var(--light)" }}>{locked ? "" : (open ? "–" : "+")}</span>
      </div>
      {open && (
        <div style={{ paddingBottom: "1rem" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.58rem", color: "var(--mid)", marginBottom: "0.5rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--rule)" }}>
            {sc.basis}
          </div>
          <div style={{ fontFamily: "var(--body)", fontSize: "0.86rem", color: "var(--mid)", lineHeight: 1.7, fontStyle: "italic", marginBottom: sc.carried ? "1.1rem" : 0 }}>
            {sc.note}
          </div>
          {sc.carried && (
            <div onClick={(e) => e.stopPropagation()}>
              <Figure
                number="1"
                sheet="SHEET 1 — SECTION · RIM TO FLOOR"
                title="QUARRY CROSS-SECTION"
                src="/diagram-1-section.svg"
                alt="Quarry cross-section showing 1,750 ft high point, 550 ft floor, 990 ft fill design surface, on-site fill volume and remaining imported-fill gap"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

export default function PermanentePasses() {
  return (
    <div style={{
      "--bg": "#F2F0E8", "--white": "#FFFFFF", "--ink": "#1C1C19", "--mid": "#5C5C52",
      "--light": "#A8A89A", "--rule": "#D8D5CB", "--accent": "#2B4A3F",
      "--display": "'Playfair Display', Georgia, serif",
      "--body": "'Source Serif 4', Georgia, serif",
      "--mono": "'IBM Plex Mono', 'Courier New', monospace",
      background: "var(--bg)", color: "var(--ink)", minHeight: "100vh", fontFamily: "var(--body)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        table { width: 100%; border-collapse: collapse; }
      `}</style>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "3.5rem 2.5rem 5rem" }}>

        {/* ── MASTHEAD ── */}
        <div style={{ marginBottom: "3.5rem" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.54rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--light)", marginBottom: "0.7rem" }}>
            Independent Research · Santa Clara County, CA
          </div>
          <h1 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "2.6rem", lineHeight: 1.08, letterSpacing: "-0.015em", color: "var(--ink)", marginBottom: "0.5rem" }}>
            Permanente Quarry
          </h1>
          <div style={{ fontFamily: "var(--display)", fontSize: "1.15rem", fontStyle: "italic", fontWeight: 400, color: "var(--mid)", marginBottom: "1.1rem" }}>
            Three passes of research on a post-extraction site proposal
          </div>
          <div style={{ height: 2, background: "var(--ink)", marginBottom: "1.5rem" }} />

          <img
            src="/aerial-site.jpg"
            alt="Aerial view of Permanente Quarry, Cupertino foothills, Santa Clara County"
            style={{ width: "100%", height: "auto", display: "block", border: "1px solid var(--rule)", marginBottom: "0.4rem" }}
          />
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.5rem", color: "var(--light)", letterSpacing: "0.06em", marginBottom: "1.75rem" }}>
            Permanente Quarry · Cupertino foothills, Santa Clara County · oblique aerial
          </div>

          <p style={{ fontFamily: "var(--body)", fontSize: "1rem", color: "var(--mid)", lineHeight: 1.75, maxWidth: 640 }}>
            A closing quarry in the Cupertino foothills — 198 acres, roughly 1,200 feet deep, 42 million cubic yards of mandated backfill, and a forty-year reclamation horizon with no settled answer about what the site becomes.
          </p>
          <p style={{ fontFamily: "var(--body)", fontSize: "1rem", color: "var(--mid)", lineHeight: 1.75, maxWidth: 640, marginTop: "0.9rem" }}>
            What follows is three passes of research at increasing depth. Each pass narrowed the question; each narrowing changed what the next pass could ask. The method note at the head of each section describes how Claude was used at that depth — the use changes as the questions get harder.
          </p>
        </div>

        {/* ── PASS 01 ── */}
        <PassHeader
          num="01"
          title="Solution Space"
          purpose="What could this site become? Generate candidate successor uses broadly, then evaluate each against physical, regulatory, and institutional conditions."
          method="Used to widen the candidate set beyond my own priors — surfacing uses I would not have generated alone — then to score each against site conditions and surface the disqualifying constraint for each."
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--rule)", border: "1px solid var(--rule)", marginBottom: "2rem" }}>
          {SITE_STATS.map(s => (
            <div key={s.label} style={{ background: "var(--white)", padding: "0.9rem 1rem" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "1.15rem", fontWeight: 500, color: "var(--ink)", marginBottom: "0.2rem" }}>{s.val}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "0.48rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--light)", marginBottom: "0.15rem" }}>{s.label}</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "0.5rem", color: "#c0bdb5" }}>{s.note}</div>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: "var(--mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--light)", marginBottom: "0.75rem" }}>
          Six candidates · expand to read the evaluation
        </div>
        <div style={{ marginBottom: "1rem" }}>
          {SCENARIOS.map(sc => <ScenarioRow key={sc.id} sc={sc} />)}
        </div>

        <Finding>
          Fill is the only candidate <strong>actionable now</strong> — because it is the one the site is already legally obligated to perform. Every other use waits on an ownership transfer, a funding source, or a contamination cleanup that does not yet exist. Open space remains the most desirable end state and the most likely eventual one; it is also a forty-year horizon with no committed actor. That gap between <em>desirable</em> and <em>actionable</em> is what carried fill into Pass 02.
        </Finding>

        {/* ── PASS 02 ── */}
        <PassHeader
          num="02"
          title="Scenario Definition"
          purpose="If fill, then who supplies it, in what volume, and on what timeline? Take the surviving candidate to real parties, real numbers, real schedules."
          method="Used to mine the operator's 1,869-page reclamation filing for the governing figures, derive excavation volumes from published project dimensions, reconcile those against independent satellite measurement, and build the visualizations."
        />

        <p style={{ fontFamily: "var(--body)", fontSize: "0.9rem", color: "var(--mid)", lineHeight: 1.75, marginBottom: "1.5rem" }}>
          The obligation, from the operator's own Reclamation Plan Amendment (Vol. I, §4.2, Table 5): 42 million cubic yards of pit backfill, of which <strong style={{ color: "var(--ink)" }}>31.2 million must be imported from off-site.</strong> The fill reaches a design surface of 990 ft MSL — the lowest natural outlet in the surrounding topography, chosen so the reclaimed surface cannot impound water. Independent Google Earth measurement returned a 225-acre pit footprint against the RPA's stated 198; the variance traces to the difference between full excavation disturbance and the defined reclamation area, and the official figure was carried forward.
        </p>

        {/* Spoil supply table */}
        <div style={{ fontFamily: "var(--mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--light)", marginBottom: "0.6rem" }}>
          Regional excavation supply · derived and estimated
        </div>
        <table style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", marginBottom: "1.5rem" }}>
          <thead>
            <tr>
              {["Project", "Agency", "Volume", "Basis", "Note"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "0.4rem 0.6rem", borderBottom: "2px solid var(--ink)", color: "var(--light)", fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.48rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPOIL_ROWS.map((r, i) => (
              <tr key={i}>
                {[r.project, r.board, r.volume, r.status, r.note].map((cell, ci) => (
                  <td key={ci} style={{
                    padding: "0.5rem 0.6rem",
                    borderBottom: "1px solid var(--rule)",
                    background: r.total ? "#edeae0" : "transparent",
                    color: r.total ? "var(--ink)" : ci === 3 && cell === "ASSUMED" ? "#8a5a4a" : ci === 3 && cell === "DERIVED" ? "var(--accent)" : "var(--mid)",
                    fontWeight: r.total || ci === 2 ? 500 : 400,
                    verticalAlign: "top", lineHeight: 1.5,
                  }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculation */}
        <div style={{ background: "var(--white)", border: "1px solid var(--rule)", padding: "1.1rem 1.25rem", marginBottom: "1rem" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.48rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--light)", marginBottom: "0.75rem" }}>
            Derivation — BART Phase II tunnel volume
          </div>
          {CALC_ROWS.map(([d, v], i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", padding: "0.35rem 0",
              borderBottom: i < CALC_ROWS.length - 1 ? "1px solid var(--rule)" : "none",
            }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", color: "var(--mid)" }}>{d}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", color: "var(--ink)", fontWeight: 500, whiteSpace: "nowrap" }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ borderLeft: "3px solid var(--ink)", paddingLeft: "0.9rem", marginBottom: "2rem" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "0.54rem", color: "var(--ink)", fontWeight: 500 }}>Confidence — </span>
          <span style={{ fontFamily: "var(--mono)", fontSize: "0.54rem", color: "var(--mid)", lineHeight: 1.65 }}>
            Site dimensions and fill volumes are sourced from the June 2023 RPA, Vol. I §4.2 &amp; Table 5. The BART tunnel figure is derived from published bore dimensions with the arithmetic shown and a stated 1.25 swell factor (range 1.15–1.35). Caltrain and highway volumes are typological estimates, not derivations, and are marked ASSUMED above — they should not be read as measurements.
          </span>
        </div>

        <Figure
          number="2"
          sheet="SHEET 2 — REGIONAL SPOIL FLOW · PLAN"
          title="REGIONAL SPOIL FLOW"
          src="/diagram-2-spoil-flow.svg"
          alt="Regional plan showing BART Phase II tunnel alignment and Caltrain grade-separation corridor converging on Permanente Quarry"
        />

        <Finding>
          The volumes match, the geography works, and the timing windows overlap. BART Phase II alone derives to ~2.5M yd³ against an imported-fill need of 31.2M — and VTA's own environmental review acknowledges the muck destination is unresolved. A coherent scenario: route regional capital-project spoil into the site's imported-fill stream before excavation contracts commit it elsewhere.
          <br /><br />
          <span style={{ fontStyle: "italic", color: "var(--mid)" }}>Coherent is not the same as necessary. Pass 03 tested it against the governing framework.</span>
        </Finding>

        {/* ── PASS 03 ── */}
        <PassHeader
          num="03"
          title="Governing Language & Feasibility"
          purpose="Does the mechanism already exist? Test the Pass 02 scenario against statute, permit classes, and the operator's actual commercial position."
          method="Used adversarially — directed to search for the statutory pathway I had assumed did not exist, and to establish what the operator already knows rather than what I had assumed they did not."
        />

        <div style={{ marginBottom: "1.5rem" }}>
          {PASS3_FINDINGS.map(f => (
            <div key={f.n} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1.1rem", padding: "1.1rem 0", borderBottom: "1px solid var(--rule)" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "1.5rem", color: "var(--rule)", fontWeight: 500, lineHeight: 1 }}>{f.n}</div>
              <div>
                <div style={{ fontFamily: "var(--body)", fontSize: "1rem", fontWeight: 600, color: "var(--ink)", marginBottom: "0.4rem" }}>{f.head}</div>
                <div style={{ fontFamily: "var(--body)", fontSize: "0.88rem", color: "var(--mid)", lineHeight: 1.7 }}>{f.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--ink)", padding: "1.75rem 2rem", marginBottom: "1.5rem" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.5rem", textTransform: "uppercase", letterSpacing: "0.16em", color: "#8a8a80", marginBottom: "0.85rem" }}>
            Pass 03 Finding
          </div>
          <p style={{ fontFamily: "var(--body)", fontSize: "1rem", color: "#d8d5cb", lineHeight: 1.8 }}>
            <strong style={{ color: "#F2F0E8" }}>Treating this as a coordination proposal is unnecessary</strong> — statute and market already perform this work. Heidelberg is a materials supplier to the very projects generating the spoil, the tipping-fee mechanism is codified in IDEFO, and their own consultants have already scoped the regional supply.
          </p>
          <p style={{ fontFamily: "var(--body)", fontSize: "1rem", color: "#d8d5cb", lineHeight: 1.8, marginTop: "1rem" }}>
            <strong style={{ color: "#F2F0E8" }}>The coordination that survives after Pass 3 is a permitting-timeline risk.</strong> If the RPA is not approved before the region's largest excavation contracts are let, the largest single fill source of the decade is committed elsewhere by default — regardless of who wants it or what it would cost. Unlike Passes 01 &amp; 02, this is a live claim about a county permitting decision, carrying real-world context and consequence.
          </p>
        </div>

        <p style={{ fontFamily: "var(--body)", fontSize: "0.9rem", color: "var(--mid)", lineHeight: 1.75, marginBottom: "3.5rem", fontStyle: "italic" }}>
          A scenario that survives Pass 03 is a proposal. One that dissolves has told you something equally useful: the system already works — and here, precisely, is where it doesn't.
        </p>

        {/* ── CODA ── */}
        <div style={{ borderTop: "2px solid var(--ink)", paddingTop: "1.75rem" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.54rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--light)", marginBottom: "1rem" }}>
            What transferred
          </div>
          <p style={{ fontFamily: "var(--body)", fontSize: "1rem", color: "var(--mid)", lineHeight: 1.8, maxWidth: 640, marginBottom: "1rem" }}>
            By narrowing what could be asked, each pass helped arrive at stronger questions. The order also affected the effort — the questions in Pass 03 could have run sooner, preventing unnecessary coordination efforts from surviving as long as they did.
          </p>
          <p style={{ fontFamily: "var(--body)", fontSize: "1rem", color: "var(--mid)", lineHeight: 1.8, maxWidth: 640, marginBottom: "1.5rem" }}>
            The wisdom of which questions to ask, which assumptions to vet, and how to sequence them is now a Claude skill — <span style={{ fontFamily: "var(--mono)", fontSize: "0.88rem", color: "var(--ink)" }}>post-extraction-site-use</span>.
          </p>
          <a
            href="#"
            style={{
              display: "inline-block",
              fontFamily: "var(--mono)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--bg)", background: "var(--accent)", padding: "0.7rem 1.4rem",
              textDecoration: "none", fontWeight: 500,
            }}
          >
            View the skill →
          </a>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ borderTop: "1px solid var(--rule)", paddingTop: "1rem", marginTop: "3rem", display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.5rem", color: "var(--light)", lineHeight: 1.7 }}>
            Sources: Heidelberg Materials Reclamation Plan Amendment, Vol. I (June 2023), §4.2 &amp; Table 5 · permanentequarry.com · VTA BART SV Phase II SEIS/SEIR · Santa Clara County Planning · 14 CCR 17388.3 (IDEFO)<br />
            Volumes marked DERIVED show their arithmetic. Volumes marked ASSUMED are typological estimates and are not measurements.
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.54rem", color: "var(--mid)", textAlign: "right", lineHeight: 1.7 }}>
            Matteo Calafiura-Soleri<br />
            Architect / Stantec
          </div>
        </div>

      </div>
    </div>
  );
}
