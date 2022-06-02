// Load env vars
require('dotenv').config();
const process = require('process');
// Define basic Express configs
const express = require('express');
const RateLimit = require('express-rate-limit');
const app = express();
const fs = require('fs');
const fetch = require('node-fetch');
const port = 8080;
const path = require('path');

// Define some basic endpoints
const api = '/api/v1';
const health = `/health`;
const POST_CALC = '/calculate';
const GET_VEHICLES = '/vehicles';

// Define our target API to proxy to
const PROXY_API = {
  key: process.env.SECRET_KEY,
  url: 'https://www.carboninterface.com/api/v1/estimates',
  header: new fetch.Headers([
    ['Authorization', `Bearer ${process.env.SECRET_KEY}`],
    ['Content-Type', 'application/json'],
  ]),
};

const validVehicles = new Map([
  ['toyota', 1],
  ['tesla', 2],
  ['audi', 3],
  ['ford', 3],
]);

function applog(req, msg) {
  let str = msg ? msg : req.originalUrl;
  console.log(`[LOG] ${new Date().toUTCString()} ${str}`)
}

// Create a little logger
const logger = (req, res, next) => {
  applog(req, null);

  next();
};
app.use(logger);

// Define some classes for data because I'm feeling fancy
class CarbonFlightReq {
  constructor(type, passengers, legs, unit) {
    this.type = 'flight';
    this.passengers = passengers ? passengers : 100;
    (this.legs = [
      {
        departure_airport: legs[0],
        destination_airport: legs[1],
      },
    ]),
      (this.distance_unit = unit ? unit : null);
  }
}

class CarbonVehReq {
  constructor(type, unit, distance, id) {
    this.type = type;
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

const limiter = RateLimit({
  windowMs: 1*60*1000,
  max: 5,
  standardHeaders: true
});
app.use(`${api}${GET_VEHICLES}`, limiter)

// Serve static assets and include JSON body parsing middleware
// eslint-disable-next-line no-undef
app.use('', express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Healthcheck endpoints
app.get(api, (req, res) => {
  res.send('Hello there!');
});
app.get(`${api}${health}`, (req, res) => {
  res.send('OK');
});

// API to fetch vehicle details
// Returns a collection of strings
app.get(`${api}${GET_VEHICLES}/:id?`, (req, res) => {
  if (req.params.id !== null && req.params.id !== undefined) {
    if (!validVehicles.has(req.params.id.toString().toString())) {
      console.error('Invalid Vehicle');
      res.status(400).send('Invalid vehicle make');
      return;
    }

    // eslint-disable-next-line no-undef
    fs.readFile(
      // eslint-disable-next-line no-undef
      path.join(__dirname, `data/vehicle-models-${req.params.id}.json`),
      'utf-8',
      (error, data) => {
        if (error) {
          console.error(error);
          res.status(500).send(error);
          return;
        }

        let carData = JSON.parse(data);
        carData = Array.from(
          new Set(carData.map((c) => c.data.attributes.name))
        );
        res
          .setHeader('Content-Type', 'application/json')
          .send(JSON.stringify(carData));
        return;
      }
    );
  } else {
    // eslint-disable-next-line no-undef
    fs.readFile(
      // eslint-disable-next-line no-undef
      path.join(__dirname, 'data/vehicle-makes.json'),
      'utf-8',
      (error, data) => {
        if (error) {
          console.error(error);
          res.status(500).send(error);
          return;
        }

        let filterData = JSON.parse(data);
        filterData = filterData
          .filter((v) =>
            validVehicles.get(v.data.attributes.name.toLowerCase())
          )
          .map((v) => v.data.attributes.name);

        res
          .setHeader('Content-Type', 'application/json')
          .send(JSON.stringify(filterData));
      }
    );
  }
});

// API to handle form input
app.post(`${api}${POST_CALC}`, (request, response) => {
  if (!request || !request.body || !request.body.data) {
    response.status(400).send(JSON.stringify(new Error('malformed request')));
    return;
  }

  if (!PROXY_API || !PROXY_API.key) {
    response.status(400).send(
      JSON.stringify({
        errorCode: 400,
        errorMessage: 'Mising KEY',
      })
    );
    return;
  }

  let carbonReq = getCarbonReq(request);

  fetch(PROXY_API.url, {
    method: 'post',
    headers: PROXY_API.header,
    body: JSON.stringify(carbonReq),
  })
    .then((res) => res.json())
    .then((json) => {
      response.send(json);
    })
    .catch((err) => {
      response.status(400).send(err);
    });
});

function getCarbonReq(req) {
  if (!req || !req.body || !req.body.type) {
    throw Error('malformed params');
  }

  const data = req.body.data;
  let carbonReq = {};
  switch (req.body.type) {
    case 'plane':
      carbonReq = new CarbonFlightReq(
        req.body.type,
        null,
        [data.departure, data.destination],
        'mi'
      );
      break;
    case 'vehicle':
      carbonReq = new CarbonVehReq(
        req.body.type,
        'mi',
        data.distance,
        '7268a9b7-17e8-4c8d-acca-57059252afe9'
      );
      break;
    case 'shipping':
      carbonReq = new CarbonShipReq(
        req.body.type,
        data.weight,
        'lb',
        data.distance,
        'mi',
        data.method.toLowerCase()
      );
      break;
  }
  return carbonReq;
}

function validateKey() {
  if (!PROXY_API.key) {
    console.error("*** Missing API key*** Is your '.env' file created?");
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Express running on port ${port}`);
  validateKey();
});
