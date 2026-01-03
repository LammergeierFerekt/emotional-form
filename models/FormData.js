const mongoose = require("mongoose");
const sanitizeHtml = require("sanitize-html");

const formDataSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    feedback: { type: String, trim: true },
    dynamicQuestions: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

formDataSchema.pre("save", function (next) {
  // sanitize simple string fields
  for (const [key, value] of Object.entries(this.toObject())) {
    if (typeof value === "string") {
      this[key] = sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
    }
  }

  // sanitize dynamicQuestions values
  if (this.dynamicQuestions) {
    for (const [k, v] of this.dynamicQuestions) {
      this.dynamicQuestions.set(
        k,
        sanitizeHtml(v, { allowedTags: [], allowedAttributes: {} })
      );
    }
  }

  next();
});

module.exports = mongoose.model("FormData", formDataSchema);
