const express = require("express");
const router = express.Router();

const { submitForm, exportCsv } = require("../controllers/form.controller");

router.post("/submit-form", submitForm);
router.get("/export-csv", exportCsv);

module.exports = router;
