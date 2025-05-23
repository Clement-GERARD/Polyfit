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

// Fonction pour activer/désactiver le mode batch
function toggleBatchMode() {
    batchModeActive = !batchModeActive;
    
    // Mettre à jour l'affichage du conteneur de fichiers batch
    const batchFilesContainer = document.getElementById('batch-files-container');
    
    if (batchModeActive) {
        document.body.classList.add('batch-mode-active');
        
        // Afficher le conteneur s'il y a des fichiers
        if (batchFiles.length > 0) {
            batchFilesContainer.classList.remove('hidden');
        }
        
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
        
        // Activer le mode comparaison
        document.body.classList.add('comparison-mode-active');
    } else {
        document.body.classList.remove('batch-mode-active');
        batchFilesContainer.classList.add('hidden');
        
        // Restaurer le comportement original du sélecteur de fichier
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.multiple = false;
            
            // Restaurer le gestionnaire d'événements original
            if (fileInput._originalOnChange) {
                fileInput.onchange = fileInput._originalOnChange;
            }
        }
        
        // Désactiver le mode comparaison
        document.body.classList.remove('comparison-mode-active');
    }
    
    // Mettre à jour le statut
    if (batchModeActive) {
        showToast('Mode batch activé', 'info');
    } else {
        showToast('Mode batch désactivé', 'info');
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

// Fonction pour exporter les résultats batch en PDF
function exportBatchToPDF() {
    if (batchFiles.length === 0) {
        showToast('Aucun fichier à exporter', 'error');
        return;
    }
    
    // Afficher un message de chargement
    showToast('Génération du PDF en cours...', 'info');
    
    // Utiliser la bibliothèque jsPDF
    const { jsPDF } = window.jspdf;
    
    // Créer un nouveau document PDF
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // Définir les styles
    const titleFontSize = 16;
    const subtitleFontSize = 14;
    const normalFontSize = 11;
    const smallFontSize = 9;
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    
    // Ajouter un titre
    doc.setFontSize(titleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport d\'analyse Polyfit AI - Batch', pageWidth / 2, margin, { align: 'center' });
    
    // Ajouter la date
    doc.setFontSize(normalFontSize);
    doc.setFont('helvetica', 'normal');
    const today = new Date();
    const dateStr = today.toLocaleDateString();
    doc.text(`Date: ${dateStr}`, pageWidth - margin, margin, { align: 'right' });
    
    // Ajouter la liste des fichiers
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
        
        // Ajouter une nouvelle page si nécessaire
        if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
        }
    });
    
    // Fonction pour ajouter une page par fichier
    async function addFilePages() {
        for (let i = 0; i < batchFiles.length; i++) {
            const file = batchFiles[i];
            
            // Ajouter une nouvelle page
            doc.addPage();
            
            // Titre de la page
            doc.setFontSize(titleFontSize);
            doc.setFont('helvetica', 'bold');
            doc.text(`Fichier: ${file.name}`, pageWidth / 2, margin, { align: 'center' });
            
            let yPosition = margin + 15;
            
            // Ajouter les résultats pour ce fichier
            doc.setFontSize(subtitleFontSize);
            doc.text('Résultats par méthode', margin, yPosition);
            yPosition += 10;
            
            // Tableau des paramètres
            const paramData = [];
            const paramColumns = [
                { header: 'Méthode', dataKey: 'method' },
                { header: 'J0', dataKey: 'j0' },
                { header: 'Jph', dataKey: 'jph' },
                { header: 'Rs', dataKey: 'rs' },
                { header: 'Rsh', dataKey: 'rsh' },
                { header: 'n', dataKey: 'n' },
                { header: 'SSD', dataKey: 'ssd' }
            ];
            
            // Chercher les résultats pour ce fichier
            const fileResult = batchResults.find(result => result.filename === file.name);
            
            if (fileResult) {
                // Remplir les données du tableau
                for (const [methodKey, methodParams] of Object.entries(fileResult.methods)) {
                    paramData.push({
                        method: methodToName(methodKey),
                        j0: methodParams.J0 || '-',
                        jph: methodParams.Jph || '-',
                        rs: methodParams.Rs || '-',
                        rsh: methodParams.Rsh || '-',
                        n: methodParams.n || '-',
                        ssd: methodParams.SSD || '-'
                    });
                }
            }
            
            // Ajouter le tableau au PDF
            doc.autoTable({
                startY: yPosition,
                head: [paramColumns.map(col => col.header)],
                body: paramData.map(row => paramColumns.map(col => row[col.dataKey])),
                margin: { top: margin, right: margin, bottom: margin, left: margin },
                styles: { fontSize: smallFontSize },
                headStyles: { fillColor: [4, 84, 117], textColor: [255, 255, 255] },
                alternateRowStyles: { fillColor: [240, 240, 240] },
                tableWidth: 'auto'
            });
            
            // Mettre à jour la position Y après le tableau
            yPosition = doc.lastAutoTable.finalY + 15;
            
            // Ajouter le graphique de la courbe générale si disponible
            if (fileResult && fileResult.curve_image_all) {
                doc.setFontSize(subtitleFontSize);
                doc.text('Courbe générale', margin, yPosition);
                yPosition += 10;
                
                // Ajouter l'image
                try {
                    const imgWidth = contentWidth;
                    const imgHeight = contentWidth * 0.6;
                    
                    doc.addImage(fileResult.curve_image_all, 'PNG', margin, yPosition, imgWidth, imgHeight);
                } catch (error) {
                    console.error(`Erreur lors de l'ajout de l'image pour ${file.name}:`, error);
                }
            }
        }
    }
    
    // Fonction pour ajouter la page des boîtes à moustaches
    async function addBoxplotPage() {
        // Ajouter une nouvelle page
        doc.addPage();
        
        // Titre de la page
        doc.setFontSize(titleFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text('Boîtes à moustaches', pageWidth / 2, margin, { align: 'center' });
        
        let yPosition = margin + 15;
        
        // Ajouter le graphique des boîtes à moustaches
        try {
            // Chercher le conteneur des boîtes à moustaches
            const boxplotElement = document.querySelector('#boxplot-zone .boxplot-container');
            
            if (boxplotElement) {
                // Capturer le graphique en tant qu'image
                const canvas = await html2canvas(boxplotElement, {
                    scale: 2,
                    logging: false,
                    useCORS: true
                });
                
                const imgData = canvas.toDataURL('image/png');
                
                // Calculer les dimensions de l'image pour qu'elle tienne sur la page
                const imgWidth = contentWidth;
                const imgHeight = contentWidth * 0.75;
                
                // Ajouter l'image
                doc.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
            }
        } catch (error) {
            console.error('Erreur lors de la capture des boîtes à moustaches:', error);
            doc.text('Erreur lors de la génération des boîtes à moustaches', margin, yPosition);
        }
    }
    
    // Générer le PDF complet
    async function generateFullBatchPDF() {
        try {
            await addFilePages();
            await addBoxplotPage();
            
            // Sauvegarder le PDF
            doc.save('polyfit_batch_resultats.pdf');
            
            showToast('Export PDF batch réussi', 'success');
        } catch (error) {
            console.error('Erreur lors de la génération du PDF batch:', error);
            showToast('Erreur lors de la génération du PDF batch', 'error');
        }
    }
    
    // Lancer la génération
    generateFullBatchPDF();
}

// Fonctions pour le mode comparaison
function updateComparisonSelectors() {
    const fileSelect1 = document.querySelector('#file-select-1');
    const fileSelect2 = document.querySelector('#file-select-2');
    
    if (!fileSelect1 || !fileSelect2) return;
    
    // Vider les sélecteurs
    fileSelect1.innerHTML = '';
    fileSelect2.innerHTML = '';
    
    // Ajouter les options
    batchFiles.forEach((file, index) => {
        const option1 = document.createElement('option');
        option1.value = index;
        option1.textContent = file.name;
        
        const option2 = document.createElement('option');
        option2.value = index;
        option2.textContent = file.name;
        
        fileSelect1.appendChild(option1);
        fileSelect2.appendChild(option2);
    });
    
    // Sélectionner par défaut le premier et le deuxième fichier
    if (batchFiles.length >= 2) {
        fileSelect1.value = 0;
        fileSelect2.value = 1;
    }
}

// Fonction pour comparer deux fichiers sélectionnés
function compareSelectedFiles() {
    const fileSelect1 = document.querySelector('#file-select-1');
    const fileSelect2 = document.querySelector('#file-select-2');
    
    if (!fileSelect1 || !fileSelect2) return;
    
    const index1 = parseInt(fileSelect1.value);
    const index2 = parseInt(fileSelect2.value);
    
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
    
    // Afficher les résultats de comparaison
    displayComparisonResults(file1, file2);
}

// Fonction pour afficher les résultats de comparaison
function displayComparisonResults(file1, file2) {
    const comparisonResults = document.getElementById('comparison-results');
    if (!comparisonResults) return;
    
    // Afficher le conteneur de résultats
    comparisonResults.classList.remove('hidden');
    
    // Chercher les résultats pour les deux fichiers
    const result1 = batchResults.find(result => result.filename === file1.name);
    const result2 = batchResults.find(result => result.filename === file2.name);
    
    if (!result1 || !result2) {
        comparisonResults.innerHTML = '<div class="error-message">Résultats non disponibles pour un ou plusieurs fichiers sélectionnés.</div>';
        return;
    }
    
    // Mettre à jour les graphiques
    updateComparisonCharts(result1, result2);
    
    // Mettre à jour le tableau de comparaison
    updateComparisonTable(result1, result2);
}

// Fonction pour mettre à jour les graphiques de comparaison
function updateComparisonCharts(result1, result2) {
    const chart1Container = document.getElementById('comparison-chart-1');
    const chart2Container = document.getElementById('comparison-chart-2');
    
    if (!chart1Container || !chart2Container) return;
    
    // Afficher les courbes pour chaque fichier
    if (result1.curve_image_all) {
        chart1Container.innerHTML = `<img src="${result1.curve_image_all}" alt="Courbe ${result1.filename}" style="max-width:100%;">`;
    } else {
        chart1Container.innerHTML = '<div class="error-message">Graphique non disponible</div>';
    }
    
    if (result2.curve_image_all) {
        chart2Container.innerHTML = `<img src="${result2.curve_image_all}" alt="Courbe ${result2.filename}" style="max-width:100%;">`;
    } else {
        chart2Container.innerHTML = '<div class="error-message">Graphique non disponible</div>';
    }
}

// Fonction pour mettre à jour le tableau de comparaison
function updateComparisonTable(result1, result2) {
    const tableContainer = document.querySelector('.comparison-table-container');
    if (!tableContainer) return;
    
    const table = document.getElementById('comparison-diff-table');
    const tbody = table.querySelector('tbody');
    
    // Vider le tableau
    tbody.innerHTML = '';
    
    // Paramètres à comparer
    const params = ['J0', 'Jph', 'Rs', 'Rsh', 'n', 'SSD'];
    
    // Méthodes disponibles
    const methods = ['rand', 'mlp', 'cnn', 'gen'];
    
    // Ajouter les lignes pour chaque méthode et paramètre
    methods.forEach(method => {
        // Vérifier si les deux fichiers ont des résultats pour cette méthode
        if (result1.methods[method] && result2.methods[method]) {
            // Ajouter un en-tête pour la méthode
            const methodRow = document.createElement('tr');
            methodRow.className = 'method-header';
            methodRow.innerHTML = `<td colspan="5"><strong>${methodToName(method)}</strong></td>`;
            tbody.appendChild(methodRow);
            
            // Ajouter les lignes pour chaque paramètre
            params.forEach(param => {
                const value1 = result1.methods[method][param];
                const value2 = result2.methods[method][param];
                
                if (value1 !== undefined && value2 !== undefined) {
                    const row = document.createElement('tr');
                    
                    // Calculer la différence
                    const diff = value2 - value1;
                    const diffPercent = value1 !== 0 ? (diff / Math.abs(value1)) * 100 : 0;
                    
                    // Formater les valeurs
                    const formattedValue1 = formatNumber(value1);
                    const formattedValue2 = formatNumber(value2);
                    const formattedDiff = formatNumber(diff);
                    const formattedDiffPercent = formatNumber(diffPercent) + '%';
                    
                    // Déterminer la classe CSS pour la différence
                    let diffClass = '';
                    if (Math.abs(diffPercent) > 10) {
                        diffClass = diff > 0 ? 'positive-large' : 'negative-large';
                    } else if (Math.abs(diffPercent) > 5) {
                        diffClass = diff > 0 ? 'positive-medium' : 'negative-medium';
                    } else if (Math.abs(diffPercent) > 1) {
                        diffClass = diff > 0 ? 'positive-small' : 'negative-small';
                    }
                    
                    row.innerHTML = `
                        <td>${param}</td>
                        <td>${formattedValue1}</td>
                        <td>${formattedValue2}</td>
                        <td class="${diffClass}">${formattedDiff}</td>
                        <td class="${diffClass}">${formattedDiffPercent}</td>
                    `;
                    
                    tbody.appendChild(row);
                }
            });
        }
    });
}

// Fonction utilitaire pour convertir une clé de méthode en nom lisible
function methodToName(methodKey) {
    switch (methodKey) {
        case 'rand':
            return 'Classique';
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

// Fonction utilitaire pour formater un nombre
function formatNumber(value) {
    if (value === undefined || value === null) return '-';
    
    // Convertir en nombre si c'est une chaîne
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(num)) return value;
    
    // Formater selon la taille du nombre
    if (Math.abs(num) < 0.001 || Math.abs(num) >= 10000) {
        return num.toExponential(3);
    } else {
        return num.toFixed(4);
    }
}
