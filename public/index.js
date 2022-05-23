
const API = 'api/v1/calculate'

const planeBlock = document.getElementById('plane-inputs');
const vehicleBlock = document.getElementById('vehicle-inputs');
const shippingBlock = document.getElementById('shipping-inputs');
const carbonOutput = document.getElementById('carbon-output');

let currentForm = null;


window.onload = (e) => {
    console.log('Window loaded');
}





function setTransport(ev) {
    console.log('setTransport', ev);
    currentForm = document.getElementById(`form-${ev}`);

    planeBlock.hidden = true;
    vehicleBlock.hidden = true;
    shippingBlock.hidden = true;


    document.getElementById(`${ev}-inputs`).hidden = false;
}


function getCalc(formType) {
    let type = formType;
    const form = currentForm.elements;
    let data = {};

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

    fetch(API, apiInit)
        .then((response) => {
            response.json()
                .then(r => updatePage(r));
        }, (err) => {
            console.error('Something went wrong', err);
        });
}


function updatePage(data) {
    console.log('Data to update page', data);
    carbonOutput.innerText = data.data.attributes.carbon_lb + 'lbs.';
    
}