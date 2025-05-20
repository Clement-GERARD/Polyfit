// Fonctions pour le mode batch (traitement de fichiers multiples)
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le mode batch
    setupBatchMode();
});

// Configuration du mode batch
function setupBatchMode() {
    // Ajouter un bouton pour activer le mode batch
    const batchButton = document.createElement('button');
    batchButton.id = 'batch-mode-btn';
    batchButton.className = 'action-button';
    batchButton.innerHTML = '📦 Mode batch';
    batchButton.title = 'Traiter plusieurs fichiers simultanément';
    
    // Ajouter le bouton à côté du sélecteur de fichier
    const fileInput = document.getElementById('file-input');
    if (fileInput && fileInput.parentNode) {
        fileInput.parentNode.insertBefore(batchButton, fileInput.nextSibling);
    }
    
    // Ajouter un gestionnaire d'événements pour le bouton
    batchButton.addEventListener('click', toggleBatchMode);
    
    // Ajouter des styles CSS pour le mode batch
    const style = document.createElement('style');
    style.textContent = `
        .batch-mode-active #file-input + label {
            background-color: var(--accent-color);
        }
        
        .batch-mode-active #batch-mode-btn {
            background-color: var(--accent-color);
            color: white;
        }
        
        .batch-files-list {
            margin-top: 10px;
            max-height: 200px;
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
            padding: 5px 0;
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
        
        .batch-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
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
    
    // Mettre à jour l'apparence du bouton
    const batchButton = document.getElementById('batch-mode-btn');
    if (batchButton) {
        if (batchModeActive) {
            batchButton.innerHTML = '📦 Mode batch (actif)';
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
            
            // Créer et afficher la liste des fichiers batch
            createBatchFilesList();
        } else {
            batchButton.innerHTML = '📦 Mode batch';
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
            
            // Supprimer la liste des fichiers batch
            const batchList = document.getElementById('batch-files-list');
            if (batchList) {
                batchList.remove();
            }
        }
    }
}

// Fonction pour créer la liste des fichiers batch
function createBatchFilesList() {
    // Supprimer la liste existante si elle existe
    const existingList = document.getElementById('batch-files-list');
    if (existingList) {
        existingList.remove();
    }
    
    // Créer la nouvelle liste
    const batchList = document.createElement('div');
    batchList.id = 'batch-files-list';
    batchList.className = 'batch-files-list';
    
    // Ajouter un titre
    if (batchFiles.length === 0) {
        batchList.innerHTML = '<p>Aucun fichier sélectionné. Utilisez le bouton "Sélectionner des fichiers CSV" pour ajouter des fichiers.</p>';
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
            
            fileItem.appendChild(fileName);
            fileItem.appendChild(fileStatus);
            batchList.appendChild(fileItem);
        });
        
        // Ajouter la barre de progression
        const progressContainer = document.createElement('div');
        progressContainer.className = 'batch-progress';
        progressContainer.innerHTML = '<div class="batch-progress-bar" id="batch-progress-bar"></div>';
        batchList.appendChild(progressContainer);
        
        // Ajouter les boutons d'action
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'batch-actions';
        
        const processButton = document.createElement('button');
        processButton.id = 'process-batch-btn';
        processButton.textContent = 'Traiter tous les fichiers';
        processButton.addEventListener('click', processBatchFiles);
        
        const clearButton = document.createElement('button');
        clearButton.id = 'clear-batch-btn';
        clearButton.textContent = 'Effacer la liste';
        clearButton.addEventListener('click', clearBatchFiles);
        
        actionsContainer.appendChild(clearButton);
        actionsContainer.appendChild(processButton);
        batchList.appendChild(actionsContainer);
    }
    
    // Ajouter la liste au DOM
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) {
        uploadSection.appendChild(batchList);
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
    createBatchFilesList();
    
    // Mettre à jour le statut
    document.getElementById('current-file').textContent = `${batchFiles.length} fichiers sélectionnés`;
    
    showToast(`${csvFiles.length} fichiers CSV ajoutés à la liste`, 'success');
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
    createBatchFilesList();
    
    // Mettre à jour le statut
    document.getElementById('current-file').textContent = 'Aucun fichier sélectionné';
    
    showToast('Liste de fichiers effacée', 'info');
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

// Fonction pour traiter un fichier individuel
async function processFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return { filename: file.name, ...data };
}

// Fonction pour mettre à jour le statut d'un fichier dans la liste
function updateBatchFileStatus(index, status) {
    const fileItems = document.querySelectorAll('.batch-file-item');
    if (index >= 0 && index < fileItems.length) {
        const statusElement = fileItems[index].querySelector('.batch-file-status');
        if (statusElement) {
            // Supprimer toutes les classes de statut
            statusElement.classList.remove('pending', 'processing', 'done', 'error');
            
            // Ajouter la nouvelle classe de statut
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

// Fonction pour mettre à jour tous les statuts de fichiers
function updateAllBatchFileStatuses(status) {
    const fileItems = document.querySelectorAll('.batch-file-item');
    fileItems.forEach((item, index) => {
        updateBatchFileStatus(index, status);
    });
}

// Fonction pour mettre à jour la barre de progression
function updateBatchProgress(percentage) {
    const progressBar = document.getElementById('batch-progress-bar');
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
}

// Fonction pour stocker les résultats batch pour les boxplots
function storeBatchResults(results) {
    // Réinitialiser allResults
    allResults = [];
    
    // Convertir les résultats batch au format attendu par createBoxplots
    results.forEach(result => {
        if (result.error) return; // Ignorer les résultats en erreur
        
        const formattedResult = {
            filename: result.filename,
            methods: {}
        };
        
        // Ajouter les résultats de chaque méthode
        if (result.params_mlp) {
            formattedResult.methods.mlp = result.params_mlp;
            if (result.ssd_mlp) {
                formattedResult.methods.mlp.SSD = result.ssd_mlp;
            }
        }
        
        if (result.params_cnn) {
            formattedResult.methods.cnn = result.params_cnn;
            if (result.ssd_cnn) {
                formattedResult.methods.cnn.SSD = result.ssd_cnn;
            }
        }
        
        if (result.params_genetique) {
            formattedResult.methods.gen = result.params_genetique;
            if (result.ssd_gen) {
                formattedResult.methods.gen.SSD = result.ssd_gen;
            }
        }
        
        if (result.params_random) {
            formattedResult.methods.rand = result.params_random;
            if (result.ssd_rand) {
                formattedResult.methods.rand.SSD = result.ssd_rand;
            }
        }
        
        allResults.push(formattedResult);
    });
}

// Fonction pour afficher un résumé des résultats batch
function displayBatchSummary() {
    // Créer un élément pour le résumé
    const summaryElement = document.createElement('div');
    summaryElement.className = 'batch-summary';
    summaryElement.innerHTML = `
        <h4>Résumé du traitement batch</h4>
        <div class="batch-summary-item">
            <span class="batch-summary-label">Fichiers traités:</span>
            <span class="batch-summary-value">${batchResults.length}/${batchFiles.length}</span>
        </div>
        <div class="batch-summary-item">
            <span class="batch-summary-label">Réussis:</span>
            <span class="batch-summary-value">${batchResults.filter(r => !r.error).length}</span>
        </div>
        <div class="batch-summary-item">
            <span class="batch-summary-label">Erreurs:</span>
            <span class="batch-summary-value">${batchResults.filter(r => r.error).length}</span>
        </div>
    `;
    
    // Ajouter le résumé à la liste des fichiers
    const batchList = document.getElementById('batch-files-list');
    if (batchList) {
        // Supprimer le résumé existant s'il y en a un
        const existingSummary = batchList.querySelector('.batch-summary');
        if (existingSummary) {
            existingSummary.remove();
        }
        
        batchList.appendChild(summaryElement);
    }
    
    // Mettre à jour le statut
    document.getElementById('current-file').textContent = `${batchResults.length} fichiers traités`;
    
    // Basculer en mode d'affichage brut pour voir les boxplots
    const displayMode = document.getElementById('display-mode');
    if (displayMode && !displayMode.checked) {
        displayMode.checked = true;
        toggleDisplayMode();
    }
}
