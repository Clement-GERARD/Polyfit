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

function generatePDF() {
    if (allResults.length === 0) {
        showToast('Aucune donnée pour générer le PDF', 'error');
        return;
    }

    showToast('Génération du PDF en cours...', 'info');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const titleFontSize = 16;
    const subtitleFontSize = 14;
    const normalFontSize = 11;
    const smallFontSize = 9;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;

    // --- Page de garde ---
    doc.setFontSize(titleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport d\'analyse Polyfit AI', pageWidth / 2, margin, { align: 'center' });

    doc.setFontSize(normalFontSize);
    doc.setFont('helvetica', 'normal');
    const today = new Date();
    const dateStr = today.toLocaleDateString();
    doc.text(`Date: ${dateStr}`, pageWidth - margin, margin + 10, { align: 'right' });

    // Liste des fichiers
    doc.setFontSize(subtitleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.text('Fichiers analysés', margin, margin + 25);

    doc.setFontSize(normalFontSize);
    doc.setFont('helvetica', 'normal');
    const fileNames = [...new Set(allResults.map(result => result.filename))];
    let y = margin + 33;
    fileNames.forEach(filename => {
        doc.text(`• ${filename}`, margin + 5, y);
        y += 6;
        if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
    });

    // Image curve_image_all (uniquement une fois, prise sur le premier élément qui l’a)
    const allImg = allResults.find(r => r.images?.all)?.images?.all;
    if (allImg) {
        const imgHeight = contentWidth * 0.75;
        if (y + imgHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
        }
        doc.addImage(allImg, 'PNG', margin, y + 10, contentWidth, imgHeight);
    }

    // --- Pages par méthode ---
    const methodList = [
        { key: 'rand', name: 'Fit Classique' },
        { key: 'mlp', name: 'MLP' },
        { key: 'cnn', name: 'CNN' },
        { key: 'gen', name: 'Génétique' }
    ];

    methodList.forEach(({ key, name }) => {
        // Extraire les lignes de résultats existants
        const rows = allResults
            .filter(r => r.methods[key])
            .map(r => ({
                filename: r.filename,
                j0: r.methods[key].J0,
                jph: r.methods[key].Jph,
                rs: r.methods[key].Rs,
                rsh: r.methods[key].Rsh,
                n: r.methods[key].n,
                ssd: r.methods[key].SSD,
                img: r.images?.[key] || null
            }));

        if (rows.length === 0) return;

        doc.addPage();
        doc.setFontSize(titleFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text(`Méthode : ${name}`, pageWidth / 2, margin, { align: 'center' });

        // Paramètres
        doc.setFontSize(subtitleFontSize);
        doc.text('Paramètres prédits', margin, margin + 15);

        doc.autoTable({
            startY: margin + 22,
            head: [[ 'Fichier', 'J0', 'Jph', 'Rs', 'Rsh', 'n', 'SSD' ]],
            body: rows.map(r => [
                r.filename,
                r.j0?.toExponential?.(2) ?? '',
                r.jph?.toFixed?.(3) ?? '',
                r.rs?.toFixed?.(3) ?? '',
                r.rsh?.toFixed?.(3) ?? '',
                r.n?.toFixed?.(3) ?? '',
                r.ssd?.toExponential?.(2) ?? ''
            ]),
            styles: { fontSize: smallFontSize },
            headStyles: { fillColor: [4, 84, 117], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [240, 240, 240] },
            margin: { left: margin, right: margin }
        });

        // Position après le tableau
        let yImg = doc.lastAutoTable.finalY + 10;

        doc.setFontSize(subtitleFontSize);
        doc.setFont('helvetica', 'bold');
        doc.text('Courbe associée', margin, yImg);
        yImg += 5;

        // Affiche la première image disponible
        const firstImage = rows.find(r => r.img)?.img;
        if (firstImage) {
            const imgHeight = contentWidth * 0.6;
            if (yImg + imgHeight > pageHeight - margin) {
                doc.addPage();
                yImg = margin;
            }
            doc.addImage(firstImage, 'PNG', margin, yImg, contentWidth, imgHeight);
        }
    });

    doc.save('polyfit_rapport.pdf');
    showToast('Génération du PDF réussie', 'success');
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
