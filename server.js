
// Define basic Express configs
const { application } = require('express');
const express = require('express');
const app = express();
const port = 8080;
const path = require('path');

// Define some basic endpoints
const api = '/api/v1';
const health = `/health`;
const carbonAPI = 'https://www.carboninterface.com/api/v1';
const POST_CALC = '/calculate'



// Define some classes for data because I'm feeling fancy
class FlightRequest {
    constructor(departure, destination) {
        this.departure = departure;
        this.destination = destination;
    }
}

class VehicleRequest {
    constructor(make, model, distance) {
        this.make = make;
        this.model = model;
        this.distance = distance;
    }
}

class ShippingRequest {
    constructor(weight, distance, method) {
        this.weight = weight;
        this.distance = distance;
        this.method = method;
    }
}


// DELETE BEFORE COMMIT
const token = '';

// Serve static assets and include JSON body parsing middleware
app.use('', express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Healthcheck endpoints
app.get(api, (req, res) => {
    res.send('Hello there!');
});
app.get(`${api}${health}`, (req, res) => {
    res.send('OK');
});


// API to handle form input
app.post(`${api}${POST_CALC}`, (request, response) => {

    if (!request) {
        response.status(400).send(JSON.stringify(new Error('malformed request')));
        return;
    }

    let retObj = {};
    if (request.body.type === 'plane') {
        retObj = new FlightRequest(request.body.data.departure, request.body.data.destination);
    } else if (request.body.type === 'vehicle') {
        retObj = new VehicleRequest(request.body.data.make, request.body.data.model, request.body.data.distance);
    } else {
        retObj = new ShippingRequest(request.body.data.weight, request.body.data.distance, request.body.data.method);
    }

    response.json(retObj);
    retObj = null;
    

})




// Start the server
app.listen(port, () => {
    console.log(`Express running on port ${port}`);
})
