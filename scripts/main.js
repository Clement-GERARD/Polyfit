document.getElementById('file-input').addEventListener('change', handleFiles);
document.getElementById('display-mode').addEventListener('change', toggleDisplayMode);
document.getElementById('toggle-theme-btn').addEventListener('click', toggleTheme);

const resultDetails = {};  // Stockage des résultats par méthode
const allResults = [];     // Stockage de tous les résultats pour les boîtes à moustaches
let currentFileName = "";  // Nom du fichier en cours de traitement
let charts = {};           // Stockage des instances de graphiques
let isDarkTheme = false;   // État du thème (clair par défaut)

// Fonction pour basculer entre les modes d'affichage
function toggleDisplayMode() {
    const isRawMode = document.getElementById('display-mode').checked;
    document.getElementById('normal-display').classList.toggle('hidden', isRawMode);
    document.getElementById('raw-display').classList.toggle('hidden', !isRawMode);
    
    // Redimensionner les graphiques si on passe en mode brut
    if (isRawMode) {
        setTimeout(() => {
            for (const chartId in charts) {
                if (charts[chartId]) {
                    charts[chartId].resize();
                }
            }
        }, 100);
    }
}

// Fonction pour basculer entre les thèmes clair et sombre
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme', isDarkTheme);
    
    // Mettre à jour le texte du bouton
    const themeBtn = document.getElementById('toggle-theme-btn');
    themeBtn.textContent = isDarkTheme ? '☀️ Thème clair' : '🌙 Thème sombre';
    
    // Mettre à jour les graphiques si nécessaire
    updateChartsTheme();
}

// Mettre à jour le thème des graphiques
function updateChartsTheme() {
    for (const chartId in charts) {
        if (charts[chartId]) {
            const chart = charts[chartId];
            
            // Mettre à jour les options du graphique pour le thème
            chart.options.plugins.legend.labels.color = isDarkTheme ? '#e0e0e0' : '#333';
            chart.options.scales.x.ticks.color = isDarkTheme ? '#e0e0e0' : '#333';
            chart.options.scales.y.ticks.color = isDarkTheme ? '#e0e0e0' : '#333';
            chart.options.scales.x.grid.color = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            chart.options.scales.y.grid.color = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            
            chart.update();
        }
    }
}

function handleFiles(event) {
    const files = event.target.files;

    console.log("[LOG] Détection des fichiers :", files);

    if (!files.length) {
        console.warn("[WARN] Aucun fichier sélectionné.");
        return;
    }

    // Mettre à jour le statut
    updateProcessingStatus("processing");
    
    // Mettre à jour le nom du fichier
    currentFileName = files[0].name;
    document.getElementById('current-file').textContent = currentFileName;

    // Mettre à jour les placeholders
    updatePlaceholder("#graph-zone", "Affichage des courbes en cours...");
    updatePlaceholder("#random-method", "Analyse par Fit Classique en cours...");
    updatePlaceholder("#mlp-method", "Analyse par MLP en cours...");
    updatePlaceholder("#cnn-method", "Analyse par CNN en cours...");
    updatePlaceholder("#genetic-method", "Analyse par Fit Génétique en cours...");
    updatePlaceholder("#boxplot-zone", "Calcul des distributions en cours...");

    // Réinitialiser le tableau
    resetComparisonTable();

    uploadFile(files[0]); // Appel réel
}

function updateProcessingStatus(status) {
    const statusElement = document.getElementById('processing-status');
    statusElement.className = 'status-badge';
    
    switch(status) {
        case 'waiting':
            statusElement.classList.add('status-waiting');
            statusElement.textContent = "En attente";
            break;
        case 'processing':
            statusElement.classList.add('status-processing');
            statusElement.textContent = "En cours";
            break;
        case 'done':
            statusElement.classList.add('status-done');
            statusElement.textContent = "Données retournées";
            break;
        default:
            statusElement.classList.add('status-waiting');
            statusElement.textContent = "En attente";
    }
}

function resetComparisonTable() {
    const cellsToReset = document.querySelectorAll('#comparison-table td:not(:first-child)');
    cellsToReset.forEach(cell => {
        cell.textContent = "-";
    });
}

function updatePlaceholder(selector, message) {
    const element = document.querySelector(`${selector} .content-placeholder`);
    if (element) {
        element.innerHTML = message;  // Utiliser innerHTML pour gérer les <br> correctement
    } else {
        console.error(`[ERROR] Élément non trouvé : ${selector}`);
    }
}

function updateTableCell(method, param, value) {
    const cell = document.querySelector(`.${method}-${param}`);
    if (cell) {
        // Formater la valeur selon le type de paramètre
        let formattedValue = value;
        if (param === 'SSD') {
            formattedValue = formatNumber(value);
        } else if (typeof value === 'number' && Math.abs(value) < 0.001) {
            formattedValue = value.toExponential(4);
        }
        
        cell.textContent = formattedValue;
    } else {
        console.error(`[ERROR] Cellule non trouvée : .${method}-${param}`);
    }
}

const API_URL = "https://clementgerard-polyfit.hf.space/predict";

async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        console.log("Résultat brut reçu :", response);

        if (response.ok) {
            const data = await response.json();

            // Affichage des données reçues pour déboguer
            console.log("[DEBUG] Données reçues de l'API :", data);

            // Mettre à jour le statut
            updateProcessingStatus("done");
            
            // Stocker les résultats pour les graphiques box plot
            storeResults(data);
            
            // Afficher les résultats
            displayResults(data);
            
            // Mettre à jour le tableau
            updateComparisonTable(data);
            
            // Créer les boîtes à moustaches
            createBoxplots();
            
            // Mettre à jour les filtres disponibles
            updateFilters();
        } else {
            alert("Erreur lors du téléchargement du fichier.");
            updateProcessingStatus("waiting");
        }
    } catch (error) {
        console.error("Erreur:", error);
        updateProcessingStatus("waiting");
    }
}

function storeResults(data) {
    // Créer un objet résultat avec les données actuelles
    const result = {
        filename: currentFileName,
        methods: {}
    };
    
    // Ajouter les résultats de chaque méthode
    if (data.params_mlp) {
        result.methods.mlp = data.params_mlp;
        // Ajouter le SSD s'il existe
        if (data.ssd_mlp !== undefined) {
            result.methods.mlp.SSD = data.ssd_mlp;
        }
    }
    
    if (data.params_cnn) {
        result.methods.cnn = data.params_cnn;
        // Ajouter le SSD s'il existe
        if (data.ssd_cnn !== undefined) {
            result.methods.cnn.SSD = data.ssd_cnn;
        }
    }
    
    if (data.params_genetique) {
        result.methods.gen = data.params_genetique;
        // Ajouter le SSD s'il existe
        if (data.ssd_gen !== undefined) {
            result.methods.gen.SSD = data.ssd_gen;
        }
    }
    
    if (data.params_random) {
        result.methods.rand = data.params_random;
        // Ajouter le SSD s'il existe
        if (data.ssd_rand !== undefined) {
            result.methods.rand.SSD = data.ssd_rand;
        }
    }
    
    // Ajouter au tableau des résultats
    allResults.push(result);
}

function updateComparisonTable(data) {
    // Méthode MLP
    if (data.params_mlp) {
        updateTableCell("mlp", "J0", data.params_mlp.J0);
        updateTableCell("mlp", "Jph", data.params_mlp.Jph);
        updateTableCell("mlp", "Rs", data.params_mlp.Rs);
        updateTableCell("mlp", "Rsh", data.params_mlp.Rsh);
        updateTableCell("mlp", "n", data.params_mlp.n);
        // Ajouter le SSD s'il existe
        if (data.ssd_mlp !== undefined) {
            updateTableCell("mlp", "SSD", data.ssd_mlp);
        }
    }

    // Méthode CNN
    if (data.params_cnn) {
        updateTableCell("cnn", "J0", data.params_cnn.J0);
        updateTableCell("cnn", "Jph", data.params_cnn.Jph);
        updateTableCell("cnn", "Rs", data.params_cnn.Rs);
        updateTableCell("cnn", "Rsh", data.params_cnn.Rsh);
        updateTableCell("cnn", "n", data.params_cnn.n);
        // Ajouter le SSD s'il existe
        if (data.ssd_cnn !== undefined) {
            updateTableCell("cnn", "SSD", data.ssd_cnn);
        }
    }

    // Méthode génétique
    if (data.params_genetique) {
        updateTableCell("gen", "J0", data.params_genetique.J0);
        updateTableCell("gen", "Jph", data.params_genetique.Jph);
        updateTableCell("gen", "Rs", data.params_genetique.Rs);
        updateTableCell("gen", "Rsh", data.params_genetique.Rsh);
        updateTableCell("gen", "n", data.params_genetique.n);
        // Ajouter le SSD s'il existe
        if (data.ssd_gen !== undefined) {
            updateTableCell("gen", "SSD", data.ssd_gen);
        }
    }

    // Méthode aléatoire
    if (data.params_random) {
        updateTableCell("rand", "J0", data.params_random.J0);
        updateTableCell("rand", "Jph", data.params_random.Jph);
        updateTableCell("rand", "Rs", data.params_random.Rs);
        updateTableCell("rand", "Rsh", data.params_random.Rsh);
        updateTableCell("rand", "n", data.params_random.n);
        // Ajouter le SSD s'il existe
        if (data.ssd_rand !== undefined) {
            updateTableCell("rand", "SSD", data.ssd_rand);
        }
    }
}

function displayResults(data) {
    // Méthode MLP
    if (data.params_mlp) {
        updatePlaceholder("#mlp-method", `
            J0: ${data.params_mlp.J0}<br>
            Jph: ${data.params_mlp.Jph}<br>
            Rs: ${data.params_mlp.Rs}<br>
            Rsh: ${data.params_mlp.Rsh}<br>
            n: ${data.params_mlp.n}
            ${data.ssd_mlp !== undefined ? '<br><strong>SSD: ' + formatNumber(data.ssd_mlp) + '</strong>' : ''}
        `);
        resultDetails["mlp"] = {
            params: data.params_mlp,
            image: data.curve_image_mlp || null,
            ssd: data.ssd_mlp || null
        };
    }

    // Méthode CNN
    if (data.params_cnn) {
        updatePlaceholder("#cnn-method", `
            J0: ${data.params_cnn.J0}<br>
            Jph: ${data.params_cnn.Jph}<br>
            Rs: ${data.params_cnn.Rs}<br>
            Rsh: ${data.params_cnn.Rsh}<br>
            n: ${data.params_cnn.n}
            ${data.ssd_cnn !== undefined ? '<br><strong>SSD: ' + formatNumber(data.ssd_cnn) + '</strong>' : ''}
        `);
        resultDetails["cnn"] = {
            params: data.params_cnn,
            image: data.curve_image_cnn || null,
            ssd: data.ssd_cnn || null
        };
    }

    // Méthode génétique
    if (data.params_genetique) {
        updatePlaceholder("#genetic-method", `
            J0: ${data.params_genetique.J0}<br>
            Jph: ${data.params_genetique.Jph}<br>
            Rs: ${data.params_genetique.Rs}<br>
            Rsh: ${data.params_genetique.Rsh}<br>
            n: ${data.params_genetique.n}
            ${data.ssd_gen !== undefined ? '<br><strong>SSD: ' + formatNumber(data.ssd_gen) + '</strong>' : ''}
        `);
        resultDetails["gen"] = {
            params: data.params_genetique,
            image: data.curve_image_gen || null,
            ssd: data.ssd_gen || null
        };
    }

    // Méthode aléatoire
    if (data.params_random) {
        updatePlaceholder("#random-method", `
            J0: ${data.params_random.J0}<br>
            Jph: ${data.params_random.Jph}<br>
            Rs: ${data.params_random.Rs}<br>
            Rsh: ${data.params_random.Rsh}<br>
            n: ${data.params_random.n}
            ${data.ssd_rand !== undefined ? '<br><strong>SSD: ' + formatNumber(data.ssd_rand) + '</strong>' : ''}
        `);
        resultDetails["rand"] = {
            params: data.params_random,
            image: data.curve_image_rand || null,
            ssd: data.ssd_rand || null
        };
    }

    // Affichage du graphique combiné
    if (data.curve_image_all) {
        const container = document.querySelector("#graph-zone .content-placeholder");
        container.innerHTML = `<img src="data:image/png;base64,${data.curve_image_all}" alt="Courbe IV combinée" style="width:100%; height:auto; border-radius:10px; box-shadow: 0 0 10px rgba(0,0,0,0.2);" />`;
    } else {
        updatePlaceholder("#graph-zone", "Pas d'image combinée reçue.");
    }
}

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

// Fonction pour convertir les clés de méthode en noms lisibles
function methodToName(methodKey) {
    const methodNames = {
        'rand': 'Classique',
        'mlp': 'MLP',
        'cnn': 'CNN',
        'gen': 'Génétique'
    };
    
    return methodNames[methodKey] || methodKey;
}

// Initialisation des filtres et tris
function initializeFiltersAndSorting() {
    // Créer les éléments de filtre s'ils n'existent pas déjà
    if (!document.getElementById('filter-container')) {
        const filterContainer = document.createElement('div');
        filterContainer.id = 'filter-container';
        filterContainer.className = 'filter-container';
        
        // Filtre par méthode
        const methodFilter = document.createElement('div');
        methodFilter.className = 'filter-group';
        methodFilter.innerHTML = `
            <label>Filtrer par méthode:</label>
            <select id="method-filter">
                <option value="all">Toutes les méthodes</option>
                <option value="rand">Classique</option>
                <option value="mlp">MLP</option>
                <option value="cnn">CNN</option>
                <option value="gen">Génétique</option>
            </select>
        `;
        
        // Filtre par paramètre
        const paramFilter = document.createElement('div');
        paramFilter.className = 'filter-group';
        paramFilter.innerHTML = `
            <label>Filtrer par paramètre:</label>
            <select id="param-filter">
                <option value="all">Tous les paramètres</option>
                <option value="J0">J0</option>
                <option value="Jph">Jph</option>
                <option value="Rs">Rs</option>
                <option value="Rsh">Rsh</option>
                <option value="n">n</option>
                <option value="SSD">SSD</option>
            </select>
            <div id="param-range" class="param-range" style="display: none;">
                <input type="number" id="param-min" placeholder="Min" step="0.0001">
                <input type="number" id="param-max" placeholder="Max" step="0.0001">
                <button id="apply-filter">Appliquer</button>
            </div>
        `;
        
        // Tri
        const sortingOptions = document.createElement('div');
        sortingOptions.className = 'filter-group';
        sortingOptions.innerHTML = `
            <label>Trier par:</label>
            <select id="sort-by">
                <option value="none">Aucun tri</option>
                <option value="filename">Nom de fichier</option>
                <option value="SSD">SSD (croissant)</option>
                <option value="SSD-desc">SSD (décroissant)</option>
            </select>
        `;
        
        // Ajouter les filtres au conteneur
        filterContainer.appendChild(methodFilter);
        filterContainer.appendChild(paramFilter);
        filterContainer.appendChild(sortingOptions);
        
        // Insérer le conteneur de filtres avant le tableau
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) {
            tableContainer.parentNode.insertBefore(filterContainer, tableContainer);
        }
        
        // Ajouter les écouteurs d'événements
        document.getElementById('param-filter').addEventListener('change', function() {
            const paramRange = document.getElementById('param-range');
            if (this.value !== 'all') {
                paramRange.style.display = 'flex';
            } else {
                paramRange.style.display = 'none';
            }
        });
        
        document.getElementById('apply-filter').addEventListener('click', applyFilters);
        document.getElementById('method-filter').addEventListener('change', applyFilters);
        document.getElementById('sort-by').addEventListener('change', applyFilters);
    }
}

// Mettre à jour les filtres avec les données actuelles
function updateFilters() {
    initializeFiltersAndSorting();
    
    // Mettre à jour les plages de valeurs pour les filtres de paramètres
    if (allResults.length > 0) {
        const paramRanges = {
            J0: { min: Infinity, max: -Infinity },
            Jph: { min: Infinity, max: -Infinity },
            Rs: { min: Infinity, max: -Infinity },
            Rsh: { min: Infinity, max: -Infinity },
            n: { min: Infinity, max: -Infinity },
            SSD: { min: Infinity, max: -Infinity }
        };
        
        // Calculer les plages pour chaque paramètre
        allResults.forEach(result => {
            for (const [methodKey, methodParams] of Object.entries(result.methods)) {
                for (const [paramKey, paramValue] of Object.entries(methodParams)) {
                    if (paramRanges[paramKey]) {
                        const value = parseFloat(paramValue);
                        if (!isNaN(value)) {
                            paramRanges[paramKey].min = Math.min(paramRanges[paramKey].min, value);
                            paramRanges[paramKey].max = Math.max(paramRanges[paramKey].max, value);
                        }
                    }
                }
            }
        });
        
        // Mettre à jour les placeholders des champs de filtre
        const paramFilter = document.getElementById('param-filter');
        paramFilter.addEventListener('change', function() {
            const paramKey = this.value;
            const minInput = document.getElementById('param-min');
            const maxInput = document.getElementById('param-max');
            
            if (paramKey !== 'all' && paramRanges[paramKey]) {
                minInput.placeholder = paramRanges[paramKey].min.toExponential(2);
                maxInput.placeholder = paramRanges[paramKey].max.toExponential(2);
            } else {
                minInput.placeholder = 'Min';
                maxInput.placeholder = 'Max';
            }
        });
    }
}

// Appliquer les filtres et tris
function applyFilters() {
    const methodFilter = document.getElementById('method-filter').value;
    const paramFilter = document.getElementById('param-filter').value;
    const paramMin = document.getElementById('param-min').value;
    const paramMax = document.getElementById('param-max').value;
    const sortBy = document.getElementById('sort-by').value;
    
    // Filtrer les lignes du tableau
    const tableRows = document.querySelectorAll('#comparison-table tbody tr');
    
    tableRows.forEach(row => {
        const paramName = row.cells[0].textContent;
        let showRow = true;
        
        // Filtre par paramètre
        if (paramFilter !== 'all' && paramName !== paramFilter) {
            showRow = false;
        }
        
        // Filtre par méthode et plage de valeurs
        if (showRow && methodFilter !== 'all') {
            const methodCell = row.querySelector(`.${methodFilter}-${paramName}`);
            if (methodCell) {
                const value = parseFloat(methodCell.textContent);
                
                // Vérifier si la valeur est dans la plage spécifiée
                if (paramMin !== '' && value < parseFloat(paramMin)) {
                    showRow = false;
                }
                if (paramMax !== '' && value > parseFloat(paramMax)) {
                    showRow = false;
                }
            }
        }
        
        // Appliquer la visibilité
        row.style.display = showRow ? '' : 'none';
    });
    
    // Appliquer le tri
    if (sortBy !== 'none' && allResults.length > 0) {
        // Tri par nom de fichier
        if (sortBy === 'filename') {
            allResults.sort((a, b) => a.filename.localeCompare(b.filename));
        }
        // Tri par SSD
        else if (sortBy === 'SSD' || sortBy === 'SSD-desc') {
            allResults.sort((a, b) => {
                const methodA = a.methods.mlp || a.methods.rand || a.methods.cnn || a.methods.gen;
                const methodB = b.methods.mlp || b.methods.rand || b.methods.cnn || b.methods.gen;
                
                if (!methodA || !methodB || !methodA.SSD || !methodB.SSD) return 0;
                
                return sortBy === 'SSD' 
                    ? methodA.SSD - methodB.SSD 
                    : methodB.SSD - methodA.SSD;
            });
        }
        
        // Mettre à jour l'affichage après le tri
        updateComparisonTable(allResults[0]);
        createBoxplots();
    }
}

// Initialiser la comparaison directe de fichiers
function initializeFileComparison() {
    const compareBtn = document.getElementById('compare-btn');
    const fileSelect1 = document.getElementById('file-select-1');
    const fileSelect2 = document.getElementById('file-select-2');
    
    if (compareBtn && fileSelect1 && fileSelect2) {
        // Mettre à jour les options des sélecteurs de fichiers
        updateFileSelectors();
        
        // Ajouter l'écouteur d'événement pour le bouton de comparaison
        compareBtn.addEventListener('click', compareFiles);
    }
}

// Mettre à jour les sélecteurs de fichiers
function updateFileSelectors() {
    const fileSelect1 = document.getElementById('file-select-1');
    const fileSelect2 = document.getElementById('file-select-2');
    
    if (fileSelect1 && fileSelect2 && allResults.length > 0) {
        // Vider les sélecteurs
        fileSelect1.innerHTML = '';
        fileSelect2.innerHTML = '';
        
        // Ajouter les options pour chaque fichier
        allResults.forEach((result, index) => {
            const option1 = document.createElement('option');
            option1.value = index;
            option1.textContent = result.filename;
            fileSelect1.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = index;
            option2.textContent = result.filename;
            fileSelect2.appendChild(option2);
        });
        
        // Sélectionner des fichiers différents par défaut
        if (allResults.length > 1) {
            fileSelect2.selectedIndex = 1;
        }
    }
}

// Comparer deux fichiers
function compareFiles() {
    const fileSelect1 = document.getElementById('file-select-1');
    const fileSelect2 = document.getElementById('file-select-2');
    const comparisonBar = document.getElementById('comparison-bar');
    
    if (fileSelect1 && fileSelect2 && comparisonBar) {
        const index1 = parseInt(fileSelect1.value);
        const index2 = parseInt(fileSelect2.value);
        
        if (isNaN(index1) || isNaN(index2) || index1 === index2) {
            alert('Veuillez sélectionner deux fichiers différents pour la comparaison.');
            return;
        }
        
        const file1 = allResults[index1];
        const file2 = allResults[index2];
        
        // Créer un graphique de comparaison
        comparisonBar.innerHTML = '<canvas id="comparison-chart"></canvas>';
        
        const ctx = document.getElementById('comparison-chart').getContext('2d');
        
        // Préparer les données pour le graphique
        const labels = ['J0', 'Jph', 'Rs', 'Rsh', 'n', 'SSD'];
        const datasets = [];
        
        // Ajouter les données pour chaque méthode
        for (const methodKey of ['rand', 'mlp', 'cnn', 'gen']) {
            if (file1.methods[methodKey] && file2.methods[methodKey]) {
                const data1 = [];
                const data2 = [];
                
                for (const paramKey of labels) {
                    if (file1.methods[methodKey][paramKey] !== undefined) {
                        data1.push(parseFloat(file1.methods[methodKey][paramKey]));
                    } else {
                        data1.push(null);
                    }
                    
                    if (file2.methods[methodKey][paramKey] !== undefined) {
                        data2.push(parseFloat(file2.methods[methodKey][paramKey]));
                    } else {
                        data2.push(null);
                    }
                }
                
                datasets.push({
                    label: `${methodToName(methodKey)} - ${file1.filename}`,
                    data: data1,
                    backgroundColor: getMethodColor(methodKey, 0.7),
                    borderColor: getMethodColor(methodKey, 1),
                    borderWidth: 1
                });
                
                datasets.push({
                    label: `${methodToName(methodKey)} - ${file2.filename}`,
                    data: data2,
                    backgroundColor: getMethodColor(methodKey, 0.4),
                    borderColor: getMethodColor(methodKey, 0.8),
                    borderWidth: 1,
                    borderDash: [5, 5]
                });
            }
        }
        
        // Créer le graphique
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        type: 'logarithmic'
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Comparaison entre ${file1.filename} et ${file2.filename}`
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                if (value === null) return 'Pas de données';
                                return `${context.dataset.label}: ${formatNumber(value)}`;
                            }
                        }
                    }
                }
            }
        });
        
        // Stocker le graphique
        charts['comparison'] = chart;
    }
}

// Obtenir la couleur pour une méthode donnée
function getMethodColor(methodKey, alpha = 1) {
    const colors = {
        rand: `rgba(255, 99, 132, ${alpha})`,    // Rouge
        mlp: `rgba(54, 162, 235, ${alpha})`,     // Bleu
        cnn: `rgba(255, 206, 86, ${alpha})`,     // Jaune
        gen: `rgba(75, 192, 192, ${alpha})`      // Vert
    };
    
    return colors[methodKey] || `rgba(128, 128, 128, ${alpha})`;
}

// Générer un rapport PDF
function generatePDF() {
    // Vérifier si jsPDF est disponible
    if (typeof jspdf === 'undefined') {
        alert('La bibliothèque jsPDF n\'est pas chargée. Impossible de générer le PDF.');
        return;
    }
    
    // Créer un nouveau document PDF
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    // Titre du document
    doc.setFontSize(18);
    doc.text('Rapport d\'analyse de courbes I-V', 105, 20, { align: 'center' });
    
    // Date du rapport
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    
    // Ajouter les informations sur le fichier
    doc.setFontSize(14);
    doc.text('Informations sur le fichier', 20, 40);
    doc.setFontSize(12);
    doc.text(`Nom du fichier: ${currentFileName}`, 20, 50);
    
    // Ajouter le tableau de comparaison
    doc.setFontSize(14);
    doc.text('Comparaison des paramètres', 20, 70);
    
    // Capturer le tableau
    html2canvas(document.getElementById('comparison-table')).then(canvas => {
        // Ajouter l'image du tableau au PDF
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 20, 80, 170, 60);
        
        // Ajouter le graphique combiné
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Visualisation des courbes', 105, 20, { align: 'center' });
        
        // Capturer l'image du graphique
        const graphImage = document.querySelector("#graph-zone img");
        if (graphImage) {
            const graphSrc = graphImage.src;
            doc.addImage(graphSrc, 'PNG', 20, 30, 170, 100);
        }
        
        // Ajouter les boxplots si disponibles
        if (allResults.length > 1) {
            doc.addPage();
            doc.setFontSize(14);
            doc.text('Distribution des paramètres', 105, 20, { align: 'center' });
            
            // Capturer les boxplots
            html2canvas(document.querySelector('.boxplot-container')).then(boxplotCanvas => {
                const boxplotImgData = boxplotCanvas.toDataURL('image/png');
                doc.addImage(boxplotImgData, 'PNG', 20, 30, 170, 200);
                
                // Enregistrer le PDF
                doc.save(`rapport_${currentFileName.replace('.csv', '')}.pdf`);
            });
        } else {
            // Enregistrer le PDF sans les boxplots
            doc.save(`rapport_${currentFileName.replace('.csv', '')}.pdf`);
        }
    });
}

// Initialiser les écouteurs d'événements pour les boutons de détails
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les filtres et tris
    initializeFiltersAndSorting();
    
    // Initialiser la comparaison de fichiers
    initializeFileComparison();
    
    // Écouteurs pour les boutons de détails
    const detailsButtons = document.querySelectorAll('.details-btn');
    detailsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            openDetailsModal(method);
        });
    });
    
    // Écouteur pour fermer la modal
    document.getElementById('modal-close').addEventListener('click', function() {
        document.getElementById('details-modal').classList.add('hidden');
    });
    
    // Écouteur pour le bouton d'export PDF
    const pdfButton = document.getElementById('generate-pdf-btn');
    if (pdfButton) {
        pdfButton.addEventListener('click', generatePDF);
    }
    
    // Écouteur pour le bouton d'export CSV
    const csvButton = document.getElementById('export-csv-btn');
    if (csvButton) {
        csvButton.addEventListener('click', exportCSV);
    }
});

// Fonction pour exporter les données en CSV
function exportCSV() {
    if (allResults.length === 0) {
        alert('Aucune donnée à exporter.');
        return;
    }
    
    // Créer l'en-tête du CSV
    let csvContent = 'Fichier,Méthode,J0,Jph,Rs,Rsh,n,SSD\n';
    
    // Ajouter les données
    allResults.forEach(result => {
        const filename = result.filename;
        
        for (const [methodKey, methodParams] of Object.entries(result.methods)) {
            const methodName = methodToName(methodKey);
            const j0 = methodParams.J0 || '';
            const jph = methodParams.Jph || '';
            const rs = methodParams.Rs || '';
            const rsh = methodParams.Rsh || '';
            const n = methodParams.n || '';
            const ssd = methodParams.SSD || '';
            
            csvContent += `"${filename}","${methodName}",${j0},${jph},${rs},${rsh},${n},${ssd}\n`;
        }
    });
    
    // Créer un blob et un lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Créer un URL pour le blob
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'resultats_analyse.csv');
    link.style.visibility = 'hidden';
    
    // Ajouter le lien au document, cliquer dessus, puis le supprimer
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Fonction pour ouvrir la modal de détails
function openDetailsModal(method) {
    const modal = document.getElementById('details-modal');
    const distributionZone = document.getElementById('distribution-zone');
    const curveImageContainer = document.getElementById('curve-image-container');
    const ssdValue = document.getElementById('ssd-value');
    const title = document.getElementById('modal-title');

    const details = resultDetails[method];

    if (!details || !details.params) {
        console.warn("[WARN] Données manquantes pour la méthode :", method, details);
        distributionZone.innerHTML = "<p>Aucune donnée disponible pour cette méthode.</p>";
        curveImageContainer.innerHTML = "";
        ssdValue.innerHTML = "";
    } else {
        title.textContent = `Détails – ${methodToName(method)}`;
        
        // Afficher les paramètres
        let paramsHTML = '<table class="params-table">';
        paramsHTML += '<tr><th>Paramètre</th><th>Valeur</th></tr>';
        paramsHTML += `<tr><td>J0</td><td>${formatNumber(details.params.J0)}</td></tr>`;
        paramsHTML += `<tr><td>Jph</td><td>${formatNumber(details.params.Jph)}</td></tr>`;
        paramsHTML += `<tr><td>Rs</td><td>${formatNumber(details.params.Rs)}</td></tr>`;
        paramsHTML += `<tr><td>Rsh</td><td>${formatNumber(details.params.Rsh)}</td></tr>`;
        paramsHTML += `<tr><td>n</td><td>${formatNumber(details.params.n)}</td></tr>`;
        paramsHTML += '</table>';
        
        distributionZone.innerHTML = paramsHTML;
        
        // Afficher l'image si disponible
        if (details.image) {
            curveImageContainer.innerHTML = `<img src="data:image/png;base64,${details.image}" alt="Courbe ${method}" style="width:100%; margin-top:15px; border-radius:8px;">`;
        } else {
            curveImageContainer.innerHTML = "";
        }
        
        // Afficher le SSD si disponible
        if (details.ssd !== null && details.ssd !== undefined) {
            ssdValue.innerHTML = `<div class="ssd-display">SSD: <span class="ssd-value">${formatNumber(details.ssd)}</span></div>`;
        } else {
            ssdValue.innerHTML = "";
        }
    }

    modal.classList.remove("hidden");
}
