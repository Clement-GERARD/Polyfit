// Fonction pour gérer le tri des tableaux de résultats
function setupTableSorting() {
    const table = document.getElementById('comparison-table');
    if (!table) return;

    // Ajouter des indicateurs de tri aux en-têtes de colonnes
    const headers = table.querySelectorAll('thead th');
    headers.forEach(header => {
        if (header.cellIndex > 0) { // Ignorer la première colonne (noms des paramètres)
            header.classList.add('sortable');
            header.innerHTML += '<span class="sort-icon">⇅</span>';
            header.addEventListener('click', () => sortTable(header.cellIndex));
        }
    });

    // Stocker l'état de tri actuel
    table.dataset.sortColumn = '0';
    table.dataset.sortDirection = 'asc';
}

// Fonction pour trier le tableau par colonne
function sortTable(columnIndex) {
    const table = document.getElementById('comparison-table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const headers = table.querySelectorAll('thead th');
    
    // Déterminer la direction du tri
    let sortDirection = 'asc';
    if (table.dataset.sortColumn === columnIndex.toString() && table.dataset.sortDirection === 'asc') {
        sortDirection = 'desc';
    }
    
    // Mettre à jour l'état de tri
    table.dataset.sortColumn = columnIndex.toString();
    table.dataset.sortDirection = sortDirection;
    
    // Mettre à jour les indicateurs visuels
    headers.forEach(header => {
        if (header.cellIndex === columnIndex) {
            header.classList.add('sorted');
            header.querySelector('.sort-icon').textContent = sortDirection === 'asc' ? '↑' : '↓';
        } else {
            header.classList.remove('sorted');
            if (header.querySelector('.sort-icon')) {
                header.querySelector('.sort-icon').textContent = '⇅';
            }
        }
    });
    
    // Trier les lignes
    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].textContent.trim();
        const cellB = rowB.cells[columnIndex].textContent.trim();
        
        // Gérer les cas spéciaux (cellules vides, valeurs non numériques)
        if (cellA === '-' && cellB === '-') return 0;
        if (cellA === '-') return 1;
        if (cellB === '-') return -1;
        
        // Convertir en nombres pour le tri numérique
        const valueA = parseFloat(cellA.replace(/[^\d.-]/g, ''));
        const valueB = parseFloat(cellB.replace(/[^\d.-]/g, ''));
        
        if (isNaN(valueA) && isNaN(valueB)) {
            // Tri alphabétique si les deux valeurs ne sont pas des nombres
            return sortDirection === 'asc' 
                ? cellA.localeCompare(cellB) 
                : cellB.localeCompare(cellA);
        } else if (isNaN(valueA)) {
            return 1;
        } else if (isNaN(valueB)) {
            return -1;
        } else {
            // Tri numérique
            return sortDirection === 'asc' 
                ? valueA - valueB 
                : valueB - valueA;
        }
    });
    
    // Réorganiser les lignes dans le tableau
    rows.forEach(row => tbody.appendChild(row));
}

// Fonction pour initialiser les filtres du tableau
function setupTableFilters() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-container';
    filterContainer.innerHTML = `
        <div class="filter-group">
            <label for="method-filter">Filtrer par méthode:</label>
            <select id="method-filter">
                <option value="all">Toutes les méthodes</option>
                <option value="rand">Classique</option>
                <option value="mlp">MLP</option>
                <option value="cnn">CNN</option>
                <option value="gen">Génétique</option>
            </select>
        </div>
        
        <div class="filter-group">
            <label for="param-filter">Filtrer par paramètre:</label>
            <select id="param-filter">
                <option value="all">Tous les paramètres</option>
                <option value="J0">J0</option>
                <option value="Jph">Jph</option>
                <option value="Rs">Rs</option>
                <option value="Rsh">Rsh</option>
                <option value="n">n</option>
                <option value="SSD">SSD</option>
            </select>
        </div>
        
        <div class="filter-group">
            <label>Plage de valeurs:</label>
            <div class="param-range">
                <input type="number" id="min-value" placeholder="Min" step="any">
                <span>à</span>
                <input type="number" id="max-value" placeholder="Max" step="any">
            </div>
        </div>
        
        <button id="apply-filter">Appliquer les filtres</button>
        <button id="reset-filter">Réinitialiser</button>
    `;
    
    // Insérer le conteneur de filtres avant le tableau
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
        tableContainer.parentNode.insertBefore(filterContainer, tableContainer);
    }
    
    // Ajouter les gestionnaires d'événements pour les filtres
    document.getElementById('apply-filter').addEventListener('click', applyFilters);
    document.getElementById('reset-filter').addEventListener('click', resetFilters);
    
    // Ajouter des classes aux cellules pour faciliter le filtrage
    const table = document.getElementById('comparison-table');
    if (table) {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const paramName = row.cells[0].textContent.trim();
            row.classList.add(`param-${paramName}`);
            
            // Ajouter des classes pour les méthodes
            for (let i = 1; i < row.cells.length; i++) {
                const methodClass = table.rows[0].cells[i].className.split('-')[0] || '';
                if (methodClass) {
                    row.cells[i].classList.add(`method-${methodClass}`);
                }
            }
        });
    }
}

// Fonction pour appliquer les filtres
function applyFilters() {
    const methodFilter = document.getElementById('method-filter').value;
    const paramFilter = document.getElementById('param-filter').value;
    const minValue = document.getElementById('min-value').value;
    const maxValue = document.getElementById('max-value').value;
    
    const table = document.getElementById('comparison-table');
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        let showRow = true;
        
        // Filtrer par paramètre
        if (paramFilter !== 'all' && !row.classList.contains(`param-${paramFilter}`)) {
            showRow = false;
        }
        
        // Filtrer par méthode et plage de valeurs
        if (showRow && (methodFilter !== 'all' || (minValue !== '' || maxValue !== ''))) {
            const cells = row.querySelectorAll('td');
            
            let methodCellFound = false;
            
            for (let i = 1; i < cells.length; i++) {
                const cell = cells[i];
                const methodClass = cell.className.split(' ').find(cls => cls.startsWith('method-'));
                
                // Vérifier si la cellule correspond à la méthode filtrée
                if (methodFilter !== 'all') {
                    if (methodClass && methodClass === `method-${methodFilter}`) {
                        methodCellFound = true;
                        
                        // Vérifier la plage de valeurs
                        if (minValue !== '' || maxValue !== '') {
                            const cellValue = parseFloat(cell.textContent.replace(/[^\d.-]/g, ''));
                            
                            if (!isNaN(cellValue)) {
                                if (minValue !== '' && cellValue < parseFloat(minValue)) {
                                    showRow = false;
                                }
                                if (maxValue !== '' && cellValue > parseFloat(maxValue)) {
                                    showRow = false;
                                }
                            }
                        }
                    }
                } else if (minValue !== '' || maxValue !== '') {
                    // Si aucune méthode spécifique n'est sélectionnée, vérifier toutes les cellules
                    const cellValue = parseFloat(cell.textContent.replace(/[^\d.-]/g, ''));
                    
                    if (!isNaN(cellValue)) {
                        if (minValue !== '' && cellValue < parseFloat(minValue)) {
                            showRow = false;
                        }
                        if (maxValue !== '' && cellValue > parseFloat(maxValue)) {
                            showRow = false;
                        }
                    }
                }
            }
            
            // Si une méthode spécifique est sélectionnée mais non trouvée dans cette ligne
            if (methodFilter !== 'all' && !methodCellFound) {
                showRow = false;
            }
        }
        
        // Afficher ou masquer la ligne
        row.style.display = showRow ? '' : 'none';
    });
    
    // Afficher un message si aucun résultat
    const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
    const noResultsMessage = document.getElementById('no-results-message');
    
    if (visibleRows.length === 0) {
        if (!noResultsMessage) {
            const message = document.createElement('div');
            message.id = 'no-results-message';
            message.className = 'no-results';
            message.textContent = 'Aucun résultat ne correspond aux filtres sélectionnés.';
            
            const tableContainer = document.querySelector('.table-container');
            if (tableContainer) {
                tableContainer.appendChild(message);
            }
        }
    } else if (noResultsMessage) {
        noResultsMessage.remove();
    }
}

// Fonction pour réinitialiser les filtres
function resetFilters() {
    document.getElementById('method-filter').value = 'all';
    document.getElementById('param-filter').value = 'all';
    document.getElementById('min-value').value = '';
    document.getElementById('max-value').value = '';
    
    // Afficher toutes les lignes
    const rows = document.querySelectorAll('#comparison-table tbody tr');
    rows.forEach(row => {
        row.style.display = '';
    });
    
    // Supprimer le message "aucun résultat"
    const noResultsMessage = document.getElementById('no-results-message');
    if (noResultsMessage) {
        noResultsMessage.remove();
    }
}

// Fonction pour mettre à jour le tableau avec les valeurs SSD
function updateTableWithSSD(data) {
    // Vérifier si la ligne SSD existe déjà
    let ssdRow = document.querySelector('#comparison-table tbody tr.param-SSD');
    
    // Si la ligne n'existe pas, la créer
    if (!ssdRow) {
        const tbody = document.querySelector('#comparison-table tbody');
        if (!tbody) return;
        
        ssdRow = document.createElement('tr');
        ssdRow.classList.add('param-SSD');
        
        ssdRow.innerHTML = `
            <td>SSD</td>
            <td class="rand-SSD method-rand">-</td>
            <td class="mlp-SSD method-mlp">-</td>
            <td class="cnn-SSD method-cnn">-</td>
            <td class="gen-SSD method-gen">-</td>
        `;
        
        tbody.appendChild(ssdRow);
    }
    
    // Mettre à jour les valeurs SSD
    if (data.ssd_rand) {
        updateTableCell("rand", "SSD", formatNumber(data.ssd_rand));
    }
    if (data.ssd_mlp) {
        updateTableCell("mlp", "SSD", formatNumber(data.ssd_mlp));
    }
    if (data.ssd_cnn) {
        updateTableCell("cnn", "SSD", formatNumber(data.ssd_cnn));
    }
    if (data.ssd_gen) {
        updateTableCell("gen", "SSD", formatNumber(data.ssd_gen));
    }
}

// Fonction pour initialiser le tri et les filtres du tableau
function initializeTableFeatures() {
    setupTableSorting();
    setupTableFilters();
    
    // Ajouter des styles CSS pour les fonctionnalités de tri
    const style = document.createElement('style');
    style.textContent = `
        .sortable {
            cursor: pointer;
            position: relative;
        }
        
        .sort-icon {
            margin-left: 5px;
            font-size: 0.8em;
        }
        
        th.sorted {
            background-color: var(--primary-color);
            color: white;
        }
        
        .no-results {
            padding: 20px;
            text-align: center;
            font-style: italic;
            color: var(--text-color);
            background-color: rgba(0, 0, 0, 0.05);
            border-radius: 8px;
            margin-top: 10px;
        }
    `;
    
    document.head.appendChild(style);
}

// Initialiser les fonctionnalités du tableau au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initializeTableFeatures();
    
    // Mettre à jour la fonction displayResults pour inclure la mise à jour du tableau avec SSD
    const originalDisplayResults = displayResults;
    displayResults = function(data) {
        originalDisplayResults(data);
        updateTableWithSSD(data);
    };
});

