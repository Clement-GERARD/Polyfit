// Variables globales pour les couleurs des méthodes
let methodColors = {
    experimental: '#000000', // Noir pour les points expérimentaux
    random: getComputedStyle(document.documentElement).getPropertyValue('--method-rand-color').trim() || '#FF6B6B',
    genetique: getComputedStyle(document.documentElement).getPropertyValue('--method-gen-color').trim() || '#6B5CA5',
    mlp: getComputedStyle(document.documentElement).getPropertyValue('--method-mlp-color').trim() || '#4ECDC4',
    cnn: getComputedStyle(document.documentElement).getPropertyValue('--method-cnn-color').trim() || '#FFD166'
};

// Stockage des instances de graphiques
let ivChart = null;

// Fonction pour afficher/masquer le panneau de personnalisation
function toggleColorPanel() {
    const panel = document.getElementById('color-customization-panel');
    if (panel) {
        panel.classList.toggle('hidden');
    }
}

// Fonction pour réinitialiser les couleurs
function resetColors() {
    // Réinitialiser aux couleurs par défaut du thème
    methodColors = {
        experimental: '#000000',
        random: getComputedStyle(document.documentElement).getPropertyValue('--method-rand-color').trim() || '#FF6B6B',
        genetique: getComputedStyle(document.documentElement).getPropertyValue('--method-gen-color').trim() || '#6B5CA5',
        mlp: getComputedStyle(document.documentElement).getPropertyValue('--method-mlp-color').trim() || '#4ECDC4',
        cnn: getComputedStyle(document.documentElement).getPropertyValue('--method-cnn-color').trim() || '#FFD166'
    };
    
    // Mettre à jour les inputs de couleur
    document.getElementById('experimental-color').value = methodColors.experimental;
    document.getElementById('random-color').value = methodColors.random;
    document.getElementById('mlp-color').value = methodColors.mlp;
    document.getElementById('cnn-color').value = methodColors.cnn;
    document.getElementById('genetique-color').value = methodColors.genetique;
    
    // Mettre à jour le graphique si disponible
    if (ivChart) {
        updateIVChartColors();
    }
    
    // Supprimer les couleurs sauvegardées
    localStorage.removeItem('polyfit_method_colors');
    
    showToast('Couleurs réinitialisées', 'info');
}

// Fonction pour sauvegarder les couleurs
function saveColors() {
    // Sauvegarder dans le localStorage
    localStorage.setItem('polyfit_method_colors', JSON.stringify(methodColors));
    
    // Mettre à jour le graphique si disponible
    if (ivChart) {
        updateIVChartColors();
    }
    
    showToast('Couleurs sauvegardées', 'success');
    toggleColorPanel(); // Fermer le panneau
}

// Fonction pour charger les couleurs sauvegardées
function loadSavedColors() {
    const savedColors = localStorage.getItem('polyfit_method_colors');
    if (savedColors) {
        try {
            const colors = JSON.parse(savedColors);
            methodColors = { ...methodColors, ...colors };
            
            // Mettre à jour les inputs de couleur
            if (document.getElementById('experimental-color')) {
                document.getElementById('experimental-color').value = methodColors.experimental;
                document.getElementById('random-color').value = methodColors.random;
                document.getElementById('mlp-color').value = methodColors.mlp;
                document.getElementById('cnn-color').value = methodColors.cnn;
                document.getElementById('genetique-color').value = methodColors.genetique;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des couleurs sauvegardées:', error);
        }
    }
}

// Fonction pour créer le graphique I-V avec Chart.js
function createIVChart(data) {
    // Vérifier si nous avons des données de courbe
    if (!data.curve_data) {
        showToast('Pas de données de courbe disponibles', 'error');
        return;
    }
    
    // Récupérer le conteneur du graphique
    const container = document.querySelector("#graph-zone .content-placeholder");
    if (!container) {
        console.error('Conteneur de graphique non trouvé');
        return;
    }
    
    // Nettoyer le conteneur
    container.innerHTML = '<canvas id="iv-chart"></canvas>';
    
    // Récupérer le contexte du canvas
    const ctx = document.getElementById('iv-chart').getContext('2d');
    
    // Préparer les datasets
    const datasets = [];
    
    // Points expérimentaux
    if (data.curve_data.experimental) {
        datasets.push({
            label: 'Expérimental',
            data: data.curve_data.experimental.x.map((x, i) => ({
                x: x,
                y: data.curve_data.experimental.y[i]
            })),
            borderColor: methodColors.experimental,
            backgroundColor: methodColors.experimental,
            pointRadius: 3,
            pointHoverRadius: 5,
            showLine: false,
            order: 1
        });
    }
    
    // Courbe Random/Classique
    if (data.curve_data.random) {
        datasets.push({
            label: 'Classique',
            data: data.curve_data.random.x.map((x, i) => ({
                x: x,
                y: data.curve_data.random.y[i]
            })),
            borderColor: methodColors.random,
            backgroundColor: hexToRgba(methodColors.random, 0.2),
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.4,
            order: 2
        });
    }
    
    // Courbe MLP
    if (data.curve_data.mlp) {
        datasets.push({
            label: 'MLP',
            data: data.curve_data.mlp.x.map((x, i) => ({
                x: x,
                y: data.curve_data.mlp.y[i]
            })),
            borderColor: methodColors.mlp,
            backgroundColor: hexToRgba(methodColors.mlp, 0.2),
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.4,
            order: 3
        });
    }
    
    // Courbe CNN
    if (data.curve_data.cnn) {
        datasets.push({
            label: 'CNN',
            data: data.curve_data.cnn.x.map((x, i) => ({
                x: x,
                y: data.curve_data.cnn.y[i]
            })),
            borderColor: methodColors.cnn,
            backgroundColor: hexToRgba(methodColors.cnn, 0.2),
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.4,
            order: 4
        });
    }
    
    // Courbe Génétique
    if (data.curve_data.genetique) {
        datasets.push({
            label: 'Génétique',
            data: data.curve_data.genetique.x.map((x, i) => ({
                x: x,
                y: data.curve_data.genetique.y[i]
            })),
            borderColor: methodColors.genetique,
            backgroundColor: hexToRgba(methodColors.genetique, 0.2),
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.4,
            order: 5
        });
    }
    
    // Créer le graphique
    ivChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'nearest',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Courbes I-V',
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
                            return `${context.dataset.label}: (${context.parsed.x.toFixed(3)}, ${context.parsed.y.toFixed(6)})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Tension (V)',
                        color: isDarkTheme ? '#e0e0e0' : '#333333'
                    },
                    grid: {
                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: isDarkTheme ? '#e0e0e0' : '#333333'
                    }
                },
                y: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Courant (A)',
                        color: isDarkTheme ? '#e0e0e0' : '#333333'
                    },
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
    
    // Stocker l'instance du graphique
    charts['iv'] = ivChart;
    
    // Ajuster la hauteur du conteneur pour le graphique
    container.style.height = '400px';
}

// Fonction pour mettre à jour la fonction displayResults pour utiliser Chart.js
function updateDisplayResultsFunction() {
    // Sauvegarder la fonction originale
    const originalDisplayResults = window.displayResults;
    
    // Remplacer par notre version améliorée
    window.displayResults = function(data) {
        // Appeler la fonction originale pour mettre à jour les autres éléments
        originalDisplayResults(data);
        
        // Remplacer l'affichage de l'image par notre graphique Chart.js
        if (data.curve_data) {
            createIVChart(data);
        } else if (data.curve_image_all) {
            // Fallback vers l'image base64 si les données de courbe ne sont pas disponibles
            const container = document.querySelector("#graph-zone .content-placeholder");
            container.innerHTML = `<img src="data:image/png;base64,${data.curve_image_all}" alt="Courbe IV combinée" style="width:100%; height:auto; border-radius:10px; box-shadow: 0 0 10px rgba(0,0,0,0.2);" />`;
        } else {
            updatePlaceholder("#graph-zone", "Pas de données de courbe disponibles.");
        }
    };
}

// Initialiser la fonction de mise à jour au chargement du script
updateDisplayResultsFunction();
