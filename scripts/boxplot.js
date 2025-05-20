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
        SSD: { rand: [], mlp: [], cnn: [], gen: [] } // Inclut SSD
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
        // Vérifier si des données existent pour ce paramètre
        let hasData = false;
        for (const methodValues of Object.values(boxplotData[paramKey])) {
            if (methodValues.length > 0) {
                hasData = true;
                break;
            }
        }
        
        if (!hasData) continue; // Passer au paramètre suivant si aucune donnée

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
                        // Configuration pour afficher les points individuels
                        outlierStyle: {
                            backgroundColor: methodColors[methodKey].replace('0.7', '0.5'),
                            borderColor: methodColors[methodKey].replace('0.7', '1')
                        }
                    });
                    
                    labels.push(methodToName(methodKey));
                }
            }
            
            // Créer le graphique
            if (datasets.length > 0) {
                const chart = new Chart(canvas, {
                    type: 'boxplot',
                    data: {
                        labels: [paramKey], // Titre du paramètre
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: `Distribution du paramètre ${paramKey}`,
                                font: {
                                    size: 16
                                },
                                color: isDarkTheme ? '#e0e0e0' : '#333333'
                            },
                            legend: {
                                position: 'top',
                                labels: {
                                    color: isDarkTheme ? '#e0e0e0' : '#333333'
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const item = context.dataset.data[context.dataIndex];
                                        return [
                                            `${context.dataset.label}:`,
                                            `Min: ${formatNumber(item.min)}`,
                                            `Q1: ${formatNumber(item.q1)}`,
                                            `Médiane: ${formatNumber(item.median)}`,
                                            `Q3: ${formatNumber(item.q3)}`,
                                            `Max: ${formatNumber(item.max)}`
                                        ];
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                grid: {
                                    color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                },
                                ticks: {
                                    color: isDarkTheme ? '#e0e0e0' : '#333333',
                                    callback: function(value) {
                                        return formatNumber(value);
                                    }
                                }
                            },
                            x: {
                                grid: {
                                    color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                },
                                ticks: {
                                    color: isDarkTheme ? '#e0e0e0' : '#333333'
                                }
                            }
                        }
                    }
                });
                
                // Stocker l'instance du graphique pour pouvoir la mettre à jour plus tard
                charts[paramKey] = chart;
                
                // Ajouter une légende avec les statistiques
                const statsDiv = document.createElement('div');
                statsDiv.className = 'boxplot-stats';
                statsDiv.innerHTML = `<h4>Statistiques du paramètre ${paramKey}</h4>`;
                
                for (const [methodKey, values] of Object.entries(boxplotData[paramKey])) {
                    if (values.length > 0) {
                        values.sort((a, b) => a - b);
                        const min = formatNumber(values[0]);
                        const max = formatNumber(values[values.length - 1]);
                        const median = formatNumber(calculateQuantile(values, 0.5));
                        const avg = formatNumber(values.reduce((a, b) => a + b, 0) / values.length);
                        
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

// Fonction pour créer un graphique radar comparant les méthodes
function createRadarChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Vider le conteneur
    container.innerHTML = '<canvas id="radar-chart"></canvas>';
    
    const ctx = document.getElementById('radar-chart').getContext('2d');
    
    // Paramètres à comparer (sans SSD qui a une échelle différente)
    const params = ['J0', 'Jph', 'Rs', 'Rsh', 'n'];
    
    // Préparer les données pour chaque méthode
    const datasets = [];
    const methodColors = {
        rand: 'rgba(255, 99, 132, 0.7)',
        mlp: 'rgba(54, 162, 235, 0.7)',
        cnn: 'rgba(255, 206, 86, 0.7)',
        gen: 'rgba(75, 192, 192, 0.7)'
    };
    
    // Normaliser les valeurs pour chaque paramètre
    const normalizedData = {};
    
    // Trouver les min/max pour chaque paramètre
    const paramRanges = {};
    params.forEach(param => {
        paramRanges[param] = { min: Infinity, max: -Infinity };
    });
    
    // Parcourir les résultats pour trouver les min/max
    allResults.forEach(result => {
        for (const [methodKey, methodParams] of Object.entries(result.methods)) {
            for (const param of params) {
                if (methodParams[param] !== undefined) {
                    const value = parseFloat(methodParams[param]);
                    if (!isNaN(value)) {
                        paramRanges[param].min = Math.min(paramRanges[param].min, value);
                        paramRanges[param].max = Math.max(paramRanges[param].max, value);
                    }
                }
            }
        }
    });
    
    // Normaliser les données pour le dernier résultat
    if (allResults.length > 0) {
        const lastResult = allResults[allResults.length - 1];
        
        for (const [methodKey, methodParams] of Object.entries(lastResult.methods)) {
            normalizedData[methodKey] = {};
            
            for (const param of params) {
                if (methodParams[param] !== undefined) {
                    const value = parseFloat(methodParams[param]);
                    const range = paramRanges[param].max - paramRanges[param].min;
                    
                    // Éviter la division par zéro
                    if (range === 0) {
                        normalizedData[methodKey][param] = 0.5; // Valeur arbitraire au milieu
                    } else {
                        // Normaliser entre 0 et 1
                        normalizedData[methodKey][param] = (value - paramRanges[param].min) / range;
                    }
                } else {
                    normalizedData[methodKey][param] = 0;
                }
            }
        }
        
        // Créer les datasets pour le graphique radar
        for (const [methodKey, normalizedParams] of Object.entries(normalizedData)) {
            const data = params.map(param => normalizedParams[param] || 0);
            
            datasets.push({
                label: methodToName(methodKey),
                data: data,
                backgroundColor: methodColors[methodKey].replace('0.7', '0.2'),
                borderColor: methodColors[methodKey].replace('0.7', '1'),
                pointBackgroundColor: methodColors[methodKey].replace('0.7', '1'),
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: methodColors[methodKey].replace('0.7', '1')
            });
        }
        
        // Créer le graphique radar
        const radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: params,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        grid: {
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        pointLabels: {
                            color: isDarkTheme ? '#e0e0e0' : '#333333'
                        },
                        ticks: {
                            backdropColor: 'transparent',
                            color: isDarkTheme ? '#e0e0e0' : '#333333'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparaison des méthodes (valeurs normalisées)',
                        color: isDarkTheme ? '#e0e0e0' : '#333333'
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            color: isDarkTheme ? '#e0e0e0' : '#333333'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const methodKey = context.dataset.label;
                                const paramName = context.label;
                                const normalizedValue = context.raw;
                                
                                // Retrouver la valeur originale
                                const lastResult = allResults[allResults.length - 1];
                                const methodData = lastResult.methods[getMethodKeyFromName(methodKey)];
                                
                                if (methodData && methodData[paramName] !== undefined) {
                                    return `${methodKey} - ${paramName}: ${formatNumber(methodData[paramName])}`;
                                }
                                
                                return `${methodKey} - ${paramName}: ${normalizedValue.toFixed(2)} (normalisé)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Stocker l'instance du graphique
        charts['radar'] = radarChart;
    }
}

// Fonction pour obtenir la clé de méthode à partir du nom affiché
function getMethodKeyFromName(methodName) {
    const methodMap = {
        'Classique': 'rand',
        'MLP': 'mlp',
        'CNN': 'cnn',
        'Génétique': 'gen'
    };
    
    return methodMap[methodName] || '';
}

// Fonction pour créer un graphique de comparaison SSD
function createSSDComparisonChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Vider le conteneur
    container.innerHTML = '<canvas id="ssd-comparison-chart"></canvas>';
    
    const ctx = document.getElementById('ssd-comparison-chart').getContext('2d');
    
    // Préparer les données pour le graphique
    const labels = [];
    const datasets = {
        rand: [],
        mlp: [],
        cnn: [],
        gen: []
    };
    
    // Collecter les valeurs SSD pour chaque fichier et méthode
    allResults.forEach(result => {
        labels.push(result.filename);
        
        for (const [methodKey, methodParams] of Object.entries(result.methods)) {
            if (methodParams.SSD !== undefined) {
                datasets[methodKey].push(parseFloat(methodParams.SSD));
            } else {
                datasets[methodKey].push(null);
            }
        }
    });
    
    // Créer les datasets pour le graphique
    const chartDatasets = [];
    const methodColors = {
        rand: 'rgba(255, 99, 132, 0.7)',
        mlp: 'rgba(54, 162, 235, 0.7)',
        cnn: 'rgba(255, 206, 86, 0.7)',
        gen: 'rgba(75, 192, 192, 0.7)'
    };
    
    for (const [methodKey, values] of Object.entries(datasets)) {
        if (values.some(v => v !== null)) {
            chartDatasets.push({
                label: methodToName(methodKey),
                data: values,
                backgroundColor: methodColors[methodKey],
                borderColor: methodColors[methodKey].replace('0.7', '1'),
                borderWidth: 1
            });
        }
    }
    
    // Créer le graphique
    if (chartDatasets.length > 0) {
        const ssdChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: chartDatasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'logarithmic',
                        title: {
                            display: true,
                            text: 'SSD (échelle logarithmique)',
                            color: isDarkTheme ? '#e0e0e0' : '#333333'
                        },
                        grid: {
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: isDarkTheme ? '#e0e0e0' : '#333333',
                            callback: function(value) {
                                return value.toExponential(1);
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: isDarkTheme ? '#e0e0e0' : '#333333',
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparaison des SSD par méthode',
                        color: isDarkTheme ? '#e0e0e0' : '#333333'
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            color: isDarkTheme ? '#e0e0e0' : '#333333'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                if (value === null) return 'Pas de données';
                                return `${context.dataset.label}: ${value.toExponential(4)}`;
                            }
                        }
                    }
                }
            }
        });
        
        // Stocker l'instance du graphique
        charts['ssd-comparison'] = ssdChart;
    } else {
        container.innerHTML = '<p>Pas de données SSD disponibles</p>';
    }
}
