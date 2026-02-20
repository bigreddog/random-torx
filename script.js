document.addEventListener('DOMContentLoaded', () => {
    const drawSelect = document.getElementById('draw-select');
    const statusMessage = document.getElementById('status-message');
    const winnersTable = document.getElementById('winners-table');
    const tableBody = document.getElementById('table-body');
    const countryFilter = document.getElementById('country-filter');

    const FIXED_OWNER_ID = '10611';
    let allWinners = [];

    // Country code to name mapping (ISO 3166-1 alpha-2)
    const countryMap = {
        'af': 'Afghanistan', 'ax': 'Åland Islands', 'al': 'Albania', 'dz': 'Algeria', 'as': 'American Samoa', 'ad': 'Andorra', 'ao': 'Angola', 'ai': 'Anguilla', 'aq': 'Antarctica', 'ag': 'Antigua and Barbuda', 'ar': 'Argentina', 'am': 'Armenia', 'aw': 'Aruba', 'au': 'Australia', 'at': 'Austria', 'az': 'Azerbaijan', 'bs': 'Bahamas', 'bh': 'Bahrain', 'bd': 'Bangladesh', 'bb': 'Barbados', 'by': 'Belarus', 'be': 'Belgium', 'bz': 'Belize', 'bj': 'Benin', 'bm': 'Bermuda', 'bt': 'Bhutan', 'bo': 'Bolivia', 'bq': 'Bonaire', 'ba': 'Bosnia and Herzegovina', 'bw': 'Botswana', 'bv': 'Bouvet Island', 'br': 'Brazil', 'io': 'British Indian Ocean Territory', 'bn': 'Brunei Darussalam', 'bg': 'Bulgaria', 'bf': 'Burkina Faso', 'bi': 'Burundi', 'cv': 'Cabo Verde', 'kh': 'Cambodia', 'cm': 'Cameroon', 'ca': 'Canada', 'ky': 'Cayman Islands', 'cf': 'Central African Republic', 'td': 'Chad', 'cl': 'Chile', 'cn': 'China', 'cx': 'Christmas Island', 'cc': 'Cocos (Keeling) Islands', 'co': 'Colombia', 'km': 'Comoros', 'cd': 'Congo (DRC)', 'cg': 'Congo (Republic)', 'ck': 'Cook Islands', 'cr': 'Costa Rica', 'ci': 'Côte d\'Ivoire', 'hr': 'Croatia', 'cu': 'Cuba', 'cw': 'Curaçao', 'cy': 'Cyprus', 'cz': 'Czech Republic', 'dk': 'Denmark', 'dj': 'Djibouti', 'dm': 'Dominica', 'do': 'Dominican Republic', 'ec': 'Ecuador', 'eg': 'Egypt', 'sv': 'El Salvador', 'gq': 'Equatorial Guinea', 'er': 'Eritrea', 'ee': 'Estonia', 'sz': 'Eswatini', 'et': 'Ethiopia', 'fk': 'Falkland Islands', 'fo': 'Faroe Islands', 'fj': 'Fiji', 'fi': 'Finland', 'fr': 'France', 'gf': 'French Guiana', 'pf': 'French Polynesia', 'tf': 'French Southern Territories', 'ga': 'Gabon', 'gm': 'Gambia', 'ge': 'Georgia', 'de': 'Germany', 'gh': 'Ghana', 'gi': 'Gibraltar', 'gr': 'Greece', 'gl': 'Greenland', 'gd': 'Grenada', 'gp': 'Guadeloupe', 'gu': 'Guam', 'gt': 'Guatemala', 'gg': 'Guernsey', 'gn': 'Guinea', 'gw': 'Guinea-Bissau', 'gy': 'Guyana', 'ht': 'Haiti', 'hm': 'Heard Island and McDonald Islands', 'va': 'Vatican City', 'hn': 'Honduras', 'hk': 'Hong Kong', 'hu': 'Hungary', 'is': 'Iceland', 'in': 'India', 'id': 'Indonesia', 'ir': 'Iran', 'iq': 'Iraq', 'ie': 'Ireland', 'im': 'Isle of Man', 'il': 'Israel', 'it': 'Italy', 'jm': 'Jamaica', 'jp': 'Japan', 'je': 'Jersey', 'jo': 'Jordan', 'kz': 'Kazakhstan', 'ke': 'Kenya', 'ki': 'Kiribati', 'kp': 'North Korea', 'kr': 'South Korea', 'kw': 'Kuwait', 'kg': 'Kyrgyzstan', 'la': 'Laos', 'lv': 'Latvia', 'lb': 'Lebanon', 'ls': 'Lesotho', 'lr': 'Liberia', 'ly': 'Libya', 'li': 'Liechtenstein', 'lt': 'Lithuania', 'lu': 'Luxembourg', 'mo': 'Macao', 'mg': 'Madagascar', 'mw': 'Malawi', 'my': 'Malaysia', 'mv': 'Maldives', 'ml': 'Mali', 'mt': 'Malta', 'mh': 'Marshall Islands', 'mq': 'Martinique', 'mr': 'Mauritania', 'mu': 'Mauritius', 'yt': 'Mayotte', 'mx': 'Mexico', 'fm': 'Micronesia', 'md': 'Moldova', 'mc': 'Monaco', 'mn': 'Mongolia', 'me': 'Montenegro', 'ms': 'Montserrat', 'ma': 'Morocco', 'mz': 'Mozambique', 'mm': 'Myanmar', 'na': 'Namibia', 'nr': 'Nauru', 'np': 'Nepal', 'nl': 'Netherlands', 'nc': 'New Caledonia', 'nz': 'New Zealand', 'ni': 'Nicaragua', 'ne': 'Niger', 'ng': 'Nigeria', 'nu': 'Niue', 'nf': 'Norfolk Island', 'mp': 'Northern Mariana Islands', 'no': 'Norway', 'om': 'Oman', 'pk': 'Pakistan', 'pw': 'Palau', 'ps': 'Palestine', 'pa': 'Panama', 'pg': 'Papua New Guinea', 'py': 'Paraguay', 'pe': 'Peru', 'ph': 'Philippines', 'pn': 'Pitcairn', 'pl': 'Poland', 'pt': 'Portugal', 'pr': 'Puerto Rico', 'qa': 'Qatar', 're': 'Réunion', 'ro': 'Romania', 'ru': 'Russia', 'rw': 'Rwanda', 'bl': 'Saint Barthélemy', 'sh': 'Saint Helena', 'kn': 'Saint Kitts and Nevis', 'lc': 'Saint Lucia', 'mf': 'Saint Martin', 'pm': 'Saint Pierre and Miquelon', 'vc': 'Saint Vincent and the Grenadines', 'ws': 'Samoa', 'sm': 'San Marino', 'st': 'Sao Tome and Principe', 'sa': 'Saudi Arabia', 'sn': 'Senegal', 'rs': 'Serbia', 'sc': 'Seychelles', 'sl': 'Sierra Leone', 'sg': 'Singapore', 'sx': 'Sint Maarten', 'sk': 'Slovakia', 'si': 'Slovenia', 'sb': 'Solomon Islands', 'so': 'Somalia', 'za': 'South Africa', 'gs': 'South Georgia and the South Sandwich Islands', 'ss': 'South Sudan', 'es': 'Spain', 'lk': 'Sri Lanka', 'sd': 'Sudan', 'sr': 'Suriname', 'sj': 'Svalbard and Jan Mayen', 'se': 'Sweden', 'ch': 'Switzerland', 'sy': 'Syria', 'tw': 'Taiwan', 'tj': 'Tajikistan', 'tz': 'Tanzania', 'th': 'Thailand', 'tl': 'Timor-Leste', 'tg': 'Togo', 'tk': 'Tokelau', 'to': 'Tonga', 'tt': 'Trinidad and Tobago', 'tn': 'Tunisia', 'tr': 'Turkey', 'tm': 'Turkmenistan', 'tc': 'Turks and Caicos Islands', 'tv': 'Tuvalu', 'ug': 'Uganda', 'ua': 'Ukraine', 'ae': 'United Arab Emirates', 'gb': 'United Kingdom', 'um': 'United States Minor Outlying Islands', 'us': 'United States', 'uy': 'Uruguay', 'uz': 'Uzbekistan', 'vu': 'Vanuatu', 've': 'Venezuela', 'vn': 'Vietnam', 'vg': 'British Virgin Islands', 'vi': 'U.S. Virgin Islands', 'wf': 'Wallis and Futuna', 'eh': 'Western Sahara', 'ye': 'Yemen', 'zm': 'Zambia', 'zw': 'Zimbabwe'
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

                // Skip header row if present
                if (isNaN(parseInt(cols[0]))) return null;

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
                    regId: cols[cols.length - 1] // Default to last column
                };

                // The Random.org draw formats have evolved over time.
                // We use the country column index as an anchor if found.
                if (countryIdx !== -1) {
                    winner.country = cols[countryIdx];
                    if (countryIdx === 3) {
                        // 2024 format: Rank, Last, First, Country, RegID, ...
                        winner.lastName = cols[1];
                        winner.firstName = cols[2];
                        winner.regId = cols[4];
                    } else if (countryIdx === 4) {
                        // 2017-2019 format: Rank, DrawName, LastName, FirstName, Country, RegID
                        winner.lastName = cols[2];
                        winner.firstName = cols[3];
                    } else if (countryIdx === 5) {
                        // 2020-2025 format: Rank, LastName, FirstName, Gender, Cat, Country, Event, RegID
                        winner.lastName = cols[1];
                        winner.firstName = cols[2];
                        winner.gender = cols[3];
                        winner.category = cols[4];
                        winner.event = cols[6];
                        winner.regId = cols[7];
                    } else {
                        // Generic fallback with country anchor
                        winner.lastName = cols[countryIdx - 2] || '';
                        winner.firstName = cols[countryIdx - 1] || '';
                    }
                } else {
                    // No country found (e.g. 2026 format) - guess by column length
                    if (cols.length === 6) {
                        // 2026 format: Rank, Last, First, Gender, Cat, ID
                        winner.lastName = cols[1];
                        winner.firstName = cols[2];
                        winner.gender = cols[3];
                        winner.category = cols[4];
                    } else {
                        // Bare minimum fallback
                        winner.lastName = cols[1] || '';
                        winner.firstName = cols[2] || '';
                    }
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
