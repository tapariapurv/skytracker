const AIRLINES_DATA_URL = 'https://raw.githubusercontent.com/npow/airline-codes/master/airlines.json';

let airlineMap = new Map();

export async function initAirlineService() {
    try {
        const response = await fetch(AIRLINES_DATA_URL);
        if (!response.ok) throw new Error('Failed to fetch airline data');

        const data = await response.json();

        // Data structure is array of objects: { name, alias, iata, icao, ... }
        data.forEach(airline => {
            if (airline.icao && airline.name) {
                airlineMap.set(airline.icao, airline.name);
            }
        });

        console.log(`Loaded ${airlineMap.size} airlines`);
        return true;
    } catch (error) {
        console.warn('Airline data could not be loaded:', error);
        return false;
    }
}

export function getAirlineName(callsign) {
    if (!callsign || callsign.length < 3) return 'Unknown Airline';

    // Extract first 3 letters as ICAO code
    // Callsigns are usually "BAW123" -> "BAW"
    // Some might be shorter or different, but standard is 3 letters.
    // We need to be careful about trimming and case.
    const cleanCallsign = callsign.trim().toUpperCase();

    // Try to match the first 3 characters
    // Regex to match 3 letters at start
    const match = cleanCallsign.match(/^[A-Z]{3}/);
    if (match) {
        const icao = match[0];
        if (airlineMap.has(icao)) {
            return airlineMap.get(icao);
        }
    }

    return 'Unknown Airline';
}
