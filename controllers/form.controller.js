const fs = require("fs");
const path = require("path");

const FormDataModel = require("../models/FormData");

// Helper: read JSON safely
function readJsonArray(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error reading/parsing JSON file:", e);
    return [];
  }
}

// Helper: write JSON safely
function writeJsonArray(filePath, arr) {
  fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), "utf8");
}

// POST /submit-form
async function submitForm(req, res) {
  const formData = req.body;

  if (!formData || Object.keys(formData).length === 0) {
    return res.status(400).json({ error: "No form data received." });
  }

  const filePath = path.join(__dirname, "..", "formData.json");

  try {
    // 1) Always append to local JSON (works even without MongoDB)
    const existing = readJsonArray(filePath);
    existing.push(formData);
    writeJsonArray(filePath, existing);

    // 2) Save to MongoDB ONLY if connected
    const mongoConnected = req.app?.locals?.mongoConnected?.() === true;
    if (mongoConnected) {
      const doc = new FormDataModel(formData);
      await doc.save();
    }

    return res.json({
      message: mongoConnected
        ? "Saved successfully (JSON + MongoDB)!"
        : "Saved successfully (JSON only — MongoDB not connected)!",
      data: formData,
    });
  } catch (err) {
    console.error("submitForm error:", err);
    return res.status(500).json({ error: "Failed to save form data." });
  }
}

// GET /export-csv -> exports latest submission as question/answer rows
// Special rule: q6 is split by commas into answer, answer_2, answer_3...
async function exportCsv(req, res) {
  const filePath = path.join(__dirname, "..", "formData.json");

  try {
    const mongoConnected = req.app?.locals?.mongoConnected?.() === true;

    // Load submissions
    let all = [];
    if (mongoConnected) {
      all = await FormDataModel.find().lean().sort({ createdAt: 1 });
    } else {
      all = readJsonArray(filePath);
    }

    if (!all || all.length === 0) {
      return res.status(404).json({ error: "No submissions found to export." });
    }

    // Export the most recent submission
    const latest = all[all.length - 1];

    // Build rows with multi-column answers for q6
    const MAX_SPLIT = 10; // change to 5 if you want exactly 5 columns for q6
    const rows = [];

    for (const [key, value] of Object.entries(latest)) {
      if (key === "_id" || key === "__v") continue;
      if (key === "createdAt" || key === "updatedAt") continue;

      // Default: single answer
      let parts = [
        value === null || value === undefined
          ? ""
          : typeof value === "object"
            ? JSON.stringify(value)
            : String(value),
      ];

      // Special: q6 split by comma into multiple columns
      if (key === "q6" && typeof value === "string") {
        parts = value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, MAX_SPLIT);

        if (parts.length === 0) parts = [""];
      }

      const row = { question: key };
      for (let i = 0; i < MAX_SPLIT; i++) {
        const colName = i === 0 ? "answer" : `answer_${i + 1}`;
        row[colName] = parts[i] ?? "";
      }

      rows.push(row);
    }

    // Headers: question, answer, answer_2 ... answer_10
    const headers = [
      "question",
      "answer",
      ...Array.from({ length: MAX_SPLIT - 1 }, (_, i) => `answer_${i + 2}`),
    ];

    // CSV escape (quotes-safe + Excel-safe)
    const escape = (s) => `"${String(s).replace(/"/g, '""')}"`;

    const csv =
      [headers.join(",")]
        .concat(rows.map((r) => headers.map((h) => escape(r[h] ?? "")).join(",")))
        .join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="form_answers.csv"');

    // Excel UTF-8 fix (BOM)
    const bom = "\uFEFF";
    return res.status(200).send(bom + csv);
  } catch (err) {
    console.error("exportCsv error:", err);
    return res.status(500).json({ error: "Failed to export CSV." });
  }
}

module.exports = { submitForm, exportCsv };
