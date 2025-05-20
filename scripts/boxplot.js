// Fonction pour créer les boîtes à moustaches avec Chart.js
function createBoxplots(distributionData) {
    // Masquer le placeholder
    document.querySelector("#boxplot-zone .content-placeholder").style.display = "none";

    // Vérifier si nous avons des données
    if (!distributionData || Object.keys(distributionData).length === 0) {
        updatePlaceholder("#boxplot-zone", "Pas de données disponibles pour les boxplots. Veuillez analyser plusieurs fichiers.");
        return;
    }

    // Paramètres à visualiser
    const parameters = ["J0", "Jph", "Rs", "Rsh", "n", "SSD"];
    
    // Méthodes disponibles
    const methods = ["random", "genetique", "mlp", "cnn"];
    
    // Couleurs pour chaque méthode, utilisant les couleurs du thème
    const methodColors = {
        random: getComputedStyle(document.documentElement).getPropertyValue('--method-rand-color') || 'rgba(255, 99, 132, 0.7)',
        genetique: getComputedStyle(document.documentElement).getPropertyValue('--method-gen-color') || 'rgba(75, 192, 192, 0.7)',
        mlp: getComputedStyle(document.documentElement).getPropertyValue('--method-mlp-color') || 'rgba(54, 162, 235, 0.7)',
        cnn: getComputedStyle(document.documentElement).getPropertyValue('--method-cnn-color') || 'rgba(255, 206, 86, 0.7)'
    };

    // Créer un boxplot pour chaque paramètre
    parameters.forEach(param => {
        const boxplotElement = document.getElementById(`${param}-boxplot`);
        if (!boxplotElement) return;
        
        // Nettoyer le contenu existant
        boxplotElement.innerHTML = '';
        
        // Créer un canvas pour le graphique
        const canvas = document.createElement('canvas');
        canvas.id = `${param}-chart`;
        boxplotElement.appendChild(canvas);
        
        // Collecter les données pour ce paramètre
        const paramData = {};
        let hasData = false;
        
        methods.forEach(method => {
            if (distributionData[method] && distributionData[method][param]) {
                paramData[method] = distributionData[method][param].values || [];
                if (paramData[method].length > 0) hasData = true;
            } else {
                paramData[method] = [];
            }
        });
        
        if (!hasData) {
            boxplotElement.innerHTML = `<p>Pas de données disponibles pour le paramètre ${param}</p>`;
            return;
        }
        
        // Préparer les données pour le boxplot
        const boxplotDatasets = [];
        
        // Créer un seul dataset pour le boxplot (une boîte par paramètre)
        const allValues = [];
        methods.forEach(method => {
            allValues.push(...paramData[method]);
        });
        
        if (allValues.length === 0) {
            boxplotElement.innerHTML = `<p>Pas de données disponibles pour le paramètre ${param}</p>`;
            return;
        }
        
        // Trier les valeurs pour calculer les statistiques
        allValues.sort((a, b) => a - b);
        
        const min = allValues[0];
        const max = allValues[allValues.length - 1];
        const q1 = calculateQuantile(allValues, 0.25);
        const median = calculateQuantile(allValues, 0.5);
        const q3 = calculateQuantile(allValues, 0.75);
        
        // Dataset pour la boîte à moustaches
        boxplotDatasets.push({
            label: param,
            backgroundColor: 'rgba(200, 200, 200, 0.5)',
            borderColor: 'rgba(150, 150, 150, 1)',
            borderWidth: 1,
            data: [{
                min: min,
                q1: q1,
                median: median,
                q3: q3,
                max: max
            }]
        });
        
        // Datasets pour les points de chaque méthode
        methods.forEach(method => {
            if (paramData[method].length > 0) {
                boxplotDatasets.push({
                    label: methodToName(method),
                    backgroundColor: methodColors[method],
                    borderColor: methodColors[method].replace(/[^,]+(?=\))/, '1'),
                    borderWidth: 1,
                    pointStyle: getMethodPointStyle(method),
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    data: paramData[method].map(value => ({
                        x: param,
                        y: value,
                        method: method
                    })),
                    type: 'scatter'
                });
            }
        });
        
        // Créer le graphique
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'boxplot',
            data: {
                labels: [param],
                datasets: boxplotDatasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Distribution du paramètre ${param}`,
                        font: {
                            size: 16
                        },
                        color: isDarkTheme ? '#e0e0e0' : '#333333'
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            color: isDarkTheme ? '#e0e0e0' : '#333333',
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    // Boxplot tooltip
                                    const item = context.dataset.data[context.dataIndex];
                                    return [
                                        `Min: ${formatNumber(item.min)}`,
                                        `Q1: ${formatNumber(item.q1)}`,
                                        `Médiane: ${formatNumber(item.median)}`,
                                        `Q3: ${formatNumber(item.q3)}`,
                                        `Max: ${formatNumber(item.max)}`
                                    ];
                                } else {
                                    // Point tooltip
                                    const value = context.parsed.y;
                                    const method = context.dataset.label;
                                    return `${method}: ${formatNumber(value)}`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: param !== 'SSD',
                        title: {
                            display: true,
                            text: param,
                            color: isDarkTheme ? '#e0e0e0' : '#333333'
                        },
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
        charts[param] = chart;
        
        // Ajouter une légende avec les statistiques
        const statsDiv = document.createElement('div');
        statsDiv.className = 'boxplot-stats';
        statsDiv.innerHTML = `<h4>Statistiques du paramètre ${param}</h4>`;
        
        methods.forEach(method => {
            if (paramData[method].length > 0) {
                const values = paramData[method];
                values.sort((a, b) => a - b);
                const min = formatNumber(values[0]);
                const max = formatNumber(values[values.length - 1]);
                const median = formatNumber(calculateQuantile(values, 0.5));
                const avg = formatNumber(values.reduce((a, b) => a + b, 0) / values.length);
                
                statsDiv.innerHTML += `
                    <div class="method-stats" style="color: ${methodColors[method].replace(/[^,]+(?=\))/, '1')}">
                        <strong>${methodToName(method)}:</strong> 
                        Min: ${min}, 
                        Médiane: ${median},
                        Moy: ${avg}, 
                        Max: ${max}
                    </div>
                `;
            }
        });
        
        boxplotElement.appendChild(statsDiv);
    });
}

// Fonction pour obtenir le style de point pour chaque méthode
function getMethodPointStyle(method) {
    const styles = {
        random: 'circle',
        genetique: 'triangle',
        mlp: 'rect',
        cnn: 'star'
    };
    
    return styles[method] || 'circle';
}

// Fonction pour calculer les quantiles (utilisée pour les boîtes à moustaches)
function calculateQuantile(sortedArray, q) {
    if (!sortedArray || sortedArray.length === 0) return 0;
    
    const pos = (sortedArray.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    
    if (sortedArray[base + 1] !== undefined) {
        return sortedArray[base] + rest * (sortedArray[base + 1] - sortedArray[base]);
    } else {
        return sortedArray[base];
    }
}

// Fonction pour formater les nombres selon leur magnitude
function formatNumber(value) {
    if (value === undefined || value === null) return 'N/A';
    
    // Pour les très petits nombres ou très grands nombres, utiliser la notation scientifique
    if (Math.abs(value) < 0.001 || Math.abs(value) > 10000) {
        return value.toExponential(4);
    }
    
    // Pour les nombres décimaux, limiter à 4 décimales
    if (Math.abs(value) < 1) {
        return value.toFixed(4);
    }
    
    // Pour les nombres entiers ou presque entiers
    if (Math.abs(value - Math.round(value)) < 0.0001) {
        return Math.round(value).toString();
    }
    
    // Pour les autres nombres
    return value.toFixed(2);
}

// Fonction pour convertir la clé de méthode en nom lisible
function methodToName(methodKey) {
    const methodNames = {
        'rand': 'Classique',
        'random': 'Classique',
        'mlp': 'MLP',
        'cnn': 'CNN',
        'gen': 'Génétique',
        'genetique': 'Génétique'
    };
    
    return methodNames[methodKey] || methodKey;
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
        rand: getComputedStyle(document.documentElement).getPropertyValue('--method-rand-color') || 'rgba(255, 99, 132, 0.7)',
        mlp: getComputedStyle(document.documentElement).getPropertyValue('--method-mlp-color') || 'rgba(54, 162, 235, 0.7)',
        cnn: getComputedStyle(document.documentElement).getPropertyValue('--method-cnn-color') || 'rgba(255, 206, 86, 0.7)',
        gen: getComputedStyle(document.documentElement).getPropertyValue('--method-gen-color') || 'rgba(75, 192, 192, 0.7)'
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
                backgroundColor: methodColors[methodKey].replace(/[^,]+(?=\))/, '0.2'),
                borderColor: methodColors[methodKey].replace(/[^,]+(?=\))/, '1'),
                pointBackgroundColor: methodColors[methodKey].replace(/[^,]+(?=\))/, '1'),
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: methodColors[methodKey].replace(/[^,]+(?=\))/, '1')
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
        rand: getComputedStyle(document.documentElement).getPropertyValue('--method-rand-color') || 'rgba(255, 99, 132, 0.7)',
        mlp: getComputedStyle(document.documentElement).getPropertyValue('--method-mlp-color') || 'rgba(54, 162, 235, 0.7)',
        cnn: getComputedStyle(document.documentElement).getPropertyValue('--method-cnn-color') || 'rgba(255, 206, 86, 0.7)',
        gen: getComputedStyle(document.documentElement).getPropertyValue('--method-gen-color') || 'rgba(75, 192, 192, 0.7)'
    };
    
    for (const [methodKey, values] of Object.entries(datasets)) {
        if (values.some(v => v !== null)) {
            chartDatasets.push({
                label: methodToName(methodKey),
                data: values,
                backgroundColor: methodColors[methodKey],
                borderColor: methodColors[methodKey].replace(/[^,]+(?=\))/, '1'),
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
