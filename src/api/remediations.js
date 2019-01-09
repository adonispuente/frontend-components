import URI from 'urijs';

const API_BASE = '/r/insights/platform/remediations/v1';

function checkResponse (r) {
    if (!r.ok) {
        throw new Error(`Unexpected response code ${r.status}`);
    }

    return r;
}

function json (r) {
    checkResponse(r);
    return r.json();
}

const headers = Object.freeze({
    'Content-Type': 'application/json; charset=utf-8'
});

export function createRemediation (data, base = API_BASE) {
    const uri = new URI(API_BASE).segment('remediations').toString();
    return fetch(uri, {
        headers,
        method: 'POST',
        body: JSON.stringify(data)
    }).then(json);
}

export function patchRemediation (id, data, base = API_BASE) {
    const uri = new URI(API_BASE).segment('remediations').segment(id).toString();
    return fetch(uri, {
        headers,
        method: 'PATCH',
        body: JSON.stringify(data)
    }).then(checkResponse);
}

export function getRemediations (basePath = API_BASE) {
    const uri = new URI(API_BASE).segment('remediations').toString();
    return fetch(uri).then(json);
}
