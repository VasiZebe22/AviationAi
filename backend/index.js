const express = require('express'); // Import Express for building the server
const cors = require('cors'); // Import CORS to handle cross-origin requests
const bodyParser = require('body-parser'); // Import Body-Parser to process incoming JSON

const app = express(); // Create an Express application
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Enable parsing of JSON data

// Define a route at '/' (homepage)
app.get('/', (req, res) => {
    res.send('Aviation AI Backend is running!'); // Send this message when someone visits the homepage
});

// Set the port number (default is 5000)
const PORT = process.env.PORT || 5000;

// Start the server and listen on the specified port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
