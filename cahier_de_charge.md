# 📘 Cahier des charges -- Application de gestion des membres

## 1. 🎯 Objectif du projet

L'application a pour but de faciliter la gestion d'un groupe de
personnes (par exemple une communauté, une église ou une association).\
Elle permettra de **collecter, stocker et consulter** les informations
personnelles et spirituelles de chaque membre, tout en offrant un accès
rapide et centralisé.

------------------------------------------------------------------------

## 2. 👥 Utilisateurs cibles

-   **Administrateurs** : responsables du groupe (ajout, suppression,
    mise à jour des membres, export des données).
-   **Membres autorisés** : consultation des informations (liste,
    anniversaires, etc.).
-   **Nouveaux membres** : possibilité de soumettre leurs informations
    via un formulaire.

------------------------------------------------------------------------

## 3. ⚙️ Fonctionnalités principales

### 🔑 Authentification & gestion des accès

-   Inscription et connexion via **Firebase Auth** (email + mot de
    passe).
-   Rôles utilisateurs (admin, simple membre).
-   Gestion sécurisée des données (règles Firestore).

### 📋 Gestion des membres

Chaque membre aura une fiche contenant :\
- **Identité** : prénom, nom.\
- **Date de naissance** (pour suivi des anniversaires).\
- **Profession**.\
- **Pôle de service** (ministère, département, équipe...).\
- **Informations spirituelles** :\
- Baptisé (Oui / Non).\
- Désire se faire baptiser (Oui / Non).\
- Requête de prière.\
- **Date d'arrivée** dans le groupe (optionnel).

### 📅 Suivi des événements

-   Liste des anniversaires par mois.\
-   Notifications (ex: "3 anniversaires cette semaine").\
-   Historique des baptêmes (si besoin).

### 🔍 Recherche et filtres

-   Recherche par nom/prénom.\
-   Filtres : profession, pôle de service, baptême, etc.

### 📲 Interface utilisateur

-   **Accueil** : résumé des informations clés (anniversaires à venir,
    nombre de membres, etc.).\
-   **Liste des membres** : tableau ou cartes avec options de
    tri/filtre.\
-   **Détail d'un membre** : fiche complète.\
-   **Ajout d'un membre** : formulaire simple et ergonomique.

### 📤 Exportation (optionnel)

-   Export des données (CSV / Excel) pour les administrateurs.

------------------------------------------------------------------------

## 4. 🏗️ Architecture technique

### 📌 Frontend

-   **Framework** : Vue.js 3 (Composition API).\
-   **UI** : TailwindCSS ou Vuetify (selon ton choix).\
-   **Routing** : Vue Router (pages protégées par rôle).

### 📌 Backend & Base de données

-   **Firebase Firestore** : stockage des informations des membres.\
-   **Firebase Auth** : gestion des utilisateurs.\
-   **Firebase Hosting** : déploiement de l'application.\
-   **Firebase Cloud Functions** (optionnel) : notifications
    automatiques (anniversaires, rappels).

------------------------------------------------------------------------

## 5. 🎨 Design & UX

-   Thème simple, moderne, avec couleurs sobres.\
-   Dark mode possible.\
-   Navigation claire (menu avec : Accueil, Membres, Ajouter,
    Statistiques).

------------------------------------------------------------------------

## 6. 📊 Exemple de structure des données (Firestore)

``` json
{
  "members": [
    {
      "id": "uid123",
      "firstName": "Jean",
      "lastName": "Dupont",
      "birthDate": "1990-05-12",
      "profession": "Enseignant",
      "servicePole": "Musique",
      "baptized": true,
      "wantsBaptism": false,
      "prayerRequest": "Santé de ma famille",
      "arrivalDate": "2025-01-10",
      "createdAt": "2025-09-27T20:00:00Z"
    }
  ],
  "users": [
    {
      "uid": "admin123",
      "email": "admin@email.com",
      "role": "admin"
    }
  ]
}
```

------------------------------------------------------------------------

## 7. ✅ Livrables

-   Une **application web responsive** accessible depuis mobile et
    ordinateur.\
-   Un **système sécurisé** avec Firebase.\
-   Une **base de données structurée** (Firestore).\
-   Un **déploiement en ligne** via Firebase Hosting.

------------------------------------------------------------------------

## 8. 📅 Planning (approximatif)

1.  **Phase 1 -- Setup** : config Firebase, Vue.js, Auth (1 semaine).\
2.  **Phase 2 -- Gestion membres** : CRUD complet avec Firestore (2
    semaines).\
3.  **Phase 3 -- Fonctionnalités avancées** : recherche, filtres,
    anniversaires (1-2 semaines).\
4.  **Phase 4 -- UI/UX** : amélioration design, responsive (1 semaine).\
5.  **Phase 5 -- Déploiement & tests** (3 jours).
