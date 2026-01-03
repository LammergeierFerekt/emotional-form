const sphereColorRules = {
  Fericire: "#FFDF00",
  Entuziasm: "#FF4500",
  Calm: "#87CEFA",
  Mulțumire: "#90EE90",
  Iubire: "#FF1493",
  Speranță: "#ADD8E6",
  Seninătate: "#E0FFFF",
  Curiozitate: "#E6E6FA",
  Empatie: "#DA70D6",
  Surpriză: "#FF69B4",
  Neutralitate: "#A9A9A9",
  Tristețe: "#4682B4",
  Frică: "#2F4F4F",
  Furie: "#B22222",
  Invidie: "#556B2F",
  Singurătate: "#483D8B",
  Vinovăție: "#800000",
  Anxietate: "#CD5C5C",
  Amărăciune: "#FF8C00",
  Nostalgie: "#F0E68C",
  Confuzie: "#808000",
};

const radiusRules = {
  "Super tare": 15,
  Tare: 10,
  Uneori: 8,
  Neutru: 5,
  "Nu prea": 2,
  Deloc: 0,
};

const goodCategory = [
  "Fericire", "Entuziasm", "Calm", "Mulțumire", "Iubire",
  "Speranță", "Seninătate", "Curiozitate", "Empatie", "Surpriză",
];

const badCategory = [
  "Tristețe", "Frică", "Furie", "Invidie", "Singurătate",
  "Vinovăție", "Anxietate", "Amărăciune", "Nostalgie", "Confuzie",
];

module.exports = {
  sphereColorRules,
  radiusRules,
  goodCategory,
  badCategory,
};
