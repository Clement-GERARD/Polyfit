// Fonctions pour l'affichage des courbes I-V avec Chart.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les variables globales pour les couleurs personnalisables
    initializeColorCustomization();
});

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

// Initialisation de la personnalisation des couleurs
function initializeColorCustomization() {
    // Créer le panneau de personnalisation des couleurs
    createColorCustomizationPanel();
    
    // Charger les couleurs sauvegardées dans le localStorage
    loadSavedColors();
}

// Création du panneau de personnalisation des couleurs
function createColorCustomizationPanel() {
    const panel = document.createElement('div');
    panel.id = 'color-customization-panel';
    panel.className = 'color-panel hidden';
    
    panel.innerHTML = `
        <div class="color-panel-header">
            <h3>Personnalisation des couleurs</h3>
            <button id="close-color-panel">×</button>
        </div>
        <div class="color-panel-content">
            <div class="color-option">
                <label for="experimental-color">Points expérimentaux:</label>
                <input type="color" id="experimental-color" value="${methodColors.experimental}">
            </div>
            <div class="color-option">
                <label for="random-color">Méthode Classique:</label>
                <input type="color" id="random-color" value="${methodColors.random}">
            </div>
            <div class="color-option">
                <label for="mlp-color">Méthode MLP:</label>
                <input type="color" id="mlp-color" value="${methodColors.mlp}">
            </div>
            <div class="color-option">
                <label for="cnn-color">Méthode CNN:</label>
                <input type="color" id="cnn-color" value="${methodColors.cnn}">
            </div>
            <div class="color-option">
                <label for="genetique-color">Méthode Génétique:</label>
                <input type="color" id="genetique-color" value="${methodColors.genetique}">
            </div>
        </div>
        <div class="color-panel-footer">
            <button id="reset-colors">Réinitialiser</button>
            <button id="save-colors">Enregistrer</button>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Ajouter les styles CSS pour le panneau
    const style = document.createElement('style');
    style.textContent = `
        .color-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: var(--card-background);
            border-radius: 8px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            width: 350px;
            z-index: 1000;
            transition: all 0.3s ease;
        }
        
        .color-panel.hidden {
            opacity: 0;
            visibility: hidden;
            transform: translate(-50%, -60%);
        }
        
        .color-panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .color-panel-header h3 {
            margin: 0;
            color: var(--text-color);
        }
        
        #close-color-panel {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: var(--text-color);
        }
        
        .color-panel-content {
            padding: 20px;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .color-option {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .color-option label {
            flex: 1;
            color: var(--text-color);
        }
        
        .color-option input[type="color"] {
            width: 40px;
            height: 40px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .color-panel-footer {
            display: flex;
            justify-content: flex-end;
            padding: 15px 20px;
            border-top: 1px solid var(--border-color);
            gap: 10px;
        }
        
        .color-panel-footer button {
            padding: 8px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
        }
        
        #reset-colors {
            background-color: var(--border-color);
            color: var(--text-color);
        }
        
        #save-colors {
            background-color: var(--primary-color);
            color: white;
        }
        
        .customize-colors-btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 15px;
            cursor: pointer;
            font-weight: 500;
            margin-top: 10px;
        }
    `;
    
    document.head.appendChild(style);
    
    // Ajouter un bouton pour ouvrir le panneau
    const customizeButton = document.createElement('button');
    customizeButton.className = 'customize-colors-btn';
    customizeButton.textContent = '🎨 Personnaliser les couleurs';
    customizeButton.addEventListener('click', toggleColorPanel);
    
    // Ajouter le bouton au conteneur du graphique
    const graphZone = document.getElementById('graph-zone');
    if (graphZone) {
        graphZone.appendChild(customizeButton);
    }
    
    // Ajouter les gestionnaires d'événements
    document.getElementById('close-color-panel').addEventListener('click', toggleColorPanel);
    document.getElementById('reset-colors').addEventListener('click', resetColors);
    document.getElementById('save-colors').addEventListener('click', saveColors);
    
    // Ajouter des gestionnaires pour les changements de couleur en temps réel
    document.getElementById('experimental-color').addEventListener('input', updateColor);
    document.getElementById('random-color').addEventListener('input', updateColor);
    document.getElementById('mlp-color').addEventListener('input', updateColor);
    document.getElementById('cnn-color').addEventListener('input', updateColor);
    document.getElementById('genetique-color').addEventListener('input', updateColor);
}

// Fonction pour afficher/masquer le panneau de personnalisation
function toggleColorPanel() {
    const panel = document.getElementById('color-customization-panel');
    if (panel) {
        panel.classList.toggle('hidden');
    }
}

// Fonction pour mettre à jour les couleurs en temps réel
function updateColor(event) {
    const id = event.target.id;
    const color = event.target.value;
    
    switch (id) {
        case 'experimental-color':
            methodColors.experimental = color;
            break;
        case 'random-color':
            methodColors.random = color;
            break;
        case 'mlp-color':
            methodColors.mlp = color;
            break;
        case 'cnn-color':
            methodColors.cnn = color;
            break;
        case 'genetique-color':
            methodColors.genetique = color;
            break;
    }
    
    // Mettre à jour le graphique si disponible
    if (ivChart) {
        updateIVChartColors();
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

// Fonction pour mettre à jour les couleurs du graphique
function updateIVChartColors() {
    if (!ivChart) return;
    
    ivChart.data.datasets.forEach(dataset => {
        switch (dataset.label) {
            case 'Expérimental':
                dataset.borderColor = methodColors.experimental;
                dataset.backgroundColor = methodColors.experimental;
                break;
            case 'Classique':
                dataset.borderColor = methodColors.random;
                dataset.backgroundColor = hexToRgba(methodColors.random, 0.2);
                break;
            case 'MLP':
                dataset.borderColor = methodColors.mlp;
                dataset.backgroundColor = hexToRgba(methodColors.mlp, 0.2);
                break;
            case 'CNN':
                dataset.borderColor = methodColors.cnn;
                dataset.backgroundColor = hexToRgba(methodColors.cnn, 0.2);
                break;
            case 'Génétique':
                dataset.borderColor = methodColors.genetique;
                dataset.backgroundColor = hexToRgba(methodColors.genetique, 0.2);
                break;
        }
    });
    
    ivChart.update();
}

// Fonction pour convertir une couleur hex en rgba
function hexToRgba(hex, alpha = 1) {
    // Supprimer le # si présent
    hex = hex.replace('#', '');
    
    // Convertir en RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
