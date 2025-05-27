// Fichier pour la gestion des visualisations avancées

// Configuration générale des boîtes à moustaches
const boxplotConfig = {
    width: 280,
    height: 220,
    margin: { top: 20, right: 30, bottom: 40, left: 50 }
};

// Couleurs par méthode
const methodColors = {
    rand: "#FF6B6B", // Rouge
    mlp: "#4ECDC4",  // Turquoise
    gen: "#6B5CA5"   // Violet
};

// Noms complets des méthodes
const methodNames = {
    rand: "Classique",
    mlp: "MLP",
    gen: "Génétique"
};

// Création d'une boîte à moustaches pour un paramètre
function createBoxplot(containerId, paramName, data) {
    // Sélection du conteneur
    const container = d3.select(`#${paramName}-boxplot`);
    container.html(""); // Nettoyer le conteneur

    // Dimensions internes
    const width = boxplotConfig.width - boxplotConfig.margin.left - boxplotConfig.margin.right;
    const height = boxplotConfig.height - boxplotConfig.margin.top - boxplotConfig.margin.bottom;

    // Création du SVG
    const svg = container.append("svg")
        .attr("width", boxplotConfig.width)
        .attr("height", boxplotConfig.height)
        .append("g")
        .attr("transform", `translate(${boxplotConfig.margin.left},${boxplotConfig.margin.top})`);

    // Si pas assez de données
    if (!data || Object.keys(data).length === 0) {
        svg.append("text")
            .attr("x", width/2)
            .attr("y", height/2)
            .attr("text-anchor", "middle")
            .text("Pas assez de données");
        return;
    }

    // Extraction des valeurs pour toutes les méthodes
    let allValues = [];
    for (const method in data) {
        if (data[method].length > 0) {
            allValues = allValues.concat(data[method]);
        }
    }

    // Échelle Y
    const y = d3.scaleLinear()
        .domain([d3.min(allValues) * 0.9, d3.max(allValues) * 1.1])
        .range([height, 0]);

    // Axe Y
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => {
            // Format scientifique pour les petites valeurs
            if (Math.abs(d) < 0.01 && d !== 0) {
                return d.toExponential(1);
            }
            return d.toFixed(2);
        }));

    // Titre du paramètre
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(paramName);

    // Positionnement horizontal des méthodes
    const methods = Object.keys(data).filter(method => data[method].length > 0);
    const x = d3.scaleBand()
        .range([0, width])
        .domain(methods)
        .paddingInner(0.3)
        .paddingOuter(0.2);

    // Axe X
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d => methodNames[d]))
        .selectAll("text")
        .attr("transform", "rotate(-25)")
        .style("text-anchor", "end");

    // Pour chaque méthode, créer une boîte à moustaches
    methods.forEach(method => {
        const values = data[method].sort(d3.ascending);
        
        if (values.length === 0) return;
        
        // Statistiques pour la boîte à moustaches
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        const min = Math.max(d3.min(values), q1 - 1.5 * iqr);
        const max = Math.min(d3.max(values), q3 + 1.5 * iqr);
        
        // Largeur de la boîte
        const boxWidth = x.bandwidth();
        
        // Boîte (rectangle du milieu)
        svg.append("rect")
            .attr("x", x(method))
            .attr("y", y(q3))
            .attr("height", y(q1) - y(q3))
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", methodColors[method])
            .attr("fill-opacity", 0.7);
        
        // Ligne médiane
        svg.append("line")
            .attr("x1", x(method))
            .attr("x2", x(method) + boxWidth)
            .attr("y1", y(median))
            .attr("y2", y(median))
            .attr("stroke", "black")
            .attr("stroke-width", 2);
        
        // Ligne du minimum au Q1
        svg.append("line")
            .attr("x1", x(method) + boxWidth/2)
            .attr("x2", x(method) + boxWidth/2)
            .attr("y1", y(min))
            .attr("y2", y(q1))
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        
        // Ligne du Q3 au maximum
        svg.append("line")
            .attr("x1", x(method) + boxWidth/2)
            .attr("x2", x(method) + boxWidth/2)
            .attr("y1", y(q3))
            .attr("y2", y(max))
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        
        // Ligne du minimum
        svg.append("line")
            .attr("x1", x(method) + boxWidth*0.25)
            .attr("x2", x(method) + boxWidth*0.75)
            .attr("y1", y(min))
            .attr("y2", y(min))
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        
        // Ligne du maximum
        svg.append("line")
            .attr("x1", x(method) + boxWidth*0.25)
            .attr("x2", x(method) + boxWidth*0.75)
            .attr("y1", y(max))
            .attr("y2", y(max))
            .attr("stroke", "black")
            .attr("stroke-width", 1);
        
        // Ajouter tous les points pour mieux visualiser la distribution
        const jitterWidth = boxWidth * 0.4;
        
        values.forEach((d, i) => {
            // Ajouter du jitter pour éviter la superposition
            const jitter = (Math.random() - 0.5) * jitterWidth;
            
            svg.append("circle")
                .attr("cx", x(method) + boxWidth/2 + jitter)
                .attr("cy", y(d))
                .attr("r", 3)
                .attr("fill", methodColors[method])
                .attr("stroke", "black")
                .attr("stroke-width", 0.5)
                .attr("opacity", 0.6)
                .on("mouseover", function() {
                    d3.select(this)
                        .attr("r", 5)
                        .attr("opacity", 1);
                        
                    // Tooltip avec la valeur
                    svg.append("text")
                        .attr("class", "tooltip-text")
                        .attr("x", x(method) + boxWidth/2)
                        .attr("y", y(d) - 10)
                        .attr("text-anchor", "middle")
                        .style("font-size", "10px")
                        .text(d.toExponential(3));
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .attr("r", 3)
                        .attr("opacity", 0.6);
                    
                    svg.selectAll(".tooltip-text").remove();
                });
        });
        
        // Ajouter statistiques en info-bulle
        svg.append("rect")
            .attr("x", x(method))
            .attr("y", 0)
            .attr("width", boxWidth)
            .attr("height", height)
            .attr("fill", "transparent")
            .on("mouseover", function() {
                // Info-bulle avec statistiques
                const tooltip = svg.append("g")
                    .attr("class", "boxplot-tooltip")
                    .attr("transform", `translate(${x(method) + boxWidth/2}, ${height/2})`);
                
                tooltip.append("rect")
                    .attr("x", -70)
                    .attr("y", -60)
                    .attr("width", 140)
                    .attr("height", 120)
                    .attr("fill", "white")
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr("rx", 5);
                
                tooltip.append("text")
                    .attr("y", -45)
                    .attr("text-anchor", "middle")
                    .style("font-weight", "bold")
                    .text(methodNames[method]);
                
                tooltip.append("text")
                    .attr("y", -25)
                    .attr("text-anchor", "middle")
                    .style("font-size", "11px")
                    .text(`Min: ${min.toExponential(2)}`);
                
                tooltip.append("text")
                    .attr("y", -10)
                    .attr("text-anchor", "middle")
                    .style("font-size", "11px")
                    .text(`Q1: ${q1.toExponential(2)}`);
                
                tooltip.append("text")
                    .attr("y", 5)
                    .attr("text-anchor", "middle")
                    .style("font-size", "11px")
                    .text(`Médiane: ${median.toExponential(2)}`);
                
                tooltip.append("text")
                    .attr("y", 20)
                    .attr("text-anchor", "middle")
                    .style("font-size", "11px")
                    .text(`Q3: ${q3.toExponential(2)}`);
                
                tooltip.append("text")
                    .attr("y", 35)
                    .attr("text-anchor", "middle")
                    .style("font-size", "11px")
                    .text(`Max: ${max.toExponential(2)}`);
                
                tooltip.append("text")
                    .attr("y", 50)
                    .attr("text-anchor", "middle")
                    .style("font-size", "11px")
                    .text(`n = ${values.length}`);
            })
            .on("mouseout", function() {
                svg.selectAll(".boxplot-tooltip").remove();
            });
    });
}

// Créer toutes les boîtes à moustaches
function createAllBoxplots(boxplotData) {
    // Si pas assez de données, afficher un message
    if (!boxplotData || Object.keys(boxplotData).length === 0) {
        document.querySelector("#boxplot-zone .content-placeholder").textContent = 
            "Pas assez de données pour créer des boîtes à moustaches. Veuillez analyser plusieurs fichiers.";
        return;
    }

    // Masquer le message de placeholder
    document.querySelector("#boxplot-zone .content-placeholder").style.display = "none";

    // Créer chaque boxplot
    for (const paramName in boxplotData) {
        createBoxplot("boxplot-zone", paramName, boxplotData[paramName]);
    }
}

// Créer des graphiques comparatifs
function createComparisonChart(containerId, data, paramName) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Configuration du graphique
    const width = container.clientWidth;
    const height = 300;
    const margin = { top: 30, right: 50, bottom: 50, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Vider le conteneur
    container.innerHTML = "";

    // Créer le SVG
    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Préparer les données
    const chartData = [];
    data.forEach(result => {
        const fileName = result.filename;
        
        // Pour chaque méthode disponible
        for (const [method, params] of Object.entries(result.methods)) {
            if (params[paramName] !== undefined) {
                chartData.push({
                    file: fileName,
                    method: method,
                    value: parseFloat(params[paramName])
                });
            }
        }
    });

    // Si pas de données
    if (chartData.length === 0) {
        svg.append("text")
            .attr("x", chartWidth / 2)
            .attr("y", chartHeight / 2)
            .attr("text-anchor", "middle")
            .text("Pas de données disponibles");
        return;
    }

    // Obtenir la liste des fichiers uniques
    const files = [...new Set(chartData.map(d => d.file))];
    
    // Échelle X pour les fichiers
    const x = d3.scaleBand()
        .domain(files)
        .range([0, chartWidth])
        .padding(0.3);

    // Sous-bandes pour les méthodes dans chaque fichier
    const methods = [...new Set(chartData.map(d => d.method))];
    const xSub = d3.scaleBand()
        .domain(methods)
        .range([0, x.bandwidth()])
        .padding(0.05);

    // Échelle Y pour les valeurs
    const values = chartData.map(d => d.value);
    const y = d3.scaleLinear()
        .domain([
            Math.min(0, d3.min(values) * 0.9), 
            d3.max(values) * 1.1
        ])
        .range([chartHeight, 0]);

    // Axe X
    svg.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Axe Y
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => {
            if (Math.abs(d) < 0.01 && d !== 0) {
                return d.toExponential(1);
            }
            return d.toFixed(2);
        }));

    // Titre du graphique
    svg.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(`Comparaison du paramètre ${paramName}`);

    // Légende X
    svg.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + margin.bottom - 5)
        .attr("text-anchor", "middle")
        .text("Fichiers");

    // Légende Y
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .text(`Valeur de ${paramName}`);

    // Ajouter les barres
    files.forEach(file => {
        const fileData = chartData.filter(d => d.file === file);
        
        methods.forEach(method => {
            const methodData = fileData.find(d => d.method === method);
            
            if (methodData) {
                svg.append("rect")
                    .attr("x", x(file) + xSub(method))
                    .attr("y", y(methodData.value))
                    .attr("width", xSub.bandwidth())
                    .attr("height", chartHeight - y(methodData.value))
                    .attr("fill", methodColors[method])
                    .on("mouseover", function(event) {
                        d3.select(this).attr("opacity", 0.7);
                        
                        // Tooltip
                        const tooltip = svg.append("g")
                            .attr("class", "tooltip");
                        
                        tooltip.append("rect")
                            .attr("x", x(file) + xSub(method) - 50)
                            .attr("y", y(methodData.value) - 40)
                            .attr("width", 100)
                            .attr("height", 30)
                            .attr("fill", "white")
                            .attr("stroke", "black");
                        
                        tooltip.append("text")
                            .attr("x", x(file) + xSub(method))
                            .attr("y", y(methodData.value) - 20)
                            .attr("text-anchor", "middle")
                            .text(`${methodNames[method]}: ${methodData.value.toExponential(3)}`);
                    })
                    .on("mouseout", function() {
                        d3.select(this).attr("opacity", 1);
                        svg.selectAll(".tooltip").remove();
                    });
            }
        });
    });

    // Ajouter la légende
    const legend = svg.append("g")
        .attr("transform", `translate(${chartWidth - 120}, 0)`);
    
    methods.forEach((method, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", methodColors[method]);
        
        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 12)
            .text(methodNames[method]);
    });
}

// Calcul et affichage du SSD (Sum of Squared Differences)
function calculateSSD(data) {
    if (!data || !data.params_random || !data.curve_data) {
        return null;
    }
    
    const ssdResults = {};
    const methods = ['random', 'mlp', 'genetique'];
    
    // Données expérimentales
    const experimentalData = data.curve_data;
    
    methods.forEach(method => {
        const paramKey = `params_${method}`;
        if (!data[paramKey]) return;
        
        // Calculer la courbe théorique avec les paramètres prédits
        const theoreticalData = calculateTheoreticalCurve(experimentalData, data[paramKey]);
        
        // Calculer SSD
        let ssd = 0;
        for (let i = 0; i < experimentalData.length; i++) {
            const diff = experimentalData[i].I - theoreticalData[i];
            ssd += diff * diff;
        }
        
        // Normaliser SSD
        const normalizedSSD = ssd / experimentalData.length;
        
        // Stocker le résultat
        const methodKey = method === 'genetique' ? 'gen' : method === 'random' ? 'rand' : method;
        ssdResults[methodKey] = normalizedSSD;
    });
    
    return ssdResults;
}

// Fonction pour calculer la courbe théorique (simplifiée)
function calculateTheoreticalCurve(experimentalData, params) {
    // Cette implémentation est simplifiée et devrait être remplacée par le modèle réel
    // Pour illustrer le concept, on renvoie simplement des valeurs calculées
    
    const k = 1.38e-23; // Constante de Boltzmann
    const q = 1.6e-19;  // Charge de l'électron
    const T = 300;      // Température en K
    
    const theoreticalCurrent = [];
    
    experimentalData.forEach(point => {
        const { V } = point;
        
        // Modèle à une diode (simplifié pour l'exemple)
        const J0 = parseFloat(params.J0);
        const Jph = parseFloat(params.Jph);
        const Rs = parseFloat(params.Rs);
        const Rsh = parseFloat(params.Rsh);
        const n = parseFloat(params.n);
        
        // Calcul simplifié du courant
        const Vt = n * k * T / q;
        let I = Jph - J0 * (Math.exp((V + I * Rs) / Vt) - 1) - (V + I * Rs) / Rsh;
        
        // Approche simplifiée sans itération
        theoreticalCurrent.push(I);
    });
    
    return theoreticalCurrent;
}

// Afficher les SSD dans l'interface
function displaySSD(ssdData) {
    if (!ssdData) return;
    
    // Créer ou mettre à jour la section SSD
    const ssdSection = d3.select("#ssd-section");
    
    if (ssdSection.empty()) {
        // Créer une nouvelle section si elle n'existe pas
        const newSection = d3.select(".full-width-panel")
            .append("div")
            .attr("class", "result-card")
            .attr("id", "ssd-section");
        
        newSection.append("h2")
            .text("🔍 Précision des modèles (SSD)");
        
        const container = newSection.append("div")
            .attr("class", "ssd-container");
        
        // Créer le SVG pour le graphique SSD
        createSSDChart("ssd-container", ssdData);
    } else {
        // Mettre à jour le graphique existant
        d3.select("#ssd-container").html("");
        createSSDChart("ssd-container", ssdData);
    }
}

// Créer un graphique à barres pour les SSD
function createSSDChart(containerId, ssdData) {
    // Configuration du graphique
    const width = 600;
    const height = 300;
    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Créer le SVG
    const container = d3.select(`#${containerId}`);
    const svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Préparer les données
    const data = Object.entries(ssdData).map(([method, value]) => ({
        method,
        value
    }));
    
    // Trier par valeur croissante (meilleure méthode en premier)
    data.sort((a, b) => a.value - b.value);
    
    // Échelle X
    const x = d3.scaleBand()
        .range([0, chartWidth])
        .domain(data.map(d => d.method))
        .padding(0.2);
    
    // Échelle Y
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) * 1.1])
        .range([chartHeight, 0]);
    
    // Axe X
    svg.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x).tickFormat(d => methodNames[d]))
        .selectAll("text")
        .attr("transform", "rotate(-25)")
        .style("text-anchor", "end");
    
    // Axe Y
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d.toExponential(1)));
    
    // Barres
    svg.selectAll("bars")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d.method))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => chartHeight - y(d.value))
        .attr("fill", d => methodColors[d.method]);
    
    // Étiquettes sur les barres
    svg.selectAll("val")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => x(d.method) + x.bandwidth()/2)
        .attr("y", d => y(d.value) - 5)
        .attr("text-anchor", "middle")
        .text(d => d.value.toExponential(2));
    
    // Titre
    svg.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Somme des carrés des différences (SSD)");
    
    // Légende Y
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text("SSD (échelle log)");
    
    // Ajouter une explication
    container.append("div")
        .attr("class", "ssd-explanation")
        .style("margin-top", "10px")
        .style("font-style", "italic")
        .html("Note: Plus la valeur SSD est faible, meilleure est la précision du modèle. Le SSD représente la somme des carrés des différences entre les points expérimentaux et les points calculés par le modèle.");
}

// Gestion du thème de couleurs
function applyColorTheme(theme) {
    const root = document.documentElement;
    
    switch(theme) {
        case 'default':
            root.style.setProperty('--primary-color', '#0077cc');
            root.style.setProperty('--secondary-color', '#0a2f5c');
            root.style.setProperty('--accent-color', '#2bae66');
            break;
        case 'dark':
            root.style.setProperty('--primary-color', '#5865F2');
            root.style.setProperty('--secondary-color', '#23272A');
            root.style.setProperty('--accent-color', '#57F287');
            break;
        case 'light':
            root.style.setProperty('--primary-color', '#4B89DC');
            root.style.setProperty('--secondary-color', '#F2F3F5');
            root.style.setProperty('--accent-color', '#48CFAD');
            break;
        case 'contrast':
            root.style.setProperty('--primary-color', '#FFCC00');
            root.style.setProperty('--secondary-color', '#000000');
            root.style.setProperty('--accent-color', '#FF6B6B');
            break;
    }
    
    // Mettre à jour les couleurs des graphiques existants
    updateChartColors();
}

// Mettre à jour les couleurs des graphiques existants
function updateChartColors() {
    // Recharger tous les graphiques avec les nouvelles couleurs
    if (window.lastBoxplotData) {
        createAllBoxplots(window.lastBoxplotData);
    }
    
    if (window.lastSSDData) {
        displaySSD(window.lastSSDData);
    }
}

// Exporter les fonctions
export { 
    createAllBoxplots, 
    createComparisonChart, 
    calculateSSD, 
    displaySSD,
    applyColorTheme
};
