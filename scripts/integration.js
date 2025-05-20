// Script d'intégration et de validation globale
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser la validation globale
    setupGlobalValidation();
    
    // Vérifier la compatibilité du navigateur
    checkBrowserCompatibility();
    
    // Initialiser les gestionnaires d'événements globaux
    setupGlobalEventHandlers();
});

// Configuration de la validation globale
function setupGlobalValidation() {
    console.log('Initialisation de la validation globale...');
    
    // Vérifier que toutes les dépendances JavaScript sont chargées
    const requiredDependencies = [
        { name: 'Chart.js', check: () => typeof Chart !== 'undefined' },
        { name: 'jsPDF', check: () => typeof window.jspdf !== 'undefined' },
        { name: 'SheetJS', check: () => typeof XLSX !== 'undefined' },
        { name: 'html2canvas', check: () => typeof html2canvas !== 'undefined' }
    ];
    
    const missingDependencies = requiredDependencies.filter(dep => !dep.check());
    
    if (missingDependencies.length > 0) {
        console.warn('Dépendances manquantes:', missingDependencies.map(d => d.name).join(', '));
        
        // Charger automatiquement les dépendances manquantes
        missingDependencies.forEach(dep => {
            loadDependency(dep.name);
        });
    }
    
    // Vérifier que toutes les fonctions requises sont définies
    const requiredFunctions = [
        { name: 'createBoxplots', check: () => typeof createBoxplots === 'function' },
        { name: 'updateComparisonTable', check: () => typeof updateComparisonTable === 'function' },
        { name: 'generatePDF', check: () => typeof generatePDF === 'function' },
        { name: 'exportToExcel', check: () => typeof exportToExcel === 'function' },
        { name: 'createIVChart', check: () => typeof createIVChart === 'function' },
        { name: 'processBatchFiles', check: () => typeof processBatchFiles === 'function' },
        { name: 'showToast', check: () => typeof showToast === 'function' },
        { name: 'generateShareableLink', check: () => typeof generateShareableLink === 'function' },
        { name: 'togglePresentationMode', check: () => typeof togglePresentationMode === 'function' }
    ];
    
    const missingFunctions = requiredFunctions.filter(func => !func.check());
    
    if (missingFunctions.length > 0) {
        console.warn('Fonctions manquantes:', missingFunctions.map(f => f.name).join(', '));
        
        // Afficher un avertissement à l'utilisateur
        setTimeout(() => {
            showToast(`Certaines fonctionnalités peuvent ne pas être disponibles. Veuillez recharger la page.`, 'warning');
        }, 2000);
    }
}

// Fonction pour charger dynamiquement une dépendance
function loadDependency(name) {
    const dependencies = {
        'Chart.js': 'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js',
        'jsPDF': 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        'SheetJS': 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
        'html2canvas': 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
    };
    
    if (dependencies[name]) {
        const script = document.createElement('script');
        script.src = dependencies[name];
        script.async = true;
        script.onload = () => {
            console.log(`Dépendance chargée: ${name}`);
            
            // Vérifier si toutes les dépendances sont maintenant chargées
            if (name === 'Chart.js' && typeof Chart !== 'undefined') {
                // Initialiser les plugins Chart.js nécessaires
                initializeChartPlugins();
            }
        };
        script.onerror = () => {
            console.error(`Erreur lors du chargement de la dépendance: ${name}`);
            showToast(`Erreur lors du chargement de ${name}. Certaines fonctionnalités peuvent ne pas être disponibles.`, 'error');
        };
        
        document.head.appendChild(script);
    }
}

// Fonction pour initialiser les plugins Chart.js
function initializeChartPlugins() {
    // Vérifier si Chart.js est chargé
    if (typeof Chart === 'undefined') {
        console.error('Chart.js n\'est pas chargé');
        return;
    }
    
    // Vérifier si le plugin boxplot est déjà enregistré
    if (!Chart.controllers.boxplot) {
        console.log('Chargement du plugin boxplot pour Chart.js...');
        
        // Charger le plugin boxplot
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chartjs-chart-box-and-violin-plot@3.0.0/build/Chart.BoxPlot.min.js';
        script.async = true;
        script.onload = () => {
            console.log('Plugin boxplot chargé');
            
            // Réinitialiser les graphiques si nécessaire
            if (typeof createBoxplots === 'function' && allResults && allResults.length > 0) {
                createBoxplots();
            }
        };
        script.onerror = () => {
            console.error('Erreur lors du chargement du plugin boxplot');
            showToast('Erreur lors du chargement du plugin boxplot. Les boîtes à moustaches peuvent ne pas s\'afficher correctement.', 'error');
        };
        
        document.head.appendChild(script);
    }
}

// Fonction pour vérifier la compatibilité du navigateur
function checkBrowserCompatibility() {
    // Vérifier les fonctionnalités essentielles
    const requiredFeatures = [
        { name: 'Fetch API', check: () => typeof fetch !== 'undefined' },
        { name: 'Promise', check: () => typeof Promise !== 'undefined' },
        { name: 'localStorage', check: () => typeof localStorage !== 'undefined' },
        { name: 'FileReader', check: () => typeof FileReader !== 'undefined' },
        { name: 'Canvas', check: () => {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        }}
    ];
    
    const missingFeatures = requiredFeatures.filter(feature => !feature.check());
    
    if (missingFeatures.length > 0) {
        console.warn('Fonctionnalités de navigateur manquantes:', missingFeatures.map(f => f.name).join(', '));
        
        // Afficher un avertissement à l'utilisateur
        setTimeout(() => {
            showErrorWithSuggestions(
                'Votre navigateur ne prend pas en charge toutes les fonctionnalités requises',
                [
                    'Utilisez un navigateur moderne comme Chrome, Firefox, Edge ou Safari',
                    'Mettez à jour votre navigateur vers la dernière version',
                    'Désactivez le mode de navigation privée qui peut bloquer certaines fonctionnalités'
                ]
            );
        }, 2000);
    }
    
    // Vérifier si l'appareil est mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Appliquer des optimisations pour mobile
        applyMobileOptimizations();
    }
}

// Fonction pour appliquer des optimisations pour mobile
function applyMobileOptimizations() {
    console.log('Application des optimisations pour mobile...');
    
    // Ajouter une classe au body pour les styles spécifiques au mobile
    document.body.classList.add('mobile-device');
    
    // Ajuster la taille des éléments d'interface
    const style = document.createElement('style');
    style.textContent = `
        .mobile-device button,
        .mobile-device input,
        .mobile-device select {
            min-height: 44px; /* Taille minimale pour les éléments tactiles */
        }
        
        .mobile-device .table-container {
            overflow-x: auto; /* Permettre le défilement horizontal des tableaux */
        }
        
        .mobile-device #comparison-table th,
        .mobile-device #comparison-table td {
            padding: 8px 4px; /* Réduire le padding dans les tableaux */
            font-size: 0.9em;
        }
        
        .mobile-device .actions-container {
            flex-direction: column;
            gap: 10px;
        }
        
        .mobile-device .actions-container button {
            width: 100%;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            h1 {
                font-size: 1.5rem;
            }
            
            h2 {
                font-size: 1.2rem;
            }
            
            .card {
                padding: 10px;
                margin-bottom: 15px;
            }
        }
    `;
    
    document.head.appendChild(style);
    
    // Ajuster les options des graphiques pour le mobile
    window.mobileChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 10,
                    font: {
                        size: 10
                    }
                }
            },
            tooltip: {
                titleFont: {
                    size: 12
                },
                bodyFont: {
                    size: 11
                },
                footerFont: {
                    size: 10
                },
                boxPadding: 3
            }
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                ticks: {
                    font: {
                        size: 10
                    }
                }
            }
        }
    };
    
    // Afficher un message d'information pour les utilisateurs mobiles
    setTimeout(() => {
        showInfoWithAction(
            'Vous utilisez un appareil mobile. Certaines fonctionnalités peuvent être limitées.',
            'Compris',
            () => {}
        );
    }, 3000);
}

// Configuration des gestionnaires d'événements globaux
function setupGlobalEventHandlers() {
    // Gestionnaire pour les changements de thème
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', handleThemeChange);
    
    // Vérifier le thème initial
    handleThemeChange(darkModeMediaQuery);
    
    // Gestionnaire pour les changements de taille de fenêtre
    window.addEventListener('resize', handleWindowResize);
    
    // Gestionnaire pour les erreurs de chargement d'images
    document.addEventListener('error', function(event) {
        if (event.target.tagName.toLowerCase() === 'img') {
            handleImageError(event);
        }
    }, true);
    
    // Gestionnaire pour la visibilité de la page
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Gestionnaire pour la déconnexion/reconnexion réseau
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
}

// Fonction pour gérer les changements de thème
function handleThemeChange(event) {
    const isDark = event.matches;
    
    // Mettre à jour la variable globale
    window.isDarkTheme = isDark;
    
    // Appliquer le thème
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    // Mettre à jour les graphiques si nécessaire
    updateChartsTheme();
    
    console.log(`Thème passé en mode ${isDark ? 'sombre' : 'clair'}`);
}

// Fonction pour mettre à jour les graphiques lors d'un changement de thème
function updateChartsTheme() {
    // Mettre à jour tous les graphiques existants
    if (typeof charts !== 'undefined') {
        for (const chartId in charts) {
            if (charts[chartId]) {
                updateChartTheme(charts[chartId]);
            }
        }
    }
}

// Fonction pour mettre à jour le thème d'un graphique
function updateChartTheme(chart) {
    if (!chart || !chart.options) return;
    
    const textColor = window.isDarkTheme ? '#e0e0e0' : '#333333';
    const gridColor = window.isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Mettre à jour les options du graphique
    if (chart.options.scales) {
        // Mettre à jour les axes X et Y
        if (chart.options.scales.x) {
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.x.ticks.color = textColor;
            if (chart.options.scales.x.title) {
                chart.options.scales.x.title.color = textColor;
            }
        }
        
        if (chart.options.scales.y) {
            chart.options.scales.y.grid.color = gridColor;
            chart.options.scales.y.ticks.color = textColor;
            if (chart.options.scales.y.title) {
                chart.options.scales.y.title.color = textColor;
            }
        }
        
        // Mettre à jour l'axe R pour les graphiques radar
        if (chart.options.scales.r) {
            chart.options.scales.r.grid.color = gridColor;
            chart.options.scales.r.ticks.color = textColor;
            chart.options.scales.r.pointLabels.color = textColor;
        }
    }
    
    // Mettre à jour les plugins
    if (chart.options.plugins) {
        if (chart.options.plugins.title) {
            chart.options.plugins.title.color = textColor;
        }
        
        if (chart.options.plugins.legend) {
            chart.options.plugins.legend.labels.color = textColor;
        }
    }
    
    // Appliquer les mises à jour
    chart.update();
}

// Fonction pour gérer les changements de taille de fenêtre
function handleWindowResize() {
    // Redimensionner les graphiques
    if (typeof charts !== 'undefined') {
        for (const chartId in charts) {
            if (charts[chartId]) {
                charts[chartId].resize();
            }
        }
    }
}

// Fonction pour gérer les erreurs de chargement d'images
function handleImageError(event) {
    const img = event.target;
    
    // Remplacer par une image par défaut
    img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJmZWF0aGVyIGZlYXRoZXItaW1hZ2UiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcG9seWxpbmU+PC9zdmc+';
    img.alt = 'Image non disponible';
    img.style.padding = '10px';
    img.style.backgroundColor = '#f8f9fa';
    
    console.warn('Erreur de chargement d\'image:', img.src);
}

// Fonction pour gérer les changements de visibilité de la page
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        console.log('Page visible, reprise des activités');
        
        // Vérifier si des mises à jour sont nécessaires
        if (typeof checkForUpdates === 'function') {
            checkForUpdates();
        }
    } else {
        console.log('Page masquée, pause des activités');
        
        // Mettre en pause les activités consommatrices de ressources
        pauseResourceIntensiveActivities();
    }
}

// Fonction pour mettre en pause les activités consommatrices de ressources
function pauseResourceIntensiveActivities() {
    // Mettre en pause les animations, les requêtes périodiques, etc.
    // Cette fonction est un placeholder pour l'instant
}

// Fonction pour gérer la connexion réseau
function handleOnlineStatus() {
    console.log('Connexion réseau rétablie');
    
    // Afficher une notification
    showToast('Connexion réseau rétablie', 'success');
    
    // Réactiver les fonctionnalités réseau
    enableNetworkFeatures();
}

// Fonction pour gérer la déconnexion réseau
function handleOfflineStatus() {
    console.log('Connexion réseau perdue');
    
    // Afficher une notification
    showWarningWithAction(
        'Connexion réseau perdue. Certaines fonctionnalités ne sont pas disponibles.',
        'Réessayer',
        checkNetworkConnection
    );
    
    // Désactiver les fonctionnalités réseau
    disableNetworkFeatures();
}

// Fonction pour vérifier la connexion réseau
function checkNetworkConnection() {
    if (navigator.onLine) {
        handleOnlineStatus();
    } else {
        handleOfflineStatus();
    }
}

// Fonction pour activer les fonctionnalités réseau
function enableNetworkFeatures() {
    // Réactiver les boutons d'upload, de partage, etc.
    const networkButtons = document.querySelectorAll('.network-dependent');
    networkButtons.forEach(button => {
        button.disabled = false;
        button.title = button.dataset.originalTitle || '';
    });
}

// Fonction pour désactiver les fonctionnalités réseau
function disableNetworkFeatures() {
    // Désactiver les boutons d'upload, de partage, etc.
    const networkButtons = document.querySelectorAll('.network-dependent');
    networkButtons.forEach(button => {
        if (!button.dataset.originalTitle) {
            button.dataset.originalTitle = button.title || '';
        }
        button.disabled = true;
        button.title = 'Non disponible en mode hors ligne';
    });
}

// Fonction pour vérifier les mises à jour
function checkForUpdates() {
    // Cette fonction est un placeholder pour l'instant
    // Elle pourrait vérifier si de nouvelles versions de l'application sont disponibles
}

// Fonction pour valider l'intégration globale
function validateGlobalIntegration() {
    console.log('Validation de l\'intégration globale...');
    
    // Liste des tests à effectuer
    const integrationTests = [
        { name: 'Chargement de l\'interface', test: testUILoading },
        { name: 'Fonctionnalités de base', test: testBasicFunctionality },
        { name: 'Intégration des graphiques', test: testChartIntegration },
        { name: 'Fonctionnalités d\'export', test: testExportFunctionality },
        { name: 'Mode batch', test: testBatchMode },
        { name: 'Partage de résultats', test: testSharingFunctionality },
        { name: 'Mode présentation', test: testPresentationMode }
    ];
    
    // Exécuter les tests
    let passedTests = 0;
    let failedTests = [];
    
    integrationTests.forEach(test => {
        try {
            const result = test.test();
            if (result) {
                console.log(`✓ Test réussi: ${test.name}`);
                passedTests++;
            } else {
                console.warn(`✗ Test échoué: ${test.name}`);
                failedTests.push(test.name);
            }
        } catch (error) {
            console.error(`✗ Erreur lors du test ${test.name}:`, error);
            failedTests.push(test.name);
        }
    });
    
    // Afficher le résultat global
    console.log(`Tests d'intégration: ${passedTests}/${integrationTests.length} réussis`);
    
    if (failedTests.length > 0) {
        console.warn('Tests échoués:', failedTests.join(', '));
        
        // Afficher un avertissement à l'utilisateur
        showWarningWithAction(
            'Certaines fonctionnalités peuvent ne pas fonctionner correctement.',
            'Détails',
            () => {
                showErrorWithSuggestions(
                    'Problèmes détectés dans les fonctionnalités suivantes',
                    failedTests.map(test => `${test}: Veuillez recharger la page ou contacter le support`)
                );
            }
        );
    } else {
        console.log('Tous les tests d\'intégration ont réussi!');
    }
    
    return passedTests === integrationTests.length;
}

// Fonctions de test individuelles
function testUILoading() {
    // Vérifier que les éléments d'interface principaux sont chargés
    const requiredElements = [
        'file-input',
        'comparison-table',
        'graph-zone',
        'boxplot-zone'
    ];
    
    return requiredElements.every(id => document.getElementById(id) !== null);
}

function testBasicFunctionality() {
    // Vérifier que les fonctions de base sont disponibles
    return typeof handleFiles === 'function' && 
           typeof updateComparisonTable === 'function' && 
           typeof displayResults === 'function';
}

function testChartIntegration() {
    // Vérifier l'intégration des graphiques
    return typeof Chart !== 'undefined' && 
           typeof createBoxplots === 'function' && 
           typeof createIVChart === 'function';
}

function testExportFunctionality() {
    // Vérifier les fonctionnalités d'export
    return typeof generatePDF === 'function' && 
           typeof exportToCSV === 'function' && 
           typeof exportToExcel === 'function';
}

function testBatchMode() {
    // Vérifier le mode batch
    return typeof processBatchFiles === 'function';
}

function testSharingFunctionality() {
    // Vérifier les fonctionnalités de partage
    return typeof generateShareableLink === 'function' && 
           typeof checkForSharedResults === 'function';
}

function testPresentationMode() {
    // Vérifier le mode présentation
    return typeof togglePresentationMode === 'function';
}

// Exécuter la validation après un délai pour permettre le chargement complet
setTimeout(validateGlobalIntegration, 5000);
