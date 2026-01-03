const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');
const sanitizeHtml = require('sanitize-html');

// Define the schema for the form data
const formDataSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    feedback: { type: String, trim: true },
    dynamicQuestions: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

// Middleware for sanitizing data before saving it to the database
formDataSchema.pre('save', function (next) {
  // Sanitize all string fields in the form data
  for (const [key, value] of Object.entries(this.toObject())) {
    if (typeof value === 'string') {
      this[key] = sanitizeHtml(value, {
        allowedTags: [],
        allowedAttributes: {},
      });
    }
  }

  // Sanitize dynamic questions if they exist
  if (this.dynamicQuestions) {
    for (const [key, value] of this.dynamicQuestions) {
      this.dynamicQuestions.set(
        key,
        sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
      );
    }
  }

  next();
});

// Export the model
module.exports = mongoose.model('FormData', formDataSchema);

// Sphere color rules based on emotion names
const sphereColorRules = {
  // Mapping emotions to their HEX colors
  Fericire: '#FFDF00', // Galben Strălucitor
  Entuziasm: '#FF4500', // Portocaliu-Roșu Viu
  Calm: '#87CEFA', // Albastru Cer
  Mulțumire: '#90EE90', // Verde Deschis
  Iubire: '#FF1493', // Roz Intens
  Speranță: '#ADD8E6', // Albastru Deschis
  Seninătate: '#E0FFFF', // Cian Pal
  Curiozitate: '#E6E6FA', // Lavandă
  Empatie: '#DA70D6', // Orhidee
  Surpriză: '#FF69B4', // Roz Aprins
  Neutralitate: '#A9A9A9', // Gri Închis
  Tristețe: '#4682B4', // Albastru Oțel
  Frică: '#2F4F4F', // Gri Ardezie Închis
  Furie: '#B22222', // Roșu Cărămidă
  Invidie: '#556B2F', // Verde Măsliniu Închis
  Singurătate: '#483D8B', // Albastru Ardezie Închis
  Vinovăție: '#800000', // Maron
  Anxietate: '#CD5C5C', // Roșu Indian
  Amărăciune: '#FF8C00', // Portocaliu Închis
  Nostalgie: '#F0E68C', // Khaki
  Confuzie: '#808000', // Măsliniu
};

// Radius rules based on emotional intensity
const radiusRules = {
  'Super tare': 15,
  'Tare': 10,
  'Uneori': 8,
  'Neutru': 5,
  'Nu prea': 2,
  'Deloc': 0,
};

// Class for handling form data and converting it to CSV
class FormDataHandler {
  constructor() {
    this.spheres = [];
    this.connections = [];
  }

  // Add a sphere with its name, color, and radius
  addSphere(name, color, radius) {
    this.spheres.push({ name, color, radius });
  }

  // Add a connection between spheres with a color
  addConnection(from, to, color) {
    this.connections.push({ from, to, color });
  }

  // Convert spheres and connections to CSV format
  toCSV() {
    const headers = ['Sphere Name', 'Color', 'Radius', 'Connections'];
    const rows = this.spheres.map((sphere) => {
      const connections = this.connections
        .filter(
          (conn) =>
            conn.from === sphere.name || conn.to === sphere.name
        )
        .map(
          (conn) => `${conn.from} -> ${conn.to} (${conn.color})`
        )
        .join('; ');
      return [sphere.name, sphere.color, sphere.radius, connections];
    });
    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  }

  // Helper function to generate connections based on user selection
  generateConnections(selectedEmotion, otherEmotions) {
    const connectionColor = this.getConnectionColor(selectedEmotion);
    otherEmotions.forEach((emotion) => {
      const otherEmotionColor = sphereColorRules[emotion];
      if (this.shouldConnect(selectedEmotion, emotion)) {
        this.addConnection(selectedEmotion, emotion, connectionColor);
      }
    });
  }

  // Get the connection color based on selected emotion
  getConnectionColor(emotion) {
    if (['Fericire', 'Entuziasm', 'Calm', 'Mulțumire', 'Iubire', 'Speranță', 'Seninătate', 'Curiozitate', 'Empatie', 'Surpriză'].includes(emotion)) {
      return '>';
    } else if (['Tristețe', 'Frică', 'Furie', 'Invidie', 'Singurătate', 'Vinovăție', 'Anxietate', 'Amărăciune', 'Nostalgie', 'Confuzie'].includes(emotion)) {
      return '<';
    } else {
      return '-';
    }
  }

  // Determine if two emotions should be connected based on their color category
  shouldConnect(emotion1, emotion2) {
    const goodCategory = ['Fericire', 'Entuziasm', 'Calm', 'Mulțumire', 'Iubire', 'Speranță', 'Seninătate', 'Curiozitate', 'Empatie', 'Surpriză'];
    const badCategory = ['Tristețe', 'Frică', 'Furie', 'Invidie', 'Singurătate', 'Vinovăție', 'Anxietate', 'Amărăciune', 'Nostalgie', 'Confuzie'];

    if (goodCategory.includes(emotion1) && goodCategory.includes(emotion2)) {
      return true;
    }
    if (badCategory.includes(emotion1) && badCategory.includes(emotion2)) {
      return true;
    }
    return false;
  }
}

// Export the FormDataHandler class
module.exports = FormDataHandler;
