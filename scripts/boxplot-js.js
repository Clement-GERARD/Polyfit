// Ajouter Chart.js au début du fichier HTML (dans le head)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>

// Fonction pour créer les boîtes à moustaches avec Chart.js
function createBoxplots() {
    // Si il n'y a qu'un seul résultat, on ne peut pas créer de boîtes à moustaches
    if (allResults.length <= 1) {
        updatePlaceholder("#boxplot-zone", "Pas assez de données pour créer des boîtes à moustaches. Veuillez analyser plusieurs fichiers.");
        return;
    }

    // Masquer le placeholder
    document.querySelector("#boxplot-zone .content-placeholder").style.display = "none";

    // Collecter toutes les données par paramètre
    const boxplotData = {
        J0: { rand: [], mlp: [], cnn: [], gen: [] },
        Jph: { rand: [], mlp: [], cnn: [], gen: [] },
        Rs: { rand: [], mlp: [], cnn: [], gen: [] },
        Rsh: { rand: [], mlp: [], cnn: [], gen: [] },
        n: { rand: [], mlp: [], cnn: [], gen: [] },
        SSD: { rand: [], mlp: [], cnn: [], gen: [] } // Ajout du SSD
    };

    // Remplir les données
    allResults.forEach(result => {
        for (const [methodKey, methodParams] of Object.entries(result.methods)) {
            for (const [paramKey, paramValue] of Object.entries(methodParams)) {
                if (boxplotData[paramKey] && boxplotData[paramKey][methodKey]) {
                    boxplotData[paramKey][methodKey].push(parseFloat(paramValue));
                }
            }
        }
    });

    // Définir les couleurs pour chaque méthode
    const methodColors = {
        rand: 'rgba(255, 99, 132, 0.7)',    // Rouge
        mlp: 'rgba(54, 162, 235, 0.7)',     // Bleu
        cnn: 'rgba(255, 206, 86, 0.7)',     // Jaune
        gen: 'rgba(75, 192, 192, 0.7)'      // Vert
    };

    // Créer un canvas pour chaque paramètre
    for (const paramKey of Object.keys(boxplotData)) {
        if (paramKey === 'SSD' && allResults[0]?.methods?.rand?.SSD === undefined) {
            continue; // Sauter SSD s'il n'existe pas dans les données
        }

        const boxplotElement = document.getElementById(`${paramKey}-boxplot`);
        
        if (boxplotElement) {
            // Nettoyer le contenu existant
            boxplotElement.innerHTML = '';
            
            // Créer un canvas pour le graphique
            const canvas = document.createElement('canvas');
            canvas.id = `${paramKey}-chart`;
            boxplotElement.appendChild(canvas);
            
            // Préparer les données pour Chart.js
            const datasets = [];
            const labels = [];
            
            for (const [methodKey, values] of Object.entries(boxplotData[paramKey])) {
                if (values.length > 0) {
                    // Trier les valeurs pour calculer les statistiques
                    values.sort((a, b) => a - b);
                    
                    const min = values[0];
                    const max = values[values.length - 1];
                    const q1 = calculateQuantile(values, 0.25);
                    const median = calculateQuantile(values, 0.5);
                    const q3 = calculateQuantile(values, 0.75);
                    
                    datasets.push({
                        label: methodToName(methodKey),
                        backgroundColor: methodColors[methodKey],
                        borderColor: methodColors[methodKey].replace('0.7', '1'),
                        borderWidth: 1,
                        data: [{
                            min: min,
                            q1: q1,
                            median: median,
                            q3: q3,
                            max: max,
                            raw: values // Ajouter les valeurs brutes pour les points individuels
                        }],
                    });
                    
                    labels.push(methodToName(methodKey));
                }
            }
            
            // Créer le graphique
            if (datasets.length > 0) {
                new Chart(canvas, {
                    type: 'boxplot',
                    data: {
                        labels: [paramKey], // Titre du paramètre
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: `Distribution du paramètre ${paramKey}`,
                                font: {
                                    size: 16
                                }
                            },
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const item = context.dataset.data[context.dataIndex];
                                        return [
                                            `${context.dataset.label}:`,
                                            `Min: ${item.min.toFixed(4)}`,
                                            `Q1: ${item.q1.toFixed(4)}`,
                                            `Médiane: ${item.median.toFixed(4)}`,
                                            `Q3: ${item.q3.toFixed(4)}`,
                                            `Max: ${item.max.toFixed(4)}`
                                        ];
                                    }
                                }
                            }
                        }
                    }
                });
                
                // Ajouter une légende avec les statistiques
                const statsDiv = document.createElement('div');
                statsDiv.className = 'boxplot-stats';
                statsDiv.innerHTML = `<h4>Statistiques du paramètre ${paramKey}</h4>`;
                
                for (const [methodKey, values] of Object.entries(boxplotData[paramKey])) {
                    if (values.length > 0) {
                        values.sort((a, b) => a - b);
                        const min = values[0].toFixed(4);
                        const max = values[values.length - 1].toFixed(4);
                        const median = calculateQuantile(values, 0.5).toFixed(4);
                        const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(4);
                        
                        statsDiv.innerHTML += `
                            <div class="method-stats" style="color: ${methodColors[methodKey].replace('0.7', '1')}">
                                <strong>${methodToName(methodKey)}:</strong> 
                                Min: ${min}, 
                                Médiane: ${median},
                                Moy: ${avg}, 
                                Max: ${max}
                            </div>
                        `;
                    }
                }
                
                boxplotElement.appendChild(statsDiv);
            } else {
                boxplotElement.innerHTML = `<p>Pas assez de données pour le paramètre ${paramKey}</p>`;
            }
        }
    }
}

// Fonction pour calculer les quantiles (utilisée pour les boîtes à moustaches)
function calculateQuantile(sortedArray, q) {
    if (sortedArray.length === 0) return 0;
    
    const pos = (sortedArray.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    
    if (sortedArray[base + 1] !== undefined) {
        return sortedArray[base] + rest * (sortedArray[base + 1] - sortedArray[base]);
    } else {
        return sortedArray[base];
    }
}

// Mettre à jour la fonction displayResults pour inclure le SSD si disponible
function displayResults(data) {
    // Code existant...
    
    // Méthode MLP
    if (data.params_mlp) {
        const ssdText = data.ssd_mlp ? `<br>SSD: ${data.ssd_mlp.toExponential(4)}` : '';
        updatePlaceholder("#mlp-method", `
            J0: ${data.params_mlp.J0}<br>
            Jph: ${data.params_mlp.Jph}<br>
            Rs: ${data.params_mlp.Rs}<br>
            Rsh: ${data.params_mlp.Rsh}<br>
            n: ${data.params_mlp.n}${ssdText}
        `);
        resultDetails["mlp"] = {
            params: data.params_mlp,
            image: data.curve_image_mlp || null,
            ssd: data.ssd_mlp || null
        };
        
        // Si SSD existe, l'ajouter aux paramètres pour les boxplots
        if (data.ssd_mlp) {
            data.params_mlp.SSD = data.ssd_mlp;
        }
    }

    // Même chose pour les autres méthodes...
    // Méthode CNN
    if (data.params_cnn) {
        const ssdText = data.ssd_cnn ? `<br>SSD: ${data.ssd_cnn.toExponential(4)}` : '';
        updatePlaceholder("#cnn-method", `
            J0: ${data.params_cnn.J0}<br>
            Jph: ${data.params_cnn.Jph}<br>
            Rs: ${data.params_cnn.Rs}<br>
            Rsh: ${data.params_cnn.Rsh}<br>
            n: ${data.params_cnn.n}${ssdText}
        `);
        resultDetails["cnn"] = {
            params: data.params_cnn,
            image: data.curve_image_cnn || null,
            ssd: data.ssd_cnn || null
        };
        
        if (data.ssd_cnn) {
            data.params_cnn.SSD = data.ssd_cnn;
        }
    }

    // Méthode génétique
    if (data.params_genetique) {
        const ssdText = data.ssd_gen ? `<br>SSD: ${data.ssd_gen.toExponential(4)}` : '';
        updatePlaceholder("#genetic-method", `
            J0: ${data.params_genetique.J0}<br>
            Jph: ${data.params_genetique.Jph}<br>
            Rs: ${data.params_genetique.Rs}<br>
            Rsh: ${data.params_genetique.Rsh}<br>
            n: ${data.params_genetique.n}${ssdText}
        `);
        resultDetails["gen"] = {
            params: data.params_genetique,
            image: data.curve_image_gen || null,
            ssd: data.ssd_gen || null
        };
        
        if (data.ssd_gen) {
            data.params_genetique.SSD = data.ssd_gen;
        }
    }

    // Méthode aléatoire
    if (data.params_random) {
        const ssdText = data.ssd_rand ? `<br>SSD: ${data.ssd_rand.toExponential(4)}` : '';
        updatePlaceholder("#random-method", `
            J0: ${data.params_random.J0}<br>
            Jph: ${data.params_random.Jph}<br>
            Rs: ${data.params_random.Rs}<br>
            Rsh: ${data.params_random.Rsh}<br>
            n: ${data.params_random.n}${ssdText}
        `);
        resultDetails["rand"] = {
            params: data.params_random,
            image: data.curve_image_rand || null,
            ssd: data.ssd_rand || null
        };
        
        if (data.ssd_rand) {
            data.params_random.SSD = data.ssd_rand;
        }
    }

    // ... reste du code existant
}

// Mettre à jour la modal pour inclure le SSD
function openDetailsModal(method) {
    const modal = document.getElementById("details-modal");
    const body = document.getElementById("modal-body");
    const title = document.getElementById("modal-title");

    const details = resultDetails[method];

    if (!details || !details.params) {
        console.warn("[WARN] Données manquantes pour la méthode :", method, details);
        body.innerHTML = "<p>Aucune donnée disponible pour cette méthode.</p>";
    } else {
        title.textContent = `Détails – ${methodToName(method)}`;
        
        // Construire le contenu de la modal
        let content = `
            <p><strong>J0 :</strong> ${details.params.J0}</p>
            <p><strong>Jph :</strong> ${details.params.Jph}</p>
            <p><strong>Rs :</strong> ${details.params.Rs}</p>
            <p><strong>Rsh :</strong> ${details.params.Rsh}</p>
            <p><strong>n :</strong> ${details.params.n}</p>
        `;
        
        // Ajouter SSD si disponible
        if (details.ssd !== null && details.ssd !== undefined) {
            content += `<p><strong>SSD :</strong> ${details.ssd.toExponential(4)}</p>`;
        }
        
        // Ajouter l'image si disponible
        if (details.image) {
            content += `<img src="data:image/png;base64,${details.image}" alt="Courbe ${method}" style="width:100%; margin-top:15px; border-radius:8px;">`;
        }
        
        body.innerHTML = content;
    }

    modal.classList.remove("hidden");
}

// Fonctions supplémentaires pour améliorer l'UI

// 1. Fonction pour comparer directement deux fichiers
function createComparisonView() {
    // Créer un nouveau modal pour la comparaison
    const comparisonModal = document.createElement('div');
    comparisonModal.id = 'comparison-modal';
    comparisonModal.className = 'modal hidden';
    
    comparisonModal.innerHTML = `
        <div class="modal-content" style="max-width: 90%; width: 1200px;">
            <span id="comparison-close">&times;</span>
            <h3>Comparaison de fichiers</h3>
            
            <div class="file-selection">
                <div class="file-select">
                    <label>Fichier 1:</label>
                    <select id="file1-select"></select>
                </div>
                <div class="file-select">
                    <label>Fichier 2:</label>
                    <select id="file2-select"></select>
                </div>
            </div>
            
            <div class="comparison-content">
                <div class="comparison-charts">
                    <div class="chart-container">
                        <canvas id="comparison-radar"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="comparison-bar"></canvas>
                    </div>
                </div>
                
                <div class="comparison-table-container">
                    <table id="comparison-detail-table">
                        <thead>
                            <tr>
                                <th>Paramètre</th>
                                <th>Fichier 1</th>
                                <th>Fichier 2</th>
                                <th>Différence (%)</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(comparisonModal);
    
    // Ajouter les gestionnaires d'événements
    document.getElementById('comparison-close').addEventListener('click', () => {
        comparisonModal.classList.add('hidden');
    });
    
    // Ajouter un bouton pour ouvrir la modal de comparaison
    const compareButton = document.createElement('button');
    compareButton.id = 'compare-files-btn';
    compareButton.className = 'action-button';
    compareButton.textContent = '🔍 Comparer des fichiers';
    compareButton.addEventListener('click', openComparisonModal);
    
    document.querySelector('#upload-section .upload-controls').appendChild(compareButton);
    
    // Styles supplémentaires pour la modal de comparaison
    const style = document.createElement('style');
    style.textContent = `
        .comparison-content {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .comparison-charts {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: space-between;
        }
        
        .chart-container {
            flex: 1;
            min-width: 45%;
            height: 300px;
            background: #f9f9f9;
            border-radius: 8px;
            padding: 10px;
        }
        
        .file-selection {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            gap: 20px;
        }
        
        .file-select {
            flex: 1;
        }
        
        .file-select select {
            width: 100%;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        
        .comparison-table-container {
            margin-top: 20px;
            overflow-x: auto;
        }
        
        #comparison-detail-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        #comparison-detail-table th, 
        #comparison-detail-table td {
            padding: 8px;
            text-align: center;
            border: 1px solid #ddd;
        }
        
        #comparison-detail-table th {
            background: #f0f4f8;
        }
        
        .action-button {
            padding: 0.6rem 1.2rem;
            background: #0077cc;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.2s ease;
        }
        
        .action-button:hover {
            background: #005fa3;
        }
        
        .positive-diff {
            color: green;
        }
        
        .negative-diff {
            color: red;
        }
    `;
    
    document.head.appendChild(style);
}

// Fonction pour ouvrir la modal de comparaison
function openComparisonModal() {
    if (allResults.length < 2) {
        alert("Vous devez avoir au moins deux fichiers analysés pour effectuer une comparaison.");
        return;
    }
    
    const modal = document.getElementById('comparison-modal');
    const fileSelect1 = document.getElementById('file1-select');
    const fileSelect2 = document.getElementById('file2-select');
    
    // Vider et remplir les sélecteurs de fichiers
    fileSelect1.innerHTML = '';
    fileSelect2.innerHTML = '';
    
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
    
    // Sélectionner par défaut le premier et le deuxième fichier
    fileSelect1.value = 0;
    fileSelect2.value = Math.min(1, allResults.length - 1);
    
    // Afficher la comparaison initiale
    updateComparisonView();
    
    // Ajouter des événements pour mettre à jour la vue lorsque les sélections changent
    fileSelect1.addEventListener('change', updateComparisonView);
    fileSelect2.addEventListener('change', updateComparisonView);
    
    // Afficher la modal
    modal.classList.remove('hidden');
}

// Fonction pour mettre à jour la vue de comparaison
function updateComparisonView() {
    const fileIndex1 = parseInt(document.getElementById('file1-select').value);
    const fileIndex2 = parseInt(document.getElementById('file2-select').value);
    
    const file1 = allResults[fileIndex1];
    const file2 = allResults[fileIndex2];
    
    // Mettre à jour le tableau de comparaison
    updateComparisonTable(file1, file2);
    
    // Mettre à jour les graphiques
    updateComparisonCharts(file1, file2);
}

// Fonction pour mettre à jour le tableau de comparaison
function updateComparisonTable(file1, file2) {
    const tableBody = document.querySelector('#comparison-detail-table tbody');
    tableBody.innerHTML = '';
    
    // Liste des paramètres à comparer
    const params = ['J0', 'Jph', 'Rs', 'Rsh', 'n'];
    const methods = ['mlp', 'cnn', 'gen', 'rand'];
    
    // Créer une ligne pour chaque méthode et paramètre
    methods.forEach(method => {
        // Vérifier si les deux fichiers ont cette méthode
        if (file1.methods[method] && file2.methods[method]) {
            // Ajouter un en-tête pour la méthode
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `<td colspan="4" style="background-color: #e0e0e0; font-weight: bold;">${methodToName(method)}</td>`;
            tableBody.appendChild(headerRow);
            
            // Ajouter une ligne pour chaque paramètre
            params.forEach(param => {
                const val1 = parseFloat(file1.methods[method][param]);
                const val2 = parseFloat(file2.methods[method][param]);
                
                // Calculer la différence en pourcentage
                const diffPercent = val1 !== 0 ? ((val2 - val1) / Math.abs(val1)) * 100 : 0;
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${param}</td>
                    <td>${val1.toExponential(4)}</td>
                    <td>${val2.toExponential(4)}</td>
                    <td class="${diffPercent > 0 ? 'positive-diff' : 'negative-diff'}">${diffPercent.toFixed(2)}%</td>
                `;
                tableBody.appendChild(row);
            });
            
            // Ajouter SSD si disponible
            if (file1.methods[method].SSD && file2.methods[method].SSD) {
                const ssd1 = parseFloat(file1.methods[method].SSD);
                const ssd2 = parseFloat(file2.methods[method].SSD);
                const ssdDiffPercent = ssd1 !== 0 ? ((ssd2 - ssd1) / Math.abs(ssd1)) * 100 : 0;
                
                const ssdRow = document.createElement('tr');
                ssdRow.innerHTML = `
                    <td>SSD</td>
                    <td>${ssd1.toExponential(4)}</td>
                    <td>${ssd2.toExponential(4)}</td>
                    <td class="${ssdDiffPercent > 0 ? 'positive-diff' : 'negative-diff'}">${ssdDiffPercent.toFixed(2)}%</td>
                `;
                tableBody.appendChild(ssdRow);
            }
        }
    });
}

// Fonction pour mettre à jour les graphiques de comparaison
function updateComparisonCharts(file1, file2) {
    // Supprimer les graphiques existants s'ils existent
    destroyChart('comparison-radar');
    destroyChart('comparison-bar');
    
    // Créer le graphique radar
    createComparisonRadarChart(file1, file2);
    
    // Créer le graphique à barres
    createComparisonBarChart(file1, file2);
}

// Fonction pour détruire un graphique existant
function destroyChart(chartId) {
    const chartInstance = Chart.getChart(chartId);
    if (chartInstance) {
        chartInstance.destroy();
    }
}

// Fonction pour créer un graphique radar de comparaison
function createComparisonRadarChart(file1, file2) {
    const ctx = document.getElementById('comparison-radar').getContext('2d');
    
    // Extraire les paramètres du MLP pour la démonstration (vous pouvez modifier pour comparer d'autres méthodes)
    const method = 'mlp'; // ou 'cnn', 'gen', 'rand'
    
    if (!file1.methods[method] || !file2.methods[method]) {
        document.getElementById('comparison-radar').parentElement.innerHTML = 
            `<p>Les données MLP ne sont pas disponibles pour les deux fichiers.</p>`;
        return;
    }
    
    const labels = ['J0', 'Jph', 'Rs', 'Rsh', 'n'];
    
    // Normaliser les valeurs pour le graphique radar (entre 0 et 1)
    const file1Values = labels.map(param => {
        const val = Math.log10(Math.abs(parseFloat(file1.methods[method][param])));
        return val;
    });
    
    const file2Values = labels.map(param => {
        const val = Math.log10(Math.abs(parseFloat(file2.methods[method][param])));
        return val;
    });
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `${file1.filename} (log10)`,
                    data: file1Values,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
                },
                {
                    label: `${file2.filename} (log10)`,
                    data: file2Values,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
                }
            ]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: `Comparaison des paramètres ${methodToName(method)} (échelle logarithmique)`,
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const originalValue = Math.pow(10, value);
                            return `${context.dataset.label}: ${originalValue.toExponential(4)}`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: Math.min(...file1Values.concat(file2Values)) - 1,
                    suggestedMax: Math.max(...file1Values.concat(file2Values)) + 1
                }
            }
        }
    });
}

// Fonction pour créer un graphique à barres de comparaison
function createComparisonBarChart(file1, file2) {
    const ctx = document.getElementById('comparison-bar').getContext('2d');
    
    // Comparer les SSD entre les méthodes si disponibles
    const methods = ['rand', 'mlp', 'cnn', 'gen'];
    const methodLabels = methods.map(methodToName);
    
    const file1SSD = methods.map(method => 
        file1.methods[method]?.SSD ? parseFloat(file1.methods[method].SSD) : null);
    
    const file2SSD = methods.map(method => 
        file2.methods[method]?.SSD ? parseFloat(file2.methods[method].SSD) : null);
    
    // Vérifier si les SSD sont disponibles
    if (file1SSD.every(val => val === null) && file2SSD.every(val => val === null)) {
        document.getElementById('comparison-bar').parentElement.innerHTML = 
            `<p>Les valeurs SSD ne sont pas disponibles pour ces fichiers.</p>`;
        return;
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: methodLabels,
            datasets: [
                {
                    label: file1.filename,
                    data: file1SSD,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: file2.filename,
                    data: file2SSD,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            