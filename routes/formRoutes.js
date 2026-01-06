// routes/formRoutes.js
const express = require("express");
const router = express.Router();

const {
  submitForm,
  exportBlenderSpheresCsv,
  exportBlenderCoordsCsv,
} = require("../controllers/form.controller");

router.post("/submit-form", submitForm);

// CSV exports (2 files)
router.get("/export-blender-spheres-csv", exportBlenderSpheresCsv);
router.get("/export-blender-coords-csv", exportBlenderCoordsCsv);

module.exports = router;
