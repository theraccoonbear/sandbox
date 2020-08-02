

class KmlRouteDoc {
    constructor(name = "New KML Doc", desc = "description") {
        this.name = name;
        this.description = desc;
        this.coords = []
    }

    static convertScale(bH) {
        return bH / 100000
    }

    static fromMapPedRoute(rawRouteData) {
        const [name, routeData] = rawRouteData.split(/=/, 2);
        // const parsedNodes = [];
    
        var routeNodes = routeData.split(";");
        var ptr = 0;
        // var unknown1;
        // var unknown2;
        const krd = new KmlRouteDoc("From MapPed", "From MapPed");
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
                            const lat = KmlRouteDoc.convertScale(parseFloat(routeNodes[ptr++]));
                            const lng = KmlRouteDoc.convertScale(parseFloat(routeNodes[ptr++]));
                            krd.addCoord(lat, lng );
                        }
                    }
                }
            }
        }
        return krd;
    }

    addCoord(lat, lng, elev = 0) {
        this.coords.push({ lat, lng, elev });
    }

    toKML() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Paths</name>
    <description>Examples of paths. Note that the tessellate tag is by default
      set to 0. If you want to create tessellated lines, they must be authored
      (or edited) directly in KML.</description>
    <Style id="basicLineStyle">
      <LineStyle>
        <color>7f00ffff</color>
        <width>4</width>
      </LineStyle>
      <PolyStyle>
        <color>7f00ff00</color>
      </PolyStyle>
    </Style>
    <Placemark>
      <name>Absolute Extruded</name>
      <description>Basic line style</description>
      <styleUrl>#basicLineStyle</styleUrl>
      <LineString>
        <extrude>1</extrude>
        <tessellate>1</tessellate>
        <altitudeMode>absolute</altitudeMode>
        <coordinates>
            ${ this.coords.map(c => `${c.lng},${c.lat},${c.elev}`).join("\n            ") }
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>`;
    }
}

module.exports = KmlRouteDoc;