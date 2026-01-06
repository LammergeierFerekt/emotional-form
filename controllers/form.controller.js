// controllers/form.controller.js
const fs = require("fs");
const path = require("path");

const FormDataModel = require("../models/FormData");
const { buildBlenderSheetsFromSubmission } = require("../utils/blenderExport");

// ---------- helpers ----------
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

function writeJsonArray(filePath, arr) {
  fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), "utf8");
}

function escapeCsvCell(value) {
  const s = value === null || value === undefined ? "" : String(value);
  // Always quote; escape internal quotes
  return `"${s.replace(/"/g, '""')}"`;
}

function rowsToCsv(headers, rows) {
  const lines = [];
  lines.push(headers.map(escapeCsvCell).join(","));
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvCell(row[h])).join(","));
  }
  return lines.join("\n");
}

function fmtConnType(type) {
  if (type === ">") return "GREEN";
  if (type === "<") return "RED";
  return "NEUTRAL";
}

function printTraceToConsole(trace) {
  if (!Array.isArray(trace) || trace.length === 0) {
    console.log("\n──────────────────────────");
    console.log("FORM → CONNECTION TRACE");
    console.log("──────────────────────────");
    console.log("(No trace available — exporter did not return trace.)");
    console.log("──────────────────────────\n");
    return;
  }

  console.log("\n──────────────────────────");
  console.log("FORM → CONNECTION TRACE");
  console.log("──────────────────────────");

  for (const t of trace) {
    const section = t.section || "UNKNOWN SECTION";
    const question = t.question || t.key || "(unknown question)";
    const key = t.key || "(no key)";
    const answer = t.answer ?? "";
    const from = t.from ?? "";
    const to = t.to ?? "";
    const type = fmtConnType(t.type);

    console.log(`[${section}] ${question}`);
    console.log(`  key: ${key}`);
    console.log(`  answer: "${answer}"`);
    if (from && to) {
      console.log(`  generated: ${from} ${type}→ ${to}`);
    } else if (Array.isArray(t.connections) && t.connections.length) {
      // if you decide to store a list
      for (const c of t.connections) {
        console.log(`  generated: ${c}`);
      }
    }
    console.log("");
  }

  console.log("──────────────────────────\n");
}

function writeTraceToFile(trace, filePath) {
  try {
    const lines = [];
    lines.push("FORM → CONNECTION TRACE");
    lines.push("");

    if (!Array.isArray(trace) || trace.length === 0) {
      lines.push("(No trace available — exporter did not return trace.)");
      fs.writeFileSync(filePath, lines.join("\n"), "utf8");
      return;
    }

    for (const t of trace) {
      const section = t.section || "UNKNOWN SECTION";
      const question = t.question || t.key || "(unknown question)";
      const key = t.key || "(no key)";
      const answer = t.answer ?? "";
      const from = t.from ?? "";
      const to = t.to ?? "";
      const type = fmtConnType(t.type);

      lines.push(`[${section}] ${question}`);
      lines.push(`  key: ${key}`);
      lines.push(`  answer: "${answer}"`);
      if (from && to) {
        lines.push(`  generated: ${from} ${type}→ ${to}`);
      } else if (Array.isArray(t.connections) && t.connections.length) {
        for (const c of t.connections) lines.push(`  generated: ${c}`);
      }
      lines.push("");
    }

    fs.writeFileSync(filePath, lines.join("\n"), "utf8");
  } catch (e) {
    console.error("Failed to write trace file:", e);
  }
}

// ---------- POST /api/submit-form ----------
async function submitForm(req, res) {
  const formData = req.body;

  if (!formData || Object.keys(formData).length === 0) {
    return res.status(400).json({ error: "No form data received." });
  }

  const filePath = path.join(__dirname, "..", "formData.json");

  try {
    // Always save locally (works without Mongo)
    const existing = readJsonArray(filePath);
    existing.push(formData);
    writeJsonArray(filePath, existing);

    // Save to Mongo only if connected
    const mongoConnected = req.app?.locals?.mongoConnected?.() === true;
    if (mongoConnected) {
      const doc = new FormDataModel(formData);
      await doc.save();
    }

    return res.json({
      message: mongoConnected
        ? "Saved successfully (JSON + MongoDB)!"
        : "Saved successfully (JSON only — MongoDB not connected)!",
    });
  } catch (err) {
    console.error("submitForm error:", err);
    return res.status(500).json({ error: "Failed to save form data." });
  }
}

// ---------- GET /api/export-blender-spheres-csv ----------
async function exportBlenderSpheresCsv(req, res) {
  const jsonPath = path.join(__dirname, "..", "formData.json");

  try {
    const mongoConnected = req.app?.locals?.mongoConnected?.() === true;

    let all = [];
    if (mongoConnected) {
      all = await FormDataModel.find().lean().sort({ createdAt: 1 });
    } else {
      all = readJsonArray(jsonPath);
    }

    if (!all || all.length === 0) {
      return res.status(404).json({ error: "No submissions found to export." });
    }

    const latest = all[all.length - 1];

    // ✅ Build export rows + trace (if exporter provides it)
    const result = buildBlenderSheetsFromSubmission(latest);
    const sphereRows = result?.sphereRows || [];
    const trace = result?.trace || [];

    // ✅ THIS is where the report is produced:
    // It appears in the Node terminal immediately when you click Export CSV.
    printTraceToConsole(trace);

    // Optional: also write trace to a txt file next to formData.json
    const tracePath = path.join(__dirname, "..", "blender_trace.txt");
    writeTraceToFile(trace, tracePath);

    const headers = ["sphere_name", "position", "radius", "sphere_color", "connection"];
    const csv = rowsToCsv(headers, sphereRows);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="blender_spheres.csv"');

    // BOM fixes Romanian diacritics in Excel
    const bom = "\uFEFF";
    return res.status(200).send(bom + csv);
  } catch (err) {
    console.error("exportBlenderSpheresCsv error:", err);
    return res.status(500).json({ error: "Failed to export Blender spheres CSV." });
  }
}

// ---------- GET /api/export-blender-coords-csv ----------
async function exportBlenderCoordsCsv(req, res) {
  const jsonPath = path.join(__dirname, "..", "formData.json");

  try {
    const mongoConnected = req.app?.locals?.mongoConnected?.() === true;

    let all = [];
    if (mongoConnected) {
      all = await FormDataModel.find().lean().sort({ createdAt: 1 });
    } else {
      all = readJsonArray(jsonPath);
    }

    if (!all || all.length === 0) {
      return res.status(404).json({ error: "No submissions found to export." });
    }

    const latest = all[all.length - 1];
    const result = buildBlenderSheetsFromSubmission(latest);
    const coordRows = result?.coordRows || [];

    const headers = ["x", "y", "z", "radius"];
    const csv = rowsToCsv(headers, coordRows);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="blender_coords.csv"');

    const bom = "\uFEFF";
    return res.status(200).send(bom + csv);
  } catch (err) {
    console.error("exportBlenderCoordsCsv error:", err);
    return res.status(500).json({ error: "Failed to export Blender coords CSV." });
  }
}

module.exports = {
  submitForm,
  exportBlenderSpheresCsv,
  exportBlenderCoordsCsv,
};
