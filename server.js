
// Define basic Express configs
const { application } = require('express');
const express = require('express');
const request = require('http').request()
const app = express();
const port = 8008;
const path = require('path');

// Define some basic endpoints
const api = '/api/v1/';
const health = `health/`;
const carbonAPI = 'https://www.carboninterface.com/api/v1';


// DELETE BEFORE COMMIT
const token = '';

// Serve static assets
app.use('', express.static(path.join(__dirname, 'public')));


app.get(api, (req, res) => {
    res.send('Hello there!');
});

app.get(api + health, (req, res) => {
    res.send('OK');
});

app.get(api+'test', (req, res) => {
    const request = new Request(`${carbonAPI}/auth`, {

        headers: {
            Authorization: `Bearer ${token}`
        },
        method: 'GET',
    })
    fetch(request)
    .then(val => {
        console.log('Auth Response', val.json());
    })
    .catch(err => {
        console.err(err);
    })

});





// Start the server
app.listen(port, () => {
    console.log(`Express running on port ${port}`);
})