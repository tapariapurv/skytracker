export function initMap() {
    // Initialize map centered on a default location (e.g., London)
    const map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([51.505, -0.09], 6);

    // Add Dark Matter tiles (CartoDB)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Add zoom control to bottom right
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    return map;
}

const markers = {};
let selectedFlightIcao = null;
let routePolyline = null;

export function updateMarkers(map, flights) {
    const currentIcaos = new Set();

    flights.forEach(flight => {
        const icao24 = flight[0];
        const lat = flight[6];
        const lon = flight[5];
        const trueTrack = flight[10] || 0;
        const callsign = flight[1] || 'N/A';

        if (!lat || !lon) return;

        currentIcaos.add(icao24);

        // Update history for selected flight
        if (selectedFlightIcao === icao24 && routePolyline) {
            routePolyline.addLatLng([lat, lon]);
        }

        if (markers[icao24]) {
            // Update existing marker
            const marker = markers[icao24];
            marker.setLatLng([lat, lon]);
            marker.setRotationAngle(trueTrack);

            // Update popup content if open (optional, skipping for performance)
        } else {
            // Create new marker
            // Better Plane SVG
            const svgPlane = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-blue-400 drop-shadow-md">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
            `;

            const icon = L.divIcon({
                className: 'bg-transparent border-none',
                html: `<div style="transform: rotate(${trueTrack - 45}deg); transition: transform 1s linear;">${svgPlane}</div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const marker = L.marker([lat, lon], { icon: icon }).addTo(map);
            marker.bindPopup(`
                <div class="font-sans">
                    <h3 class="font-bold text-lg text-blue-300">${callsign.trim()}</h3>
                    <p class="text-xs text-slate-300">ICAO: ${icao24}</p>
                    <p class="text-sm mt-1">Alt: ${Math.round(flight[7] * 3.28084)} ft</p>
                    <p class="text-sm">Spd: ${Math.round(flight[9] * 1.94384)} kts</p>
                </div>
            `);

            marker.setRotationAngle = (angle) => {
                const div = marker.getElement()?.querySelector('div');
                if (div) {
                    div.style.transform = `rotate(${angle - 45}deg)`;
                }
            };

            // Click event on marker to select
            marker.on('click', () => {
                document.dispatchEvent(new CustomEvent('flightSelected', { detail: flight }));
            });

            markers[icao24] = marker;
        }
    });

    // Remove markers
    Object.keys(markers).forEach(icao => {
        if (!currentIcaos.has(icao)) {
            map.removeLayer(markers[icao]);
            delete markers[icao];
        }
    });
}

export function selectFlight(map, flight) {
    const icao24 = flight[0];
    const lat = flight[6];
    const lon = flight[5];

    if (selectedFlightIcao === icao24) return;

    // Clear old selection
    if (routePolyline) {
        map.removeLayer(routePolyline);
    }

    selectedFlightIcao = icao24;

    // Start new polyline
    if (lat && lon) {
        routePolyline = L.polyline([[lat, lon]], {
            color: '#60a5fa', // blue-400
            weight: 2,
            opacity: 0.8,
            dashArray: '5, 10'
        }).addTo(map);
    }
}

export function deselectFlight(map) {
    selectedFlightIcao = null;
    if (routePolyline) {
        map.removeLayer(routePolyline);
        routePolyline = null;
    }
}
