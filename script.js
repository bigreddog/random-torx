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
        'in': 'India', 'ae': 'UAE', 'il': 'Israel', 'ad': 'Andorra', 'ee': 'Estonia',
        'lv': 'Latvia', 'lt': 'Lithuania', 'lu': 'Luxembourg', 'cy': 'Cyprus',
        'is': 'Iceland', 'mt': 'Malta', 'mc': 'Monaco', 'li': 'Liechtenstein',
        'sm': 'San Marino', 'va': 'Vatican City', 'ua': 'Ukraine', 'by': 'Belarus',
        'md': 'Moldova', 'ge': 'Georgia', 'am': 'Armenia', 'az': 'Azerbaijan',
        'kz': 'Kazakhstan', 'uz': 'Uzbekistan', 'tm': 'Turkmenistan', 'kg': 'Kyrgyzstan',
        'tj': 'Tajikistan'
    };

    function getCountryName(code) {
        if (!code) return 'Unknown';
        const lowerCode = code.toLowerCase();
        return countryMap[lowerCode] || code.toUpperCase();
    }

    function isCountryCode(val) {
        if (!val || val.length !== 2) return false;
        return countryMap.hasOwnProperty(val.toLowerCase());
    }

    // Fetch draw list from Random.org
    async function fetchDrawList(ownerId) {
        statusMessage.textContent = `Finding draws for owner ${ownerId}...`;
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
                statusMessage.textContent = 'No draws found.';
                return;
            }

            draws.forEach(draw => {
                const option = document.createElement('option');
                option.value = draw.id;
                option.textContent = `#${draw.id} - ${draw.name}`;
                drawSelect.appendChild(option);
            });

            statusMessage.textContent = 'Select a draw to view winners.';
        } catch (error) {
            console.error(error);
            statusMessage.textContent = `Error: ${error.message}`;
        }
    }

    // Fetch and parse CSV winners list
    async function fetchWinners(drawId) {
        if (!drawId) return;

        statusMessage.textContent = `Loading winners for draw #${drawId}...`;
        statusMessage.style.display = 'block';
        winnersTable.style.display = 'none';
        tableBody.innerHTML = '';
        allWinners = [];

        countryFilter.innerHTML = '<option value="">All Countries</option>';
        countryFilter.disabled = true;

        try {
            const url = `https://www.random.org/draws/download/?draw=${drawId}&file=winners&format=csv`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch winners CSV');

            const csvText = await response.text();
            const lines = csvText.trim().split('\n');

            allWinners = lines.map(line => {
                // Robust CSV split that handles quotes
                const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.replace(/^"|"$/g, '').trim());
                if (cols.length < 3) return null;

                // Guess mapping by finding country code
                let countryIdx = -1;
                for (let i = 1; i < cols.length; i++) {
                    if (isCountryCode(cols[i])) {
                        countryIdx = i;
                        break;
                    }
                }

                let winner = {
                    place: cols[0],
                    lastName: '',
                    firstName: '',
                    gender: '',
                    category: '',
                    country: '',
                    event: '',
                    regId: ''
                };

                // The Random.org draw formats have evolved over time.
                // We use the country column index as an anchor.
                if (countryIdx === 3) {
                    // Early format (e.g. some 2017 sub-draws)
                    winner.lastName = cols[1];
                    winner.firstName = cols[2];
                    winner.country = cols[3];
                    winner.regId = cols[cols.length - 1];
                } else if (countryIdx === 4) {
                    // 2017-2019 format: Rank, DrawName, LastName, FirstName, Country, RegID
                    winner.lastName = cols[2];
                    winner.firstName = cols[3];
                    winner.country = cols[4];
                    winner.regId = cols[cols.length - 1];
                } else if (countryIdx === 5) {
                    // 2020-2025 format: Rank, LastName, FirstName, Gender, Cat, Country, Event, RegID
                    winner.lastName = cols[1];
                    winner.firstName = cols[2];
                    winner.gender = cols[3];
                    winner.category = cols[4];
                    winner.country = cols[5];
                    winner.event = cols[6];
                    winner.regId = cols[7];
                } else if (countryIdx > 0) {
                    // Generic fallback
                    winner.country = cols[countryIdx];
                    winner.lastName = cols[countryIdx - 2] || '';
                    winner.firstName = cols[countryIdx - 1] || '';
                    winner.regId = cols[cols.length - 1];
                }

                return winner;
            }).filter(Boolean);

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
                winner.gender || '-',
                winner.category || '-',
                getCountryName(winner.country),
                winner.event || '-',
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
