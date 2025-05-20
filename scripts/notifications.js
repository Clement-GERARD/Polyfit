// Système de notifications toast et gestion des erreurs
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le système de notifications
    setupNotificationSystem();
    
    // Remplacer les fonctions d'erreur natives par nos versions avec toast
    overrideErrorHandling();
});

// Configuration du système de notifications
function setupNotificationSystem() {
    // Créer le conteneur de notifications s'il n'existe pas déjà
    if (!document.getElementById('toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
        
        // Ajouter des styles pour le conteneur de notifications
        const style = document.createElement('style');
        style.textContent = `
            #toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                max-height: 80vh;
                overflow-y: auto;
                padding-right: 10px;
            }
            
            .toast {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                margin-bottom: 8px;
                animation: toast-in 0.3s ease-out forwards;
                max-width: 100%;
                overflow: hidden;
                opacity: 0;
                transform: translateX(50px);
            }
            
            .toast.toast-exit {
                animation: toast-out 0.3s ease-in forwards;
            }
            
            .toast-content {
                display: flex;
                align-items: center;
                flex: 1;
                min-width: 0;
            }
            
            .toast-icon {
                margin-right: 12px;
                font-size: 20px;
                flex-shrink: 0;
            }
            
            .toast-message {
                font-size: 14px;
                line-height: 1.4;
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: normal;
                word-break: break-word;
            }
            
            .toast-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                margin-left: 12px;
                padding: 0;
                color: inherit;
                opacity: 0.7;
                transition: opacity 0.2s;
                flex-shrink: 0;
            }
            
            .toast-close:hover {
                opacity: 1;
            }
            
            .toast-info {
                background-color: var(--info-color, #3498db);
                color: white;
            }
            
            .toast-success {
                background-color: var(--success-color, #2ecc71);
                color: white;
            }
            
            .toast-warning {
                background-color: var(--warning-color, #f39c12);
                color: white;
            }
            
            .toast-error {
                background-color: var(--error-color, #e74c3c);
                color: white;
            }
            
            @keyframes toast-in {
                from {
                    opacity: 0;
                    transform: translateX(50px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes toast-out {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(50px);
                }
            }
            
            @media (max-width: 768px) {
                #toast-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: calc(100% - 20px);
                }
                
                .toast {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Fonction pour afficher une notification toast
function showToast(message, type = 'info', duration = 5000, action = null) {
    // Vérifier si le conteneur existe
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        setupNotificationSystem();
        toastContainer = document.getElementById('toast-container');
    }
    
    // Créer l'élément toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Déterminer l'icône en fonction du type
    let icon = '';
    switch (type) {
        case 'success':
            icon = '✓';
            break;
        case 'error':
            icon = '✗';
            break;
        case 'warning':
            icon = '⚠';
            break;
        case 'info':
        default:
            icon = 'ℹ';
            break;
    }
    
    // Créer le contenu du toast
    const content = document.createElement('div');
    content.className = 'toast-content';
    
    const iconSpan = document.createElement('span');
    iconSpan.className = 'toast-icon';
    iconSpan.textContent = icon;
    
    const messageSpan = document.createElement('span');
    messageSpan.className = 'toast-message';
    messageSpan.textContent = message;
    
    content.appendChild(iconSpan);
    content.appendChild(messageSpan);
    toast.appendChild(content);
    
    // Ajouter un bouton de fermeture
    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => {
        closeToast(toast);
    });
    
    toast.appendChild(closeButton);
    
    // Ajouter un bouton d'action si spécifié
    if (action && action.label && action.callback) {
        const actionButton = document.createElement('button');
        actionButton.className = 'toast-action';
        actionButton.textContent = action.label;
        actionButton.addEventListener('click', () => {
            action.callback();
            closeToast(toast);
        });
        
        // Ajouter des styles pour le bouton d'action
        actionButton.style.marginLeft = '10px';
        actionButton.style.padding = '4px 8px';
        actionButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        actionButton.style.border = 'none';
        actionButton.style.borderRadius = '4px';
        actionButton.style.color = 'inherit';
        actionButton.style.cursor = 'pointer';
        
        toast.appendChild(actionButton);
    }
    
    // Ajouter le toast au conteneur
    toastContainer.appendChild(toast);
    
    // Fermer automatiquement après la durée spécifiée
    const timeout = setTimeout(() => {
        closeToast(toast);
    }, duration);
    
    // Stocker le timeout pour pouvoir l'annuler si nécessaire
    toast._timeout = timeout;
    
    // Fonction pour fermer le toast
    function closeToast(toastElement) {
        // Annuler le timeout si le toast est fermé manuellement
        if (toastElement._timeout) {
            clearTimeout(toastElement._timeout);
        }
        
        // Ajouter la classe de sortie pour l'animation
        toastElement.classList.add('toast-exit');
        
        // Supprimer le toast après l'animation
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
        }, 300);
    }
    
    return toast;
}

// Fonction pour remplacer les fonctions d'erreur natives
function overrideErrorHandling() {
    // Sauvegarder la fonction console.error originale
    const originalConsoleError = console.error;
    
    // Remplacer console.error pour afficher un toast
    console.error = function(...args) {
        // Appeler la fonction originale
        originalConsoleError.apply(console, args);
        
        // Extraire le message d'erreur
        let errorMessage = args.map(arg => {
            if (arg instanceof Error) {
                return arg.message;
            } else if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return String(arg);
                }
            } else {
                return String(arg);
            }
        }).join(' ');
        
        // Limiter la longueur du message
        if (errorMessage.length > 150) {
            errorMessage = errorMessage.substring(0, 147) + '...';
        }
        
        // Afficher un toast d'erreur
        showToast(`Erreur: ${errorMessage}`, 'error');
    };
    
    // Intercepter les erreurs non capturées
    window.addEventListener('error', function(event) {
        showToast(`Erreur JavaScript: ${event.message}`, 'error');
        return false; // Permet à l'erreur de se propager
    });
    
    // Intercepter les rejets de promesses non gérés
    window.addEventListener('unhandledrejection', function(event) {
        let message = 'Promesse rejetée';
        if (event.reason) {
            if (event.reason instanceof Error) {
                message = `Erreur asynchrone: ${event.reason.message}`;
            } else if (typeof event.reason === 'string') {
                message = `Erreur asynchrone: ${event.reason}`;
            } else {
                message = 'Erreur asynchrone non spécifiée';
            }
        }
        showToast(message, 'error');
    });
    
    // Remplacer la fonction fetch pour gérer les erreurs réseau
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        try {
            const response = await originalFetch.apply(this, args);
            
            // Vérifier si la réponse est OK
            if (!response.ok) {
                const url = typeof args[0] === 'string' ? args[0] : args[0].url;
                const errorMessage = `Erreur HTTP ${response.status}: ${response.statusText}`;
                
                // Afficher un toast d'erreur avec une action pour réessayer
                showToast(errorMessage, 'error', 8000, {
                    label: 'Réessayer',
                    callback: () => {
                        // Réessayer la requête
                        window.fetch.apply(this, args);
                    }
                });
            }
            
            return response;
        } catch (error) {
            // Gérer les erreurs réseau (CORS, connexion perdue, etc.)
            const errorMessage = `Erreur réseau: ${error.message}`;
            
            // Afficher un toast d'erreur avec une action pour réessayer
            showToast(errorMessage, 'error', 8000, {
                label: 'Réessayer',
                callback: () => {
                    // Réessayer la requête
                    window.fetch.apply(this, args);
                }
            });
            
            throw error; // Propager l'erreur
        }
    };
}

// Fonction pour afficher une notification d'erreur avec suggestions
function showErrorWithSuggestions(message, suggestions = []) {
    // Créer un élément toast personnalisé
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        setupNotificationSystem();
    }
    
    // Créer l'élément toast
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.style.flexDirection = 'column';
    toast.style.alignItems = 'stretch';
    
    // Créer l'en-tête du toast
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '8px';
    
    const titleContainer = document.createElement('div');
    titleContainer.style.display = 'flex';
    titleContainer.style.alignItems = 'center';
    
    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.textContent = '✗';
    
    const title = document.createElement('span');
    title.style.fontWeight = 'bold';
    title.textContent = 'Erreur';
    
    titleContainer.appendChild(icon);
    titleContainer.appendChild(title);
    
    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => {
        closeToast(toast);
    });
    
    header.appendChild(titleContainer);
    header.appendChild(closeButton);
    
    // Créer le contenu du toast
    const content = document.createElement('div');
    content.className = 'toast-message';
    content.textContent = message;
    content.style.marginBottom = '8px';
    
    // Ajouter les suggestions si présentes
    let suggestionsElement = null;
    if (suggestions && suggestions.length > 0) {
        suggestionsElement = document.createElement('div');
        suggestionsElement.style.fontSize = '13px';
        suggestionsElement.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
        suggestionsElement.style.paddingTop = '8px';
        
        const suggestionsTitle = document.createElement('div');
        suggestionsTitle.style.fontWeight = 'bold';
        suggestionsTitle.style.marginBottom = '4px';
        suggestionsTitle.textContent = 'Suggestions:';
        
        suggestionsElement.appendChild(suggestionsTitle);
        
        const suggestionsList = document.createElement('ul');
        suggestionsList.style.margin = '0';
        suggestionsList.style.paddingLeft = '20px';
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('li');
            item.textContent = suggestion;
            suggestionsList.appendChild(item);
        });
        
        suggestionsElement.appendChild(suggestionsList);
    }
    
    // Assembler le toast
    toast.appendChild(header);
    toast.appendChild(content);
    if (suggestionsElement) {
        toast.appendChild(suggestionsElement);
    }
    
    // Ajouter le toast au conteneur
    document.getElementById('toast-container').appendChild(toast);
    
    // Fermer automatiquement après 10 secondes (plus long pour les erreurs avec suggestions)
    const timeout = setTimeout(() => {
        closeToast(toast);
    }, 10000);
    
    // Stocker le timeout pour pouvoir l'annuler si nécessaire
    toast._timeout = timeout;
    
    // Fonction pour fermer le toast
    function closeToast(toastElement) {
        // Annuler le timeout si le toast est fermé manuellement
        if (toastElement._timeout) {
            clearTimeout(toastElement._timeout);
        }
        
        // Ajouter la classe de sortie pour l'animation
        toastElement.classList.add('toast-exit');
        
        // Supprimer le toast après l'animation
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
        }, 300);
    }
    
    return toast;
}

// Fonction pour afficher une notification de succès avec détails
function showSuccessWithDetails(message, details = null) {
    // Créer un élément toast personnalisé
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        setupNotificationSystem();
    }
    
    // Créer l'élément toast
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    
    // Créer le contenu du toast
    const content = document.createElement('div');
    content.className = 'toast-content';
    
    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.textContent = '✓';
    
    const messageElement = document.createElement('span');
    messageElement.className = 'toast-message';
    messageElement.textContent = message;
    
    content.appendChild(icon);
    content.appendChild(messageElement);
    
    // Ajouter un bouton de fermeture
    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => {
        closeToast(toast);
    });
    
    toast.appendChild(content);
    toast.appendChild(closeButton);
    
    // Ajouter les détails si présents
    if (details) {
        const detailsButton = document.createElement('button');
        detailsButton.textContent = 'Détails';
        detailsButton.style.marginLeft = '10px';
        detailsButton.style.padding = '4px 8px';
        detailsButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        detailsButton.style.border = 'none';
        detailsButton.style.borderRadius = '4px';
        detailsButton.style.color = 'inherit';
        detailsButton.style.cursor = 'pointer';
        
        detailsButton.addEventListener('click', () => {
            // Créer une modal pour afficher les détails
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = '10000';
            
            const modalContent = document.createElement('div');
            modalContent.style.backgroundColor = 'var(--card-background, white)';
            modalContent.style.borderRadius = '8px';
            modalContent.style.padding = '20px';
            modalContent.style.maxWidth = '80%';
            modalContent.style.maxHeight = '80%';
            modalContent.style.overflow = 'auto';
            modalContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
            modalContent.style.color = 'var(--text-color, black)';
            
            const modalHeader = document.createElement('div');
            modalHeader.style.display = 'flex';
            modalHeader.style.justifyContent = 'space-between';
            modalHeader.style.alignItems = 'center';
            modalHeader.style.marginBottom = '15px';
            
            const modalTitle = document.createElement('h3');
            modalTitle.style.margin = '0';
            modalTitle.textContent = 'Détails';
            
            const modalCloseButton = document.createElement('button');
            modalCloseButton.textContent = '×';
            modalCloseButton.style.background = 'none';
            modalCloseButton.style.border = 'none';
            modalCloseButton.style.fontSize = '24px';
            modalCloseButton.style.cursor = 'pointer';
            modalCloseButton.style.color = 'var(--text-color, black)';
            
            modalCloseButton.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            
            modalHeader.appendChild(modalTitle);
            modalHeader.appendChild(modalCloseButton);
            
            const modalBody = document.createElement('div');
            
            if (typeof details === 'string') {
                modalBody.textContent = details;
            } else if (typeof details === 'object') {
                try {
                    modalBody.innerHTML = `<pre>${JSON.stringify(details, null, 2)}</pre>`;
                } catch (e) {
                    modalBody.textContent = 'Impossible d\'afficher les détails.';
                }
            }
            
            modalContent.appendChild(modalHeader);
            modalContent.appendChild(modalBody);
            modal.appendChild(modalContent);
            
            document.body.appendChild(modal);
            
            // Fermer la modal en cliquant en dehors
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    document.body.removeChild(modal);
                }
            });
        });
        
        toast.appendChild(detailsButton);
    }
    
    // Ajouter le toast au conteneur
    document.getElementById('toast-container').appendChild(toast);
    
    // Fermer automatiquement après 5 secondes
    const timeout = setTimeout(() => {
        closeToast(toast);
    }, 5000);
    
    // Stocker le timeout pour pouvoir l'annuler si nécessaire
    toast._timeout = timeout;
    
    // Fonction pour fermer le toast
    function closeToast(toastElement) {
        // Annuler le timeout si le toast est fermé manuellement
        if (toastElement._timeout) {
            clearTimeout(toastElement._timeout);
        }
        
        // Ajouter la classe de sortie pour l'animation
        toastElement.classList.add('toast-exit');
        
        // Supprimer le toast après l'animation
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
        }, 300);
    }
    
    return toast;
}

// Fonction pour afficher une notification d'information avec action
function showInfoWithAction(message, actionLabel, actionCallback) {
    return showToast(message, 'info', 10000, {
        label: actionLabel,
        callback: actionCallback
    });
}

// Fonction pour afficher une notification d'avertissement avec action
function showWarningWithAction(message, actionLabel, actionCallback) {
    return showToast(message, 'warning', 8000, {
        label: actionLabel,
        callback: actionCallback
    });
}

// Fonction pour afficher une notification de chargement
function showLoadingToast(message) {
    // Créer un élément toast personnalisé
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        setupNotificationSystem();
    }
    
    // Créer l'élément toast
    const toast = document.createElement('div');
    toast.className = 'toast toast-info';
    
    // Créer le contenu du toast
    const content = document.createElement('div');
    content.className = 'toast-content';
    
    // Créer un spinner
    const spinner = document.createElement('div');
    spinner.className = 'toast-spinner';
    spinner.style.width = '20px';
    spinner.style.height = '20px';
    spinner.style.borderRadius = '50%';
    spinner.style.border = '2px solid rgba(255, 255, 255, 0.3)';
    spinner.style.borderTopColor = 'white';
    spinner.style.animation = 'spin 1s linear infinite';
    spinner.style.marginRight = '12px';
    
    // Ajouter l'animation de rotation
    const spinnerStyle = document.createElement('style');
    spinnerStyle.textContent = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(spinnerStyle);
    
    const messageElement = document.createElement('span');
    messageElement.className = 'toast-message';
    messageElement.textContent = message;
    
    content.appendChild(spinner);
    content.appendChild(messageElement);
    toast.appendChild(content);
    
    // Ajouter le toast au conteneur
    document.getElementById('toast-container').appendChild(toast);
    
    // Retourner une fonction pour mettre à jour ou fermer le toast
    return {
        update: (newMessage) => {
            messageElement.textContent = newMessage;
        },
        close: () => {
            toast.classList.add('toast-exit');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        },
        success: (successMessage) => {
            // Transformer en toast de succès
            toast.className = 'toast toast-success';
            spinner.remove();
            
            const icon = document.createElement('span');
            icon.className = 'toast-icon';
            icon.textContent = '✓';
            content.insertBefore(icon, messageElement);
            
            messageElement.textContent = successMessage;
            
            // Fermer automatiquement après 5 secondes
            setTimeout(() => {
                toast.classList.add('toast-exit');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 5000);
        },
        error: (errorMessage) => {
            // Transformer en toast d'erreur
            toast.className = 'toast toast-error';
            spinner.remove();
            
            const icon = document.createElement('span');
            icon.className = 'toast-icon';
            icon.textContent = '✗';
            content.insertBefore(icon, messageElement);
            
            messageElement.textContent = errorMessage;
            
            // Fermer automatiquement après 8 secondes
            setTimeout(() => {
                toast.classList.add('toast-exit');
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 8000);
        }
    };
}

// Intégrer les notifications toast dans les fonctions existantes
document.addEventListener('DOMContentLoaded', function() {
    // Remplacer la fonction uploadFile pour utiliser les notifications toast
    if (typeof window.uploadFile === 'function') {
        const originalUploadFile = window.uploadFile;
        
        window.uploadFile = async function(file) {
            // Afficher une notification de chargement
            const loadingToast = showLoadingToast(`Traitement du fichier ${file.name}...`);
            
            try {
                const result = await originalUploadFile(file);
                
                // Afficher une notification de succès
                loadingToast.success(`Fichier ${file.name} traité avec succès`);
                
                return result;
            } catch (error) {
                // Afficher une notification d'erreur
                loadingToast.error(`Erreur lors du traitement du fichier ${file.name}`);
                
                // Afficher des suggestions en fonction de l'erreur
                if (error.message && error.message.includes('format')) {
                    showErrorWithSuggestions('Erreur de format de fichier', [
                        'Vérifiez que le fichier est au format CSV',
                        'Assurez-vous que les colonnes sont correctement formatées',
                        'Vérifiez les séparateurs (virgule ou point-virgule)'
                    ]);
                } else if (error.message && error.message.includes('réseau')) {
                    showErrorWithSuggestions('Erreur de connexion', [
                        'Vérifiez votre connexion internet',
                        'Le serveur est peut-être indisponible, réessayez plus tard',
                        'Contactez l\'administrateur si le problème persiste'
                    ]);
                }
                
                throw error;
            }
        };
    }
    
    // Remplacer la fonction processBatchFiles pour utiliser les notifications toast
    if (typeof window.processBatchFiles === 'function') {
        const originalProcessBatchFiles = window.processBatchFiles;
        
        window.processBatchFiles = async function() {
            // Afficher une notification de chargement
            const loadingToast = showLoadingToast('Traitement des fichiers en cours...');
            
            try {
                const result = await originalProcessBatchFiles();
                
                // Afficher une notification de succès avec détails
                const successDetails = {
                    total: window.batchFiles.length,
                    success: window.batchResults.filter(r => !r.error).length,
                    errors: window.batchResults.filter(r => r.error).length
                };
                
                loadingToast.success(`Traitement terminé: ${successDetails.success}/${successDetails.total} fichiers traités avec succès`);
                
                // Afficher des détails supplémentaires si des erreurs sont survenues
                if (successDetails.errors > 0) {
                    showWarningWithAction(
                        `${successDetails.errors} fichiers n'ont pas pu être traités`,
                        'Voir détails',
                        () => {
                            // Afficher les détails des erreurs
                            const errorFiles = window.batchResults
                                .filter(r => r.error)
                                .map(r => `${r.filename}: ${r.error}`);
                            
                            showErrorWithSuggestions('Détails des erreurs', errorFiles);
                        }
                    );
                }
                
                return result;
            } catch (error) {
                // Afficher une notification d'erreur
                loadingToast.error('Erreur lors du traitement par lots');
                
                // Afficher des suggestions
                showErrorWithSuggestions('Erreur de traitement par lots', [
                    'Vérifiez que tous les fichiers sont au format CSV',
                    'Réduisez le nombre de fichiers si le lot est trop volumineux',
                    'Vérifiez votre connexion internet',
                    'Le serveur est peut-être surchargé, réessayez plus tard'
                ]);
                
                throw error;
            }
        };
    }
});
