const mongoose = require('mongoose');
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
