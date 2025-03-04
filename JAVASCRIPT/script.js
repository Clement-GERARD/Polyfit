document.getElementById('start-btn').addEventListener('click', function() {
    alert("Lancement de l'IA pour l'ajustement des courbes !");
    // Appel à l'IA (à implémenter plus tard)
});

document.getElementById('stop-btn').addEventListener('click', function() {
    alert("Arrêt du processus.");
});

document.getElementById('file-upload').addEventListener('change', function(event) {
    let file = event.target.files[0];
    if (file) {
        alert("Fichier sélectionné : " + file.name);
        // Traitement du fichier (à implémenter)
    }
});

// Affichage d'une courbe de base (à améliorer avec de vraies données)
let canvas = document.getElementById('curveCanvas');
let ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 300;

ctx.beginPath();
ctx.moveTo(50, 250);
ctx.quadraticCurveTo(200, 50, 350, 250);
ctx.strokeStyle = "blue";
ctx.lineWidth = 2;
ctx.stroke();
