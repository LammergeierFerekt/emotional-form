const {
  connectionTypeFromEmotion,
  colorFromEmotion,
  radiusFromIntensity,
} = require("./emotionRules");

// -----------------------------------------------------
// Utilities
// -----------------------------------------------------

function cleanName(name) {
  return String(name || "")
    .trim()
    .replace(/[;,]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-ăâîșțĂÂÎȘȚ]/g, "")
    .trim();
}

function parseQ6List(q6Raw) {
  return String(q6Raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function formatConn(type, target) {
  if (type === ">" || type === "<") return `${type}${target}`;
  // any other value means neutral (no prefix)
  return `${target}`;
}

// NOTE: you told us direction is not relevant; BUT the CSV still stores both
// sides because Blender reads per-row. We'll keep it as-is for compatibility.
function invert(type) {
  if (type === ">") return "<";
  if (type === "<") return ">";
  return null;
}

// -----------------------------------------------------
// Interpret.Emotion engine
// -----------------------------------------------------

function interpretEmotion(e1, e2) {
  const key = [e1, e2].sort().join("+");

  const overrides = {
    "Furie+Iubire": "Frică",
    "Invidie+Iubire": "Anxietate",
    "Amărăciune+Iubire": "Tristețe",
    "Iubire+Vinovăție": "Anxietate",
    "Iubire+Singurătate": "Tristețe",
    "Amărăciune+Speranță": "Tristețe",
    "Confuzie+Speranță": "Anxietate",
    "Curiozitate+Frică": "Frică",
    "Curiozitate+Vinovăție": "Vinovăție",
    "Curiozitate+Furie": "Furie",
    "Empatie+Singurătate": "Tristețe",
    "Empatie+Invidie": "Anxietate",
    "Fericire+Frică": "Frică",
    "Entuziasm+Frică": "Frică",
    "Calm+Furie": "Furie",
    "Amărăciune+Mulțumire": "Amărăciune",
    "Seninătate+Tristețe": "Tristețe",
    "Frică+Surpriză": "Frică",
  };

  if (overrides[key]) return overrides[key];

  if (e1 === "Neutralitate") return e2;
  if (e2 === "Neutralitate") return e1;

  const t1 = connectionTypeFromEmotion(e1);
  const t2 = connectionTypeFromEmotion(e2);
  const e1Good = t1 === ">";
  const e2Good = t2 === ">";
  const e1Bad = t1 === "<";
  const e2Bad = t2 === "<";

  if (e1Bad && e2Good) return e1;
  if (e1Good && e2Bad) return e2;
  if (e1Bad && e2Bad) return e1;
  return e2;
}

// -----------------------------------------------------
// Graph Engine + TRACE
// -----------------------------------------------------

function buildGraphFromSubmission(sub, questionMap = {}) {
  const nodes = new Map();

  // Trace events: each event corresponds to ONE rule-generated edge
  const trace = [];
  function pushTrace({ section, key, from, to, type }) {
    trace.push({
      section,
      key,
      question: questionMap?.[key] || key,
      answer: sub?.[key],
      from,
      to,
      type: type === ">" || type === "<" ? type : "neutral",
    });
  }

  function ensure(name, radius = 1, color = "RGB(200,200,200)") {
    const n = cleanName(name);
    if (!nodes.has(n)) nodes.set(n, { radius, color, conns: new Set() });
    const cur = nodes.get(n);
    cur.radius = Math.max(cur.radius, radius);
    if (cur.color === "RGB(200,200,200)" && color !== cur.color) cur.color = color;
    return n;
  }

  function link(a, b, type) {
    if (!a || !b || a === b) return;
    ensure(a);
    ensure(b);
    nodes.get(a).conns.add(formatConn(type, b));
    nodes.get(b).conns.add(formatConn(invert(type), a));
  }

  function tracedLink(meta, a, b, type) {
    link(a, b, type);
    pushTrace({ ...meta, from: a, to: b, type });
  }

  // ---------- SECTION 0 ----------
  const addiction = ensure(sub.q0_addiction, 6, "RGB(255,223,0)");

  // ---------- SECTION 2 + 3 ----------
  const time = [
    ensure(sub.q2_1),
    ensure(sub.q2_2),
    ensure(sub.q2_3),
    ensure(sub.q2_4),
  ];

  // SECTION 1 rules for q1_1..q1_4
  ["q1_1", "q1_2", "q1_3", "q1_4"].forEach((k, i) => {
    if (["Super tare", "Tare", "Uneori"].includes(sub[k])) {
      tracedLink({ section: "SECTION 1", key: k }, addiction, time[i], "<");
    }
  });

  const motiv = ensure("motiv priori", 3, colorFromEmotion(sub.q3));

  // q3: addiction -> motiv priori (color by emotion)
  tracedLink(
    { section: "SECTION 3", key: "q3" },
    addiction,
    motiv,
    connectionTypeFromEmotion(sub.q3)
  );

  // q3_1..q3_4: motiv -> time spheres (and recolor those spheres)
  ["q3_1", "q3_2", "q3_3", "q3_4"].forEach((k, i) => {
    nodes.get(time[i]).color = colorFromEmotion(sub[k]);
    tracedLink(
      { section: "SECTION 3", key: k },
      motiv,
      time[i],
      connectionTypeFromEmotion(sub[k])
    );
  });

  // ---------- SECTION 4 ----------
  const recompensa = ensure("recompensa", radiusFromIntensity(sub.q4_3));
  const sinele = ensure("sinele", 3, colorFromEmotion(sub.q4_4));
  const familia = ensure("familia", radiusFromIntensity(sub.q4_5), colorFromEmotion(sub.q4_6));
  const munca = ensure("loc de munca", radiusFromIntensity(sub.q4_7), colorFromEmotion(sub.q4_8));

  // q4_1: addiction -> recompensa (emotion)
  tracedLink(
    { section: "SECTION 4", key: "q4_1" },
    addiction,
    recompensa,
    connectionTypeFromEmotion(sub.q4_1)
  );

  // q4_4: recompensa -> sinele neutral/grey connection
  // (no key in spec; but we'll attach it to q4_4 since it's the closest driver)
  tracedLink(
    { section: "SECTION 4", key: "q4_4" },
    recompensa,
    sinele,
    null
  );

  // q4_5: familia -> addiction only if intensity is strong
  if (["Super tare", "Tare", "Uneori"].includes(sub.q4_5)) {
    tracedLink({ section: "SECTION 4", key: "q4_5" }, familia, addiction, "<");
  }

  // q4_7: munca -> addiction only if intensity is strong
  if (["Super tare", "Tare", "Uneori"].includes(sub.q4_7)) {
    tracedLink({ section: "SECTION 4", key: "q4_7" }, munca, addiction, "<");
  }

  // ---------- SECTION 5 ----------
  const memEmotion =
    sub.q5_1 === sub.q5_3 ? sub.q5_1 : interpretEmotion(sub.q5_1, sub.q5_3);

  const memory = ensure(sub.q5, 5, colorFromEmotion(memEmotion));

  // q5_3: memory -> addiction (emotion)
  tracedLink(
    { section: "SECTION 5", key: "q5_3" },
    memory,
    addiction,
    connectionTypeFromEmotion(sub.q5_3)
  );

  const mapQ5 = {
    "Cand mă conectez cu sinele (hobby, introspectie)": sinele,
    "Cand mă conectez cu cei din jur (familia, prieteni, clienti, pacienti)": familia,
    "Cand fac ceva productiv (locul de munca, gospodarie, invatat)": munca,
    "Cand ma distrag cu ceva (reels, film, mancare, muzica, citit)": recompensa,
  };

  // q5_1: memory -> selected target sphere (emotion)
  if (mapQ5[sub.q5_2]) {
    tracedLink(
      { section: "SECTION 5", key: "q5_1" },
      memory,
      mapQ5[sub.q5_2],
      connectionTypeFromEmotion(sub.q5_1)
    );
  }

  // ---------- SECTION 6 ----------
  const elements = parseQ6List(sub.q6);

  const s6 = elements.map((n, i) => {
    return ensure(
      n,
      radiusFromIntensity(sub[`q6_${i + 1}_3`]),
      colorFromEmotion(sub[`q6_${i + 1}_2`])
    );
  });

  // q6_n_1 connects to other section6 spheres (dynamic color rules simplified to same-valence clustering)
  s6.forEach((a, i) => {
    const key = `q6_${i + 1}_1`;
    const t = connectionTypeFromEmotion(sub[key]);
    if (!t || t === "=") return;

    s6.forEach((b) => {
      if (a === b) return;
      tracedLink({ section: "SECTION 6", key }, a, b, t);
    });
  });

  return { nodes, trace };
}

// -----------------------------------------------------
// Export
// -----------------------------------------------------

function buildBlenderSheetsFromSubmission(submission) {
  const questionMap = submission.__questionMap || {};
  const { nodes, trace } = buildGraphFromSubmission(submission, questionMap);

  const sphereRows = [];
  const coordRows = [];

  for (const [name, n] of nodes.entries()) {
    sphereRows.push({
      sphere_name: name,
      position: "0,0,0",
      radius: n.radius,
      sphere_color: n.color,
      connection: Array.from(n.conns).join("; "),
    });
    coordRows.push({ x: 0, y: 0, z: 0, radius: n.radius });
  }

  return { sphereRows, coordRows, trace };
}

module.exports = { buildBlenderSheetsFromSubmission };
