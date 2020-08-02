const cbfs = require('fs');
const util = require('util');
const fetch = require('node-fetch');
const KmlRouteDoc = require('./kml-route-doc');

const fs = {
    readFile: util.promisify(cbfs.readFile)
};

/************************************** */
function convertScale(bH) {
    return bH / 100000
}

function parseRoute(rawRouteData) {
    const [name, routeData] = rawRouteData.split(/=/, 2);
    // const parsedNodes = [];

    var routeNodes = routeData.split(";");
    var ptr = 0;
    // var unknown1;
    // var unknown2;
    const latLngCoords = [];
    if (routeNodes.length >= 3) {
        if (routeNodes[ptr++] == "1.01") {
            ptr++; // zoomLevel = parseInt(routeNodes[ptr++]);                   // 18
            ptr++; //unknown1 = parseInt(routeNodes[ptr++]);                    // 1
            ptr++; // routeTypeUnused = parseInt(routeNodes[ptr++]);             // 0
            ptr++ // unknown2 = routeNodes[ptr++];                              // p
            ptr++ //const structType = routeNodes[ptr++];                      // a
            if (routeNodes.length >= 9) {
                ptr++; // const lat = convertScale(parseFloat(routeNodes[ptr++]));     // 4311737
                ptr++; // const lng = convertScale(parseFloat(routeNodes[ptr++]));     // -8949125
                var structTypeLen = parseInt(routeNodes[ptr++]);           // 30
                for (let idx = 0; idx < structTypeLen; idx++) {
                    ptr++; //const b4 = parseFloat(routeNodes[ptr++]);          // 130.805
                    // parsedNodes.push(b4);
                    ptr++ // const structType2 = routeNodes[ptr++];                        // a
                    var structType2Len = parseInt(routeNodes[ptr++]);              // 9
                    var idx2;
                    for (idx2 = 0; idx2 < structType2Len; idx2++) {
                        const lat = convertScale(parseFloat(routeNodes[ptr++]));
                        const lng = convertScale(parseFloat(routeNodes[ptr++]));
                        latLngCoords.push({ lat, lng });
                    }
                }
            }
        }
    }
    return latLngCoords;
}
/************************************** */

async function fromFile(filename) {
    const dat = await fs.readFile(filename, { encoding: 'utf-8' });
    const [name, value] = dat.split(/=/, 2);
    const route = parseRoute(value);
    console.log(name);
    console.log(route);
}

async function getMapPedRoute(routeId) {
    const url = `https://www.mappedometer.com/mapGetRoute.php?route_num=${routeId}`;
    const headers = {};
    return fetch(url, { method: 'GET', headers });
}

function doResp(body = '', code = 200, message = false) {
    const resp = {
        statusCode: code || 200,
        body: typeof body !== 'string' ? JSON.stringify(body) : body
    };

    if (message) {
        resp.message = message;
    }

    return resp;
}

exports.handler = async (event) => {
    try {
        if (!event || !event.queryStringParameters || !event.queryStringParameters.id) {
            return doResp({}, 401, 'bad request');
        } else {
            const id = event.queryStringParameters.id;
            const format = event.queryStringParameters.format || 'kml';

            const resp = await getMapPedRoute(id)
            const raw = await resp.text();
            if (format === 'raw') {
                const route = parseRoute(raw);
                return doResp({ id, raw, route });
            } else {
                const doc = KmlRouteDoc.fromMapPedRoute(raw);
                return doc.toKML();
                // return doResp({ kml: doc.toKML() });
            }
        }
    } catch (err) {
        console.log(err);
        return doResp({ err: JSON.stringify(err, null, 2) }, 500, 'we get signal');
    }
};
