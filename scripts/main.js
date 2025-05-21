document.getElementById('file-input').addEventListener('change', handleFiles);
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
                updatePlaceholder("#boxplot-zone", "Pas de données disponibles pour créer des boîtes à moustaches. Veuillez analyser au moins un fichier.");
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
    // Créer un objet résultat avec les données actuelles
    const result = {
        filename: currentFileName,
        methods: {}
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
    }

    // Méthode CNN
    if (data.params_cnn) {
        updateTableCell("cnn", "J0", data.params_cnn.J0);
        updateTableCell("cnn", "Jph", data.params_cnn.Jph);
        updateTableCell("cnn", "Rs", data.params_cnn.Rs);
        updateTableCell("cnn", "Rsh", data.params_cnn.Rsh);
        updateTableCell("cnn", "n", data.params_cnn.n);
    }

    // Méthode génétique
    if (data.params_genetique) {
        updateTableCell("gen", "J0", data.params_genetique.J0);
        updateTableCell("gen", "Jph", data.params_genetique.Jph);
        updateTableCell("gen", "Rs", data.params_genetique.Rs);
        updateTableCell("gen", "Rsh", data.params_genetique.Rsh);
        updateTableCell("gen", "n", data.params_genetique.n);
    }

    // Méthode aléatoire
    if (data.params_random) {
        updateTableCell("rand", "J0", data.params_random.J0);
        updateTableCell("rand", "Jph", data.params_random.Jph);
        updateTableCell("rand", "Rs", data.params_random.Rs);
        updateTableCell("rand", "Rsh", data.params_random.Rsh);
        updateTableCell("rand", "n", data.params_random.n);
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
            n: ${data.params_mlp.n}<br>
            SSD: ${data.ssd_mlp}
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
            n: ${data.params_cnn.n}<br>
            SSD: ${data.ssd_cnn}
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
            n: ${data.params_genetique.n}<br>
            SSD: ${data.ssd_gen}
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
            n: ${data.params_random.n}<br>
            SSD: ${data.ssd_rand}
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
                    <div class="ssd-bar" style="width: ${percentage}%;" title="SSD: ${formatNumber(ssd)}"></div>
                </div>
                <div class="ssd-value">${formatNumber(ssd)}</div>
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
    const ssdValue = document.getElementById('ssd-value');
    const title = document.getElementById('modal-title');

    const details = resultDetails[method];
    console.log("Résultat avant modale :", details);

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
        paramsHTML += `<tr><td>J0</td><td>${details.params.J0}</td></tr>`;
        paramsHTML += `<tr><td>Jph</td><td>${details.params.Jph}</td></tr>`;
        paramsHTML += `<tr><td>Rs</td><td>${details.params.Rs}</td></tr>`;
        paramsHTML += `<tr><td>Rsh</td><td>${details.params.Rsh}</td></tr>`;
        paramsHTML += `<tr><td>n</td><td>${details.params.n}</td></tr>`;
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
            ssdValue.innerHTML = `<div class="ssd-display">SSD: <span class="ssd-value">${details.ssd}</span></div>`;
        } else {
            ssdValue.innerHTML = "";
        }
    }

    modal.classList.remove("hidden");
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
                params.J0,
                params.Jph,
                params.Rs,
                params.Rsh,
                params.n,
                ssd
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
    
    // Ajouter un gestionnaire pour traiter plusieurs fichiers
    document.getElementById('file-input').addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 1) {
            const confirmBatch = confirm(`Vous avez sélectionné ${files.length} fichiers. Voulez-vous les traiter tous en séquence?`);
            
            if (confirmBatch) {
                processBatchFiles(files);
            } else {
                // Sinon, traiter juste le premier fichier comme d'habitude
                handleFiles(event);
            }
        } else {
            // Un seul fichier, comportement normal
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
