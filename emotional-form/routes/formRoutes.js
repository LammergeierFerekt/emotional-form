const express = require('express');
const FormData = require('../models/FormData');

const router = express.Router();

// POST route to handle form submissions
router.post('/submit', async (req, res) => {
  try {
    const formData = req.body;

    // Save the sanitized form data
    const newFormData = new FormData(formData);
    await newFormData.save();

    res.status(200).json({ message: 'Form data saved successfully!', data: formData });
  } catch (err) {
    console.error('Error saving form data:', err);
    res.status(500).json({ error: 'Failed to save form data.' });
  }
});

module.exports = router;
