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
