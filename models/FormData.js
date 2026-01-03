const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');
const sanitizeHtml = require('sanitize-html');

// Define the schema
const formDataSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    trim: true, 
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] 
  },
  feedback: { type: String, trim: true },
  dynamicQuestions: { type: Map, of: String, default: {} },
}, { timestamps: true });

// Middleware for sanitizing data
formDataSchema.pre('save', function (next) {
  // Sanitize all string fields
  for (const [key, value] of Object.entries(this.toObject())) {
    if (typeof value === 'string') {
      this[key] = sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
    }
  }

  // Sanitize dynamic questions
  if (this.dynamicQuestions) {
    for (const [key, value] of this.dynamicQuestions) {
      this.dynamicQuestions.set(key, sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }));
    }
  }

  next();
});

// Export the model
module.exports = mongoose.model('FormData', formDataSchema);


// Sphere and Radius Rules
const sphereColorRules = {
  Fericire: '#FFDF00',
  Entuziasm: '#FF4500',
  Calm: '#87CEFA',
  Mulțumire: '#90EE90',
  Iubire: '#FF1493',
  Speranță: '#ADD8E6',
  Seninătate: '#E0FFFF',
  Curiozitate: '#E6E6FA',
  Empatie: '#DA70D6',
  Surpriză: '#FF69B4',
  Neutralitate: '#A9A9A9',
  Tristețe: '#4682B4',
  Frică: '#2F4F4F',
  Furie: '#B22222',
  Invidie: '#556B2F',
  Singurătate: '#483D8B',
  Vinovăție: '#800000',
  Anxietate: '#CD5C5C',
  Amărăciune: '#FF8C00',
  Nostalgie: '#F0E68C',
  Confuzie: '#808000'
};

const radiusRules = {
  'Super tare': 15,
  'Tare': 10,
  'Uneori': 8,
  'Neutru': 5,
  'Nu prea': 2,
  'Deloc': 0
};

// FormData class for handling spheres and connections
class FormData {
  constructor() {
    this.spheres = [];
    this.connections = [];
  }

  addSphere(name, color, radius) {
    this.spheres.push({ name, color, radius });
  }

  addConnection(from, to, color) {
    this.connections.push({ from, to, color });
  }

  toCSV() {
    const headers = ['Sphere Name', 'Color', 'Radius', 'Connections'];
    const rows = this.spheres.map(sphere => {
      const connections = this.connections
        .filter(conn => conn.from === sphere.name || conn.to === sphere.name)
        .map(conn => `${conn.from} -> ${conn.to} (${conn.color})`)
        .join('; ') || 'No connections'; // Handle cases with no connections
      return [sphere.name, sphere.color, sphere.radius, connections];
    });
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  saveCSV(fileName) {
    const csvContent = this.toCSV();
    const filePath = path.join(__dirname, fileName);
    fs.writeFileSync(filePath, csvContent, 'utf8');
    console.log(`CSV saved to ${filePath}`);
  }
}

module.exports = FormData;
