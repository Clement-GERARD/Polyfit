// Mode présentation plein écran
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le mode présentation
    setupPresentationMode();
});

// Configuration du mode présentation
function setupPresentationMode() {
    // Ajouter un bouton pour activer le mode présentation
    const presentationButton = document.createElement('button');
    presentationButton.id = 'presentation-mode-btn';
    presentationButton.className = 'action-button';
    presentationButton.innerHTML = '<i class="fas fa-tv"></i> Mode présentation';
    presentationButton.title = 'Activer le mode présentation plein écran';
    
    // Ajouter le bouton dans la section appropriée
    const actionsSection = document.querySelector('.actions-container');
    if (actionsSection) {
        actionsSection.appendChild(presentationButton);
    } else {
        // Fallback: ajouter après le titre principal
        const mainTitle = document.querySelector('h1');
        if (mainTitle && mainTitle.parentNode) {
            const container = document.createElement('div');
            container.className = 'actions-container';
            container.appendChild(presentationButton);
            mainTitle.parentNode.insertBefore(container, mainTitle.nextSibling);
        }
    }
    
    // Ajouter un gestionnaire d'événements pour le bouton
    presentationButton.addEventListener('click', togglePresentationMode);
    
    // Ajouter des styles CSS pour le mode présentation
    const style = document.createElement('style');
    style.textContent = `
        #presentation-mode-btn {
            background-color: var(--accent-color, #9c27b0);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 15px;
            cursor: pointer;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        #presentation-mode-btn:hover {
            background-color: var(--accent-color-dark, #7b1fa2);
        }
        
        #presentation-mode-btn i {
            font-size: 16px;
        }
        
        .presentation-mode {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--card-background);
            z-index: 2000;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        
        .presentation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background-color: var(--primary-color);
            color: white;
        }
        
        .presentation-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }
        
        .presentation-controls {
            display: flex;
            gap: 15px;
        }
        
        .presentation-control-btn {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: background-color 0.2s;
        }
        
        .presentation-control-btn:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
        
        .presentation-content {
            flex: 1;
            overflow: hidden;
            position: relative;
        }
        
        .presentation-slide {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
            opacity: 0;
            transition: opacity 0.5s;
            overflow: auto;
        }
        
        .presentation-slide.active {
            opacity: 1;
            z-index: 1;
        }
        
        .presentation-slide-content {
            width: 90%;
            max-width: 1200px;
            height: 90%;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .presentation-slide-title {
            font-size: 32px;
            margin-bottom: 20px;
            color: var(--text-color);
            text-align: center;
        }
        
        .presentation-chart-container {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .presentation-chart {
            width: 100%;
            height: 100%;
            max-height: 70vh;
        }
        
        .presentation-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background-color: var(--card-background);
            border-top: 1px solid var(--border-color);
        }
        
        .presentation-pagination {
            font-size: 16px;
            color: var(--text-color);
        }
        
        .presentation-navigation {
            display: flex;
            gap: 15px;
        }
        
        .presentation-nav-btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 15px;
            cursor: pointer;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .presentation-nav-btn:disabled {
            background-color: var(--border-color);
            cursor: not-allowed;
        }
        
        .presentation-slide-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 18px;
        }
        
        .presentation-slide-table th,
        .presentation-slide-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        
        .presentation-slide-table th {
            background-color: var(--primary-color);
            color: white;
            font-weight: bold;
        }
        
        .presentation-slide-table tr:nth-child(even) {
            background-color: rgba(0, 0, 0, 0.05);
        }
        
        .presentation-slide-table tr:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 768px) {
            .presentation-title {
                font-size: 18px;
            }
            
            .presentation-slide-title {
                font-size: 24px;
            }
            
            .presentation-slide-table {
                font-size: 14px;
            }
            
            .presentation-slide-table th,
            .presentation-slide-table td {
                padding: 8px 10px;
            }
        }
    `;
    
    document.head.appendChild(style);
    
    // Ajouter des gestionnaires d'événements pour les touches clavier
    document.addEventListener('keydown', handlePresentationKeydown);
}

// Variable pour stocker l'état du mode présentation
let presentationMode = {
    active: false,
    currentSlide: 0,
    slides: [],
    container: null
};

// Fonction pour activer/désactiver le mode présentation
function togglePresentationMode() {
    if (presentationMode.active) {
        exitPresentationMode();
    } else {
        enterPresentationMode();
    }
}

// Fonction pour entrer en mode présentation
function enterPresentationMode() {
    // Vérifier si nous avons des résultats à présenter
    if (!allResults || allResults.length === 0) {
        showToast('Aucun résultat à présenter. Veuillez d\'abord analyser des fichiers.', 'error');
        return;
    }
    
    // Créer le conteneur du mode présentation
    const presentationContainer = document.createElement('div');
    presentationContainer.className = 'presentation-mode';
    
    // Créer l'en-tête
    const header = document.createElement('div');
    header.className = 'presentation-header';
    
    const title = document.createElement('h1');
    title.className = 'presentation-title';
    title.textContent = 'Polyfit AI - Résultats d\'analyse';
    
    const controls = document.createElement('div');
    controls.className = 'presentation-controls';
    
    const exitButton = document.createElement('button');
    exitButton.className = 'presentation-control-btn';
    exitButton.innerHTML = '<i class="fas fa-times"></i>';
    exitButton.title = 'Quitter le mode présentation';
    exitButton.addEventListener('click', exitPresentationMode);
    
    const fullscreenButton = document.createElement('button');
    fullscreenButton.className = 'presentation-control-btn';
    fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>';
    fullscreenButton.title = 'Plein écran';
    fullscreenButton.addEventListener('click', toggleFullscreen);
    
    controls.appendChild(fullscreenButton);
    controls.appendChild(exitButton);
    
    header.appendChild(title);
    header.appendChild(controls);
    
    // Créer le contenu
    const content = document.createElement('div');
    content.className = 'presentation-content';
    
    // Créer le pied de page
    const footer = document.createElement('div');
    footer.className = 'presentation-footer';
    
    const pagination = document.createElement('div');
    pagination.className = 'presentation-pagination';
    pagination.id = 'presentation-pagination';
    
    const navigation = document.createElement('div');
    navigation.className = 'presentation-navigation';
    
    const prevButton = document.createElement('button');
    prevButton.className = 'presentation-nav-btn';
    prevButton.id = 'presentation-prev';
    prevButton.innerHTML = '<i class="fas fa-arrow-left"></i> Précédent';
    prevButton.addEventListener('click', () => navigatePresentation(-1));
    
    const nextButton = document.createElement('button');
    nextButton.className = 'presentation-nav-btn';
    nextButton.id = 'presentation-next';
    nextButton.innerHTML = 'Suivant <i class="fas fa-arrow-right"></i>';
    nextButton.addEventListener('click', () => navigatePresentation(1));
    
    navigation.appendChild(prevButton);
    navigation.appendChild(nextButton);
    
    footer.appendChild(pagination);
    footer.appendChild(navigation);
    
    // Assembler le conteneur
    presentationContainer.appendChild(header);
    presentationContainer.appendChild(content);
    presentationContainer.appendChild(footer);
    
    // Ajouter le conteneur au document
    document.body.appendChild(presentationContainer);
    
    // Mettre à jour l'état du mode présentation
    presentationMode.active = true;
    presentationMode.currentSlide = 0;
    presentationMode.container = presentationContainer;
    
    // Créer les diapositives
    createPresentationSlides(content);
    
    // Mettre à jour la pagination
    updatePresentationPagination();
    
    // Demander le mode plein écran
    requestFullscreen(presentationContainer);
}

// Fonction pour créer les diapositives de la présentation
function createPresentationSlides(container) {
    // Réinitialiser les diapositives
    presentationMode.slides = [];
    
    // Diapositive 1: Résumé des fichiers analysés
    const slide1 = createPresentationSlide('Résumé des fichiers analysés');
    const slide1Content = document.createElement('div');
    slide1Content.className = 'presentation-slide-content';
    
    const filesTable = document.createElement('table');
    filesTable.className = 'presentation-slide-table';
    
    // En-tête du tableau
    const tableHeader = document.createElement('thead');
    tableHeader.innerHTML = `
        <tr>
            <th>Fichier</th>
            <th>Méthodes</th>
            <th>Paramètres</th>
        </tr>
    `;
    
    // Corps du tableau
    const tableBody = document.createElement('tbody');
    
    allResults.forEach(result => {
        const row = document.createElement('tr');
        
        const fileCell = document.createElement('td');
        fileCell.textContent = result.filename || 'Fichier sans nom';
        
        const methodsCell = document.createElement('td');
        const methods = Object.keys(result.methods).map(key => methodToName(key)).join(', ');
        methodsCell.textContent = methods;
        
        const paramsCell = document.createElement('td');
        const params = Object.keys(result.methods[Object.keys(result.methods)[0]] || {}).join(', ');
        paramsCell.textContent = params;
        
        row.appendChild(fileCell);
        row.appendChild(methodsCell);
        row.appendChild(paramsCell);
        
        tableBody.appendChild(row);
    });
    
    filesTable.appendChild(tableHeader);
    filesTable.appendChild(tableBody);
    
    slide1Content.appendChild(filesTable);
    slide1.appendChild(slide1Content);
    
    // Diapositive 2: Tableau comparatif des méthodes
    const slide2 = createPresentationSlide('Comparaison des méthodes');
    const slide2Content = document.createElement('div');
    slide2Content.className = 'presentation-slide-content';
    
    // Cloner le tableau de comparaison
    const comparisonTable = document.getElementById('comparison-table');
    if (comparisonTable) {
        const tableClone = comparisonTable.cloneNode(true);
        tableClone.className = 'presentation-slide-table';
        slide2Content.appendChild(tableClone);
    } else {
        slide2Content.innerHTML = '<p>Tableau de comparaison non disponible</p>';
    }
    
    slide2.appendChild(slide2Content);
    
    // Diapositive 3: Graphique radar
    const slide3 = createPresentationSlide('Comparaison radar des méthodes');
    const slide3Content = document.createElement('div');
    slide3Content.className = 'presentation-slide-content';
    
    const radarContainer = document.createElement('div');
    radarContainer.className = 'presentation-chart-container';
    
    const radarCanvas = document.createElement('canvas');
    radarCanvas.id = 'presentation-radar-chart';
    radarCanvas.className = 'presentation-chart';
    
    radarContainer.appendChild(radarCanvas);
    slide3Content.appendChild(radarContainer);
    slide3.appendChild(slide3Content);
    
    // Diapositive 4: Graphique SSD
    const slide4 = createPresentationSlide('Comparaison des SSD');
    const slide4Content = document.createElement('div');
    slide4Content.className = 'presentation-slide-content';
    
    const ssdContainer = document.createElement('div');
    ssdContainer.className = 'presentation-chart-container';
    
    const ssdCanvas = document.createElement('canvas');
    ssdCanvas.id = 'presentation-ssd-chart';
    ssdCanvas.className = 'presentation-chart';
    
    ssdContainer.appendChild(ssdCanvas);
    slide4Content.appendChild(ssdContainer);
    slide4.appendChild(slide4Content);
    
    // Diapositives 5+: Boxplots pour chaque paramètre
    const parameters = ['J0', 'Jph', 'Rs', 'Rsh', 'n', 'SSD'];
    
    parameters.forEach((param, index) => {
        const slide = createPresentationSlide(`Distribution du paramètre ${param}`);
        const slideContent = document.createElement('div');
        slideContent.className = 'presentation-slide-content';
        
        const boxplotContainer = document.createElement('div');
        boxplotContainer.className = 'presentation-chart-container';
        
        const boxplotCanvas = document.createElement('canvas');
        boxplotCanvas.id = `presentation-${param}-boxplot`;
        boxplotCanvas.className = 'presentation-chart';
        
        boxplotContainer.appendChild(boxplotCanvas);
        slideContent.appendChild(boxplotContainer);
        slide.appendChild(slideContent);
        
        container.appendChild(slide);
        presentationMode.slides.push(slide);
    });
    
    // Ajouter les diapositives au conteneur
    container.appendChild(slide1);
    container.appendChild(slide2);
    container.appendChild(slide3);
    container.appendChild(slide4);
    
    // Ajouter les diapositives à l'état
    presentationMode.slides.unshift(slide1, slide2, slide3, slide4);
    
    // Activer la première diapositive
    if (presentationMode.slides.length > 0) {
        presentationMode.slides[0].classList.add('active');
    }
    
    // Initialiser les graphiques après un court délai
    setTimeout(initPresentationCharts, 500);
}

// Fonction pour créer une diapositive
function createPresentationSlide(title) {
    const slide = document.createElement('div');
    slide.className = 'presentation-slide';
    
    const slideTitle = document.createElement('h2');
    slideTitle.className = 'presentation-slide-title';
    slideTitle.textContent = title;
    
    slide.appendChild(slideTitle);
    
    return slide;
}

// Fonction pour initialiser les graphiques de la présentation
function initPresentationCharts() {
    // Graphique radar
    const radarCanvas = document.getElementById('presentation-radar-chart');
    if (radarCanvas && typeof createRadarChart === 'function') {
        // Créer un graphique radar personnalisé pour la présentation
        createCustomRadarChart(radarCanvas);
    }
    
    // Graphique SSD
    const ssdCanvas = document.getElementById('presentation-ssd-chart');
    if (ssdCanvas && typeof createSSDComparisonChart === 'function') {
        // Créer un graphique SSD personnalisé pour la présentation
        createCustomSSDChart(ssdCanvas);
    }
    
    // Boxplots
    const parameters = ['J0', 'Jph', 'Rs', 'Rsh', 'n', 'SSD'];
    parameters.forEach(param => {
        const boxplotCanvas = document.getElementById(`presentation-${param}-boxplot`);
        if (boxplotCanvas) {
            // Créer un boxplot personnalisé pour la présentation
            createCustomBoxplot(boxplotCanvas, param);
        }
    });
}

// Fonction pour créer un graphique radar personnalisé
function createCustomRadarChart(canvas) {
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
                pointHoverBorderColor: methodColors[methodKey].replace(/[^,]+(?=\))/, '1'),
                pointRadius: 6,
                pointHoverRadius: 8
            });
        }
        
        // Créer le graphique radar
        const ctx = canvas.getContext('2d');
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
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            lineWidth: 2
                        },
                        grid: {
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            lineWidth: 2
                        },
                        pointLabels: {
                            color: isDarkTheme ? '#e0e0e0' : '#333333',
                            font: {
                                size: 18,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            backdropColor: 'transparent',
                            color: isDarkTheme ? '#e0e0e0' : '#333333',
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: isDarkTheme ? '#e0e0e0' : '#333333',
                            font: {
                                size: 16
                            },
                            padding: 20
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
                        },
                        titleFont: {
                            size: 16
                        },
                        bodyFont: {
                            size: 14
                        },
                        padding: 12
                    }
                }
            }
        });
    }
}

// Fonction pour créer un graphique SSD personnalisé
function createCustomSSDChart(canvas) {
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
                borderWidth: 2
            });
        }
    }
    
    // Créer le graphique
    if (chartDatasets.length > 0) {
        const ctx = canvas.getContext('2d');
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
                            color: isDarkTheme ? '#e0e0e0' : '#333333',
                            font: {
                                size: 18,
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            lineWidth: 2
                        },
                        ticks: {
                            color: isDarkTheme ? '#e0e0e0' : '#333333',
                            font: {
                                size: 14
                            },
                            callback: function(value) {
                                return value.toExponential(1);
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                            lineWidth: 2
                        },
                        ticks: {
                            color: isDarkTheme ? '#e0e0e0' : '#333333',
                            font: {
                                size: 14
                            },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: isDarkTheme ? '#e0e0e0' : '#333333',
                            font: {
                                size: 16
                            },
                            padding: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                if (value === null) return 'Pas de données';
                                return `${context.dataset.label}: ${value.toExponential(4)}`;
                            }
                        },
                        titleFont: {
                            size: 16
                        },
                        bodyFont: {
                            size: 14
                        },
                        padding: 12
                    }
                }
            }
        });
    }
}

// Fonction pour créer un boxplot personnalisé
function createCustomBoxplot(canvas, param) {
    // Collecter toutes les données par méthode
    const methodData = {
        rand: [],
        mlp: [],
        cnn: [],
        gen: []
    };
    
    // Remplir les données
    allResults.forEach(result => {
        for (const [methodKey, methodParams] of Object.entries(result.methods)) {
            if (methodParams[param] !== undefined) {
                methodData[methodKey].push(parseFloat(methodParams[param]));
            }
        }
    });
    
    // Vérifier si nous avons des données
    const hasData = Object.values(methodData).some(values => values.length > 0);
    
    if (!hasData) {
        return;
    }
    
    // Couleurs pour les différentes méthodes
    const methodColors = {
        rand: getComputedStyle(document.documentElement).getPropertyValue('--method-rand-color') || 'rgba(255, 99, 132, 0.7)',
        mlp: getComputedStyle(document.documentElement).getPropertyValue('--method-mlp-color') || 'rgba(54, 162, 235, 0.7)',
        cnn: getComputedStyle(document.documentElement).getPropertyValue('--method-cnn-color') || 'rgba(255, 206, 86, 0.7)',
        gen: getComputedStyle(document.documentElement).getPropertyValue('--method-gen-color') || 'rgba(75, 192, 192, 0.7)'
    };
    
    // Préparer les données pour le boxplot
    const allValues = [];
    Object.values(methodData).forEach(values => {
        allValues.push(...values);
    });
    
    // Trier les valeurs pour calculer les statistiques
    allValues.sort((a, b) => a - b);
    
    const min = allValues[0];
    const max = allValues[allValues.length - 1];
    const q1 = calculateQuantile(allValues, 0.25);
    const median = calculateQuantile(allValues, 0.5);
    const q3 = calculateQuantile(allValues, 0.75);
    
    // Dataset pour la boîte à moustaches
    const boxplotDatasets = [{
        label: param,
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
        borderColor: 'rgba(150, 150, 150, 1)',
        borderWidth: 2,
        data: [{
            min: min,
            q1: q1,
            median: median,
            q3: q3,
            max: max
        }]
    }];
    
    // Datasets pour les points de chaque méthode
    for (const [methodKey, values] of Object.entries(methodData)) {
        if (values.length > 0) {
            boxplotDatasets.push({
                label: methodToName(methodKey),
                backgroundColor: methodColors[methodKey],
                borderColor: methodColors[methodKey].replace(/[^,]+(?=\))/, '1'),
                borderWidth: 2,
                pointStyle: getMethodPointStyle(methodKey),
                pointRadius: 8,
                pointHoverRadius: 10,
                data: values.map(value => ({
                    x: param,
                    y: value,
                    method: methodKey
                })),
                type: 'scatter'
            });
        }
    }
    
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
                legend: {
                    position: 'top',
                    labels: {
                        color: isDarkTheme ? '#e0e0e0' : '#333333',
                        font: {
                            size: 16
                        },
                        usePointStyle: true,
                        padding: 20
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
                    },
                    titleFont: {
                        size: 16
                    },
                    bodyFont: {
                        size: 14
                    },
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: param !== 'SSD',
                    title: {
                        display: true,
                        text: param,
                        color: isDarkTheme ? '#e0e0e0' : '#333333',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 2
                    },
                    ticks: {
                        color: isDarkTheme ? '#e0e0e0' : '#333333',
                        font: {
                            size: 14
                        },
                        callback: function(value) {
                            return formatNumber(value);
                        }
                    }
                },
                x: {
                    grid: {
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 2
                    },
                    ticks: {
                        color: isDarkTheme ? '#e0e0e0' : '#333333',
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}

// Fonction pour quitter le mode présentation
function exitPresentationMode() {
    if (presentationMode.container) {
        // Quitter le mode plein écran
        exitFullscreen();
        
        // Supprimer le conteneur
        document.body.removeChild(presentationMode.container);
        
        // Mettre à jour l'état
        presentationMode.active = false;
        presentationMode.currentSlide = 0;
        presentationMode.slides = [];
        presentationMode.container = null;
    }
}

// Fonction pour naviguer dans la présentation
function navigatePresentation(direction) {
    // Calculer le nouvel index
    const newIndex = presentationMode.currentSlide + direction;
    
    // Vérifier si l'index est valide
    if (newIndex < 0 || newIndex >= presentationMode.slides.length) {
        return;
    }
    
    // Désactiver la diapositive actuelle
    presentationMode.slides[presentationMode.currentSlide].classList.remove('active');
    
    // Mettre à jour l'index
    presentationMode.currentSlide = newIndex;
    
    // Activer la nouvelle diapositive
    presentationMode.slides[presentationMode.currentSlide].classList.add('active');
    
    // Mettre à jour la pagination
    updatePresentationPagination();
    
    // Mettre à jour les boutons de navigation
    updatePresentationNavigation();
}

// Fonction pour mettre à jour la pagination
function updatePresentationPagination() {
    const pagination = document.getElementById('presentation-pagination');
    if (pagination) {
        pagination.textContent = `Diapositive ${presentationMode.currentSlide + 1} / ${presentationMode.slides.length}`;
    }
    
    // Mettre à jour les boutons de navigation
    updatePresentationNavigation();
}

// Fonction pour mettre à jour les boutons de navigation
function updatePresentationNavigation() {
    const prevButton = document.getElementById('presentation-prev');
    const nextButton = document.getElementById('presentation-next');
    
    if (prevButton) {
        prevButton.disabled = presentationMode.currentSlide === 0;
    }
    
    if (nextButton) {
        nextButton.disabled = presentationMode.currentSlide === presentationMode.slides.length - 1;
    }
}

// Fonction pour gérer les touches clavier en mode présentation
function handlePresentationKeydown(event) {
    if (!presentationMode.active) {
        return;
    }
    
    switch (event.key) {
        case 'ArrowLeft':
            navigatePresentation(-1);
            break;
        case 'ArrowRight':
        case 'Space':
            navigatePresentation(1);
            break;
        case 'Escape':
            exitPresentationMode();
            break;
        case 'f':
        case 'F':
            toggleFullscreen();
            break;
    }
}

// Fonction pour demander le mode plein écran
function requestFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

// Fonction pour quitter le mode plein écran
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Fonction pour basculer le mode plein écran
function toggleFullscreen() {
    if (document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement) {
        exitFullscreen();
    } else if (presentationMode.container) {
        requestFullscreen(presentationMode.container);
    }
}

// Fonction pour obtenir le style de point pour chaque méthode
function getMethodPointStyle(method) {
    const styles = {
        rand: 'circle',
        random: 'circle',
        genetique: 'triangle',
        gen: 'triangle',
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
