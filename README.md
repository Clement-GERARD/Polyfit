# Frontend – Polyfit AI

Interface utilisateur simple pour charger des fichiers CSV de courbes I-V, les analyser via une API et afficher les résultats.

## 🗂 Arborescence

```
frontend/
├── index.html # Page principale HTML
├── favicon.ico # Icône de l'onglet
├── assets/
│ └── logo.png # Logo du projet
├── style/
│ └── main.css # Fichier de style CSS
├── scripts/
│ └── main.js # Script JS (gestion du chargement & logs)
└── README.md # Présent fichier
```

## 📦 Fonctionnement

- L’utilisateur charge des fichiers CSV.
- Des zones de résultats sont mises à jour (graphique, MLP, CNN, random).
- Une API sera reliée à cette interface pour analyser les fichiers.

## 🚀 À faire ensuite

- Connecter à l’API réelle.
- Afficher dynamiquement les courbes et prédictions.
