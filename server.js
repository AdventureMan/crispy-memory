
// Load env vars
require('dotenv').config();

// Define basic Express configs
const { application } = require('express');
const express = require('express');
const app = express();
const fetch = require('node-fetch');
const port = 8080;
const path = require('path');

// Define some basic endpoints
const api = '/api/v1';
const health = `/health`;
const POST_CALC = '/calculate'

// Define our target API to proxy to
const PROXY_API = {
    key: process.env.SECRET_KEY,
    url: 'https://www.carboninterface.com/api/v1/estimates',
    header: new fetch.Headers([
        ['Authorization', `Bearer ${process.env.SECRET_KEY}`],
        ['Content-Type', 'application/json']
    ])
};



// Define some classes for data because I'm feeling fancy

class CarbonFlightReq {
    constructor(type, passengers, legs, unit) {
        this.type = 'flight';
        this.passengers = passengers ? passengers : 100;
        this.legs = [{
            departure_airport: legs[0],
            destination_airport: legs[1]
        }],
        this.distance_unit = unit ? unit : null;
    }
}

class CarbonVehReq {
    constructor(type,unit, distance, id) {
        this.type =type;
        this.distance_unit = unit;
        this.distance_value = +distance;
        this.vehicle_model_id = id;
    }
}

class CarbonShipReq {
    constructor(type, weight, weightU, distance, distanceU, method) {
        this.type = type;
        this.weight_value = +weight;
        this.weight_unit = weightU;
        this.distance_value = +distance;
        this.distance_unit = distanceU;
        this.transport_method = method;
    }
}

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

    if (!request || !request.body || !request.body.data) {
        response.status(400).send(JSON.stringify(new Error('malformed request')));
        return;
    }

    const bodyData = request.body.data;

    let carbonReq = {};
    if (request.body.type === 'plane') {
        carbonReq = new CarbonFlightReq(request.body.type, null, [bodyData.departure, bodyData.destination], 'mi');
    } else if (request.body.type === 'vehicle') {
        carbonReq = new CarbonVehReq(request.body.type, 'mi', bodyData.distance, '7268a9b7-17e8-4c8d-acca-57059252afe9');
    } else {
        carbonReq = new CarbonShipReq(request.body.type, bodyData.weight, 'lb', bodyData.distance, 'mi', bodyData.method.toLowerCase());
    }

    fetch(PROXY_API.url, {
        method: 'post',
        headers: PROXY_API.header,
        body: JSON.stringify(carbonReq)
    })
    .then(res => res.json())
    .then(json => {
        response.send(json);
    });
    

})




// Start the server
app.listen(port, () => {
    console.log(`Express running on port ${port}`);
})
