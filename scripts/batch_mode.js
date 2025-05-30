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
    
    // Créer le conteneur pour la liste des fichiers batch (entre upload-section et main)
    const batchFilesContainer = document.createElement('div');
    batchFilesContainer.id = 'batch-files-container';
    batchFilesContainer.className = 'batch-files-container hidden';
    
    // Structure interne du conteneur
    batchFilesContainer.innerHTML = `
        <div class="batch-header">
            <h3>Liste des fichiers batch</h3>
            <span id="batch-close" class="batch-close">&times;</span>
        </div>
        <div class="batch-files-list">
            <ul id="batch-files-list"></ul>
        </div>
        <div class="batch-progress">
            <h4>Progression</h4>
            <div class="progress-bar-container">
                <div id="batch-progress-bar" class="progress-bar"></div>
            </div>
            <div id="batch-progress-text" class="progress-text">0%</div>
        </div>
        <div class="batch-controls">
            <button id="export-batch-pdf-btn" class="action-button">
                <i class="fas fa-file-pdf"></i> Exporter en PDF
            </button>
        </div>
    `;
    
    // Insérer le conteneur après la section de téléchargement et avant le main
    const uploadSection = document.getElementById('upload-section');
    const mainContainer = document.querySelector('.main-container');
    
    if (uploadSection && mainContainer) {
        uploadSection.parentNode.insertBefore(batchFilesContainer, mainContainer);
    }
    
    // Ajouter des styles CSS pour le mode batch
    const style = document.createElement('style');
    style.textContent = `
        .batch-toggle {
            margin-left: 10px;
        }
        
        .batch-mode-active #file-input + label {
            background-color: var(--accent-color);
        }
        
        .batch-files-container {
            margin: 1.5rem auto;
            max-width: 1200px;
            background-color: var(--card-background);
            padding: 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
        }
        
        .batch-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .batch-header h3 {
            margin: 0;
            color: var(--primary-color);
        }
        
        .batch-close {
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--primary-color);
        }
        
        .batch-close:hover {
            color: var(--accent-color);
        }
        
        .batch-files-list {
            margin-top: 10px;
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: 10px;
            background-color: var(--card-background);
        }
        
        .batch-files-list ul {
            list-style: none;
            padding: 0;
            margin: 0;
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
        
        .batch-progress {
            margin-top: 15px;
        }
        
        .progress-bar-container {
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
        
        .batch-controls {
            display: flex;
            justify-content: flex-end;
            margin-top: 15px;
            gap: 10px;
        }
        
        /* Mode comparaison */
        #comparison-zone {
            display: none;
        }
        
        .comparison-mode-active #comparison-zone {
            display: block;
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
            border-radius: var(--border-radius);
            border: 1px solid var(--border-color);
            background-color: var(--card-background);
            color: var(--text-color);
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
            border-radius: var(--border-radius);
            padding: 10px;
            background-color: var(--card-background);
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
    
    // Ajouter les gestionnaires d'événements
    document.getElementById('batch-close').addEventListener('click', () => {
        document.getElementById('batch-files-container').classList.add('hidden');
    });
    
    document.getElementById('export-batch-pdf-btn').addEventListener('click', exportBatchToPDF);
}

// Variables pour le mode batch
let batchModeActive = false;
let batchFiles = [];
let batchResults = [];
let processingBatch = false;

function toggleBatchMode() {
    const wasActive = batchModeActive;
    batchModeActive = !batchModeActive;

    // Réinitialisation globale des résultats
    if (batchModeActive) {
        allResults.length = 0;
    }

    // Mettre à jour l'affichage du conteneur de fichiers batch
    const batchFilesContainer = document.getElementById('batch-files-container');

    if (batchModeActive) {
        document.body.classList.add('batch-mode-active');

        if (batchFiles.length > 0) {
            batchFilesContainer.classList.remove('hidden');
        }

        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.multiple = true;

            if (!fileInput._originalOnChange) {
                fileInput._originalOnChange = fileInput.onchange;
            }

            fileInput.onchange = handleBatchFiles;
        }

        document.body.classList.add('comparison-mode-active');
    } else {
        document.body.classList.remove('batch-mode-active');
        batchFilesContainer.classList.add('hidden');

        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.multiple = false;

            if (fileInput._originalOnChange) {
                fileInput.onchange = fileInput._originalOnChange;
            } else {
                fileInput.onchange = (event) => handleFiles(event);
            }
        }

        document.body.classList.remove('comparison-mode-active');

        resetBatchMode();
    }

    if (batchModeActive) {
        showToast('Mode batch activé', 'info');
    } else {
        showToast('Mode batch désactivé', 'info');
    }
}

// Fonction pour réinitialiser complètement le mode batch
function resetBatchMode() {
    // Réinitialiser les variables
    batchFiles = [];
    batchResults = [];
    processingBatch = false;
    
    // Réinitialiser l'interface
    document.getElementById('batch-files-list').innerHTML = '';
    document.getElementById('batch-progress-bar').style.width = '0%';
    document.getElementById('batch-progress-text').textContent = '0%';
    
    // Réinitialiser le statut du fichier courant
    document.getElementById('current-file').textContent = 'Aucun fichier sélectionné';
    
    // Réinitialiser les sélecteurs du mode comparaison
    updateComparisonSelectors();
    
    // Masquer les résultats de comparaison
    const comparisonResults = document.getElementById('comparison-results');
    if (comparisonResults) {
        comparisonResults.classList.add('hidden');
    }
    
    // Réinitialiser l'affichage principal
    resetMainDisplay();
}

// Fonction pour réinitialiser l'affichage principal
function resetMainDisplay() {
    // Masquer les sections de résultats
    document.querySelectorAll('.result-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Afficher le message d'accueil
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        welcomeMessage.classList.remove('hidden');
    }
    
    // Réinitialiser les graphiques
    if (typeof resetCharts === 'function') {
        resetCharts();
    }
}

// Fonction pour mettre à jour la liste des fichiers batch
function updateBatchFilesList() {
    const filesList = document.getElementById('batch-files-list');
    if (!filesList) return;
    
    // Vider la liste
    filesList.innerHTML = '';
    
    // Ajouter un message si aucun fichier
    if (batchFiles.length === 0) {
        filesList.innerHTML = '<li class="no-files">Aucun fichier sélectionné. Utilisez le bouton "Sélectionner des fichiers CSV" pour ajouter des fichiers.</li>';
    } else {
        // Ajouter les fichiers à la liste
        batchFiles.forEach((file, index) => {
            const fileItem = document.createElement('li');
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
    
    // Afficher le conteneur de fichiers batch
    document.getElementById('batch-files-container').classList.remove('hidden');
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
        
        // Masquer le conteneur s'il n'y a plus de fichiers
        if (batchFiles.length === 0) {
            document.getElementById('batch-files-container').classList.add('hidden');
        }
    }
}

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
    console.log(file);

    // Mettre à jour le statut du fichier
    updateBatchFileStatus(index, 'processing');

    try {
        // Traiter le fichier en utilisant la fonction principale d'analyse
        const result = await analyzeFile(file);

        // Vérifier si l'analyse a réussi
        if (result.success) {
            result.data.filename = file.name;
            currentFileName = result.data.filename;
            storeResults(result.data)
            
            // Afficher les résultats (comme uploadFile)
            displayResults(result.data);

            // Mettre à jour le tableau (si nécessaire)
            updateComparisonTable(result.data);

            // Créer les boîtes à moustaches (si nécessaire)
            createAllBoxplots();

            // Mettre à jour le statut du fichier
            updateBatchFileStatus(index, 'done');

            showToast(`Fichier "${file.name}" traité avec succès`, 'success');
        } else {
            // Gérer l'erreur d'analyse
            updateBatchFileStatus(index, 'error');
            showToast(`Erreur lors du traitement du fichier "${file.name}": ${result.error}`, 'error');
        }


    } catch (error) {
        console.error(`Erreur lors du traitement du fichier ${file.name}:`, error);

        // Mettre à jour le statut du fichier
        updateBatchFileStatus(index, 'error');

        showToast(`Erreur lors du traitement du fichier "${file.name}"`, 'error');
    }
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

function exportBatchToPDF() {
    if (batchFiles.length === 0) {
        showToast('Aucun fichier à exporter', 'error');
        return;
    }

    showToast('Génération du PDF en cours...', 'info');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const titleFontSize = 16;
    const subtitleFontSize = 14;
    const normalFontSize = 11;
    const smallFontSize = 9;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    doc.setFontSize(titleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport d\'analyse Polyfit AI - Batch', pageWidth / 2, margin, { align: 'center' });

    doc.setFontSize(normalFontSize);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date().toLocaleDateString();
    doc.text(`Date: ${dateStr}`, pageWidth - margin, margin, { align: 'right' });

    let yPosition = margin + 20;
    doc.setFontSize(subtitleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Fichiers analysés', margin, yPosition);

    yPosition += 8;
    doc.setFontSize(normalFontSize);
    doc.setFont('helvetica', 'normal');

    batchFiles.forEach((file, index) => {
        doc.text(`${index + 1}. ${file.name}`, margin, yPosition);
        yPosition += 6;
        if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
        }
    });

    async function addFilePages() {
        console.log('→ addFilePages() appelée');
        for (let i = 0; i < batchFiles.length; i++) {
            const file = batchFiles[i];
            console.log(file)

            // Forcer traitement si non encore analysé
            const alreadyProcessed = batchResults.some(r => r.filename === file.name);
            if (!alreadyProcessed) {
                await processIndividualFile(i);
            }
            
            const result = allResults.find(r => r.filename === file.name);
            if (!result) continue;
            console.log(result);

            doc.addPage();
            console.log(`→ Ajout page pour ${file.name}`);
            doc.setFontSize(titleFontSize);
            doc.setFont('helvetica', 'bold');
            doc.text(`Fichier : ${file.name}`, pageWidth / 2, margin, { align: 'center' });

            let y = margin + 15;
            const paramKeys = ['J0', 'Jph', 'Rs', 'Rsh', 'n', 'SSD'];

            for (const methodKey of ['rand', 'mlp', 'gen']) {
                const methodName = methodToName(methodKey);
                const methodData = result.methods[methodKey];
                if (!methodData) continue;

                doc.setFontSize(subtitleFontSize);
                doc.text(`Méthode : ${methodName}`, margin, y);
                y += 8;

                const tableBody = paramKeys.map(key => [key, formatNumber(methodData[key])]);

                doc.autoTable({
                    startY: y,
                    head: [['Paramètre', 'Valeur']],
                    body: tableBody,
                    styles: { fontSize: smallFontSize },
                    headStyles: { fillColor: [4, 84, 117], textColor: [255, 255, 255] },
                    alternateRowStyles: { fillColor: [245, 245, 245] },
                    margin: { left: margin, right: margin },
                    tableWidth: 'auto'
                });

                y = doc.lastAutoTable.finalY + 10;
                if (y > pageHeight - 50) {
                    doc.addPage();
                    y = margin;
                }
            }
        }
    }

    async function generateFullBatchPDF() {
        try {
            await addFilePages();  // ⚠️ obligatoire
            doc.save('polyfit_batch_resultats.pdf');
            showToast('Export PDF batch réussi', 'success');
        } catch (error) {
            console.error('Erreur lors de la génération du PDF batch:', error);
            showToast('Erreur lors de la génération du PDF batch', 'error');
        }
    }

    generateFullBatchPDF();  // ✅ exécution finale
}

// Fonction pour convertir la clé de méthode en nom lisible
function methodToName(methodKey) {
    const methodNames = {
        'rand': 'Classique',
        'random': 'Classique',
        'mlp': 'MLP',
        'gen': 'Génétique',
        'genetique': 'Génétique'
    };
    
    return methodNames[methodKey] || methodKey;
}

// Fonction pour formater un nombre
function formatNumber(num) {
    if (num === undefined || num === null) return '-';
    
    if (typeof num !== 'number') {
        num = parseFloat(num);
        if (isNaN(num)) return '-';
    }
    
    // Format scientifique pour les très petits nombres
    if (Math.abs(num) < 0.001) {
        return num.toExponential(4);
    }
    
    // Format arrondi pour les autres nombres
    return num.toFixed(4);
}

// Fonction pour afficher un toast
function showToast(message, type = 'info') {
    // Vérifier si la fonction existe déjà dans le contexte global
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Implémentation de secours si la fonction n'existe pas
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Supprimer le toast après 3 secondes
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// Fonction pour créer le conteneur de toast s'il n'existe pas
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}
