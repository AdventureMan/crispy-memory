
// Set our backend API path
const API = 'api/v1/calculate'
const API_VHIC_MODELS = 'api/v1/vehicles';

// Handy references to our form wrappers on the DOM
const planeBlock = document.getElementById('plane-inputs');
const vehicleBlock = document.getElementById('vehicle-inputs');
const shippingBlock = document.getElementById('shipping-inputs');
const carbonOutput = document.getElementById('carbon-output');

// Handy reference to the form in use
let currentForm = null;


window.onload = (e) => {
    console.log('Window loaded');
    fetchVhicModels();
}

function fetchVhicModels() {

    // Call and respond to the API
    fetch(API_VHIC_MODELS)
        .then((response) => {
            if (response.ok) {
                response.json()
                    .then(r => {
                        const makesDropDown = document.getElementById('inputMake');
                        r.forEach(vehicle => {
                            const opt = document.createElement('option');
                            opt.value = vehicle, opt.text = vehicle;
                            makesDropDown.add(opt);
                        });
                    });
            } else {
                console.error('Something went wrong', err);
            }
        })
        .catch(e => {
            console.error(new Error('API failed'));
        });

}


// Sets the current form based on the transportation type and hides others
// Called from the DOM
function setTransport(ev) {
    currentForm = document.getElementById(`form-${ev}`);

    planeBlock.hidden = true;
    vehicleBlock.hidden = true;
    shippingBlock.hidden = true;


    document.getElementById(`${ev}-inputs`).hidden = false;
}

// Called from the DOM
// Formats the request and calls the API to generate an estimate
function getCalc(formType) {
    let type = formType;
    const form = currentForm.elements;
    let data = {};

    // Create the request object based on the transport type
    switch (formType) {
        case 'plane':
            data = {
                departure: form.inputDeparture.value,
                destination: form.inputDestination.value
            };
            break;
        case 'vehicle':
            data = {
                make: form.inputMake.value,
                model: form.inputModel.value,
                distance: form.inputVehDist.value
            };
            break;
        case 'shipping':
            data = {
                weight: form.inputWeight.value,
                distance: form.inputShipDist.value,
                method: form.inputShipMethod.value
            };
            break;
    }

    // Create request headers, body, method, etc.
    const request = {
        type,
        data
    };
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const apiInit = {
        method: 'POST',
        body: JSON.stringify(request),
        headers
    };

    // Call and respond to the API
    fetch(API, apiInit)
        .then((response) => {
            if (response.ok) {
                response.json()
                    .then(r => updatePage(r));
            } else {
                console.error('Something went wrong', err);
                carbonOutput.innerText = 'Well something broke... try again?';
            }
        })
        .catch(e => {
            console.error(new Error('API failed'));
            carbonOutput.innerText = 'Well something broke... try again?';
        })
}

// Called from JS
// Binds the estimate values to the DOM
function updatePage(data) {
    carbonOutput.innerText = data.data.attributes.carbon_lb + 'lbs.';

}