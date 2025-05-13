document.getElementById('file-input').addEventListener('change', handleFiles);

const resultDetails = {};  // Stockage des résultats par méthode

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
    updatePlaceholder("#genetic-method", "Analyse par CNN en cours...");

    uploadFile(files[0]); // Appel réel
}

function updatePlaceholder(selector, message) {
    const element = document.querySelector(`${selector} .content-placeholder`);
    if (element) {
        element.innerHTML = message;  // Utiliser innerHTML pour gérer les <br> correctement
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

        console.log("Résultat brut reçu :", response);

        if (response.ok) {
            const data = await response.json();

            // Affichage des données reçues pour déboguer
            console.log("[DEBUG] Données reçues de l'API :", data);

            displayResults(data);
        } else {
            alert("Erreur lors du téléchargement du fichier.");
        }
    } catch (error) {
        console.error("Erreur:", error);
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
        resultDetails["mlp"] = {
        params: data.params_mlp,
        image: data.curve_image_mlp || null
    };
        resultDetails["gen"] = {
        params: data.params_genetique,
        image: data.curve_image_genetique || null
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
            image: data.curve_image_random || null
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
