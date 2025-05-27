// Fonctions pour le partage des résultats via URL
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le système de partage
    setupSharingSystem();
    
    // Vérifier si l'URL contient des résultats partagés
    checkForSharedResults();
});

// Configuration du système de partage
function setupSharingSystem() {
    // Ajouter un bouton de partage
    const shareButton = document.createElement('button');
    shareButton.id = 'share-results-btn';
    shareButton.className = 'action-button';
    shareButton.innerHTML = '<i class="fas fa-share-alt"></i> Partager les résultats';
    shareButton.title = 'Générer un lien de partage pour ces résultats';
    
    // Ajouter le bouton dans la section appropriée
    const actionsSection = document.querySelector('.actions-container');
    if (actionsSection) {
        actionsSection.appendChild(shareButton);
    } else {
        // Fallback: ajouter après le titre principal
        const mainTitle = document.querySelector('h1');
        if (mainTitle && mainTitle.parentNode) {
            const container = document.createElement('div');
            container.className = 'actions-container';
            container.appendChild(shareButton);
            mainTitle.parentNode.insertBefore(container, mainTitle.nextSibling);
        }
    }
    
    // Ajouter un gestionnaire d'événements pour le bouton
    shareButton.addEventListener('click', generateShareableLink);
    
    // Ajouter des styles CSS pour le bouton de partage
    const style = document.createElement('style');
    style.textContent = `
        #share-results-btn {
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
        
        #share-results-btn:hover {
            background-color: var(--primary-color-dark, #0056b3);
        }
        
        #share-results-btn i {
            font-size: 16px;
        }
        
        .share-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .share-modal-content {
            background-color: var(--card-background);
            border-radius: 8px;
            padding: 20px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        
        .share-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .share-modal-header h3 {
            margin: 0;
            color: var(--text-color);
        }
        
        .share-modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--text-color);
        }
        
        .share-link-container {
            display: flex;
            margin-bottom: 15px;
        }
        
        .share-link-input {
            flex: 1;
            padding: 10px;
            border: 1px solid var(--border-color);
            border-radius: 4px 0 0 4px;
            font-size: 14px;
            color: var(--text-color);
            background-color: var(--input-background, #f5f5f5);
        }
        
        .copy-link-btn {
            padding: 10px 15px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 0 4px 4px 0;
            cursor: pointer;
        }
        
        .share-options {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .share-option {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .share-option input[type="checkbox"] {
            width: 18px;
            height: 18px;
        }
        
        .share-option label {
            color: var(--text-color);
            font-size: 14px;
        }
        
        .share-buttons {
            display: flex;
            gap: 10px;
        }
        
        .share-button {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
        }
        
        .share-button.email {
            background-color: #D44638;
            color: white;
        }
        
        .share-button.twitter {
            background-color: #1DA1F2;
            color: white;
        }
        
        .share-button.linkedin {
            background-color: #0077B5;
            color: white;
        }
        
        .qr-code-container {
            display: flex;
            justify-content: center;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid var(--border-color);
        }
    `;
    
    document.head.appendChild(style);
    
    // Ajouter Font Awesome pour les icônes si pas déjà présent
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fontAwesome);
    }
    
    // Ajouter QRCode.js pour la génération de QR codes
    if (!document.querySelector('script[src*="qrcode"]')) {
        const qrcodeScript = document.createElement('script');
        qrcodeScript.src = 'https://cdn.jsdelivr.net/npm/qrcode.js@1.0.0/qrcode.min.js';
        document.head.appendChild(qrcodeScript);
    }
}

// Fonction pour générer un lien partageable
function generateShareableLink() {
    // Vérifier si nous avons des résultats à partager
    if (!allResults || allResults.length === 0) {
        showToast('Aucun résultat à partager. Veuillez d\'abord analyser des fichiers.', 'error');
        return;
    }
    
    // Créer un objet contenant les données à partager
    const dataToShare = {
        results: allResults,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    
    // Convertir en JSON et encoder en base64
    const jsonData = JSON.stringify(dataToShare);
    const base64Data = btoa(unescape(encodeURIComponent(jsonData)));
    
    // Créer l'URL partageable
    const shareableUrl = `${window.location.origin}${window.location.pathname}?shared=${base64Data}`;
    
    // Vérifier si l'URL n'est pas trop longue (limite ~2000 caractères pour la plupart des navigateurs)
    if (shareableUrl.length > 2000) {
        showErrorWithSuggestions('L\'URL générée est trop longue pour être partagée', [
            'Réduisez le nombre de fichiers analysés',
            'Partagez uniquement les résultats les plus récents',
            'Utilisez l\'export PDF ou Excel pour partager des résultats volumineux'
        ]);
        return;
    }
    
    // Afficher la modal de partage
    showShareModal(shareableUrl);
}

// Fonction pour afficher la modal de partage
function showShareModal(shareableUrl) {
    // Créer la modal
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    
    // Créer le contenu de la modal
    const modalContent = document.createElement('div');
    modalContent.className = 'share-modal-content';
    
    // Créer l'en-tête de la modal
    const modalHeader = document.createElement('div');
    modalHeader.className = 'share-modal-header';
    
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = 'Partager les résultats';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'share-modal-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    // Créer le conteneur du lien
    const linkContainer = document.createElement('div');
    linkContainer.className = 'share-link-container';
    
    const linkInput = document.createElement('input');
    linkInput.className = 'share-link-input';
    linkInput.type = 'text';
    linkInput.value = shareableUrl;
    linkInput.readOnly = true;
    
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-link-btn';
    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
    copyButton.title = 'Copier le lien';
    copyButton.addEventListener('click', () => {
        linkInput.select();
        document.execCommand('copy');
        showToast('Lien copié dans le presse-papiers', 'success');
    });
    
    linkContainer.appendChild(linkInput);
    linkContainer.appendChild(copyButton);
    
    // Créer les options de partage
    const shareOptions = document.createElement('div');
    shareOptions.className = 'share-options';
    
    const includeVisualizationsOption = document.createElement('div');
    includeVisualizationsOption.className = 'share-option';
    
    const includeVisualizationsCheckbox = document.createElement('input');
    includeVisualizationsCheckbox.type = 'checkbox';
    includeVisualizationsCheckbox.id = 'include-visualizations';
    includeVisualizationsCheckbox.checked = true;
    
    const includeVisualizationsLabel = document.createElement('label');
    includeVisualizationsLabel.htmlFor = 'include-visualizations';
    includeVisualizationsLabel.textContent = 'Inclure les visualisations';
    
    includeVisualizationsOption.appendChild(includeVisualizationsCheckbox);
    includeVisualizationsOption.appendChild(includeVisualizationsLabel);
    
    const includeRawDataOption = document.createElement('div');
    includeRawDataOption.className = 'share-option';
    
    const includeRawDataCheckbox = document.createElement('input');
    includeRawDataCheckbox.type = 'checkbox';
    includeRawDataCheckbox.id = 'include-raw-data';
    includeRawDataCheckbox.checked = true;
    
    const includeRawDataLabel = document.createElement('label');
    includeRawDataLabel.htmlFor = 'include-raw-data';
    includeRawDataLabel.textContent = 'Inclure les données brutes';
    
    includeRawDataOption.appendChild(includeRawDataCheckbox);
    includeRawDataOption.appendChild(includeRawDataLabel);
    
    shareOptions.appendChild(includeVisualizationsOption);
    shareOptions.appendChild(includeRawDataOption);
    
    // Créer les boutons de partage social
    const shareButtons = document.createElement('div');
    shareButtons.className = 'share-buttons';
    
    const emailButton = document.createElement('button');
    emailButton.className = 'share-button email';
    emailButton.innerHTML = '<i class="fas fa-envelope"></i> Email';
    emailButton.addEventListener('click', () => {
        const subject = encodeURIComponent('Résultats d\'analyse Polyfit AI');
        const body = encodeURIComponent(`Voici les résultats de mon analyse avec Polyfit AI:\n\n${shareableUrl}`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
    });
    
    const twitterButton = document.createElement('button');
    twitterButton.className = 'share-button twitter';
    twitterButton.innerHTML = '<i class="fab fa-twitter"></i> Twitter';
    twitterButton.addEventListener('click', () => {
        const text = encodeURIComponent('Voici mes résultats d\'analyse avec Polyfit AI:');
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareableUrl)}`);
    });
    
    const linkedinButton = document.createElement('button');
    linkedinButton.className = 'share-button linkedin';
    linkedinButton.innerHTML = '<i class="fab fa-linkedin"></i> LinkedIn';
    linkedinButton.addEventListener('click', () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}`);
    });
    
    shareButtons.appendChild(emailButton);
    shareButtons.appendChild(twitterButton);
    shareButtons.appendChild(linkedinButton);
    
    // Créer le conteneur pour le QR code
    const qrCodeContainer = document.createElement('div');
    qrCodeContainer.className = 'qr-code-container';
    qrCodeContainer.id = 'qr-code';
    
    // Assembler la modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(linkContainer);
    modalContent.appendChild(shareOptions);
    modalContent.appendChild(shareButtons);
    modalContent.appendChild(qrCodeContainer);
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Générer le QR code
    setTimeout(() => {
        if (window.QRCode && document.getElementById('qr-code')) {
            new QRCode(document.getElementById('qr-code'), {
                text: shareableUrl,
                width: 128,
                height: 128,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    }, 500);
    
    // Mettre à jour l'URL partageable lorsque les options changent
    includeVisualizationsCheckbox.addEventListener('change', updateShareableUrl);
    includeRawDataCheckbox.addEventListener('change', updateShareableUrl);
    
    function updateShareableUrl() {
        // Créer un objet contenant les données à partager en fonction des options
        const dataToShare = {
            results: allResults,
            timestamp: new Date().toISOString(),
            version: '1.0',
            options: {
                includeVisualizations: includeVisualizationsCheckbox.checked,
                includeRawData: includeRawDataCheckbox.checked
            }
        };
        
        // Convertir en JSON et encoder en base64
        const jsonData = JSON.stringify(dataToShare);
        const base64Data = btoa(unescape(encodeURIComponent(jsonData)));
        
        // Créer l'URL partageable
        const newShareableUrl = `${window.location.origin}${window.location.pathname}?shared=${base64Data}`;
        
        // Vérifier si l'URL n'est pas trop longue
        if (newShareableUrl.length > 2000) {
            showToast('L\'URL est trop longue avec ces options. Certaines options ont été désactivées.', 'warning');
            
            // Désactiver certaines options pour réduire la taille
            if (includeRawDataCheckbox.checked) {
                includeRawDataCheckbox.checked = false;
                return updateShareableUrl(); // Appel récursif avec les nouvelles options
            }
            
            return;
        }
        
        // Mettre à jour l'URL dans l'input
        linkInput.value = newShareableUrl;
    }
    
    // Fermer la modal en cliquant en dehors
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Fonction pour vérifier si l'URL contient des résultats partagés
function checkForSharedResults() {
    // Récupérer les paramètres de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('shared');
    
    if (!sharedData) {
        return;
    }
    
    try {
        // Décoder les données partagées
        const jsonData = decodeURIComponent(escape(atob(sharedData)));
        const parsedData = JSON.parse(jsonData);
        
        // Vérifier si les données sont valides
        if (!parsedData.results || !Array.isArray(parsedData.results) || parsedData.results.length === 0) {
            throw new Error('Les données partagées sont invalides ou vides');
        }
        
        // Afficher une notification de chargement
        const loadingToast = showLoadingToast('Chargement des résultats partagés...');
        
        // Charger les résultats
        setTimeout(() => {
            try {
                // Stocker les résultats
                allResults = parsedData.results;
                
                // Mettre à jour l'interface
                updateInterfaceWithSharedResults(parsedData);
                
                // Afficher une notification de succès
                loadingToast.success('Résultats partagés chargés avec succès');
                
                // Afficher des informations sur les résultats partagés
                showSharedResultsInfo(parsedData);
            } catch (error) {
                console.error('Erreur lors du chargement des résultats partagés:', error);
                loadingToast.error('Erreur lors du chargement des résultats partagés');
                
                showErrorWithSuggestions('Erreur lors du chargement des résultats partagés', [
                    'Le format des données partagées est peut-être incompatible',
                    'Le lien de partage est peut-être corrompu ou incomplet',
                    'Essayez de demander un nouveau lien de partage'
                ]);
            }
        }, 1000);
    } catch (error) {
        console.error('Erreur lors du décodage des données partagées:', error);
        
        showErrorWithSuggestions('Erreur lors du décodage des données partagées', [
            'Le lien de partage est peut-être corrompu ou incomplet',
            'Le format des données partagées est peut-être incompatible',
            'Essayez de demander un nouveau lien de partage'
        ]);
    }
}

// Fonction pour mettre à jour l'interface avec les résultats partagés
function updateInterfaceWithSharedResults(parsedData) {
    // Mettre à jour le statut
    updateProcessingStatus("done");
    
    // Mettre à jour le nom du fichier
    if (parsedData.results.length === 1) {
        document.getElementById('current-file').textContent = parsedData.results[0].filename || 'Résultat partagé';
    } else {
        document.getElementById('current-file').textContent = `${parsedData.results.length} fichiers partagés`;
    }
    
    // Basculer en mode d'affichage brut pour voir les boxplots
    const displayMode = document.getElementById('display-mode');
    if (displayMode && !displayMode.checked) {
        displayMode.checked = true;
        toggleDisplayMode();
    }
    
    // Créer les boxplots
    createBoxplots();
    
    // Créer les graphiques comparatifs
    if (typeof createRadarChart === 'function') {
        createRadarChart('comparison-radar');
    }
    
    if (typeof createSSDComparisonChart === 'function') {
        createSSDComparisonChart('ssd-comparison');
    }
    
    // Mettre à jour le tableau de comparaison
    if (parsedData.results.length > 0 && parsedData.results[0].methods) {
        const lastResult = parsedData.results[parsedData.results.length - 1];
        
        // Simuler un objet de données compatible avec updateComparisonTable
        const tableData = {
            params_mlp: lastResult.methods.mlp,
            params_genetique: lastResult.methods.gen,
            params_random: lastResult.methods.rand
        };
        
        // Mettre à jour le tableau
        updateComparisonTable(tableData);
        
        // Mettre à jour les SSD si disponibles
        const ssdData = {
            ssd_mlp: lastResult.methods.mlp?.SSD,
            ssd_gen: lastResult.methods.gen?.SSD,
            ssd_rand: lastResult.methods.rand?.SSD
        };
        
        if (Object.values(ssdData).some(v => v !== undefined)) {
            displaySSD(ssdData);
        }
    }
}

// Fonction pour afficher des informations sur les résultats partagés
function showSharedResultsInfo(parsedData) {
    // Créer une bannière d'information
    const banner = document.createElement('div');
    banner.className = 'shared-results-banner';
    banner.style.backgroundColor = 'var(--info-color, #3498db)';
    banner.style.color = 'white';
    banner.style.padding = '10px 15px';
    banner.style.borderRadius = '4px';
    banner.style.margin = '10px 0';
    banner.style.display = 'flex';
    banner.style.justifyContent = 'space-between';
    banner.style.alignItems = 'center';
    
    // Formater la date
    const sharedDate = new Date(parsedData.timestamp);
    const formattedDate = sharedDate.toLocaleDateString() + ' ' + sharedDate.toLocaleTimeString();
    
    // Créer le contenu de la bannière
    banner.innerHTML = `
        <div>
            <strong>Résultats partagés</strong>
            <div style="font-size: 0.9em; margin-top: 5px;">
                ${parsedData.results.length} fichier(s) • Partagé le ${formattedDate}
            </div>
        </div>
        <button id="clear-shared-results" style="background: none; border: 1px solid white; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
            Effacer
        </button>
    `;
    
    // Ajouter la bannière au début du contenu principal
    const mainContent = document.querySelector('main') || document.querySelector('.container') || document.body;
    mainContent.insertBefore(banner, mainContent.firstChild);
    
    // Ajouter un gestionnaire d'événements pour le bouton d'effacement
    document.getElementById('clear-shared-results').addEventListener('click', () => {
        // Supprimer les paramètres de l'URL
        const url = new URL(window.location);
        url.searchParams.delete('shared');
        window.history.replaceState({}, '', url);
        
        // Supprimer la bannière
        banner.remove();
        
        // Réinitialiser l'interface
        resetInterface();
        
        showToast('Résultats partagés effacés', 'info');
    });
}

// Fonction pour réinitialiser l'interface
function resetInterface() {
    // Réinitialiser les résultats
    allResults = [];
    
    // Réinitialiser le statut
    updateProcessingStatus("waiting");
    
    // Réinitialiser le nom du fichier
    document.getElementById('current-file').textContent = 'Aucun fichier sélectionné';
    
    // Réinitialiser le tableau
    resetComparisonTable();
    
    // Réinitialiser les placeholders
    updatePlaceholder("#graph-zone", "Sélectionnez un fichier pour afficher les courbes");
    updatePlaceholder("#random-method", "Sélectionnez un fichier pour lancer l'analyse");
    updatePlaceholder("#mlp-method", "Sélectionnez un fichier pour lancer l'analyse");
    updatePlaceholder("#genetic-method", "Sélectionnez un fichier pour lancer l'analyse");
    updatePlaceholder("#boxplot-zone", "Sélectionnez un fichier pour lancer l'analyse");
    
    // Basculer en mode d'affichage normal
    const displayMode = document.getElementById('display-mode');
    if (displayMode && displayMode.checked) {
        displayMode.checked = false;
        toggleDisplayMode();
    }
}
