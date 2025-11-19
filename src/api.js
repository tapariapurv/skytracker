const BASE_URL = 'https://opensky-network.org/api';

export function initFlightService(map, ui) {
    // Initial fetch
    fetchFlights(map, ui);

    // Poll every 10 seconds
    setInterval(() => fetchFlights(map, ui), 10000);

    // Update on map move (debounce this in production, but simple for now)
    map.on('moveend', () => fetchFlights(map, ui));
}

async function fetchFlights(map, ui) {
    const bounds = map.getBounds();
    const lamin = bounds.getSouth();
    const lomin = bounds.getWest();
    const lamax = bounds.getNorth();
    const lomax = bounds.getEast();

    try {
        // OpenSky API for states within bounding box
        const response = await fetch(`${BASE_URL}/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const flights = data.states || [];

        // Update UI and Map
        ui.updateFlightList(flights);
        ui.updateStatus(flights.length);

        // We need to import updateMarkers here or pass it in. 
        // For better separation, let's dispatch an event or callback.
        // For now, we'll just log it.
        console.log(`Fetched ${flights.length} flights`);

        // Ideally, we call map.updateMarkers(flights) if we attached it to the map object
        // or import it. Let's assume we pass a callback or handle it in main.
        // Refactoring to return data might be cleaner, but let's stick to the plan.

        // Dispatch custom event for map to pick up
        const event = new CustomEvent('flightsUpdated', { detail: flights });
        document.dispatchEvent(event);

    } catch (error) {
        console.error('Failed to fetch flights:', error);
        ui.showError('Failed to fetch flight data');
    }
}
