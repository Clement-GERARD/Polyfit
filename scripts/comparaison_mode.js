document.addEventListener('DOMContentLoaded', () => {
    const compareButton = document.getElementById('compare-btn');
    if (compareButton) {
        compareButton.addEventListener('click', compareSelectedFiles);
    }

    updateComparisonSelectors(); // Initialiser les sélecteurs au chargement
});

// Fonctions pour le mode comparaison
function updateComparisonSelectors() {
    const fileSelect1 = document.querySelector('#file-select-1');
    const fileSelect2 = document.querySelector('#file-select-2');

    if (!fileSelect1 || !fileSelect2) return;

    // Vider les sélecteurs
    fileSelect1.innerHTML = '';
    fileSelect2.innerHTML = '';

    // Ajouter les options
    batchFiles.forEach((file, index) => {
        const option1 = document.createElement('option');
        option1.value = index;
        option1.textContent = file.name;

        const option2 = document.createElement('option');
        option2.value = index;
        option2.textContent = file.name;

        fileSelect1.appendChild(option1);
        fileSelect2.appendChild(option2);
    });

    // Sélectionner par défaut le premier et le deuxième fichier
    if (batchFiles.length >= 2) {
        fileSelect1.value = 0;
        fileSelect2.value = 1;
    }
}

async function analyzeFile(file) {
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
            console.log("[DEBUG] Données reçues de l'API :", data);  // Log data

            return { success: true, data: data, filename: file.name }; // Include filename
        } else {
            console.error("Erreur lors de l'appel à l'API :", response.status, response.statusText);
            return { success: false, error: `Erreur HTTP: ${response.status} - ${response.statusText}` };
        }
    } catch (error) {
        console.error("Erreur lors de la requête :", error);
        return { success: false, error: error.message || "Erreur inconnue" };
    }
}

async function compareSelectedFiles() { // Make this async
    const fileSelect1 = document.querySelector('#file-select-1');
    const fileSelect2 = document.querySelector('#file-select-2');

    if (!fileSelect1 || !fileSelect2) return;

    const index1 = parseInt(fileSelect1.value);
    const index2 = parseInt(fileSelect2.value);

    if (index1 === index2) {
        showToast('Veuillez sélectionner deux fichiers différents', 'error');
        return;
    }

    if (index1 < 0 || index1 >= batchFiles.length || index2 < 0 || index2 >= batchFiles.length) {
        showToast('Sélection de fichier invalide', 'error');
        return;
    }

    const file1 = batchFiles[index1];
    const file2 = batchFiles[index2];

    try {
        const result1 = await analyzeFile(file1); // Await the promise
        const result2 = await analyzeFile(file2); // Await the promise

        console.log("Résultats d'analyse :", result1, result2); // Log results

        if (result1.success && result2.success) {
            displayComparisonResults(result1.data, result2.data, result1.filename, result2.filename); // Pass filenames
        } else {
            let errorMessage = "Erreur lors de l'analyse des fichiers : ";
            if (!result1.success) errorMessage += result1.error + " ";
            if (!result2.success) errorMessage += result2.error;
            console.error(errorMessage);
            showToast(errorMessage, "error");
        }

    } catch (error) {
        console.error("Erreur lors de l'analyse des fichiers :", error);
        showToast("Erreur lors de la comparaison des fichiers", "error");
    }
}

function displayComparisonResults(data1, data2, filename1, filename2) {
    const comparisonResults = document.getElementById('comparison-results');
    if (!comparisonResults) return;

    // Afficher le conteneur de résultats
    comparisonResults.classList.remove('hidden');

    if (!data1 || !data2) {
        console.log(data1, data2);
        comparisonResults.innerHTML = '<div class="error-message">Résultats non disponibles pour un ou plusieurs fichiers sélectionnés.</div>';
        return;
    }

    // Mettre à jour les graphiques et les tableaux
    updateComparisonCharts(data1, data2, filename1, filename2);
}

function updateComparisonCharts(data1, data2, filename1, filename2) {
    const curveImageContainer1 = document.getElementById('comparison-chart-1');
    const curveImageContainer2 = document.getElementById('comparison-chart-2');
    const table1Container = document.getElementById('comparison-params-1');
    const table2Container = document.getElementById('comparison-params-2');

    if (!curveImageContainer1 || !curveImageContainer2 || !table1Container || !table2Container) return;

    // Afficher les tableaux de paramètres
    table1Container.innerHTML = createParamsTable(data1);
    table2Container.innerHTML = createParamsTable(data2);

    // Afficher les courbes pour chaque fichier
    if (data1.curve_image_all) {
        curveImageContainer1.innerHTML = `<img src="data:image/png;base64,${data1.curve_image_all}" alt="Courbe ${filename1}" style="max-width:100%;">`;
    } else {
        curveImageContainer1.innerHTML = '<div class="error-message">Graphique non disponible</div>';
    }

    if (data2.curve_image_all) {
        curveImageContainer2.innerHTML = `<img src="data:image/png;base64,${data2.curve_image_all}" alt="Courbe ${filename2}" style="max-width:100%;">`;
    } else {
        curveImageContainer2.innerHTML = '<div class="error-message">Graphique non disponible</div>';
    }
}

// Fonction pour mettre à jour le tableau de comparaison
function updateComparisonTable(data1, data2) {
    const table1Container = document.getElementById('comparison-params-1');
    const table2Container = document.getElementById('comparison-params-2');

    if (!table1Container || !table2Container) return;

    // Créer les tableaux de paramètres
    table1Container.innerHTML = createParamsTable(data1);
    table2Container.innerHTML = createParamsTable(data2);
}

function createParamsTable(data) {
    if (!data) {
        return '<div class="error-message">Paramètres non disponibles</div>';
    }

    const methodMap = {
        cnn: "CNN",
        genetique: "Génétique",
        mlp: "MLP",
        random: "Random"
    };

    let tableHTML = `
        <table class="comparison-param-table">
            <thead>
                <tr>
                    <th>Méthode</th>
                    <th>J0</th>
                    <th>Jph</th>
                    <th>Rs</th>
                    <th>Rsh</th>
                    <th>n</th>
                    <th>SSD</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const [key, label] of Object.entries(methodMap)) {
        const params = data[`params_${key}`];
        const ssd = data[`ssd_${key}`] ?? data[`ssd_${key.slice(0, 3)}`]; // handle both 'ssd_cnn' and 'ssd_gen'

        if (params) {
            tableHTML += `
                <tr>
                    <td>${label}</td>
                    <td>${formatNumber(params.J0)}</td>
                    <td>${formatNumber(params.Jph)}</td>
                    <td>${formatNumber(params.Rs)}</td>
                    <td>${formatNumber(params.Rsh)}</td>
                    <td>${formatNumber(params.n)}</td>
                    <td>${formatNumber(ssd)}</td>
                </tr>
            `;
        }
    }

    tableHTML += `
            </tbody>
        </table>
    `;

    return tableHTML;
}


// --- Helper Functions (Assuming these exist) ---
function showToast(message, type) {
    // Your showToast implementation
    console.warn(`TOAST: ${type} - ${message}`); // Placeholder
}

function methodToName(methodKey) {
    const methodNames = {
        cnn: "CNN",
        genetique: "Génétique",
        mlp: "MLP",
        random: "Random"
    };
    return methodNames[methodKey] || methodKey;
}

function formatNumber(number) {
    return Number(number).toPrecision(5); // Or your preferred formatting
}