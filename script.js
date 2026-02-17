document.addEventListener('DOMContentLoaded', () => {
    const ownerIdInput = document.getElementById('owner-id');
    const loadDrawsButton = document.getElementById('load-draws');
    const drawSelect = document.getElementById('draw-select');
    const statusMessage = document.getElementById('status-message');
    const winnersTable = document.getElementById('winners-table');
    const tableBody = document.getElementById('table-body');
    const countryFilter = document.getElementById('country-filter');

    let allWinners = [];

    // Fetch draw list from Random.org
    async function fetchDrawList(ownerId) {
        statusMessage.textContent = `Fetching draws for owner ${ownerId}...`;
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

                // Extract draw ID from href
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

            statusMessage.textContent = 'Draws loaded. Please select one below.';
        } catch (error) {
            console.error(error);
            statusMessage.textContent = `Error: ${error.message}. Make sure CORS is allowed.`;
        }
    }

    loadDrawsButton.addEventListener('click', () => {
        fetchDrawList(ownerIdInput.value.trim());
    });

    // Fetch and parse CSV winners list
    async function fetchWinners(drawId) {
        if (!drawId) return;

        statusMessage.textContent = `Fetching winners for draw #${drawId}...`;
        statusMessage.style.display = 'block';
        winnersTable.style.display = 'none';
        tableBody.innerHTML = '';
        allWinners = [];

        try {
            const url = `https://www.random.org/draws/download/?draw=${drawId}&file=winners&format=csv`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch winners CSV');

            const csvText = await response.text();
            const lines = csvText.trim().split('\n');

            allWinners = lines.map(line => {
                const cols = line.split(',');
                // CSV structure: Place, LastName, FirstName, Gender, Category, Country, Event, ID
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

            renderTable(allWinners);
            statusMessage.style.display = 'none';
            winnersTable.style.display = 'table';
        } catch (error) {
            console.error(error);
            statusMessage.textContent = `Error: ${error.message}`;
        }
    }

    function renderTable(data) {
        tableBody.innerHTML = '';
        data.forEach(winner => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${winner.place}</td>
                <td>${winner.lastName}</td>
                <td>${winner.firstName}</td>
                <td>${winner.gender}</td>
                <td>${winner.category}</td>
                <td>${winner.country}</td>
                <td>${winner.event}</td>
                <td>${winner.regId}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    drawSelect.addEventListener('change', () => {
        fetchWinners(drawSelect.value);
        countryFilter.value = '';
    });

    countryFilter.addEventListener('input', () => {
        const filterValue = countryFilter.value.toLowerCase().trim();
        if (!filterValue) {
            renderTable(allWinners);
            return;
        }

        const filtered = allWinners.filter(winner =>
            winner.country && winner.country.toLowerCase().includes(filterValue)
        );
        renderTable(filtered);
    });

    // Initial load
    fetchDrawList('10611');
});
