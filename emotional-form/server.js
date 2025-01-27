const express = require('express');
const cors = require('cors');
const fs = require('fs'); // For saving data to a file (optional)
const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.static('public')); // Serve static files (HTML, CSS, JS)

// Route to handle form submission
app.post('/submit', (req, res) => {
  const formData = req.body;

  // Debugging: Log the received form data
  console.log('Form Data Received:', formData);

  // Validate the form data
  if (!formData || Object.keys(formData).length === 0) {
    return res.status(400).json({ error: 'No form data received.' });
  }

  // Debugging: Check if dynamic questions are included
  const dynamicQuestions = Object.keys(formData).filter(key => key.startsWith('q6_') || key.startsWith('q7'));
  console.log('Dynamic Questions:', dynamicQuestions);

  // Save data to a JSON file (optional)
  const filePath = 'formData.json';
  fs.readFile(filePath, 'utf8', (err, data) => {
    let jsonData = [];
    if (!err && data) {
      try {
        jsonData = JSON.parse(data); // Parse existing data
      } catch (parseError) {
        console.error('Error parsing JSON file:', parseError);
      }
    }

    // Add new form data to the array
    jsonData.push(formData);

    // Write updated data back to the file
    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error writing to file:', writeErr);
        return res.status(500).json({ error: 'Failed to save form data.' });
      }

      console.log('Form data saved successfully.');
      res.json({ message: 'Form data received and saved successfully!', data: formData });
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});