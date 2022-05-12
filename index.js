
// Define basic Express configs
const express = require('express');
const app = express();
const port = 8008;
const path = require('path');

// Define some basic endpoints
const api = '/api/v1/';
const health = `health/`;

// Serve static assets
app.use('', express.static(path.join(__dirname, 'public')));


app.get(api, (req, res) => {
    res.send('Hello there!');
});

app.get(api + health, (req, res) => {
    res.send('OK');
});





// Start the server
app.listen(port, () => {
    console.log(`Express running on port ${port}`);
})