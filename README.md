# Polyfit AI – I-V Curves Frontend

**Polyfit AI** est une interface web moderne pour charger, visualiser et analyser des courbes courant-tension (I-V) photovoltaïques à partir de fichiers CSV. L’application exploite plusieurs méthodes d’analyse (classique, MLP, CNN, génétique) en s’appuyant sur une API, et offre des fonctionnalités avancées de comparaison, traitement par lots, et export des résultats.

---

## 🚀 Fonctionnalités principales

- **Chargement de fichiers CSV de courbes I-V**
- **Analyse automatique via API (MLP, CNN, génétique, classique)**
- **Affichage des résultats par méthode, courbes et paramètres**
- **Comparaison visuelle et tabulaire des résultats entre méthodes et fichiers**
- **Mode batch** : traitement simultané de plusieurs fichiers avec suivi de progression, gestion d’erreurs et résumé des performances
- **Exports** : résultats exportables en CSV, Excel, PDF
- **Affichage “brut”** : vue synthétique avec boxplots et statistiques sur les paramètres extraits
- **Mode sombre/clair personnalisable**
- **Notifications toast, interface réactive, et expérience utilisateur optimisée**
- **Design responsive** (s’adapte aux mobiles et desktop)
- **Code sous licence MIT**

---

## 🖼️ Aperçu de l’interface

- **Chargement de fichiers** : UI intuitive, drag & drop, sélection multiple possible
- **Analyse** : résultats affichés sous forme de cartes pour chaque méthode, avec détails accessibles
- **Comparaison** : table de comparaison paramètre par paramètre, graphiques côte à côte
- **Batch** : listing dynamique des fichiers, suivi de statut, barre de progression, résumé de traitement
- **Boxplots** : visualisation statistique des paramètres extraits sur plusieurs fichiers

---

## 📂 Structure du projet

```
Polyfit/
├── index.html                 # Page principale
├── assets/
│   └── logo.png               # Logo du projet
├── style/
│   ├── main.css               # Styles principaux
│   └── theme_colors.css       # Thèmes de couleurs (clair/sombre)
├── scripts/
│   ├── main.js                # Logique principale (fichier unique)
│   ├── batch_mode.js          # Mode batch (traitement multi-fichiers)
│   ├── boxplot.js             # Génération des boxplots
│   ├── visualization.js       # Affichage graphique IV
│   ├── export.js              # Exports CSV, Excel, PDF
│   ├── iv_chart.js            # Courbes IV
│   ├── table_sorting.js       # Tri des tableaux
│   ├── sharing.js             # Partage de résultats, QR code
│   ├── presentation_mode.js   # Mode présentation
│   ├── integration.js         # Intégrations externes
│   └── ascii.js               # Affichage ASCII Art (détail fun)
├── favicon.ico                # Icône de l’application
├── LICENSE                    # Licence MIT
└── README.md                  # Ce fichier
```

---

## 🔧 Installation & utilisation

### Prérequis

- Navigateur web récent (Chrome, Firefox, Edge, ...)

### Lancer l’interface

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/Clement-GERARD/Polyfit.git
   ```
2. **Ouvrir `index.html` dans votre navigateur.**
   (Aucune dépendance serveur requise pour l’interface seule.)

3. **Configurer l’API**
   - Par défaut, l’interface attend une variable `API_URL` pointant vers une API compatible pour le traitement des fichiers.
   - L’URL de l’API doit accepter des fichiers CSV et retourner les résultats attendus (voir `scripts/main.js` et `scripts/batch_mode.js` pour le format).

---

## 📝 Notes sur l’état du projet

- **Fonctionnalités avancées déjà en place** : mode batch (multi-fichiers), exports, comparaisons, visualisation, notifications.
- **API** : l’interface est prête à communiquer avec une API réelle pour l’analyse ; prévoyez d’adapter `API_URL` selon votre backend.
- **Interface peaufinée** : thèmes, responsivité, expérience utilisateur améliorée.
- **À venir** : amélioration du support mobile, raffinement des visualisations, connexion à l’API de production, documentation API.

---

## 💡 Crédits

- Licence : [MIT](./LICENSE)
- Auteur : Clément GERARD — Polytech Nantes

---

## ✨ Contributions

Les contributions sont bienvenues ! N’hésitez pas à proposer issues, suggestions, ou pull requests.

---

## 📫 Contact

Pour toute question, contactez-moi sur GitHub ou via l’adresse affichée sur mon profil.

---

**Polyfit AI – Analyser, comparer, comprendre vos courbes I-V en un clic.**
