// Fonction pour gérer le tri des tableaux de résultats
function setupTableSorting() {
    // Nous supprimons complètement le comportement de tri sur le tableau dans #raw-display
    // Aucune initialisation de tri n'est effectuée
    console.log("Comportement de tri supprimé du tableau comparatif");
    
    // Supprimer les attributs data-sort des en-têtes de colonnes
    const tableHeaders = document.querySelectorAll('#comparison-table th');
    tableHeaders.forEach(header => {
        header.removeAttribute('data-sort');
        header.style.cursor = 'default'; // Supprimer le curseur pointer
        
        // Supprimer les écouteurs d'événements click
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
    });
}

// Fonction pour initialiser les fonctionnalités du tableau
function initializeTableFeatures() {
    // Ne plus initialiser le tri du tableau
    setupTableSorting();
    
    // Ajouter des styles CSS pour le tableau
    const style = document.createElement('style');
    style.textContent = `
        .no-results {
            padding: 20px;
            text-align: center;
            font-style: italic;
            color: var(--text-color);
            background-color: rgba(0, 0, 0, 0.05);
            border-radius: 8px;
            margin-top: 10px;
        }
        
        #comparison-table th {
            cursor: default;
        }
    `;
    
    document.head.appendChild(style);
}

// Fonction pour mettre à jour le tableau avec toutes les valeurs
function updateTableWithAllValues(data) {
    if (!data) return;
    
    // Mettre à jour les valeurs pour chaque méthode et paramètre
    const parameters = ['J0', 'Jph', 'Rs', 'Rsh', 'n', 'SSD'];
    const methods = ['rand', 'mlp', 'cnn', 'gen'];
    
    parameters.forEach(param => {
        methods.forEach(method => {
            let value = '-';
            
            // Récupérer la valeur selon le paramètre
            if (param === 'SSD') {
                // Pour SSD, utiliser les propriétés ssd_*
                const ssdKey = `ssd_${method}`;
                if (data[ssdKey] !== undefined) {
                    value = formatNumber(data[ssdKey]);
                }
            } else {
                // Pour les autres paramètres, chercher dans les objets params_*
                const paramsKey = `params_${method === 'rand' ? 'random' : method === 'gen' ? 'genetique' : method}`;
                if (data[paramsKey] && data[paramsKey][param] !== undefined) {
                    value = formatNumber(data[paramsKey][param]);
                }
            }
            
            // Mettre à jour la cellule du tableau
            updateTableCell(method, param, value);
        });
    });
}

// Fonction pour mettre à jour une cellule spécifique du tableau
function updateTableCell(method, param, value) {
    const cell = document.querySelector(`.${method}-${param}`);
    if (cell) {
        cell.textContent = value;
    }
}

// Fonction pour formater un nombre
function formatNumber(num) {
    if (typeof num === 'number') {
        // Format scientifique pour les très petits nombres
        if (Math.abs(num) < 0.001) {
            return num.toExponential(4);
        }
        // Format arrondi pour les autres nombres
        return num.toFixed(4);
    }
    return num;
}

// Initialiser les fonctionnalités du tableau au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    initializeTableFeatures();
    
    // Remplacer la fonction displayResults pour inclure la mise à jour complète du tableau
    if (typeof displayResults === 'function') {
        const originalDisplayResults = displayResults;
        window.displayResults = function(data) {
            originalDisplayResults(data);
            updateTableWithAllValues(data);
        };
    } else {
        // Si displayResults n'est pas encore définie, attendre qu'elle le soit
        const checkInterval = setInterval(() => {
            if (typeof displayResults === 'function') {
                const originalDisplayResults = displayResults;
                window.displayResults = function(data) {
                    originalDisplayResults(data);
                    updateTableWithAllValues(data);
                };
                clearInterval(checkInterval);
            }
        }, 100);
    }
});

