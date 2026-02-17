document.addEventListener('DOMContentLoaded', () => {
    const drawSelect = document.getElementById('draw-select');
    const statusMessage = document.getElementById('status-message');
    const winnersTable = document.getElementById('winners-table');
    const tableBody = document.getElementById('table-body');
    const countryFilter = document.getElementById('country-filter');

    const FIXED_OWNER_ID = '10611';
    let allWinners = [];

    // Country code to name mapping
    const countryMap = {
        'it': 'Italy', 'fr': 'France', 'es': 'Spain', 'de': 'Germany',
        'gb': 'United Kingdom', 'us': 'USA', 'ca': 'Canada', 'ch': 'Switzerland',
        'at': 'Austria', 'be': 'Belgium', 'nl': 'Netherlands', 'jp': 'Japan',
        'cn': 'China', 'ru': 'Russia', 'gr': 'Greece', 'pt': 'Portugal',
        'ie': 'Ireland', 'se': 'Sweden', 'no': 'Norway', 'fi': 'Finland',
        'dk': 'Denmark', 'pl': 'Poland', 'cz': 'Czech Republic', 'sk': 'Slovakia',
        'hu': 'Hungary', 'ro': 'Romania', 'bg': 'Bulgaria', 'hr': 'Croatia',
        'si': 'Slovenia', 'rs': 'Serbia', 'mk': 'North Macedonia', 'tr': 'Turkey',
        'au': 'Australia', 'nz': 'New Zealand', 'za': 'South Africa', 'br': 'Brazil',
        'ar': 'Argentina', 'mx': 'Mexico', 'co': 'Colombia', 'cl': 'Chile',
        'hk': 'Hong Kong', 'tw': 'Taiwan', 'kr': 'South Korea', 'my': 'Malaysia',
        'sg': 'Singapore', 'th': 'Thailand', 'vn': 'Vietnam', 'id': 'Indonesia',
        'in': 'India', 'ae': 'UAE', 'il': 'Israel'
    };

    function getCountryName(code) {
        if (!code) return 'Unknown';
        const lowerCode = code.toLowerCase();
        return countryMap[lowerCode] || code.toUpperCase();
    }

    // Fetch draw list from Random.org
    async function fetchDrawList(ownerId) {
        statusMessage.textContent = `Initializing data for owner ${ownerId}...`;
        drawSelect.innerHTML = '<option value="">-- Select a Draw --</option>';
        winnersTable.style.display = 'none';

        try {
            const url = `https://www.random.org/draws/records/?owner=${ownerId}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch records page');

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const rows = doc.querySelectorAll('table tr');

            const draws = Array.from(rows).map(row => {
                const link = row.querySelector('a[href*="draw="]');
                if (!link) return null;

                const href = link.getAttribute('href');
                const match = href.match(/draw=(\d+)/);
                const id = match ? match[1] : null;
                const name = link.textContent.trim();

                return id ? { id, name } : null;
            }).filter(Boolean);

            if (draws.length === 0) {
                statusMessage.textContent = 'No draws found for this owner.';
                return;
            }

            draws.forEach(draw => {
                const option = document.createElement('option');
                option.value = draw.id;
                option.textContent = `#${draw.id} - ${draw.name}`;
                drawSelect.appendChild(option);
            });

            statusMessage.textContent = 'Data ready. Select a draw to begin.';
        } catch (error) {
            console.error(error);
            statusMessage.textContent = `Error: ${error.message}. Please check your connection.`;
        }
    }

    // Fetch and parse CSV winners list
    async function fetchWinners(drawId) {
        if (!drawId) return;

        statusMessage.textContent = `Retrieving winners for draw #${drawId}...`;
        statusMessage.style.display = 'block';
        winnersTable.style.display = 'none';
        tableBody.innerHTML = '';
        allWinners = [];

        // Reset country filter
        countryFilter.innerHTML = '<option value="">All Countries</option>';
        countryFilter.disabled = true;

        try {
            const url = `https://www.random.org/draws/download/?draw=${drawId}&file=winners&format=csv`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch winners CSV');

            const csvText = await response.text();
            const lines = csvText.trim().split('\n');

            allWinners = lines.map(line => {
                const cols = line.split(',');
                return {
                    place: cols[0],
                    lastName: cols[1],
                    firstName: cols[2],
                    gender: cols[3],
                    category: cols[4],
                    country: cols[5],
                    event: cols[6],
                    regId: cols[7]
                };
            });

            populateCountryDropdown(allWinners);
            renderTable(allWinners);
            statusMessage.style.display = 'none';
            winnersTable.style.display = 'table';
        } catch (error) {
            console.error(error);
            statusMessage.textContent = `Error: ${error.message}`;
        }
    }

    function populateCountryDropdown(winners) {
        const countries = new Set();
        winners.forEach(w => {
            if (w.country) countries.add(w.country.toLowerCase());
        });

        const sortedCountries = Array.from(countries).sort((a, b) => {
            const nameA = getCountryName(a);
            const nameB = getCountryName(b);
            return nameA.localeCompare(nameB);
        });

        sortedCountries.forEach(code => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = `${getCountryName(code)} (${code.toUpperCase()})`;
            countryFilter.appendChild(option);
        });

        if (sortedCountries.length > 0) {
            countryFilter.disabled = false;
        }
    }

    function renderTable(data) {
        tableBody.innerHTML = '';
        data.forEach(winner => {
            const row = tableBody.insertRow();

            const fields = [
                winner.place,
                winner.lastName,
                winner.firstName,
                winner.gender,
                winner.category,
                getCountryName(winner.country),
                winner.event,
                winner.regId
            ];

            fields.forEach(text => {
                const cell = row.insertCell();
                cell.textContent = text || '';
            });
        });
    }

    drawSelect.addEventListener('change', () => {
        fetchWinners(drawSelect.value);
    });

    countryFilter.addEventListener('change', () => {
        const filterValue = countryFilter.value;
        if (!filterValue) {
            renderTable(allWinners);
            return;
        }

        const filtered = allWinners.filter(winner =>
            winner.country && winner.country.toLowerCase() === filterValue
        );
        renderTable(filtered);
    });

    // Initial load
    fetchDrawList(FIXED_OWNER_ID);
});
