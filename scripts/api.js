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
    const predictionsDiv = document.getElementById("predictions");
    predictionsDiv.innerHTML = `
        <p><strong>R_s:</strong> ${data.R_s}</p>
        <p><strong>R_sh:</strong> ${data.R_sh}</p>
        <p><strong>J_o:</strong> ${data.J_o}</p>
    `;
    
    const graphDiv = document.getElementById("graph");
    // Code pour générer le graphique avec les résultats, par exemple avec Chart.js
}
