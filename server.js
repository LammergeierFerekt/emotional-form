require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { mapFormData, generateCSV } = require('./mapformData'); // Import CSV functions
const formRoutes = require('./routes/formRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests
app.use(express.static('public')); // Serve frontend files

// MongoDB Connection (Remove if not using a database)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));
} else {
  console.warn('MongoDB URI is not defined in the environment variables.');
}

// Form Routes
app.use('/api', formRoutes);

// Form Submission Route (Stores data in JSON and generates CSV)
app.post('/submit-form', async (req, res) => {
    const formData = req.body;

    // Debugging: Log received form data
    console.log('Form Data Received:', formData);

    if (!formData || Object.keys(formData).length === 0) {
        return res.status(400).json({ error: 'No form data received.' });
    }

    try {
        // Process Form Data → Convert it for CSV
        const mappedData = mapFormData([formData]);

        // Generate CSV
        await generateCSV(mappedData);

        // File path for saving JSON data - ensure path is compatible with Render (or use cloud storage)
        const filePath = path.join(__dirname, 'formData.json');

        // Read existing data or create a new array if file doesn't exist
        let jsonData = [];
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            try {
                jsonData = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing JSON file:', parseError);
            }
        }

        // Push the new form data to the existing array
        jsonData.push(formData);

        // Write the updated data back to the file
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

        console.log('Form data saved successfully.');
        res.json({ message: 'Data received, CSV generated, and saved successfully!', data: formData });
    } catch (error) {
        console.error('Error during form submission:', error);
        res.status(500).json({ error: 'Failed to process form data.' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
