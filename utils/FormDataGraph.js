const { sphereColorRules, goodCategory, badCategory } = require("./emotionRules");

class FormDataGraph {
  constructor() {
    this.spheres = [];
    this.connections = [];
  }

  addSphere(name, radius) {
    const color = sphereColorRules[name] || "#A9A9A9";
    this.spheres.push({ name, color, radius });
  }

  addConnection(from, to, symbol) {
    this.connections.push({ from, to, symbol });
  }

  getConnectionSymbol(emotion) {
    if (goodCategory.includes(emotion)) return ">";
    if (badCategory.includes(emotion)) return "<";
    return "-";
  }

  shouldConnect(e1, e2) {
    if (goodCategory.includes(e1) && goodCategory.includes(e2)) return true;
    if (badCategory.includes(e1) && badCategory.includes(e2)) return true;
    return false;
  }

  generateConnections(selectedEmotion, otherEmotions) {
    const symbol = this.getConnectionSymbol(selectedEmotion);
    for (const emotion of otherEmotions) {
      if (this.shouldConnect(selectedEmotion, emotion)) {
        this.addConnection(selectedEmotion, emotion, symbol);
      }
    }
  }
}

module.exports = FormDataGraph;
