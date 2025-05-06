document.getElementById('file-input').addEventListener('change', handleFiles);

function handleFiles(event) {
    const files = event.target.files;

    console.log("[LOG] Détection des fichiers :", files);

    if (!files.length) {
        console.warn("[WARN] Aucun fichier sélectionné.");
        return;
    }

    updatePlaceholder("#graph-zone", "Affichage des courbes en cours...");
    updatePlaceholder("#random-method", "Analyse par méthode aléatoire en cours...");
    updatePlaceholder("#mlp-method", "Analyse par MLP en cours...");
    updatePlaceholder("#cnn-method", "Analyse par CNN en cours...");

    uploadFile(files[0]); // Appel réel
}

function updatePlaceholder(selector, message) {
    const element = document.querySelector(`${selector} .content-placeholder`);
    if (element) {
        element.textContent = message;
    } else {
        console.error(`[ERROR] Élément non trouvé : ${selector}`);
    }
}

function simulateApiRequest(files) {
    console.log("[INFO] Simulation de l'envoi des fichiers à l'API...");

    setTimeout(() => {
        console.log("[SUCCESS] API a répondu avec succès (simulation)");

        updatePlaceholder("#graph-zone", "✅ Courbes affichées !");
        updatePlaceholder("#random-method", "🔍 Résultats aléatoires disponibles");
        updatePlaceholder("#mlp-method", "✅ Prédiction MLP reçue");
        updatePlaceholder("#cnn-method", "✅ Prédiction CNN reçue");
    }, 1000);
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

        if (response.ok) {
            const data = await response.json();
            displayResults(data);
        } else {
            alert("Erreur lors du téléchargement du fichier.");
        }
    } catch (error) {
        console.error("Erreur:", error);
    }
}

function displayResults(data) {
    updatePlaceholder("#random-method", "Méthode aléatoire : " + JSON.stringify(data.random));
    updatePlaceholder("#mlp-method", "MLP : " + JSON.stringify(data.mlp));
    updatePlaceholder("#cnn-method", "CNN : " + JSON.stringify(data.cnn));

    // Exemple : tracer un graphique si data.curves est présent
    if (data.curves) {
        drawGraph(data.curves); // à implémenter avec Chart.js ou autre
    } else {
        updatePlaceholder("#graph-zone", "Pas de courbes reçues.");
    }
}
