document.getElementById('file-input').addEventListener('change', handleFiles);

function handleFiles(event) {
    const files = event.target.files;
    if (!files.length) return;

    // Affiche un message temporaire dans chaque section
    document.querySelector('#graph-zone .content-placeholder').textContent = "Affichage des courbes en cours...";
    document.querySelector('#random-method .content-placeholder').textContent = "Analyse par méthode aléatoire en cours...";
    document.querySelector('#mlp-method .content-placeholder').textContent = "Analyse par MLP en cours...";
    document.querySelector('#cnn-method .content-placeholder').textContent = "Analyse par CNN en cours...";

    // TODO: ici on ajoutera l'envoi des fichiers à l'API + affichage réel
}

