document.getElementById('display-mode').addEventListener('change', toggleDisplayMode);
document.getElementById('toggle-theme-btn').addEventListener('click', toggleTheme);

const resultDetails = {};  // Stockage des résultats par méthode
const allResults = [];     // Stockage de tous les résultats pour les boîtes à moustaches
let currentFileName = "";  // Nom du fichier en cours de traitement
let charts = {};           // Stockage des instances de graphiques

function calculateBoxplotStats(data) {
    if (!data || data.length === 0) {
        return { min: undefined, q1: undefined, median: undefined, q3: undefined, max: undefined };
    }

    const sortedData = [...data].sort((a, b) => a - b);
    const n = sortedData.length;

    const min = sortedData[0];
    const max = sortedData[n - 1];

    let median;
    if (n % 2 === 0) {
        median = (sortedData[n / 2 - 1] + sortedData[n / 2]) / 2;
    } else {
        median = sortedData[Math.floor(n / 2)];
    }

    // Calculer Q1 et Q3 en utilisant la méthode de la médiane inclusive (courante pour les petits ensembles de données)
    let q1, q3;
    if (n >= 4) {
        // Utilisation de l'interpolation linéaire pour les quartiles, comme le comportement typique du plugin Chart.js boxplot
        const getQuantile = (arr, q) => {
            const index = (arr.length - 1) * q;
            const lower = Math.floor(index);
            const upper = Math.ceil(index);
            const weight = index - lower;
            if (lower === upper) return arr[lower];
            return arr[lower] * (1 - weight) + arr[upper] * weight;
        };

        q1 = getQuantile(sortedData, 0.25);
        q3 = getQuantile(sortedData, 0.75);

    } else if (n === 3) {
        q1 = sortedData[0]; // Plus petite valeur
        q3 = sortedData[2]; // Plus grande valeur
    } else if (n === 2) {
        q1 = sortedData[0];
        q3 = sortedData[1];
    } else if (n === 1) {
        q1 = sortedData[0];
        q3 = sortedData[0];
    } else {
        q1 = undefined;
        q3 = undefined;
    }
    
    return { min, q1, median, q3, max };
}

// Fonction pour les Moustaches
function createAllBoxplots() {
    console.log("allResults:", allResults, "Length:", allResults.length);

    // Vérifier si des résultats sont disponibles
    if (allResults.length === 0) {
        console.log("Arrêt de BoxPlots: Pas de données.");
        return;
    }

    // Utiliser toujours les résultats du premier fichier
    const singleFileResult = allResults[0]; 
    if (!singleFileResult || !singleFileResult.methods) {
        updatePlaceholder("#boxplot-zone", "Structure de données invalide dans allResults[0].");
        console.log("Arrêt de BoxPlots: Structure de données invalide.");
        return;
    }

    const parameters = ['J0', 'Jph', 'Rs', 'Rsh', 'n'];

    parameters.forEach(paramKey => {
        // CORRECTION ICI : Cibler l'ID du canvas réel, pas la div parente
        const canvasId = `${paramKey}-boxplot-canvas`; 
        const boxplotElement = document.getElementById(canvasId);

        if (!boxplotElement || !boxplotElement.getContext) {
            console.error(`Élément canvas '${canvasId}' non trouvé ou non supporté.`);
            // Afficher un message dans la div spécifique si le canvas n'est pas trouvé
            const parentDiv = document.getElementById(`${paramKey}-boxplot`);
            if (parentDiv) {
                parentDiv.innerHTML = `<div class="content-placeholder">Élément canvas '${canvasId}' non trouvé.</div>`;
                parentDiv.querySelector('.content-placeholder').style.display = 'flex';
            }
            return; // Passer au paramètre suivant si le canvas n'existe pas
        }

        // Détruire le graphique existant s'il y en a un
        if (charts[paramKey]) {
            charts[paramKey].destroy();
        }

        const valuesForParam = [];
        const scatterPoints = [];

        // Collecter les données pour le paramètre actuel à partir des 4 méthodes du fichier unique
        for (const [methodKey, methodParams] of Object.entries(singleFileResult.methods)) {
            let value;
            // Gérer le mappage 'nVth' vers 'n'
            if (paramKey === 'n' && methodParams['nVth'] !== undefined) {
                value = parseFloat(methodParams['nVth']);
            } else if (methodParams[paramKey] !== undefined) {
                value = parseFloat(methodParams[paramKey]);
            } else {
                continue; // Ignorer si le paramètre n'est pas trouvé pour cette méthode
            }
            valuesForParam.push(value);

            // Pour les points de dispersion : la coordonnée x sera légèrement décalée autour de 0
            const jitter = (Math.random() - 0.5) * 0.4; // Ajuster 0.4 pour plus/moins d'étalement
            scatterPoints.push({ x: 0 + jitter, y: value, method: methodToName(methodKey) });
        }

        // Préparer les ensembles de données pour Chart.js
        const datasets = [];
        const labels = ['']; // Étiquette unique pour la boîte à moustaches unique

        // Ajouter l'ensemble de données de la boîte à moustaches
        if (valuesForParam.length > 0) {
            datasets.push({
                type: 'boxplot', // Définir explicitement le type pour cet ensemble de données
                label: `Distribution des prédictions`,
                backgroundColor: 'rgba(75, 192, 192, 0.6)', // Couleur pour la boîte à moustaches
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                data: [valuesForParam] // Données pour la boîte à moustaches
            });
        } else {
            // Afficher un message dans la div spécifique si pas assez de données
            const parentDiv = document.getElementById(`${paramKey}-boxplot`);
            if (parentDiv) {
                parentDiv.innerHTML = `<div class="content-placeholder">Pas assez de données pour ${paramKey}.</div>`;
                parentDiv.querySelector('.content-placeholder').style.display = 'flex';
            }
            return; // Passer au paramètre suivant
        }

        // Ajouter l'ensemble de données de dispersion pour les points individuels
        if (scatterPoints.length > 0) {
            datasets.push({
                type: 'scatter', // Définir explicitement le type pour cet ensemble de données
                label: 'Points de données individuels',
                data: scatterPoints,
                backgroundColor: 'rgba(255, 99, 132, 1)', // Couleur pour les points individuels
                borderColor: 'rgba(255, 99, 132, 1)',
                pointRadius: 6, // Taille des points
                pointHoverRadius: 8,
                showLine: false, // Ne pas tracer de lignes entre les points de dispersion
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            // Info-bulle personnalisée pour les points de dispersion pour afficher la méthode et la valeur
                            if (context.dataset.type === 'scatter') {
                                const point = context.raw;
                                return `${point.method}: ${formatNumber(point.y)}`;
                            }
                            return '';
                        }
                    }
                }
            });
        }

        const ctx = boxplotElement.getContext('2d');

        // Créer l'instance du graphique
        charts[paramKey] = new Chart(ctx, {
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Distribution de ${paramKey === 'n' ? 'n / nVth' : paramKey}`,
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        color: '#333'
                    },
                    legend: {
                        display: false, // Masquer la légende car l'objectif principal est la boîte à moustaches + les points
                    },
                    tooltip: {
                        // Rappels d'info-bulle unifiés pour la boîte à moustaches et la dispersion
                        callbacks: {
                            title: function(context) {
                                if (context[0] && context[0].dataset.type === 'boxplot') {
                                    return `Paramètre : ${paramKey === 'n' ? 'n / nVth' : paramKey}`;
                                } else if (context[0] && context[0].dataset.type === 'scatter') {
                                    return `Point de donnée`;
                                }
                                return '';
                            },
                            label: function(context) {
                                if (context.dataset.type === 'boxplot') {
                                    // Calculer les statistiques directement à partir du tableau de valeurs brutes pour la boîte à moustaches
                                    const rawValues = context.dataset.data[context.dataIndex];
                                    const stats = calculateBoxplotStats(rawValues);
                                    
                                    return [
                                        `Min: ${stats.min}`,
                                        `Q1: ${stats.q1}`,
                                        `Médiane: ${stats.median}`,
                                        `Q3: ${stats.q3}`,
                                        `Max: ${stats.max}`
                                    ];
                                } else if (context.dataset.type === 'scatter') {
                                    const point = context.raw;
                                    return `${point.method}: ${formatNumber(point.y)}`;
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: `Valeur de ${paramKey === 'n' ? 'n / nVth' : paramKey}`,
                            font: {
                                size: 14
                            },
                            color: '#555'
                        },
                        ticks: {
                            callback: function(value) {
                                return formatNumber(value);
                            },
                            color: '#666'
                        }
                    },
                    x: {
                        // Masquer les étiquettes et les tics de l'axe X pour une seule boîte à moustaches
                        display: false,
                        ticks: {
                            display: false
                        }
                    }
                }
            }
        });
    });
}

// Fonction pour jouer avec le thème de la page
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme', isDarkTheme);
    
    // Mettre à jour le texte du bouton
    const themeBtn = document.getElementById('toggle-theme-btn');
    themeBtn.textContent = isDarkTheme ? '☀️ Thème clair' : '🌙 Thème sombre';
}

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
        cell.textContent = value;
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
            createAllBoxplots();
            
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
    const result = {
        filename: currentFileName,
        methods: {},
        images : {}
    };

    // Ajouter les résultats de chaque méthode
    if (data.params_mlp) {
        result.methods.mlp = data.params_mlp;
    }

    if (data.params_cnn) {
        result.methods.cnn = data.params_cnn;
    }

    if (data.params_genetique) {
        result.methods.gen = data.params_genetique;
    }

    if (data.params_random) {
        result.methods.rand = data.params_random;
    }

    if (data.curve_image_mlp) {
        result.images.mlp = data.curve_image_mlp;
    }

    if (data.curve_image_cnn) {
        result.images.cnn = data.curve_image_cnn;
    }

    if (data.curve_image_gen) {
        result.images.gen = data.curve_image_gen;
    }

    if (data.curve_image_rand) {
        result.images.rand = data.curve_image_rand;
    }

    if (data.curve_image_all) {
        result.images.all = data.curve_image_all;
    }

    allResults.push(result);
}


function updateComparisonTable(data) {
    // Méthode MLP
    if (data.params_mlp) {
        updateTableCell("mlp", "J0", formatFullNumber(data.params_mlp.J0));
        updateTableCell("mlp", "Jph", formatFullNumber(data.params_mlp.Jph));
        updateTableCell("mlp", "Rs", formatFullNumber(data.params_mlp.Rs));
        updateTableCell("mlp", "Rsh", formatFullNumber(data.params_mlp.Rsh));
        updateTableCell("mlp", "n", formatFullNumber(data.params_mlp.n));
    }

    // Méthode CNN
    if (data.params_cnn) {
        updateTableCell("cnn", "J0", formatFullNumber(data.params_cnn.J0));
        updateTableCell("cnn", "Jph", formatFullNumber(data.params_cnn.Jph));
        updateTableCell("cnn", "Rs", formatFullNumber(data.params_cnn.Rs));
        updateTableCell("cnn", "Rsh", formatFullNumber(data.params_cnn.Rsh));
        updateTableCell("cnn", "n", formatFullNumber(data.params_cnn.n));
    }

    // Méthode génétique
    if (data.params_genetique) {
        updateTableCell("gen", "J0", formatFullNumber(data.params_genetique.J0));
        updateTableCell("gen", "Jph", formatFullNumber(data.params_genetique.Jph));
        updateTableCell("gen", "Rs", formatFullNumber(data.params_genetique.Rs));
        updateTableCell("gen", "Rsh", formatFullNumber(data.params_genetique.Rsh));
        updateTableCell("gen", "n", formatFullNumber(data.params_genetique.n));
    }

    // Méthode aléatoire
    if (data.params_random) {
        updateTableCell("rand", "J0", formatFullNumber(data.params_random.J0));
        updateTableCell("rand", "Jph", formatFullNumber(data.params_random.Jph));
        updateTableCell("rand", "Rs", formatFullNumber(data.params_random.Rs));
        updateTableCell("rand", "Rsh", formatFullNumber(data.params_random.Rsh));
        updateTableCell("rand", "n", formatFullNumber(data.params_random.n));
    }
}

function displayResults(data) {
    // Méthode MLP
    if (data.params_mlp) {
        updatePlaceholder("#mlp-method", `
            J0: ${formatFullNumber(data.params_mlp.J0)}<br>
            Jph: ${formatFullNumber(data.params_mlp.Jph)}<br>
            Rs: ${formatFullNumber(data.params_mlp.Rs)}<br>
            Rsh: ${formatFullNumber(data.params_mlp.Rsh)}<br>
            n: ${formatFullNumber(data.params_mlp.n)}<br>
            SSD: ${formatFullNumber(data.ssd_mlp)}
        `);
        resultDetails["mlp"] = {
            params: data.params_mlp,
            image: data.curve_image_mlp || null,
            ssd: data.ssd_mlp || null,
            error: data.error_bounds_mlp
        };
    }

    // Méthode CNN
    if (data.params_cnn) {
        updatePlaceholder("#cnn-method", `
            J0: ${formatFullNumber(data.params_cnn.J0)}<br>
            Jph: ${formatFullNumber(data.params_cnn.Jph)}<br>
            Rs: ${formatFullNumber(data.params_cnn.Rs)}<br>
            Rsh: ${formatFullNumber(data.params_cnn.Rsh)}<br>
            n: ${formatFullNumber(data.params_cnn.n)}<br>
            SSD: ${formatFullNumber(data.ssd_cnn)}
        `);
        resultDetails["cnn"] = {
            params: data.params_cnn,
            image: data.curve_image_cnn || null,
            ssd: data.ssd_cnn || null,
            error: data.error_bounds_cnn
        };
    }

    // Méthode génétique
    if (data.params_genetique) {
        updatePlaceholder("#genetic-method", `
            J0: ${formatFullNumber(data.params_genetique.J0)}<br>
            Jph: ${formatFullNumber(data.params_genetique.Jph)}<br>
            Rs: ${formatFullNumber(data.params_genetique.Rs)}<br>
            Rsh: ${formatFullNumber(data.params_genetique.Rsh)}<br>
            n: ${formatFullNumber(data.params_genetique.n)}<br>
            SSD: ${formatFullNumber(data.ssd_gen)}
        `);
        resultDetails["gen"] = {
            params: data.params_genetique,
            image: data.curve_image_gen || null,
            ssd: data.ssd_gen || null,
            error: data.error_bounds_genetique
        };
    }

    // Méthode aléatoire
    if (data.params_random) {
        updatePlaceholder("#random-method", `
            J0: ${formatFullNumber(data.params_random.J0)}<br>
            Jph: ${formatFullNumber(data.params_random.Jph)}<br>
            Rs: ${formatFullNumber(data.params_random.Rs)}<br>
            Rsh: ${formatFullNumber(data.params_random.Rsh)}<br>
            n: ${formatFullNumber(data.params_random.n)}<br>
            SSD: ${formatFullNumber(data.ssd_rand)}
        `);
        resultDetails["rand"] = {
            params: data.params_random,
            image: data.curve_image_rand || null,
            ssd: data.ssd_rand || null,
            error: data.error_bounds_random
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

// Nouvelle fonction pour formater les nombres avec une précision complète
function formatFullNumber(num) {
    if (typeof num === 'number') {
        return num.toPrecision(8); // Utilise 8 chiffres significatifs pour une meilleure précision
    }
    return num;
}

function calculateAndDisplaySSD(data) {
    // Si les SSD ne sont pas fournis par l'API, nous pourrions les calculer
    // Note: Cette fonction simule des valeurs SSD pour l'exemple
    // Dans un cas réel, vous calculerez ces valeurs à partir des données mesurées vs prédites
    
    const ssdContainer = document.getElementById('ssd-comparison');
    if (!ssdContainer) {
        console.warn("Conteneur SSD non trouvé");
        return;
    }
    
    // Simulation de valeurs SSD (à remplacer par un calcul réel)
    const ssdValues = {
        rand: Math.random() * 0.01,
        mlp: Math.random() * 0.005,
        cnn: Math.random() * 0.002,
        gen: Math.random() * 0.001
    };
    
    // Mise à jour des objets de résultats avec les SSD calculés
    for (const [method, ssd] of Object.entries(ssdValues)) {
        if (resultDetails[method]) {
            resultDetails[method].ssd = ssd;
        }
    }
    
    displaySSD(ssdValues);
}

function displaySSD(ssdValues) {
    const ssdContainer = document.getElementById('ssd-comparison');
    if (!ssdContainer) {
        console.warn("Conteneur SSD non trouvé");
        return;
    }
    
    let ssdHTML = '<h3>Comparaison des SSD (Sum of Squared Differences)</h3>';
    ssdHTML += '<div class="ssd-bars">';
    
    const methods = Object.keys(ssdValues);
    const maxSSD = Math.max(...Object.values(ssdValues));
    
    for (const method of methods) {
        const ssd = ssdValues[method];
        const percentage = (ssd / maxSSD) * 100;
        
        ssdHTML += `
            <div class="ssd-bar-container">
                <div class="ssd-label">${methodToName(method)}</div>
                <div class="ssd-bar-wrapper">
                    <div class="ssd-bar" style="width: ${percentage}%;" title="SSD: ${formatFullNumber(ssd)}"></div>
                </div>
                <div class="ssd-value">${formatFullNumber(ssd)}</div>
            </div>
        `;
    }
    
    ssdHTML += '</div>';
    
    ssdContainer.innerHTML = ssdHTML;
    ssdContainer.classList.remove('hidden');
}

function methodToName(methodKey) {
    switch(methodKey) {
        case 'rand': return 'Classique';
        case 'mlp': return 'MLP';
        case 'cnn': return 'CNN';
        case 'gen': return 'Génétique';
        default: return methodKey;
    }
}

function openDetailsModal(method) {
    const modal = document.getElementById('details-modal');
    const distributionZone = document.getElementById('distribution-zone');
    const curveImageContainer = document.getElementById('curve-image-container');
    const ssdValueContainer = document.getElementById('ssd-value'); // Renommé pour clarté
    const title = document.getElementById('modal-title');

    const details = resultDetails[method];
    console.log("Résultat avant modale :", details);

    if (!details || !details.params) {
        console.warn("[WARN] Données manquantes pour la méthode :", method, details);
        distributionZone.innerHTML = "<p>Aucune donnée disponible pour cette méthode.</p>";
        curveImageContainer.innerHTML = "";
        ssdValueContainer.innerHTML = "";
    } else {
        title.textContent = `Détails – ${methodToName(method)}`;
        
        // --- RESTORED PARAMETERS TABLE ---
        let paramsHTML = '<table class="params-table">';
        paramsHTML += '<tr><th>Paramètre</th><th>Valeur</th></tr>';
        paramsHTML += `<tr><td>J0</td><td>${formatFullNumber(details.params.J0)}</td></tr>`;
        paramsHTML += `<tr><td>Jph</td><td>${formatFullNumber(details.params.Jph)}</td></tr>`;
        paramsHTML += `<tr><td>Rs</td><td>${formatFullNumber(details.params.Rs)}</td></tr>`;
        paramsHTML += `<tr><td>Rsh</td><td>${formatFullNumber(details.params.Rsh)}</td></tr>`;
        paramsHTML += `<tr><td>n</td><td>${formatFullNumber(details.params.n)}</td></tr>`;
        paramsHTML += '</table>';
        
        // Append the table to the distributionZone first
        distributionZone.innerHTML = paramsHTML;

        // --- ERROR BAR CHARTS ---
        if (details.error) {
            const chartContainer = document.createElement('div');
            chartContainer.style.display = 'grid';
            chartContainer.style.gap = '10px';
            distributionZone.appendChild(chartContainer);

            ['J0', 'Rs', 'Rsh', 'n'].forEach(param => {
                const canvas = document.createElement('canvas');
                canvas.id = `error-bar-chart-${param.toLowerCase()}`;
                canvas.style.maxHeight = '200px'; // Adjust as needed
                chartContainer.appendChild(canvas);
                plotErrorBarsIndividual(method, details.error, param, canvas.getContext('2d'));
            });
        } else {
            // Remove any existing chart container if no error data
            const existingChartContainer = distributionZone.querySelector('div[style*="grid-template-columns"]');
            if (existingChartContainer) {
                existingChartContainer.remove();
            }
            const chartPlaceholder = document.createElement('p');
            chartPlaceholder.textContent = "Graphiques d'erreurs non disponibles.";
            distributionZone.appendChild(chartPlaceholder); // Append after params table
        }
                
        // --- ISOLATED CURVE IMAGE ---
        if (details.image) {
            curveImageContainer.innerHTML = `<img src="data:image/png;base64,${details.image}" alt="Courbe ${method}" style="width:100%; margin-top:15px; border-radius:8px;">`;
        } else {
            curveImageContainer.innerHTML = "";
        }
        
        // --- SSD VALUE ---
        if (details.ssd !== null && details.ssd !== undefined) {
            ssdValueContainer.innerHTML = `<div class="ssd-display">SSD: <span class="ssd-value">${formatFullNumber(details.ssd)}</span></div>`;
        } else {
            ssdValueContainer.innerHTML = "";
        }
    }

    modal.classList.remove("hidden");
}

function openDetailsModal(method) {
    const modal = document.getElementById('details-modal');
    const distributionZone = document.getElementById('distribution-zone');
    const curveImageContainer = document.getElementById('curve-image-container');
    const ssdValue = document.getElementById('ssd-value');
    const title = document.getElementById('modal-title');

    // Rechercher les détails correspondants dans allResults
    const details = allResults.find(result => result.methods[method] !== undefined);

    console.log("Résultat avant modale :", details);

    if (!details || !details.methods || !details.methods[method]) {
        console.warn("[WARN] Données manquantes pour la méthode :", method, details);
        distributionZone.innerHTML = "<p>Aucune donnée de paramètres disponible pour cette méthode.</p>";
        curveImageContainer.innerHTML = "";
        ssdValue.innerHTML = "";
        // On ne touche pas à distributionZone car on va y mettre les graphiques
    } else {
        title.textContent = `Détails – ${methodToName(method)}`;

        const params = details.methods[method];
        const errors = details.errors ? details.errors[method] : null;

        distributionZone.innerHTML = ''; // Effacer le contenu précédent de la zone de distribution

        if (errors) {
            // Créer un conteneur flex pour aligner les graphiques horizontalement
            const chartContainer = document.createElement('div');
            chartContainer.style.display = 'flex';
            chartContainer.style.flexWrap = 'wrap'; // Permettre le retour à la ligne si nécessaire
            distributionZone.appendChild(chartContainer);

            for (const paramName in errors) {
                if (errors.hasOwnProperty(paramName) && errors[paramName].min !== undefined && errors[paramName].max !== undefined && errors[paramName].central !== undefined) {
                    const canvas = document.createElement('canvas');
                    canvas.id = `error-bar-canvas-${method}-${paramName}`;
                    canvas.width = 200;
                    canvas.height = 150;
                    canvas.style.marginRight = '10px';
                    chartContainer.appendChild(canvas);
                    const ctx = canvas.getContext('2d');
                    plotErrorBarChart(ctx, paramName, errors[paramName].min, errors[paramName].max, errors[paramName].central);
                }
            }
        } else {
            distributionZone.innerHTML = "<p>Barres d'erreur non disponibles pour cette méthode.</p>";
        }

        // Afficher l'image si disponible
        const imageName = `curve_image_${method.replace('gen', 'gen')}`; // Ajustement pour 'gen'
        if (details.images && details.images[imageName]) {
            curveImageContainer.innerHTML = `<img src="data:image/png;base64,${details.images[imageName]}" alt="Courbe ${methodToName(method)}" style="width:100%; margin-top:15px; border-radius:8px;">`;
        } else {
            curveImageContainer.innerHTML = "";
        }

        // Afficher le SSD si disponible (rechercher la clé ssd correspondante)
        const ssdKey = `ssd_${method.replace('gen', 'gen')}`; // Ajustement pour 'gen'
        if (details.hasOwnProperty(ssdKey) && details[ssdKey] !== null && details[ssdKey] !== undefined) {
            ssdValue.innerHTML = `<div class="ssd-display">SSD: <span class="ssd-value">${details[ssdKey]}</span></div>`;
        } else {
            ssdValue.innerHTML = "";
        }
    }

    modal.classList.remove("hidden");
}

function plotErrorBarsIndividual(method, statsData, paramToPlot, ctx) {

    console.log(`Plotting ${paramToPlot} for ${method}`, statsData);

    if (!statsData || !statsData[paramToPlot]) return;



    const labels = [paramToPlot];



    const means = { [paramToPlot]: statsData[paramToPlot].central };

    const mins = { [paramToPlot]: statsData[paramToPlot].min };

    const maxs = { [paramToPlot]: statsData[paramToPlot].max };

    // Access the predicted value from resultDetails

    const predictedValue = resultDetails[method].params[paramToPlot];



    // Prepare data for vertical points with error bars

    const dataPoints = labels.map(param => ({

        x: param, // Parameter name on X-axis

        y: means[param], // Mean value on Y-axis

        yMin: mins[param], // Min value for error bar

        yMax: maxs[param], // Max value for error bar

        predicted: predictedValue // Add predicted value

    }));



    const errorBarData = {

        labels: labels,

        datasets: [{

            label: `${methodToName(method)} – ${paramToPlot}`,

            data: dataPoints,

            backgroundColor: 'rgba(54, 162, 235, 0.5)', // Color for the mean point

            borderColor: 'rgb(54, 162, 235)',

            borderWidth: 1,

            pointRadius: 8, // Size of the mean point

            pointBackgroundColor: 'rgb(54, 162, 235)',

            pointBorderColor: 'rgb(54, 162, 235)',

            type: 'scatter', // Use scatter type for the mean point

            showLine: false, // Do not draw lines between points

            errorBarColor: 'rgb(54, 162, 235)', // Custom property for error bar color

            errorBarLineWidth: 2, // Custom property

            errorBarWhiskerWidth: 10 // Custom property

        },

        {

            label: `Prédiction – ${paramToPlot}`,

            data: dataPoints.map(p => ({ x: p.x, y: p.predicted })),

            backgroundColor: 'rgba(255, 99, 132, 0.8)', // Color for the predicted point

            borderColor: 'rgb(255, 99, 132)',

            borderWidth: 1,

            pointRadius: 6,

            pointBackgroundColor: 'rgb(255, 99, 132)',

            pointBorderColor: 'rgb(255, 99, 132)',

            type: 'scatter',

            showLine: false

        }]

    };



    const config = {

        type: 'scatter', // Main chart type is scatter

        data: errorBarData,

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: { display: false },

                tooltip: {

                    enabled: true,

                    callbacks: {

                        label: function(context) {

                            const point = context.raw;

                            if (context.datasetIndex === 0) {

                                return [

                                    `Paramètre: ${point.x}`,

                                    `Moyenne: ${formatFullNumber(point.y)}`,

                                    `Min: ${formatFullNumber(point.yMin)}`,

                                    `Max: ${formatFullNumber(point.yMax)}`

                                ];

                            } else {

                                return [`Prédiction: ${formatFullNumber(point.y)}`];

                            }

                        }

                    }

                }

            },

            scales: {

                x: {

                    type: 'category', // Use category scale for parameter labels

                    labels: labels,

                    title: { display: true, text: 'Paramètre' },

                    grid: {

                        display: false // Hide vertical grid lines

                    },

                    // Center the label on the X-axis

                    ticks: {

                        align: 'center'

                    }

                },

                y: {

                    beginAtZero: false,

                    title: { display: true, text: 'Valeur' },

                    ticks: {

                        callback: function(value) {

                            return formatFullNumber(value); // Use full precision for ticks

                        }

                    },

                    // Adjust the scale to fit the error bars

                    suggestedMin: Math.min(...dataPoints.map(p => p.yMin)),

                    suggestedMax: Math.max(...dataPoints.map(p => p.yMax))

                }

            }

        },

        // Custom plugin to draw error bars if 'chartjs-chart-error-bars' is not used

        plugins: [{

            id: 'errorBarsPlugin',

            afterDatasetsDraw(chart, args, options) {

                const { ctx, chartArea: { left, right, top, bottom, width, height }, scales: { x, y } } = chart;



                chart.data.datasets.forEach((dataset, datasetIndex) => {

                    if (datasetIndex === 0 && dataset.type === 'scatter' && dataset.errorBarColor) {

                        ctx.save();

                        ctx.strokeStyle = dataset.errorBarColor;

                        ctx.lineWidth = dataset.errorBarLineWidth || 1;



                        dataset.data.forEach((point, index) => {

                            const xCoord = x.getPixelForValue(point.x);

                            const yMin = y.getPixelForValue(point.yMin);

                            const yMax = y.getPixelForValue(point.yMax);

                            const whiskerWidth = dataset.errorBarWhiskerWidth / 2 || 5;



                            // Draw vertical line

                            ctx.beginPath();

                            ctx.moveTo(xCoord, yMin);

                            ctx.lineTo(xCoord, yMax);

                            ctx.stroke();



                            // Draw top whisker

                            ctx.beginPath();

                            ctx.moveTo(xCoord - whiskerWidth, yMin);

                            ctx.lineTo(xCoord + whiskerWidth, yMin);

                            ctx.stroke();



                            // Draw bottom whisker

                            ctx.beginPath();

                            ctx.moveTo(xCoord - whiskerWidth, yMax);

                            ctx.lineTo(xCoord + whiskerWidth, yMax);

                            ctx.stroke();

                        });

                        ctx.restore();

                    }

                });

            }

        }]

    };



    new Chart(ctx, config);

}

// Permettre le traitement batch des fichiers
function processBatchFiles(files) {
    if (!files || files.length === 0) return;
    
    let currentIndex = 0;
    
    function processNextFile() {
        if (currentIndex < files.length) {
            const file = files[currentIndex];
            currentFileName = file.name;
            document.getElementById('current-file').textContent = currentFileName + ` (${currentIndex + 1}/${files.length})`;
            
            updateProcessingStatus("processing");
            uploadFile(file).then(() => {
                currentIndex++;
                setTimeout(processNextFile, 1000); // Attendre 1 seconde entre chaque fichier
            });
        }
    }
    
    processNextFile();
}

// Fonction pour exporter les résultats en CSV
function exportResultsToCSV() {
    if (allResults.length === 0) {
        alert("Aucun résultat à exporter.");
        return;
    }
    
    // Créer l'en-tête du CSV
    let csvContent = "Fichier,Méthode,J0,Jph,Rs,Rsh,n,SSD\n";
    
    // Ajouter chaque ligne de données
    allResults.forEach(result => {
        const filename = result.filename;
        
        for (const [methodKey, params] of Object.entries(result.methods)) {
            const methodName = methodToName(methodKey);
            const ssd = resultDetails[methodKey]?.ssd || '';
            
            const line = [
                filename,
                methodName,
                formatFullNumber(params.J0),
                formatFullNumber(params.Jph),
                formatFullNumber(params.Rs),
                formatFullNumber(params.Rsh),
                formatFullNumber(params.n),
                formatFullNumber(ssd)
            ].join(',');
            
            csvContent += line + '\n';
        }
    });
    
    // Créer un blob et un lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "resultats_polyfit.csv");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Fonction pour générer un rapport PDF
function generatePDFReport() {
    alert("Génération du rapport PDF...");
    // Cette fonction serait implémentée avec une bibliothèque comme jsPDF
    // Pour l'instant, c'est juste un placeholder
}

// Fonction pour basculer le thème de couleurs
function toggleColorTheme() {
    document.body.classList.toggle('dark-theme');
    
    // Mettre à jour les graphiques avec le nouveau thème
    for (const chartId in charts) {
        if (charts[chartId]) {
            charts[chartId].update();
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {


    document.getElementById("modal-close").addEventListener("click", () => {
        document.getElementById("details-modal").classList.add("hidden");
    });

    document.querySelectorAll(".details-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const method = btn.getAttribute("data-method");
            openDetailsModal(method);
        });
    });

    // Gestionnaire pour le sélecteur de fichiers
    document.getElementById('file-input').addEventListener('change', (event) => {
        const files = event.target.files;

        if (!batchModeActive && files.length > 1) {
            alert("Erreur : Veuillez activer le mode batch pour sélectionner plusieurs fichiers.");
            // Réinitialiser la valeur de l'input file pour empêcher le traitement
            document.getElementById('file-input').value = '';
            return;
        }

        if (batchModeActive && files.length > 0) {
            document.getElementById('batch-files-container').classList.remove('hidden');
        } else if (!batchModeActive && files.length === 1) {
            handleFiles(event);
        }
    });

    // Ajouter les nouveaux boutons de fonctionnalités
    if (document.getElementById('export-csv-btn')) {
        document.getElementById('export-csv-btn').addEventListener('click', exportResultsToCSV);
    }

    if (document.getElementById('generate-pdf-btn')) {
        document.getElementById('generate-pdf-btn').addEventListener('click', generatePDFReport);
    }

    if (document.getElementById('toggle-theme-btn')) {
        document.getElementById('toggle-theme-btn').addEventListener('click', toggleColorTheme);
    }
});
