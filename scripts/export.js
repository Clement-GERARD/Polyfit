// Fonctions pour l'export PDF et Excel
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les boutons d'export
    setupExportButtons();
});

const { jsPDF } = window.jspdf;
const doc = new jsPDF();

// Configuration des boutons d'export
function setupExportButtons() {
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const generatePdfBtn = document.getElementById('generate-pdf-btn');
    const exportExcelBtn = document.getElementById('export-excel-btn');
    
    // Ajouter le bouton Excel après le bouton CSV
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', exportToExcel);
    }
    
    // Configurer les gestionnaires d'événements pour les autres boutons
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', exportToCSV);
    }
    
    if (generatePdfBtn) {
        generatePdfBtn.addEventListener('click', generatePDF);
    }
}

// Fonction pour exporter les données au format CSV
function exportToCSV() {
    if (allResults.length === 0) {
        showToast('Aucune donnée à exporter', 'error');
        return;
    }
    
    // Créer l'en-tête du CSV
    let csvContent = 'Fichier,Méthode,J0,Jph,Rs,Rsh,n,SSD\n';
    
    // Ajouter les données de chaque résultat
    allResults.forEach(result => {
        const filename = result.filename;
        
        for (const [methodKey, methodParams] of Object.entries(result.methods)) {
            const methodName = methodToName(methodKey);
            const j0 = methodParams.J0 || '';
            const jph = methodParams.Jph || '';
            const rs = methodParams.Rs || '';
            const rsh = methodParams.Rsh || '';
            const n = methodParams.n || '';
            const ssd = methodParams.SSD || '';
            
            csvContent += `"${filename}","${methodName}",${j0},${jph},${rs},${rsh},${n},${ssd}\n`;
        }
    });
    
    // Créer un objet Blob et un lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Créer un URL pour le Blob
    const url = URL.createObjectURL(blob);
    
    // Configurer le lien de téléchargement
    link.setAttribute('href', url);
    link.setAttribute('download', 'polyfit_resultats.csv');
    link.style.visibility = 'hidden';
    
    // Ajouter le lien au document, cliquer dessus, puis le supprimer
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Export CSV réussi', 'success');
}

// Fonction pour exporter les données au format Excel
function exportToExcel() {
    if (allResults.length === 0) {
        showToast('Aucune donnée à exporter', 'error');
        return;
    }
    
    // Créer un nouveau classeur
    const wb = XLSX.utils.book_new();
    
    // Préparer les données pour la feuille principale
    const mainData = [['Fichier', 'Méthode', 'J0', 'Jph', 'Rs', 'Rsh', 'n', 'SSD']];
    
    // Ajouter les données de chaque résultat
    allResults.forEach(result => {
        const filename = result.filename;
        
        for (const [methodKey, methodParams] of Object.entries(result.methods)) {
            const methodName = methodToName(methodKey);
            const j0 = methodParams.J0 || '';
            const jph = methodParams.Jph || '';
            const rs = methodParams.Rs || '';
            const rsh = methodParams.Rsh || '';
            const n = methodParams.n || '';
            const ssd = methodParams.SSD || '';
            
            mainData.push([filename, methodName, j0, jph, rs, rsh, n, ssd]);
        }
    });
    
    // Créer la feuille principale
    const ws = XLSX.utils.aoa_to_sheet(mainData);
    
    // Ajouter des styles pour l'en-tête
    const headerStyle = {
        font: { bold: true },
        fill: { fgColor: { rgb: "CCCCCC" } }
    };
    
    // Appliquer les styles (note: SheetJS ne prend pas en charge tous les styles directement)
    // Pour une meilleure mise en forme, il faudrait utiliser des bibliothèques supplémentaires
    
    // Ajouter la feuille au classeur
    XLSX.utils.book_append_sheet(wb, ws, "Résultats");
    
    // Créer une feuille pour chaque paramètre avec des statistiques
    const parameters = ['J0', 'Jph', 'Rs', 'Rsh', 'n', 'SSD'];
    
    parameters.forEach(param => {
        // Collecter les données pour ce paramètre
        const paramData = [['Méthode', 'Min', 'Max', 'Moyenne', 'Médiane', 'Écart-type']];
        const methodData = {
            rand: [],
            mlp: [],
            cnn: [],
            gen: []
        };
        
        // Collecter toutes les valeurs par méthode
        allResults.forEach(result => {
            for (const [methodKey, methodParams] of Object.entries(result.methods)) {
                if (methodParams[param] !== undefined) {
                    methodData[methodKey].push(parseFloat(methodParams[param]));
                }
            }
        });
        
        // Calculer les statistiques pour chaque méthode
        for (const [methodKey, values] of Object.entries(methodData)) {
            if (values.length > 0) {
                const min = Math.min(...values);
                const max = Math.max(...values);
                const sum = values.reduce((a, b) => a + b, 0);
                const avg = sum / values.length;
                
                // Trier pour calculer la médiane
                values.sort((a, b) => a - b);
                const median = values.length % 2 === 0
                    ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
                    : values[Math.floor(values.length / 2)];
                
                // Calculer l'écart-type
                const variance = values.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / values.length;
                const stdDev = Math.sqrt(variance);
                
                paramData.push([
                    methodToName(methodKey),
                    min,
                    max,
                    avg,
                    median,
                    stdDev
                ]);
            }
        }
        
        // Créer la feuille pour ce paramètre
        if (paramData.length > 1) {
            const paramSheet = XLSX.utils.aoa_to_sheet(paramData);
            XLSX.utils.book_append_sheet(wb, paramSheet, param);
        }
    });
    
    // Générer le fichier Excel et le télécharger
    XLSX.writeFile(wb, 'polyfit_resultats.xlsx');
    
    showToast('Export Excel réussi', 'success');
}

// Fonction pour générer un PDF des résultats
function generatePDF() {
    if (allResults.length === 0) {
        showToast('Aucune donnée pour générer le PDF', 'error');
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
    doc.text('Rapport d\'analyse Polyfit AI', pageWidth / 2, margin, { align: 'center' });
    
    // Ajouter la date
    doc.setFontSize(normalFontSize);
    doc.setFont('helvetica', 'normal');
    const today = new Date();
    const dateStr = today.toLocaleDateString();
    doc.text(`Date: ${dateStr}`, pageWidth - margin, margin, { align: 'right' });
    
    // Fonction pour ajouter une page par méthode
    function addMethodPage(methodKey, methodName) {
        // Ajouter une nouvelle page
        doc.addPage();
        
        // Titre de la page
        doc.setFontSize(titleFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text(`Méthode: ${methodName}`, pageWidth / 2, margin, { align: 'center' });
        
        let yPosition = margin + 15;
        
        // Tableau des paramètres pour cette méthode
        doc.setFontSize(subtitleFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text('Paramètres', margin, yPosition);
        yPosition += 10;
        
        // Créer le tableau des paramètres
        const paramData = [];
        const paramColumns = [
            { header: 'Fichier', dataKey: 'filename' },
            { header: 'J0', dataKey: 'j0' },
            { header: 'Jph', dataKey: 'jph' },
            { header: 'Rs', dataKey: 'rs' },
            { header: 'Rsh', dataKey: 'rsh' },
            { header: 'n', dataKey: 'n' },
            { header: 'SSD', dataKey: 'ssd' }
        ];
        
        // Remplir les données du tableau
        allResults.forEach(result => {
            if (result.methods[methodKey]) {
                const methodParams = result.methods[methodKey];
                paramData.push({
                    filename: result.filename,
                    j0: methodParams.J0,
                    jph: methodParams.Jph,
                    rs: methodParams.Rs,
                    rsh: methodParams.Rsh,
                    n: methodParams.n,
                    ssd: methodParams.SSD
                });
            }
        });
        
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
        
        // Ajouter le graphique de la méthode si disponible
        doc.setFontSize(subtitleFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text('Courbe isolée', margin, yPosition);
        yPosition += 10;
        
        // Capturer et ajouter le graphique de la méthode
        return new Promise(async (resolve) => {
            try {
                // Chercher le graphique de la méthode
                const methodChartElement = document.querySelector(`#${methodKey}-method .curve-image`);
                
                if (methodChartElement) {
                    // Capturer le graphique en tant qu'image
                    const canvas = await html2canvas(methodChartElement, {
                        scale: 2,
                        logging: false,
                        useCORS: true
                    });
                    
                    const imgData = canvas.toDataURL('image/png');
                    
                    // Calculer les dimensions de l'image pour qu'elle tienne sur la page
                    const imgWidth = contentWidth;
                    const imgHeight = contentWidth * 0.6; // Ratio approximatif
                    
                    // Ajouter l'image
                    doc.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
                }
                
                resolve();
            } catch (error) {
                console.error(`Erreur lors de la capture du graphique pour ${methodName}:`, error);
                resolve();
            }
        });
    }
    
    // Fonction pour ajouter la page de la courbe générale
    function addCurveAllPage() {
        // Ajouter une nouvelle page
        doc.addPage();
        
        // Titre de la page
        doc.setFontSize(titleFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text('Courbe générale', pageWidth / 2, margin, { align: 'center' });
        
        let yPosition = margin + 15;
        
        // Ajouter le graphique de la courbe générale
        return new Promise(async (resolve) => {
            try {
                // Chercher le graphique de la courbe générale
                const curveAllElement = document.querySelector('#graph-zone .curve-image-all');
                
                if (curveAllElement) {
                    // Capturer le graphique en tant qu'image
                    const canvas = await html2canvas(curveAllElement, {
                        scale: 2,
                        logging: false,
                        useCORS: true
                    });
                    
                    const imgData = canvas.toDataURL('image/png');
                    
                    // Calculer les dimensions de l'image pour qu'elle tienne sur la page
                    const imgWidth = contentWidth;
                    const imgHeight = contentWidth * 0.75; // Ratio approximatif
                    
                    // Ajouter l'image
                    doc.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
                }
                
                resolve();
            } catch (error) {
                console.error('Erreur lors de la capture de la courbe générale:', error);
                resolve();
            }
        });
    }
    
    // Fonction pour ajouter la page des boîtes à moustaches
    function addBoxplotPage() {
        // Ajouter une nouvelle page
        doc.addPage();
        
        // Titre de la page
        doc.setFontSize(titleFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text('Boîtes à moustaches', pageWidth / 2, margin, { align: 'center' });
        
        let yPosition = margin + 15;
        
        // Ajouter le graphique des boîtes à moustaches
        return new Promise(async (resolve) => {
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
                    const imgHeight = contentWidth * 0.75; // Ratio approximatif
                    
                    // Ajouter l'image
                    doc.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
                }
                
                resolve();
            } catch (error) {
                console.error('Erreur lors de la capture des boîtes à moustaches:', error);
                resolve();
            }
        });
    }
    
    // Générer le PDF avec la structure demandée
    async function generateStructuredPDF() {
        try {
            // Page de couverture avec informations générales
            let yPosition = margin + 25;
            
            // Ajouter un résumé des fichiers analysés
            doc.setFontSize(subtitleFontSize);
            doc.setFont('helvetica', 'bold');
            doc.text('Fichiers analysés', margin, yPosition);
            
            yPosition += 8;
            doc.setFontSize(normalFontSize);
            doc.setFont('helvetica', 'normal');
            
            // Liste des fichiers
            const fileNames = [...new Set(allResults.map(result => result.filename))];
            fileNames.forEach(filename => {
                doc.text(`• ${filename}`, margin + 5, yPosition);
                yPosition += 6;
                
                // Vérifier si on doit passer à une nouvelle page
                if (yPosition > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin;
                }
            });
            
            // Ajouter une page pour chaque méthode
            await addMethodPage('rand', 'Fit Classique');
            await addMethodPage('mlp', 'MLP');
            await addMethodPage('cnn', 'CNN');
            await addMethodPage('gen', 'Génétique');
            
            // Ajouter la page de la courbe générale
            await addCurveAllPage();
            
            // Ajouter la page des boîtes à moustaches
            await addBoxplotPage();
            
            // Sauvegarder le PDF
            doc.save('polyfit_rapport.pdf');
            
            showToast('Génération du PDF réussie', 'success');
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            showToast('Erreur lors de la génération du PDF', 'error');
        }
    }
    
    // Lancer la génération du PDF structuré
    generateStructuredPDF();
}

// Fonction pour afficher un toast de notification
function showToast(message, type = 'info') {
    // Vérifier si le conteneur de toast existe
    let toastContainer = document.getElementById('toast-container');
    
    // Créer le conteneur s'il n'existe pas
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
        
        // Ajouter des styles pour le conteneur
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '9999';
    }
    
    // Créer le toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close">×</button>
    `;
    
    // Ajouter des styles pour le toast
    toast.style.backgroundColor = getToastColor(type);
    toast.style.color = '#fff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '4px';
    toast.style.marginBottom = '10px';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.style.display = 'flex';
    toast.style.justifyContent = 'space-between';
    toast.style.alignItems = 'center';
    toast.style.minWidth = '300px';
    toast.style.maxWidth = '400px';
    toast.style.animation = 'fadeIn 0.3s, fadeOut 0.3s 2.7s';
    toast.style.opacity = '0';
    
    // Ajouter des styles pour le contenu du toast
    const toastContent = toast.querySelector('.toast-content');
    toastContent.style.display = 'flex';
    toastContent.style.alignItems = 'center';
    
    // Ajouter des styles pour l'icône
    const toastIcon = toast.querySelector('.toast-icon');
    toastIcon.style.marginRight = '10px';
    toastIcon.style.fontSize = '20px';
    
    // Ajouter des styles pour le bouton de fermeture
    const closeButton = toast.querySelector('.toast-close');
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.color = '#fff';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.marginLeft = '10px';
    
    // Ajouter le toast au conteneur
    toastContainer.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // Fermer le toast après 3 secondes
    const timeout = setTimeout(() => {
        closeToast();
    }, 3000);
    
    // Fonction pour fermer le toast
    function closeToast() {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
    
    // Ajouter un gestionnaire d'événements pour le bouton de fermeture
    closeButton.addEventListener('click', () => {
        clearTimeout(timeout);
        closeToast();
    });
    
    // Ajouter des styles d'animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
}

// Fonction pour obtenir la couleur du toast en fonction du type
function getToastColor(type) {
    switch (type) {
        case 'success':
            return '#28a745';
        case 'error':
            return '#dc3545';
        case 'warning':
            return '#ffc107';
        case 'info':
        default:
            return '#17a2b8';
    }
}

// Fonction pour obtenir l'icône du toast en fonction du type
function getToastIcon(type) {
    switch (type) {
        case 'success':
            return '✓';
        case 'error':
            return '✗';
        case 'warning':
            return '⚠';
        case 'info':
        default:
            return 'ℹ';
    }
}
