# Gestion des Emplois du Temps - ESP

Bienvenue dans l'application dynamique de gestion des emplois du temps pour l'École Supérieure Polytechnique (ESP). Ce projet est composé d'un backend Spring Boot et d'un frontend React/Vite.

## 🚀 Démarrage Rapide

### 1. Démarrer le Backend (Spring Boot)

Assurez-vous d'avoir Java et Maven installés, ainsi qu'une base de données PostgreSQL en cours d'exécution avec les identifiants configurés dans `backend_edt/src/main/resources/application.properties` (utilisateur: `postgres`, mot de passe: `00000000`, bd: `emploi_du_temps`).

1. Ouvrez un terminal et naviguez vers le dossier backend :
   ```bash
   cd backend_edt
   ```
2. (Facultatif) Pour réinitialiser la base de données avec les données de base (départements, professeurs, salles, matières) :
   ```bash
   PGPASSWORD=00000000 psql -U postgres -h localhost -d emploi_du_temps -f src/main/resources/clean_start.sql
   ```
3. Lancez le serveur :
   ```bash
   ./mvnw spring-boot:run
   ```

### 2. Démarrer le Frontend (React/Vite)

1. Ouvrez un nouveau terminal et naviguez vers le dossier frontend :
   ```bash
   cd EdT_ESP2
   ```
2. Installez les dépendances :
   ```bash
   npm install
   # ou pnpm install
   ```
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   # ou pnpm run dev
   ```
4. Ouvrez votre navigateur sur `http://localhost:5173`.

---

## 🧪 Comment Tester les Fonctionnalités

Afin de permettre une configuration réaliste, la base de données est initialisée avec les professeurs, les salles et les matières (les données statiques d'origine), mais **sans aucune affectation ni séance planifiée**. C'est à vous (en tant qu'administrateur) de faire la configuration initiale !

### Étape 1 : Connexion
Connectez-vous avec le compte Super Admin :
* **Email :** `admin@esp.mr`
* **Mot de passe :** `admin123`

### Étape 2 : Configuration Initiale (Affectations)
1. Allez dans la page **Configuration** (via le menu latéral ou le bouton de setup).
2. Pour chaque matière, assignez un **Professeur** et une **Salle**.
3. C'est cette étape qui lie les données de base entre elles pour le semestre en cours.

### Étape 3 : Planification (Matrice des cours)
1. Allez dans la page **Plan** dans la barre latérale.
2. Sélectionnez le département `IRT` et le semestre `S3 2025-2026`.
3. Vous verrez la matrice vide. Cliquez sur un créneau libre pour planifier une séance.
4. Répétez l'opération pour créer l'emploi du temps type de la semaine.

### Étape 4 : Gestion de l'Emploi du Temps (Vue hebdomadaire)
1. Allez dans la page **Emploi du Temps**.
2. Vous pouvez visualiser l'emploi du temps par semaine.
3. **Tester les statuts :** Cliquez sur une séance planifiée. Vous pouvez changer son statut en `Réalisée` (vert) ou `Annulée` (rouge).
4. **Validation en masse :** Un bouton vert `Valider semaine` apparaîtra en haut. Cliquez dessus pour marquer toutes les séances planifiées de la semaine comme réalisées d'un seul coup.

### Étape 5 : Suivi (Bilan)
1. Allez dans la page **Bilan**.
2. Vous verrez la progression de chaque matière calculée dynamiquement (séances réalisées par rapport aux heures totales du programme).

---

## 👥 Comptes de démonstration

* **Super Admin :** `admin@esp.mr` / `admin123`
* **Chef de Département IRT (Hafedh) :** `hafedh@esp.mr` / `prof123`
* **Professeur (Abderrahmane) :** `abderrahmane@esp.mr` / `prof123`
* **Étudiant :** `24013@esp.mr` / `student123`
