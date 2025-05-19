document.getElementById('file-input').addEventListener('change', handleFiles);
document.getElementById('display-mode').addEventListener('change', toggleDisplayMode);

const resultDetails = {};  // Stockage des résultats par méthode
const allResults = [];     // Stockage de tous les résultats pour les boîtes à moustaches
let currentFileName = "";  // Nom du fichier en cours de traitement

// Fonction pour basculer entre les modes d'affichage
function toggleDisplayMode() {
    const isRawMode = document.getElementById('display-mode').checked;
    document.getElementById('normal-display').classList.toggle('hidden', isRawMode);
    document.getElementById('raw-display').classList.toggle('hidden', !isRawMode);
}

function handleFiles(event) {
    const files = event.target.files;

    console.log("[LOG] Détection des fichiers :", files);

    if (!files.length) {
        console.warn("[WARN] Aucun fichier sélectionné.");
        return;
    }

    // Mettre à jour le statut
    updateProcessingStatus("processing");
    
    // Mettre à jour le nom du fichier
    currentFileName = files[0].name;
    document.getElementById('current-file').textContent = currentFileName;

    // Mettre à jour les placeholders
    updatePlaceholder("#graph-zone", "Affichage des courbes en cours...");
    updatePlaceholder("#random-method", "Analyse par Fit Classique en cours...");
    updatePlaceholder("#mlp-method", "Analyse par MLP en cours...");
    updatePlaceholder("#cnn-method", "Analyse par CNN en cours...");
    updatePlaceholder("#genetic-method", "Analyse par Fit Génétique en cours...");
    updatePlaceholder("#boxplot-zone", "Calcul des distributions en cours...");

    // Réinitialiser le tableau
    resetComparisonTable();

    uploadFile(files[0]); // Appel réel
}

function updateProcessingStatus(status) {
    const statusElement = document.getElementById('processing-status');
    statusElement.className = 'status-badge';
    
    switch(status) {
        case 'waiting':
            statusElement.classList.add('status-waiting');
            statusElement.textContent = "En attente";
            break;
        case 'processing':
            statusElement.classList.add('status-processing');
            statusElement.textContent = "En cours";
            break;
        case 'done':
            statusElement.classList.add('status-done');
            statusElement.textContent = "Données retournées";
            break;
        default:
            statusElement.classList.add('status-waiting');
            statusElement.textContent = "En attente";
    }
}

function resetComparisonTable() {
    const cellsToReset = document.querySelectorAll('#comparison-table td:not(:first-child)');
    cellsToReset.forEach(cell => {
        cell.textContent = "-";
    });
}

function updatePlaceholder(selector, message) {
    const element = document.querySelector(`${selector} .content-placeholder`);
    if (element) {
        element.innerHTML = message;  // Utiliser innerHTML pour gérer les <br> correctement
    } else {
        console.error(`[ERROR] Élément non trouvé : ${selector}`);
    }
}

function updateTableCell(method, param, value) {
    const cell = document.querySelector(`.${method}-${param}`);
    if (cell) {
        cell.textContent = value;
    } else {
        console.error(`[ERROR] Cellule non trouvée : .${method}-${param}`);
    }
}

const API_URL = "https://clementgerard-polyfit.hf.space/predict";

async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        console.log("Résultat brut reçu :", response);

        if (response.ok) {
            const data = await response.json();

            // Affichage des données reçues pour déboguer
            console.log("[DEBUG] Données reçues de l'API :", data);

            // Mettre à jour le statut
            updateProcessingStatus("done");
            
            // Stocker les résultats pour les graphiques box plot
            storeResults(data);
            
            // Afficher les résultats
            displayResults(data);
            
            // Mettre à jour le tableau
            updateComparisonTable(data);
            
            // Créer les boîtes à moustaches
            createBoxplots();
            
        } else {
            alert("Erreur lors du téléchargement du fichier.");
            updateProcessingStatus("waiting");
        }
    } catch (error) {
        console.error("Erreur:", error);
        updateProcessingStatus("waiting");
    }
}

function storeResults(data) {
    // Créer un objet résultat avec les données actuelles
    const result = {
        filename: currentFileName,
        methods: {}
    };
    
    // Ajouter les résultats de chaque méthode
    if (data.params_mlp) {
        result.methods.mlp = data.params_mlp;
    }
    
    if (data.params_cnn) {
        result.methods.cnn = data.params_cnn;
    }
    
    if (data.params_genetique) {
        result.methods.gen = data.params_genetique;
    }
    
    if (data.params_random) {
        result.methods.rand = data.params_random;
    }
    
    // Ajouter au tableau des résultats
    allResults.push(result);
}

function updateComparisonTable(data) {
    // Méthode MLP
    if (data.params_mlp) {
        updateTableCell("mlp", "J0", data.params_mlp.J0);
        updateTableCell("mlp", "Jph", data.params_mlp.Jph);
        updateTableCell("mlp", "Rs", data.params_mlp.Rs);
        updateTableCell("mlp", "Rsh", data.params_mlp.Rsh);
        updateTableCell("mlp", "n", data.params_mlp.n);
    }

    // Méthode CNN
    if (data.params_cnn) {
        updateTableCell("cnn", "J0", data.params_cnn.J0);
        updateTableCell("cnn", "Jph", data.params_cnn.Jph);
        updateTableCell("cnn", "Rs", data.params_cnn.Rs);
        updateTableCell("cnn", "Rsh", data.params_cnn.Rsh);
        updateTableCell("cnn", "n", data.params_cnn.n);
    }

    // Méthode génétique
    if (data.params_genetique) {
        updateTableCell("gen", "J0", data.params_genetique.J0);
        updateTableCell("gen", "Jph", data.params_genetique.Jph);
        updateTableCell("gen", "Rs", data.params_genetique.Rs);
        updateTableCell("gen", "Rsh", data.params_genetique.Rsh);
        updateTableCell("gen", "n", data.params_genetique.n);
    }

    // Méthode aléatoire
    if (data.params_random) {
        updateTableCell("rand", "J0", data.params_random.J0);
        updateTableCell("rand", "Jph", data.params_random.Jph);
        updateTableCell("rand", "Rs", data.params_random.Rs);
        updateTableCell("rand", "Rsh", data.params_random.Rsh);
        updateTableCell("rand", "n", data.params_random.n);
    }
}

function displayResults(data) {
    // Méthode MLP
    if (data.params_mlp) {
        updatePlaceholder("#mlp-method", `
            J0: ${data.params_mlp.J0}<br>
            Jph: ${data.params_mlp.Jph}<br>
            Rs: ${data.params_mlp.Rs}<br>
            Rsh: ${data.params_mlp.Rsh}<br>
            n: ${data.params_mlp.n}
        `);
        resultDetails["mlp"] = {
            params: data.params_mlp,
            image: data.curve_image_mlp || null
        };
    }

    // Méthode CNN
    if (data.params_cnn) {
        updatePlaceholder("#cnn-method", `
            J0: ${data.params_cnn.J0}<br>
            Jph: ${data.params_cnn.Jph}<br>
            Rs: ${data.params_cnn.Rs}<br>
            Rsh: ${data.params_cnn.Rsh}<br>
            n: ${data.params_cnn.n}
        `);
        resultDetails["cnn"] = {
            params: data.params_cnn,
            image: data.curve_image_cnn || null
        };
    }

    // Méthode génétique
    if (data.params_genetique) {
        updatePlaceholder("#genetic-method", `
            J0: ${data.params_genetique.J0}<br>
            Jph: ${data.params_genetique.Jph}<br>
            Rs: ${data.params_genetique.Rs}<br>
            Rsh: ${data.params_genetique.Rsh}<br>
            n: ${data.params_genetique.n}
        `);
        resultDetails["gen"] = {
            params: data.params_genetique,
            image: data.curve_image_gen || null
        };
    }

    // Méthode aléatoire
    if (data.params_random) {
        updatePlaceholder("#random-method", `
            J0: ${data.params_random.J0}<br>
            Jph: ${data.params_random.Jph}<br>
            Rs: ${data.params_random.Rs}<br>
            Rsh: ${data.params_random.Rsh}<br>
            n: ${data.params_random.n}
        `);
        resultDetails["rand"] = {
            params: data.params_random,
            image: data.curve_image_rand || null
        };
    }

    // Affichage du graphique combiné
    if (data.curve_image_all) {
        const container = document.querySelector("#graph-zone .content-placeholder");
        container.innerHTML = `<img src="data:image/png;base64,${data.curve_image_all}" alt="Courbe IV combinée" style="width:100%; height:auto; border-radius:10px; box-shadow: 0 0 10px rgba(0,0,0,0.2);" />`;
    } else {
        updatePlaceholder("#graph-zone", "Pas d'image combinée reçue.");
    }
}

function createBoxplots() {
    // Si il n'y a qu'un seul résultat, on ne peut pas créer de boîtes à moustaches
    if (allResults.length <= 1) {
        updatePlaceholder("#boxplot-zone", "Pas assez de données pour créer des boîtes à moustaches. Veuillez analyser plusieurs fichiers.");
        return;
    }

    // Collecter toutes les données par paramètre
    const boxplotData = {
        J0: { rand: [], mlp: [], cnn: [], gen: [] },
        Jph: { rand: [], mlp: [], cnn: [], gen: [] },
        Rs: { rand: [], mlp: [], cnn: [], gen: [] },
        Rsh: { rand: [], mlp: [], cnn: [], gen: [] },
        n: { rand: [], mlp: [], cnn: [], gen: [] }
    };

    // Remplir les données
    allResults.forEach(result => {
        for (const [methodKey, methodParams] of Object.entries(result.methods)) {
            for (const [paramKey, paramValue] of Object.entries(methodParams)) {
                if (boxplotData[paramKey] && boxplotData[paramKey][methodKey]) {
                    boxplotData[paramKey][methodKey].push(parseFloat(paramValue));
                }
            }
        }
    });

    // Masquer le placeholder
    document.querySelector("#boxplot-zone .content-placeholder").style.display = "none";

    // Exemple de mise à jour d'un des boxplots (dans un cas réel, vous utiliseriez une bibliothèque de graphiques)
    for (const [paramKey, methodsData] of Object.entries(boxplotData)) {
        const boxplotElement = document.getElementById(`${paramKey}-boxplot`);
        
        if (boxplotElement) {
            let boxplotContent = `<h3>${paramKey}</h3>`;
            
            for (const [methodKey, values] of Object.entries(methodsData)) {
                if (values.length > 0) {
                    const min = Math.min(...values).toFixed(4);
                    const max = Math.max(...values).toFixed(4);
                    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(4);
                    
                    boxplotContent += `
                        <div class="method-stats">
                            <strong>${methodToName(methodKey)}:</strong> 
                            Min: ${min}, 
                            Moy: ${avg}, 
                            Max: ${max}
                        </div>
                    `;
                }
            }
            
            boxplotElement.innerHTML = boxplotContent;
        }
    }
}

function methodToName(methodKey) {
    switch(methodKey) {
        case 'rand': return 'Classique';
        case 'mlp': return 'MLP';
        case 'cnn': return 'CNN';
        case 'gen': return 'Génétique';
        default: return methodKey;
    }
}

function openDetailsModal(method) {
    const modal = document.getElementById("details-modal");
    const body = document.getElementById("modal-body");
    const title = document.getElementById("modal-title");

    const details = resultDetails[method];

    if (!details || !details.params || !details.image) {
        console.warn("[WARN] Données manquantes pour la méthode :", method, details);
        body.innerHTML = "<p>Aucune donnée disponible pour cette méthode.</p>";
    } else {
        title.textContent = `Détails – ${methodToName(method)}`;
        body.innerHTML = `
            <p><strong>J0 :</strong> ${details.params.J0}</p>
            <p><strong>Jph :</strong> ${details.params.Jph}</p>
            <p><strong>Rs :</strong> ${details.params.Rs}</p>
            <p><strong>Rsh :</strong> ${details.params.Rsh}</p>
            <p><strong>n :</strong> ${details.params.n}</p>
            <img src="data:image/png;base64,${details.image}" alt="Courbe ${method}" style="width:100%; margin-top:15px; border-radius:8px;">
        `;
    }

    modal.classList.remove("hidden");
}

// Permettre le traitement batch des fichiers
function processBatchFiles(files) {
    if (!files || files.length === 0) return;
    
    let currentIndex = 0;
    
    function processNextFile() {
        if (currentIndex < files.length) {
            const file = files[currentIndex];
            currentFileName = file.name;
            document.getElementById('current-file').textContent = currentFileName + ` (${currentIndex + 1}/${files.length})`;
            
            updateProcessingStatus("processing");
            uploadFile(file).then(() => {
                currentIndex++;
                setTimeout(processNextFile, 1000); // Attendre 1 seconde entre chaque fichier
            });
        }
    }
    
    processNextFile();
}

// Fonction pour exporter les résultats en CSV
function exportResultsToCSV() {
    if (allResults.length === 0) {
        alert("Aucun résultat à exporter.");
        return;
    }
    
    // Créer l'en-tête du CSV
    let csvContent = "Fichier,Méthode,J0,Jph,Rs,Rsh,n\n";
    
    // Ajouter chaque ligne de données
    allResults.forEach(result => {
        const filename = result.filename;
        
        for (const [methodKey, params] of Object.entries(result.methods)) {
            const methodName = methodToName(methodKey);
            
            const line = [
                filename,
                methodName,
                params.J0,
                params.Jph,
                params.Rs,
                params.Rsh,
                params.n
            ].join(',');
            
            csvContent += line + '\n';
        }
    });
    
    // Créer un blob et un lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "resultats_polyfit.csv");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("modal-close").addEventListener("click", () => {
        document.getElementById("details-modal").classList.add("hidden");
    });

    document.querySelectorAll(".details-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const method = btn.getAttribute("data-method");
            openDetailsModal(method);
        });
    });
    
    // Ajouter un gestionnaire pour traiter plusieurs fichiers
    document.getElementById('file-input').addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 1) {
            const confirmBatch = confirm(`Vous avez sélectionné ${files.length} fichiers. Voulez-vous les traiter tous en séquence?`);
            
            if (confirmBatch) {
                processBatchFiles(files);
            } else {
                // Sinon, traiter juste le premier fichier comme d'habitude
                handleFiles(event);
            }
        } else {
            // Un seul fichier, comportement normal
            handleFiles(event);
        }
    });
});
