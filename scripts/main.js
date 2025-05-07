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

console.log("[DEBUG] Données reçues de l'API :", data);

function displayResults(data) {
    updatePlaceholder("#random-method", "Méthode aléatoire : " + JSON.stringify(data.random));
    updatePlaceholder("#mlp-method", "MLP : " + JSON.stringify(data.mlp));
    updatePlaceholder("#cnn-method", "CNN : " + JSON.stringify(data.cnn));

    if (data.curve_image) {
        const container = document.querySelector("#graph-zone .content-placeholder");
        container.innerHTML = `<img src="data:image/png;base64,${data.curve_image}" alt="Courbe IV générée" style="max-width:100%; height:auto; border-radius:10px; box-shadow: 0 0 10px rgba(0,0,0,0.2);" />`;
    } else {
        updatePlaceholder("#graph-zone", "Pas d'image reçue.");
    }

}

function drawGraph(data, container) {
    if (!container) {
        console.error("[ERROR] Élément container pour le graphe non trouvé.");
        return;
    }

    const placeholder = container.querySelector('.content-placeholder');
    if (placeholder) {
        placeholder.innerHTML = "<em>Graphique en cours de développement...</em>";
    } else {
        container.innerHTML = "<em>Graphique en cours de développement...</em>";
    }

    console.log("[INFO] Graphique à tracer avec :", data);
}
