import { getAirlineName } from './airlines.js';

export function initUI(map) {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleSidebar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const closeDetailsBtn = document.getElementById('closeDetails');
    const flightList = document.getElementById('flightList');
    const flightCount = document.getElementById('flightCount');
    const lastUpdated = document.getElementById('lastUpdated');
    const flightDetails = document.getElementById('flightDetails');
    const searchInput = document.getElementById('searchInput');

    let currentFlights = [];

    // Sidebar Toggles
    const toggleSidebar = () => {
        sidebar.classList.toggle('-translate-x-full');
    };

    toggleBtn.addEventListener('click', toggleSidebar);
    mobileMenuBtn.addEventListener('click', toggleSidebar);

    closeDetailsBtn.addEventListener('click', () => {
        flightDetails.classList.add('hidden');
        // Dispatch event to clear selection on map
        document.dispatchEvent(new CustomEvent('flightDeselected'));
    });

    // Search Filter
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        renderFlightList(currentFlights, term);
    });

    function renderFlightList(flights, searchTerm = '') {
        flightList.innerHTML = '';

        const filtered = flights.filter(f => {
            const callsign = (f[1] || '').toLowerCase();
            const country = (f[2] || '').toLowerCase();
            const icao = (f[0] || '').toLowerCase();
            return callsign.includes(searchTerm) || country.includes(searchTerm) || icao.includes(searchTerm);
        });

        // Limit to 50 for performance, unless searching
        const displayList = searchTerm ? filtered : filtered.slice(0, 50);

        if (displayList.length === 0) {
            flightList.innerHTML = '<div class="text-slate-500 text-center mt-4">No flights found</div>';
            return;
        }

        displayList.forEach(flight => {
            const callsign = flight[1] || 'N/A';
            const country = flight[2] || 'Unknown';
            const icao24 = flight[0];
            const airline = getAirlineName(callsign);

            const item = document.createElement('div');
            item.className = 'p-3 bg-slate-800/50 hover:bg-slate-700 rounded cursor-pointer transition-colors border border-slate-700/50';
            item.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="font-bold text-blue-300">${callsign.trim()}</span>
                    <span class="text-xs text-slate-400">${country}</span>
                </div>
                <div class="text-xs text-slate-500 mt-1 flex justify-between">
                    <span>ICAO: ${icao24}</span>
                    <span class="text-slate-400 italic truncate max-w-[120px] text-right">${airline}</span>
                </div>
            `;
            item.addEventListener('click', () => {
                showDetails(flight);
                if (flight[6] && flight[5]) {
                    map.setView([flight[6], flight[5]], 10);
                    // Dispatch event to select flight on map
                    document.dispatchEvent(new CustomEvent('flightSelected', { detail: flight }));
                }
                // On mobile, close sidebar after selection
                if (window.innerWidth < 768) {
                    toggleSidebar();
                }
            });
            flightList.appendChild(item);
        });
    }

    return {
        updateFlightList: (flights) => {
            currentFlights = flights;
            const searchTerm = searchInput.value.toLowerCase();
            renderFlightList(flights, searchTerm);
        },
        updateStatus: (count) => {
            flightCount.textContent = `${count} flights visible`;
            const now = new Date();
            lastUpdated.textContent = `Updated ${now.toLocaleTimeString()}`;
        },
        showError: (msg) => {
            flightCount.textContent = msg;
            flightCount.classList.add('text-red-400');
        }
    };
}

function showDetails(flight) {
    const flightDetails = document.getElementById('flightDetails');
    const detailCallsign = document.getElementById('detailCallsign');
    const detailCountry = document.getElementById('detailCountry');
    const detailAltitude = document.getElementById('detailAltitude');
    const detailVelocity = document.getElementById('detailVelocity');
    const detailLat = document.getElementById('detailLat');
    const detailLon = document.getElementById('detailLon');

    const callsign = flight[1] || flight[0];
    const airline = getAirlineName(callsign);

    detailCallsign.innerHTML = `${callsign} <span class="block text-sm font-normal text-slate-400 mt-1">${airline}</span>`;
    detailCountry.textContent = flight[2];
    detailAltitude.textContent = flight[7] ? `${Math.round(flight[7] * 3.28084)} ft` : 'N/A';
    detailVelocity.textContent = flight[9] ? `${Math.round(flight[9] * 1.94384)} kts` : 'N/A';
    detailLat.textContent = flight[6]?.toFixed(4);
    detailLon.textContent = flight[5]?.toFixed(4);

    flightDetails.classList.remove('hidden');
}
