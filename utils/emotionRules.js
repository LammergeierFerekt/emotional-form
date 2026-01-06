// utils/emotionRules.js

// 1) Emotion -> RGB string for Blender CSV ("RGB(r,g,b)")
const sphereColorRules = {
  Fericire: "RGB(255,223,0)",
  Entuziasm: "RGB(255,69,0)",
  Calm: "RGB(135,206,250)",
  "Mulțumire": "RGB(144,238,144)",
  Iubire: "RGB(255,20,147)",
  "Speranță": "RGB(173,216,230)",
  "Seninătate": "RGB(224,255,255)",
  Curiozitate: "RGB(230,230,250)",
  Empatie: "RGB(218,112,214)",
  "Surpriză": "RGB(255,105,180)",
  Neutralitate: "RGB(169,169,169)",
  "Tristețe": "RGB(70,130,180)",
  "Frică": "RGB(47,79,79)",
  Furie: "RGB(178,34,34)",
  Invidie: "RGB(85,107,47)",
  "Singurătate": "RGB(72,61,139)",
  "Vinovăție": "RGB(128,0,0)",
  Anxietate: "RGB(205,92,92)",
  "Amărăciune": "RGB(255,140,0)",
  Nostalgie: "RGB(240,230,140)",
  Confuzie: "RGB(128,128,0)",
};

// 2) Intensity label -> radius
const radiusRules = {
  "Super tare": 15,
  Tare: 10,
  Uneori: 8,
  Neutru: 5,
  "Nu prea": 2,
  Deloc: 0,
};

// 3) Valence groups -> connection type
const POSITIVE = new Set([
  "Fericire",
  "Entuziasm",
  "Calm",
  "Mulțumire",
  "Iubire",
  "Speranță",
  "Seninătate",
  "Curiozitate",
  "Empatie",
  "Surpriză",
]);

const NEGATIVE = new Set([
  "Tristețe",
  "Frică",
  "Furie",
  "Invidie",
  "Singurătate",
  "Vinovăție",
  "Anxietate",
  "Amărăciune",
  "Nostalgie",
  "Confuzie",
]);

function connectionTypeFromEmotion(emotion) {
  if (POSITIVE.has(emotion)) return ">";
  if (NEGATIVE.has(emotion)) return "<";
  return "="; // Neutral or unknown
}

function colorFromEmotion(emotion) {
  return sphereColorRules[emotion] || "RGB(200,200,200)";
}

function radiusFromIntensity(label) {
  return radiusRules[label] ?? 1;
}

module.exports = {
  sphereColorRules,
  radiusRules,
  connectionTypeFromEmotion,
  colorFromEmotion,
  radiusFromIntensity,
};
