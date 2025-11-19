import { initMap } from './map.js';
import { initFlightService } from './api.js';
import { initUI } from './ui.js';
import { initAirlineService } from './airlines.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing SkyTrack...');

    // Initialize Airline Database
    await initAirlineService();

    // Initialize Map
    const map = initMap();

    // Initialize UI
    const ui = initUI(map);

    // Initialize Data Service
    initFlightService(map, ui);

    // Listen for flight updates
    document.addEventListener('flightsUpdated', (e) => {
        import('./map.js').then(module => {
            module.updateMarkers(map, e.detail);
        });
    });

    // Listen for selection
    document.addEventListener('flightSelected', (e) => {
        import('./map.js').then(module => {
            module.selectFlight(map, e.detail);
        });
    });

    document.addEventListener('flightDeselected', () => {
        import('./map.js').then(module => {
            module.deselectFlight(map);
        });
    });
});
