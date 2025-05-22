// Fonctions pour le mode batch (traitement de fichiers multiples)
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le mode batch
    setupBatchMode();
});

// Configuration du mode batch
function setupBatchMode() {
    // Créer un conteneur pour le switch box du mode batch
    const batchSwitchContainer = document.createElement('div');
    batchSwitchContainer.className = 'display-toggle batch-toggle';
    
    // Créer la checkbox pour le switch
    const batchCheckbox = document.createElement('input');
    batchCheckbox.type = 'checkbox';
    batchCheckbox.id = 'batch-mode-toggle';
    batchCheckbox.className = 'toggle-checkbox';
    
    // Créer le label pour le switch
    const batchLabel = document.createElement('label');
    batchLabel.htmlFor = 'batch-mode-toggle';
    batchLabel.className = 'toggle-label';
    batchLabel.textContent = 'Mode batch';
    
    // Assembler le switch
    batchSwitchContainer.appendChild(batchCheckbox);
    batchSwitchContainer.appendChild(batchLabel);
    
    // Ajouter le switch à côté du sélecteur de fichier
    const uploadControls = document.querySelector('.upload-controls');
    if (uploadControls) {
        uploadControls.appendChild(batchSwitchContainer);
    }
    
    // Ajouter un gestionnaire d'événements pour le switch
    batchCheckbox.addEventListener('change', toggleBatchMode);
    
    // Créer le bouton pour ouvrir le modal de la liste des fichiers
    const batchListButton = document.createElement('button');
    batchListButton.id = 'batch-list-btn';
    batchListButton.className = 'action-button hidden';
    batchListButton.innerHTML = '<i class="fas fa-list"></i> Liste des fichiers';
    batchListButton.title = 'Afficher la liste des fichiers en attente';
    
    // Ajouter le bouton dans la section des actions
    const actionsContainer = document.querySelector('.actions-container');
    if (actionsContainer) {
        actionsContainer.appendChild(batchListButton);
    }
    
    // Ajouter un gestionnaire d'événements pour le bouton de liste
    batchListButton.addEventListener('click', showBatchModal);
    
    // Ajouter des styles CSS pour le mode batch
    const style = document.createElement('style');
    style.textContent = `
        .batch-toggle {
            margin-left: 10px;
        }
        
        .batch-mode-active #file-input + label {
            background-color: var(--accent-color);
        }
        
        #batch-list-btn {
            background-color: var(--primary-color);
            color: white;
        }
        
        #batch-list-btn:hover {
            background-color: var(--accent-color);
        }
        
        .batch-files-list {
            margin-top: 10px;
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 10px;
            background-color: var(--card-background);
        }
        
        .batch-file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .batch-file-item:last-child {
            border-bottom: none;
        }
        
        .batch-file-name {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding: 0 10px;
        }
        
        .batch-file-status {
            margin-left: 10px;
            font-size: 0.8em;
            padding: 2px 6px;
            border-radius: 10px;
            background-color: var(--border-color);
        }
        
        .batch-file-status.pending {
            background-color: var(--border-color);
            color: var(--text-color);
        }
        
        .batch-file-status.processing {
            background-color: var(--warning-color);
            color: white;
        }
        
        .batch-file-status.done {
            background-color: var(--success-color);
            color: white;
        }
        
        .batch-file-status.error {
            background-color: var(--error-color);
            color: white;
        }
        
        .batch-file-actions {
            display: flex;
            gap: 5px;
        }
        
        .batch-file-btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 3px 8px;
            cursor: pointer;
            font-size: 0.8em;
        }
        
        .batch-file-btn.process {
            background-color: var(--success-color);
        }
        
        .batch-file-btn.remove {
            background-color: var(--error-color);
        }
        
        .batch-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
        }
        
        .batch-progress {
            height: 6px;
            width: 100%;
            background-color: var(--border-color);
            border-radius: 3px;
            margin-top: 10px;
            overflow: hidden;
        }
        
        .batch-progress-bar {
            height: 100%;
            background-color: var(--primary-color);
            width: 0;
            transition: width 0.3s ease;
        }
        
        .batch-progress-text {
            text-align: center;
            font-size: 0.8em;
            margin-top: 5px;
        }
        
        #process-batch-btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 15px;
            cursor: pointer;
            font-weight: 500;
        }
        
        #clear-batch-btn {
            background-color: var(--border-color);
            color: var(--text-color);
            border: none;
            border-radius: 4px;
            padding: 8px 15px;
            cursor: pointer;
            font-weight: 500;
        }
        
        .batch-summary {
            margin-top: 15px;
            padding: 10px;
            background-color: rgba(0, 0, 0, 0.05);
            border-radius: 4px;
        }
        
        .batch-summary h4 {
            margin-top: 0;
            margin-bottom: 10px;
        }
        
        .batch-summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        
        .batch-summary-label {
            font-weight: 500;
        }
        
        .batch-summary-value {
            font-weight: 400;
        }
        
        /* Styles pour le mode comparaison */
        .comparison-mode-container {
            margin-top: 15px;
            padding: 10px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            background-color: var(--card-background);
        }
        
        .comparison-mode-title {
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .comparison-file-selectors {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .comparison-file-selector {
            flex: 1;
        }
        
        .comparison-file-selector select {
            width: 100%;
            padding: 5px;
            border-radius: 4px;
            border: 1px solid var(--border-color);
        }
        
        .comparison-results {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .comparison-charts {
            display: flex;
            gap: 10px;
        }
        
        .comparison-chart {
            flex: 1;
            min-height: 200px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 10px;
        }
        
        .comparison-params {
            display: flex;
            gap: 10px;
        }
        
        .comparison-param-table {
            flex: 1;
            border-collapse: collapse;
            width: 100%;
        }
        
        .comparison-param-table th,
        .comparison-param-table td {
            padding: 5px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        
        .comparison-param-table th {
            background-color: var(--primary-color);
            color: white;
        }
    `;
    
    document.head.appendChild(style);
}

// Variables pour le mode batch
let batchModeActive = false;
let batchFiles = [];
let batchResults = [];
let processingBatch = false;

// Fonction pour activer/désactiver le mode batch
function toggleBatchMode() {
    batchModeActive = !batchModeActive;
    
    // Mettre à jour l'apparence du bouton de liste
    const batchListButton = document.getElementById('batch-list-btn');
    if (batchListButton) {
        if (batchModeActive) {
            batchListButton.classList.remove('hidden');
            document.body.classList.add('batch-mode-active');
            
            // Modifier le comportement du sélecteur de fichier
            const fileInput = document.getElementById('file-input');
            if (fileInput) {
                fileInput.multiple = true;
                
                // Sauvegarder le gestionnaire d'événements original
                if (!fileInput._originalOnChange) {
                    fileInput._originalOnChange = fileInput.onchange;
                }
                
                // Remplacer par notre gestionnaire pour le mode batch
                fileInput.onchange = handleBatchFiles;
            }
        } else {
            batchListButton.classList.add('hidden');
            document.body.classList.remove('batch-mode-active');
            
            // Restaurer le comportement original du sélecteur de fichier
            const fileInput = document.getElementById('file-input');
            if (fileInput) {
                fileInput.multiple = false;
                
                // Restaurer le gestionnaire d'événements original
                if (fileInput._originalOnChange) {
                    fileInput.onchange = fileInput._originalOnChange;
                }
            }
            
            // Désactiver le mode comparaison s'il est actif
            disableComparisonMode();
        }
    }
    
    // Mettre à jour le statut
    if (batchModeActive) {
        showToast('Mode batch activé', 'info');
    } else {
        showToast('Mode batch désactivé', 'info');
    }
}

// Fonction pour afficher le modal de la liste des fichiers batch
function showBatchModal() {
    const batchModal = document.getElementById('batch-modal');
    if (!batchModal) {
        createBatchModal();
    } else {
        updateBatchFilesList();
        batchModal.classList.remove('hidden');
    }
}

// Fonction pour créer le modal de la liste des fichiers batch
function createBatchModal() {
    // Créer le modal
    const modal = document.createElement('div');
    modal.id = 'batch-modal';
    modal.className = 'modal';
    
    // Créer le contenu du modal
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Ajouter le bouton de fermeture
    const closeButton = document.createElement('span');
    closeButton.id = 'batch-modal-close';
    closeButton.className = 'modal-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    // Ajouter le titre
    const title = document.createElement('h3');
    title.textContent = 'Mode batch - Liste des fichiers';
    
    // Créer la liste des fichiers
    const filesList = document.createElement('div');
    filesList.className = 'batch-files-list';
    filesList.id = 'batch-files-list';
    
    // Créer la barre de progression
    const progressContainer = document.createElement('div');
    progressContainer.className = 'batch-progress';
    
    const progressBar = document.createElement('div');
    progressBar.id = 'batch-progress-bar';
    progressBar.className = 'batch-progress-bar';
    
    progressContainer.appendChild(progressBar);
    
    const progressText = document.createElement('div');
    progressText.id = 'batch-progress-text';
    progressText.className = 'batch-progress-text';
    progressText.textContent = '0%';
    
    // Créer les boutons d'action
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'batch-actions';
    
    const processButton = document.createElement('button');
    processButton.id = 'process-batch-btn';
    processButton.innerHTML = '<i class="fas fa-play"></i> Traiter tous les fichiers';
    processButton.addEventListener('click', processBatchFiles);
    
    const clearButton = document.createElement('button');
    clearButton.id = 'clear-batch-btn';
    clearButton.innerHTML = '<i class="fas fa-trash"></i> Vider la liste';
    clearButton.addEventListener('click', clearBatchFiles);
    
    actionsContainer.appendChild(clearButton);
    actionsContainer.appendChild(processButton);
    
    // Créer la section pour le mode comparaison
    const comparisonContainer = document.createElement('div');
    comparisonContainer.id = 'comparison-mode-container';
    comparisonContainer.className = 'comparison-mode-container hidden';
    
    const comparisonTitle = document.createElement('div');
    comparisonTitle.className = 'comparison-mode-title';
    comparisonTitle.textContent = 'Mode comparaison';
    
    const comparisonSelectors = document.createElement('div');
    comparisonSelectors.className = 'comparison-file-selectors';
    
    const selector1Container = document.createElement('div');
    selector1Container.className = 'comparison-file-selector';
    
    const selector1Label = document.createElement('label');
    selector1Label.htmlFor = 'comparison-file-1';
    selector1Label.textContent = 'Fichier 1:';
    
    const selector1 = document.createElement('select');
    selector1.id = 'comparison-file-1';
    
    selector1Container.appendChild(selector1Label);
    selector1Container.appendChild(selector1);
    
    const selector2Container = document.createElement('div');
    selector2Container.className = 'comparison-file-selector';
    
    const selector2Label = document.createElement('label');
    selector2Label.htmlFor = 'comparison-file-2';
    selector2Label.textContent = 'Fichier 2:';
    
    const selector2 = document.createElement('select');
    selector2.id = 'comparison-file-2';
    
    selector2Container.appendChild(selector2Label);
    selector2Container.appendChild(selector2);
    
    comparisonSelectors.appendChild(selector1Container);
    comparisonSelectors.appendChild(selector2Container);
    
    const compareButton = document.createElement('button');
    compareButton.id = 'compare-files-btn';
    compareButton.className = 'action-button';
    compareButton.innerHTML = '<i class="fas fa-search"></i> Comparer';
    compareButton.addEventListener('click', compareSelectedFiles);
    
    const comparisonResults = document.createElement('div');
    comparisonResults.id = 'batch-comparison-results';
    comparisonResults.className = 'comparison-results hidden';
    
    comparisonContainer.appendChild(comparisonTitle);
    comparisonContainer.appendChild(comparisonSelectors);
    comparisonContainer.appendChild(compareButton);
    comparisonContainer.appendChild(comparisonResults);
    
    // Assembler le contenu du modal
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(filesList);
    modalContent.appendChild(progressContainer);
    modalContent.appendChild(progressText);
    modalContent.appendChild(actionsContainer);
    modalContent.appendChild(comparisonContainer);
    
    // Assembler le modal
    modal.appendChild(modalContent);
    
    // Ajouter le modal au document
    document.body.appendChild(modal);
    
    // Mettre à jour la liste des fichiers
    updateBatchFilesList();
    
    // Afficher le modal
    modal.classList.remove('hidden');
}

// Fonction pour mettre à jour la liste des fichiers batch
function updateBatchFilesList() {
    const filesList = document.getElementById('batch-files-list');
    if (!filesList) return;
    
    // Vider la liste
    filesList.innerHTML = '';
    
    // Ajouter un titre
    if (batchFiles.length === 0) {
        filesList.innerHTML = '<p>Aucun fichier sélectionné. Utilisez le bouton "Sélectionner des fichiers CSV" pour ajouter des fichiers.</p>';
    } else {
        // Ajouter les fichiers à la liste
        batchFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'batch-file-item';
            
            const fileName = document.createElement('div');
            fileName.className = 'batch-file-name';
            fileName.textContent = file.name;
            
            const fileStatus = document.createElement('div');
            fileStatus.className = 'batch-file-status pending';
            fileStatus.textContent = 'En attente';
            
            const fileActions = document.createElement('div');
            fileActions.className = 'batch-file-actions';
            
            const processButton = document.createElement('button');
            processButton.className = 'batch-file-btn process';
            processButton.innerHTML = '<i class="fas fa-play"></i>';
            processButton.title = 'Traiter ce fichier';
            processButton.addEventListener('click', () => processIndividualFile(index));
            
            const removeButton = document.createElement('button');
            removeButton.className = 'batch-file-btn remove';
            removeButton.innerHTML = '<i class="fas fa-times"></i>';
            removeButton.title = 'Supprimer ce fichier';
            removeButton.addEventListener('click', () => removeFileFromBatch(index));
            
            fileActions.appendChild(processButton);
            fileActions.appendChild(removeButton);
            
            fileItem.appendChild(fileName);
            fileItem.appendChild(fileStatus);
            fileItem.appendChild(fileActions);
            
            filesList.appendChild(fileItem);
        });
    }
    
    // Mettre à jour les sélecteurs du mode comparaison
    updateComparisonSelectors();
    
    // Afficher/masquer le conteneur du mode comparaison
    const comparisonContainer = document.getElementById('comparison-mode-container');
    if (comparisonContainer) {
        if (batchFiles.length >= 2) {
            comparisonContainer.classList.remove('hidden');
        } else {
            comparisonContainer.classList.add('hidden');
        }
    }
}

// Fonction pour gérer la sélection de fichiers en mode batch
function handleBatchFiles(event) {
    const files = event.target.files;
    
    if (!files.length) {
        return;
    }
    
    // Filtrer pour ne garder que les fichiers CSV
    const csvFiles = Array.from(files).filter(file => file.name.endsWith('.csv'));
    
    if (csvFiles.length === 0) {
        showToast('Aucun fichier CSV sélectionné', 'error');
        return;
    }
    
    // Ajouter les fichiers à la liste
    batchFiles = [...batchFiles, ...csvFiles];
    
    // Mettre à jour l'affichage
    updateBatchFilesList();
    
    // Mettre à jour le statut
    document.getElementById('current-file').textContent = `${batchFiles.length} fichiers sélectionnés`;
    
    showToast(`${csvFiles.length} fichiers CSV ajoutés à la liste`, 'success');
    
    // Afficher le modal de la liste des fichiers
    showBatchModal();
}

// Fonction pour effacer la liste des fichiers batch
function clearBatchFiles() {
    if (processingBatch) {
        showToast('Impossible d\'effacer la liste pendant le traitement', 'error');
        return;
    }
    
    batchFiles = [];
    batchResults = [];
    
    // Mettre à jour l'affichage
    updateBatchFilesList();
    
    // Mettre à jour le statut
    document.getElementById('current-file').textContent = 'Aucun fichier sélectionné';
    
    // Désactiver le mode comparaison
    disableComparisonMode();
    
    showToast('Liste de fichiers effacée', 'info');
}

// Fonction pour supprimer un fichier de la liste batch
function removeFileFromBatch(index) {
    if (processingBatch) {
        showToast('Impossible de supprimer un fichier pendant le traitement', 'error');
        return;
    }
    
    if (index >= 0 && index < batchFiles.length) {
        const fileName = batchFiles[index].name;
        batchFiles.splice(index, 1);
        
        // Mettre à jour l'affichage
        updateBatchFilesList();
        
        // Mettre à jour le statut
        document.getElementById('current-file').textContent = batchFiles.length > 0 
            ? `${batchFiles.length} fichiers sélectionnés` 
            : 'Aucun fichier sélectionné';
        
        showToast(`Fichier "${fileName}" supprimé de la liste`, 'info');
    }
}

// Fonction pour traiter un fichier individuel
async function processIndividualFile(index) {
    if (processingBatch) {
        showToast('Impossible de traiter un fichier pendant le traitement batch', 'error');
        return;
    }
    
    if (index < 0 || index >= batchFiles.length) {
        showToast('Fichier invalide', 'error');
        return;
    }
    
    const file = batchFiles[index];
    
    // Mettre à jour le statut du fichier
    updateBatchFileStatus(index, 'processing');
    
    try {
        // Traiter le fichier
        await processFile(file);
        
        // Mettre à jour le statut du fichier
        updateBatchFileStatus(index, 'done');
        
        showToast(`Fichier "${file.name}" traité avec succès`, 'success');
    } catch (error) {
        console.error(`Erreur lors du traitement du fichier ${file.name}:`, error);
        
        // Mettre à jour le statut du fichier
        updateBatchFileStatus(index, 'error');
        
        showToast(`Erreur lors du traitement du fichier "${file.name}"`, 'error');
    }
}

// Fonction pour traiter tous les fichiers en mode batch
async function processBatchFiles() {
    if (processingBatch) {
        showToast('Traitement déjà en cours', 'warning');
        return;
    }
    
    if (batchFiles.length === 0) {
        showToast('Aucun fichier à traiter', 'error');
        return;
    }
    
    processingBatch = true;
    batchResults = [];
    
    // Mettre à jour le statut
    updateProcessingStatus("processing");
    
    // Mettre à jour les placeholders
    updatePlaceholder("#graph-zone", "Traitement batch en cours...");
    updatePlaceholder("#random-method", "Traitement batch en cours...");
    updatePlaceholder("#mlp-method", "Traitement batch en cours...");
    updatePlaceholder("#cnn-method", "Traitement batch en cours...");
    updatePlaceholder("#genetic-method", "Traitement batch en cours...");
    
    // Désactiver les boutons pendant le traitement
    const processButton = document.getElementById('process-batch-btn');
    const clearButton = document.getElementById('clear-batch-btn');
    if (processButton) processButton.disabled = true;
    if (clearButton) clearButton.disabled = true;
    
    try {
        // Utiliser l'API batch-predict si disponible
        if (typeof API_URL !== 'undefined' && API_URL.includes('/predict')) {
            const batchApiUrl = API_URL.replace('/predict', '/batch-predict');
            await processBatchWithApi(batchApiUrl);
        } else {
            // Fallback: traiter les fichiers un par un
            await processBatchSequentially();
        }
        
        // Afficher un résumé des résultats
        displayBatchSummary();
        
        showToast('Traitement batch terminé', 'success');
    } catch (error) {
        console.error('Erreur lors du traitement batch:', error);
        showToast('Erreur lors du traitement batch', 'error');
    } finally {
        processingBatch = false;
        
        // Réactiver les boutons
        if (processButton) processButton.disabled = false;
        if (clearButton) clearButton.disabled = false;
        
        // Mettre à jour le statut
        updateProcessingStatus("done");
    }
}

// Fonction pour traiter les fichiers avec l'API batch
async function processBatchWithApi(batchApiUrl) {
    // Créer un FormData avec tous les fichiers
    const formData = new FormData();
    batchFiles.forEach(file => {
        formData.append('files', file);
    });
    
    try {
        // Mettre à jour tous les statuts en "processing"
        updateAllBatchFileStatuses('processing');
        
        // Envoyer la requête
        const response = await fetch(batchApiUrl, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.results && Array.isArray(data.results)) {
            // Traiter les résultats
            batchResults = data.results;
            
            // Mettre à jour les statuts des fichiers
            batchResults.forEach((result, index) => {
                const status = result.error ? 'error' : 'done';
                updateBatchFileStatus(index, status);
            });
            
            // Mettre à jour la barre de progression
            updateBatchProgress(100);
            
            // Stocker les résultats pour les boxplots
            storeBatchResults(batchResults);
            
            // Créer les boxplots
            createBoxplots();
        } else {
            throw new Error('Format de réponse invalide');
        }
    } catch (error) {
        console.error('Erreur lors du traitement batch avec l\'API:', error);
        updateAllBatchFileStatuses('error');
        throw error;
    }
}

// Fonction pour traiter les fichiers séquentiellement
async function processBatchSequentially() {
    for (let i = 0; i < batchFiles.length; i++) {
        // Mettre à jour la barre de progression
        updateBatchProgress((i / batchFiles.length) * 100);
        
        // Mettre à jour le statut du fichier
        updateBatchFileStatus(i, 'processing');
        
        try {
            // Traiter le fichier
            const result = await processFile(batchFiles[i]);
            batchResults.push(result);
            
            // Mettre à jour le statut du fichier
            updateBatchFileStatus(i, 'done');
        } catch (error) {
            console.error(`Erreur lors du traitement du fichier ${batchFiles[i].name}:`, error);
            batchResults.push({ filename: batchFiles[i].name, error: error.message });
            
            // Mettre à jour le statut du fichier
            updateBatchFileStatus(i, 'error');
        }
    }
    
    // Mettre à jour la barre de progression
    updateBatchProgress(100);
    
    // Stocker les résultats pour les boxplots
    storeBatchResults(batchResults);
    
    // Créer les boxplots
    createBoxplots();
}

// Fonction pour mettre à jour la barre de progression
function updateBatchProgress(percentage) {
    const progressBar = document.getElementById('batch-progress-bar');
    const progressText = document.getElementById('batch-progress-text');
    
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${Math.round(percentage)}%`;
    }
}

// Fonction pour mettre à jour le statut d'un fichier
function updateBatchFileStatus(index, status) {
    const fileItems = document.querySelectorAll('.batch-file-item');
    
    if (index >= 0 && index < fileItems.length) {
        const statusElement = fileItems[index].querySelector('.batch-file-status');
        
        if (statusElement) {
            // Supprimer toutes les classes de statut
            statusElement.classList.remove('pending', 'processing', 'done', 'error');
            
            // Ajouter la classe correspondant au nouveau statut
            statusElement.classList.add(status);
            
            // Mettre à jour le texte
            switch (status) {
                case 'pending':
                    statusElement.textContent = 'En attente';
                    break;
                case 'processing':
                    statusElement.textContent = 'En cours';
                    break;
                case 'done':
                    statusElement.textContent = 'Terminé';
                    break;
                case 'error':
                    statusElement.textContent = 'Erreur';
                    break;
            }
        }
    }
}

// Fonction pour mettre à jour tous les statuts des fichiers
function updateAllBatchFileStatuses(status) {
    const fileItems = document.querySelectorAll('.batch-file-item');
    
    fileItems.forEach(item => {
        const statusElement = item.querySelector('.batch-file-status');
        
        if (statusElement) {
            // Supprimer toutes les classes de statut
            statusElement.classList.remove('pending', 'processing', 'done', 'error');
            
            // Ajouter la classe correspondant au nouveau statut
            statusElement.classList.add(status);
            
            // Mettre à jour le texte
            switch (status) {
                case 'pending':
                    statusElement.textContent = 'En attente';
                    break;
                case 'processing':
                    statusElement.textContent = 'En cours';
                    break;
                case 'done':
                    statusElement.textContent = 'Terminé';
                    break;
                case 'error':
                    statusElement.textContent = 'Erreur';
                    break;
            }
        }
    });
}

// Fonction pour afficher un résumé des résultats
function displayBatchSummary() {
    // À implémenter si nécessaire
}

// Fonctions pour le mode comparaison
function updateComparisonSelectors() {
    const selector1 = document.getElementById('comparison-file-1');
    const selector2 = document.getElementById('comparison-file-2');
    
    if (!selector1 || !selector2) return;
    
    // Vider les sélecteurs
    selector1.innerHTML = '';
    selector2.innerHTML = '';
    
    // Ajouter les options
    batchFiles.forEach((file, index) => {
        const option1 = document.createElement('option');
        option1.value = index;
        option1.textContent = file.name;
        
        const option2 = document.createElement('option');
        option2.value = index;
        option2.textContent = file.name;
        
        selector1.appendChild(option1);
        selector2.appendChild(option2);
    });
    
    // Sélectionner par défaut le premier et le deuxième fichier
    if (batchFiles.length >= 2) {
        selector1.value = 0;
        selector2.value = 1;
    }
}

// Fonction pour comparer deux fichiers sélectionnés
async function compareSelectedFiles() {
    const selector1 = document.getElementById('comparison-file-1');
    const selector2 = document.getElementById('comparison-file-2');
    
    if (!selector1 || !selector2) return;
    
    const index1 = parseInt(selector1.value);
    const index2 = parseInt(selector2.value);
    
    if (index1 === index2) {
        showToast('Veuillez sélectionner deux fichiers différents', 'error');
        return;
    }
    
    if (index1 < 0 || index1 >= batchFiles.length || index2 < 0 || index2 >= batchFiles.length) {
        showToast('Sélection de fichier invalide', 'error');
        return;
    }
    
    const file1 = batchFiles[index1];
    const file2 = batchFiles[index2];
    
    // Vérifier si les fichiers ont déjà été traités
    const result1 = batchResults.find(result => result.filename === file1.name);
    const result2 = batchResults.find(result => result.filename === file2.name);
    
    if (!result1 || !result2) {
        // Traiter les fichiers s'ils n'ont pas encore été traités
        showToast('Traitement des fichiers en cours...', 'info');
        
        if (!result1) {
            await processIndividualFile(index1);
        }
        
        if (!result2) {
            await processIndividualFile(index2);
        }
    }
    
    // Afficher la comparaison
    displayComparison(index1, index2);
}

// Fonction pour afficher la comparaison entre deux fichiers
function displayComparison(index1, index2) {
    const comparisonResults = document.getElementById('batch-comparison-results');
    if (!comparisonResults) return;
    
    // Vider le conteneur
    comparisonResults.innerHTML = '';
    
    // Créer les conteneurs pour les graphiques
    const chartsContainer = document.createElement('div');
    chartsContainer.className = 'comparison-charts';
    
    const chart1Container = document.createElement('div');
    chart1Container.className = 'comparison-chart';
    
    const chart1Canvas = document.createElement('canvas');
    chart1Canvas.id = 'comparison-chart-1';
    
    chart1Container.appendChild(chart1Canvas);
    
    const chart2Container = document.createElement('div');
    chart2Container.className = 'comparison-chart';
    
    const chart2Canvas = document.createElement('canvas');
    chart2Canvas.id = 'comparison-chart-2';
    
    chart2Container.appendChild(chart2Canvas);
    
    chartsContainer.appendChild(chart1Container);
    chartsContainer.appendChild(chart2Container);
    
    // Créer les conteneurs pour les paramètres
    const paramsContainer = document.createElement('div');
    paramsContainer.className = 'comparison-params';
    
    const params1Container = document.createElement('div');
    params1Container.className = 'comparison-param-table-container';
    
    const params1Table = document.createElement('table');
    params1Table.className = 'comparison-param-table';
    params1Table.id = 'comparison-params-1';
    
    params1Container.appendChild(params1Table);
    
    const params2Container = document.createElement('div');
    params2Container.className = 'comparison-param-table-container';
    
    const params2Table = document.createElement('table');
    params2Table.className = 'comparison-param-table';
    params2Table.id = 'comparison-params-2';
    
    params2Container.appendChild(params2Table);
    
    paramsContainer.appendChild(params1Container);
    paramsContainer.appendChild(params2Container);
    
    // Assembler le conteneur de résultats
    comparisonResults.appendChild(chartsContainer);
    comparisonResults.appendChild(paramsContainer);
    
    // Afficher le conteneur
    comparisonResults.classList.remove('hidden');
    
    // Charger les données et créer les graphiques
    loadComparisonData(index1, index2);
}

// Fonction pour charger les données de comparaison
function loadComparisonData(index1, index2) {
    const file1 = batchFiles[index1];
    const file2 = batchFiles[index2];
    
    // Récupérer les résultats
    const result1 = batchResults.find(result => result.filename === file1.name);
    const result2 = batchResults.find(result => result.filename === file2.name);
    
    if (!result1 || !result2) {
        showToast('Données de comparaison non disponibles', 'error');
        return;
    }
    
    // Créer les graphiques
    createComparisonCharts(result1, result2);
    
    // Créer les tableaux de paramètres
    createComparisonParamTables(result1, result2);
}

// Fonction pour créer les graphiques de comparaison
function createComparisonCharts(result1, result2) {
    // À implémenter selon les données disponibles
    // Cette fonction dépend de la structure des données et des bibliothèques de graphiques utilisées
}

// Fonction pour créer les tableaux de paramètres
function createComparisonParamTables(result1, result2) {
    const table1 = document.getElementById('comparison-params-1');
    const table2 = document.getElementById('comparison-params-2');
    
    if (!table1 || !table2) return;
    
    // Vider les tableaux
    table1.innerHTML = '';
    table2.innerHTML = '';
    
    // Créer les en-têtes
    const header1 = document.createElement('thead');
    header1.innerHTML = `
        <tr>
            <th colspan="2">${result1.filename}</th>
        </tr>
        <tr>
            <th>Paramètre</th>
            <th>Valeur</th>
        </tr>
    `;
    
    const header2 = document.createElement('thead');
    header2.innerHTML = `
        <tr>
            <th colspan="2">${result2.filename}</th>
        </tr>
        <tr>
            <th>Paramètre</th>
            <th>Valeur</th>
        </tr>
    `;
    
    table1.appendChild(header1);
    table2.appendChild(header2);
    
    // Créer les corps des tableaux
    const body1 = document.createElement('tbody');
    const body2 = document.createElement('tbody');
    
    // Ajouter les paramètres pour chaque méthode
    for (const [methodKey, methodParams] of Object.entries(result1.methods || {})) {
        const methodName = methodToName(methodKey);
        
        // Ajouter une ligne de titre pour la méthode
        const methodRow1 = document.createElement('tr');
        methodRow1.innerHTML = `
            <td colspan="2" style="background-color: var(--primary-color); color: white; font-weight: bold;">${methodName}</td>
        `;
        body1.appendChild(methodRow1);
        
        // Ajouter les paramètres
        for (const [paramKey, paramValue] of Object.entries(methodParams)) {
            const paramRow = document.createElement('tr');
            paramRow.innerHTML = `
                <td>${paramKey}</td>
                <td>${formatNumber(paramValue)}</td>
            `;
            body1.appendChild(paramRow);
        }
    }
    
    // Faire de même pour le deuxième fichier
    for (const [methodKey, methodParams] of Object.entries(result2.methods || {})) {
        const methodName = methodToName(methodKey);
        
        // Ajouter une ligne de titre pour la méthode
        const methodRow2 = document.createElement('tr');
        methodRow2.innerHTML = `
            <td colspan="2" style="background-color: var(--primary-color); color: white; font-weight: bold;">${methodName}</td>
        `;
        body2.appendChild(methodRow2);
        
        // Ajouter les paramètres
        for (const [paramKey, paramValue] of Object.entries(methodParams)) {
            const paramRow = document.createElement('tr');
            paramRow.innerHTML = `
                <td>${paramKey}</td>
                <td>${formatNumber(paramValue)}</td>
            `;
            body2.appendChild(paramRow);
        }
    }
    
    table1.appendChild(body1);
    table2.appendChild(body2);
}

// Fonction pour désactiver le mode comparaison
function disableComparisonMode() {
    const comparisonContainer = document.getElementById('comparison-mode-container');
    const comparisonResults = document.getElementById('batch-comparison-results');
    
    if (comparisonContainer) {
        comparisonContainer.classList.add('hidden');
    }
    
    if (comparisonResults) {
        comparisonResults.classList.add('hidden');
    }
}

// Fonction utilitaire pour formater les nombres
function formatNumber(value) {
    if (value === undefined || value === null) return '-';
    
    if (typeof value === 'number') {
        // Formater selon la taille du nombre
        if (Math.abs(value) < 0.001 || Math.abs(value) >= 10000) {
            return value.toExponential(3);
        } else {
            return value.toFixed(4);
        }
    }
    
    return value.toString();
}

// Fonction utilitaire pour convertir une clé de méthode en nom lisible
function methodToName(methodKey) {
    switch (methodKey) {
        case 'rand':
            return 'Fit Classique';
        case 'mlp':
            return 'MLP';
        case 'cnn':
            return 'CNN';
        case 'gen':
            return 'Génétique';
        default:
            return methodKey;
    }
}

