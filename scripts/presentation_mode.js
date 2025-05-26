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
            background-color: var(--bg-color);
            z-index: 2000;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            color: var(--text-color);
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
            transition: opacity 0.5s, transform 0.5s;
            overflow: auto;
            transform: translateX(100%);
        }
        
        .presentation-slide.active {
            opacity: 1;
            z-index: 1;
            transform: translateX(0);
        }
        
        .presentation-slide.prev {
            transform: translateX(-100%);
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
            background-color: var(--bg-color);
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
        
        .presentation-method-card {
            background-color: var(--bg-color);
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 20px;
            margin-bottom: 20px;
            width: 100%;
        }
        
        .presentation-method-title {
            font-size: 24px;
            margin-bottom: 15px;
            color: var(--primary-color);
        }
        
        .presentation-method-params {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .presentation-param-item {
            display: flex;
            flex-direction: column;
        }
        
        .presentation-param-label {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .presentation-param-value {
            font-family: monospace;
        }
        
        .presentation-method-chart {
            width: 100%;
            height: 300px;
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
            
            .presentation-method-params {
                grid-template-columns: 1fr;
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
    
    // Appliquer le thème actuel
    if (document.body.classList.contains('dark-theme')) {
        presentationContainer.classList.add('dark-theme');
    }
    
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
    
    // Récupérer le résultat actuel
    const currentResult = allResults[0]; // Utiliser le premier résultat par défaut
    
    // Diapositive 1: Nom du fichier
    const slide1 = createPresentationSlide(`Fichier: ${currentResult.filename}`);
    const slide1Content = document.createElement('div');
    slide1Content.className = 'presentation-slide-content';
    
    const fileInfo = document.createElement('div');
    fileInfo.className = 'presentation-file-info';
    fileInfo.innerHTML = `
        <p>Nom du fichier: <strong>${currentResult.filename}</strong></p>
        <p>Méthodes d'analyse: <strong>${Object.keys(currentResult.methods).map(key => methodToName(key)).join(', ')}</strong></p>
    `;
    
    slide1Content.appendChild(fileInfo);
    slide1.appendChild(slide1Content);
    
    // Diapositive 2: Courbe générale
    const slide2 = createPresentationSlide('Courbe générale');
    const slide2Content = document.createElement('div');
    slide2Content.className = 'presentation-slide-content';
    
    const curveContainer = document.createElement('div');
    curveContainer.className = 'presentation-chart-container';
    
    if (currentResult.images && currentResult.images.all) {
        const curveImage = document.createElement('img');
        curveImage.src = 'data:image/png;base64,' + currentResult.images.all;
        curveImage.style.objectFit = 'contain';
        
        curveImage.className = 'presentation-chart';
        curveContainer.appendChild(curveImage);
    } else {
        curveContainer.innerHTML = '<p>Courbe générale non disponible</p>';
    }
    
    slide2Content.appendChild(curveContainer);
    slide2.appendChild(slide2Content);
    
    // Diapositives pour chaque méthode
    const methods = [
        { key: 'rand', name: 'Fit Classique' },
        { key: 'mlp', name: 'MLP' },
        { key: 'cnn', name: 'CNN' },
        { key: 'gen', name: 'Génétique' }
    ];
    
    methods.forEach(method => {
        if (currentResult.methods[method.key]) {
            const methodSlide = createPresentationSlide(`Méthode: ${method.name}`);
            const methodContent = document.createElement('div');
            methodContent.className = 'presentation-slide-content';
            
            const methodCard = document.createElement('div');
            methodCard.className = 'presentation-method-card';
            
            const methodTitle = document.createElement('h3');
            methodTitle.className = 'presentation-method-title';
            methodTitle.textContent = method.name;
            
            const methodParams = document.createElement('div');
            methodParams.className = 'presentation-method-params';
            
            // Ajouter les paramètres
            const params = currentResult.methods[method.key];
            for (const [paramKey, paramValue] of Object.entries(params)) {
                const paramItem = document.createElement('div');
                paramItem.className = 'presentation-param-item';
                
                const paramLabel = document.createElement('div');
                paramLabel.className = 'presentation-param-label';
                paramLabel.textContent = paramKey;
                
                const paramValueElem = document.createElement('div');
                paramValueElem.className = 'presentation-param-value';
                paramValueElem.textContent = formatNumber(paramValue);
                
                paramItem.appendChild(paramLabel);
                paramItem.appendChild(paramValueElem);
                methodParams.appendChild(paramItem);
            }
            
            // Ajouter la courbe isolée
            const methodChartContainer = document.createElement('div');
            methodChartContainer.className = 'presentation-method-chart';
            
            // Cloner la courbe de la méthode
            const methodCurveElement = document.querySelector(`#${method.key}-method .curve-image`);
            if (currentResult.images && currentResult.images[method.key]) {
                const methodImage = document.createElement('img');
                methodImage.src = 'data:image/png;base64,' + currentResult.images[method.key];
                methodImage.style.objectFit = 'contain';
                methodChartContainer.appendChild(methodImage);
            } else {
                methodChartContainer.innerHTML = '<p>Courbe non disponible</p>';
            }
            
            methodCard.appendChild(methodTitle);
            methodCard.appendChild(methodParams);
            methodCard.appendChild(methodChartContainer);
            
            methodContent.appendChild(methodCard);
            methodSlide.appendChild(methodContent);
        }
    });
    
    // Diapositive: Tableau comparatif
    const tableSlide = createPresentationSlide('Tableau comparatif');
    const tableContent = document.createElement('div');
    tableContent.className = 'presentation-slide-content';
    
    // Cloner le tableau de comparaison
    const comparisonTable = document.getElementById('comparison-table');
    if (comparisonTable) {
        const tableClone = comparisonTable.cloneNode(true);
        tableClone.className = 'presentation-slide-table';
        tableContent.appendChild(tableClone);
    } else {
        tableContent.innerHTML = '<p>Tableau de comparaison non disponible</p>';
    }
    
    tableSlide.appendChild(tableContent);
    
    // Diapositives: Boîtes à moustaches (1 par paramètre)
    const parameters = ['J0', 'Jph', 'Rs', 'Rsh', 'n'];
    
    parameters.forEach(paramKey => {
        const boxplotSlide = createPresentationSlide(`Distribution de ${paramKey}`);
        const boxplotContent = document.createElement('div');
        boxplotContent.className = 'presentation-slide-content';
    
        const boxplotContainer = document.createElement('div');
        boxplotContainer.className = 'presentation-chart-container';
    
        const canvas = document.createElement('canvas');
        canvas.id = `${paramKey}-boxplot-canvas`;
        canvas.className = 'presentation-chart';
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '80%';
        boxplotContainer.appendChild(canvas);
    
        boxplotContent.appendChild(boxplotContainer);
        boxplotSlide.appendChild(boxplotContent);
    });

    
    // Activer la première diapositive
    if (presentationMode.slides.length > 0) {
        presentationMode.slides[0].classList.add('active');
    }
}

// Fonction pour créer une diapositive
function createPresentationSlide(title) {
    const slide = document.createElement('div');
    slide.className = 'presentation-slide';
    
    const slideTitle = document.createElement('h2');
    slideTitle.className = 'presentation-slide-title';
    slideTitle.textContent = title;
    
    slide.appendChild(slideTitle);
    
    // Ajouter la diapositive au conteneur
    const container = presentationMode.container.querySelector('.presentation-content');
    if (container) {
        container.appendChild(slide);
    }
    
    // Ajouter la diapositive à la liste
    presentationMode.slides.push(slide);
    
    return slide;
}

// Fonction pour naviguer entre les diapositives
function navigatePresentation(direction) {
    // Calculer le nouvel index
    const newIndex = presentationMode.currentSlide + direction;
    
    // Vérifier si l'index est valide
    if (newIndex < 0 || newIndex >= presentationMode.slides.length) {
        return;
    }
    
    // Mettre à jour les classes pour l'animation
    const currentSlide = presentationMode.slides[presentationMode.currentSlide];
    const nextSlide = presentationMode.slides[newIndex];
    
    // Déterminer la direction de l'animation
    if (direction > 0) {
        // Vers la droite
        currentSlide.classList.remove('active');
        currentSlide.classList.add('prev');
        nextSlide.classList.remove('prev');
        nextSlide.classList.add('active');
    } else {
        // Vers la gauche
        currentSlide.classList.remove('active');
        nextSlide.classList.remove('prev');
        nextSlide.classList.add('active');
        
        // Ajouter un délai pour réinitialiser la classe prev
        setTimeout(() => {
            currentSlide.classList.add('prev');
        }, 50);
    }
    
    // Mettre à jour l'index courant
    presentationMode.currentSlide = newIndex;
    
    // Mettre à jour la pagination
    updatePresentationPagination();
    
    // Mettre à jour l'état des boutons de navigation
    updateNavigationButtons();
    
    // Initialiser les graphiques si nécessaire
    initializeSlideCharts(newIndex);
}

// Fonction pour mettre à jour la pagination
function updatePresentationPagination() {
    const paginationElement = document.getElementById('presentation-pagination');
    if (paginationElement) {
        paginationElement.textContent = `Diapositive ${presentationMode.currentSlide + 1} / ${presentationMode.slides.length}`;
    }
}

// Fonction pour mettre à jour l'état des boutons de navigation
function updateNavigationButtons() {
    const prevButton = document.getElementById('presentation-prev');
    const nextButton = document.getElementById('presentation-next');
    
    if (prevButton) {
        prevButton.disabled = presentationMode.currentSlide === 0;
    }
    
    if (nextButton) {
        nextButton.disabled = presentationMode.currentSlide === presentationMode.slides.length - 1;
    }
}

// Fonction pour initialiser les graphiques d'une diapositive
function initializeSlideCharts(slideIndex) {
    const slide = presentationMode.slides[slideIndex];
    if (!slide) return;
    
    // Vérifier s'il y a un graphique radar à initialiser
    const radarCanvas = slide.querySelector('#presentation-radar-chart');
    if (radarCanvas && !radarCanvas._chartInitialized) {
        // Initialiser le graphique radar
        createRadarChart(radarCanvas);
        radarCanvas._chartInitialized = true;
    }
    
    // Autres initialisations de graphiques si nécessaire
}

// Fonction pour créer un graphique radar
function createRadarChart(canvas) {
    // Cette fonction dépend de la structure des données et des bibliothèques de graphiques utilisées
    // Implémentation à adapter selon les besoins
}

// Fonction pour quitter le mode présentation
function exitPresentationMode() {
    if (!presentationMode.active) return;
    
    // Supprimer le conteneur du mode présentation
    if (presentationMode.container) {
        presentationMode.container.remove();
    }
    
    // Réinitialiser l'état du mode présentation
    presentationMode.active = false;
    presentationMode.currentSlide = 0;
    presentationMode.slides = [];
    presentationMode.container = null;
    
    // Quitter le mode plein écran si actif
    exitFullscreen();
}

// Fonction pour gérer les touches clavier en mode présentation
function handlePresentationKeydown(event) {
    if (!presentationMode.active) return;
    
    switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
            navigatePresentation(1);
            event.preventDefault();
            break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
            navigatePresentation(-1);
            event.preventDefault();
            break;
        case 'Escape':
            exitPresentationMode();
            event.preventDefault();
            break;
        case 'Home':
            // Aller à la première diapositive
            while (presentationMode.currentSlide > 0) {
                navigatePresentation(-1);
            }
            event.preventDefault();
            break;
        case 'End':
            // Aller à la dernière diapositive
            while (presentationMode.currentSlide < presentationMode.slides.length - 1) {
                navigatePresentation(1);
            }
            event.preventDefault();
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
    if (!document.fullscreenElement &&
        !document.mozFullScreenElement &&
        !document.webkitFullscreenElement &&
        !document.msFullscreenElement) {
        // Entrer en mode plein écran
        requestFullscreen(presentationMode.container);
    } else {
        // Quitter le mode plein écran
        exitFullscreen();
    }
}
