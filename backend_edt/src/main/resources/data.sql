-- ============================================================
-- EdT Seed Data — Realistic ESP (École Supérieure Polytechnique)
-- Run: PGPASSWORD=00000000 psql -U postgres -h localhost -d emploi_du_temps -f src/main/resources/data.sql
-- ============================================================

-- Clean existing data (order matters for FK constraints)
TRUNCATE seance_departement, seance, affectation_enseignement, creneau, 
         semaine_academique, semestre, evenement_calendrier,
         matiere, salle, utilisateur, professeur, departement, ecole
         CASCADE;

-- Reset sequences
ALTER SEQUENCE IF EXISTS departement_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS professeur_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS salle_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS semestre_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS semaine_academique_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS creneau_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS seance_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS affectation_enseignement_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS utilisateur_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS evenement_calendrier_id_seq RESTART WITH 1;

-- ============================================================
-- 1. ECOLE
-- ============================================================
INSERT INTO ecole (id, nom, domaine, slug) VALUES
('ESP', 'École Supérieure Polytechnique', 'esp.mr', 'esp');

-- ============================================================
-- 2. DEPARTEMENTS
-- ============================================================
INSERT INTO departement (id, code, nom, ecole_id) VALUES
(1, 'IRT', 'Informatique Réseaux et Télécoms', 'ESP'),
(2, 'GC', 'Génie Civil', 'ESP'),
(3, 'GM', 'Génie Mécanique', 'ESP');

-- ============================================================
-- 3. PROFESSEURS
-- ============================================================
INSERT INTO professeur (id, nom, prenom, email, statut) VALUES
(1, 'Abderrahmane', '', 'abderrahmane@esp.mr', 'PERMANENT'),
(2, 'Hafedh', '', 'hafedh@esp.mr', 'PERMANENT'),
(3, 'El Aoun', '', 'elaoun@esp.mr', 'PERMANENT'),
(4, 'Sass', '', 'sass@esp.mr', 'PERMANENT'),
(5, 'Moktar', '', 'moktar@esp.mr', 'PERMANENT'),
(6, 'Elhacen', '', 'elhacen@esp.mr', 'PERMANENT'),
(7, 'Blake', '', 'blake@esp.mr', 'VACATAIRE'),
(8, 'LAM', '', 'lam@esp.mr', 'VACATAIRE'),
(9, 'Limam', '', 'limam@esp.mr', 'VACATAIRE'),
(10, 'Helmi', '', 'helmi@esp.mr', 'VACATAIRE'),
(11, 'Mayara', '', 'mayara@esp.mr', 'VACATAIRE');

-- ============================================================
-- 4. SALLES
-- ============================================================
-- Amphis & Online (shared — no departement)
INSERT INTO salle (id, nom, type_salle, ecole_id, departement_id) VALUES
(1, 'Amphi', 'AMPHI', 'ESP', NULL),
(2, 'En ligne', 'SALLE', 'ESP', NULL);

-- Department-specific rooms
INSERT INTO salle (id, nom, type_salle, ecole_id, departement_id) VALUES
(3, 'Salle 104', 'SALLE', 'ESP', 1),
(4, 'Salle 101', 'SALLE', 'ESP', 1),
(5, 'Salle 102', 'SALLE', 'ESP', 1),
(6, 'Salle 103', 'SALLE', 'ESP', 1),
(7, 'Salle 105', 'SALLE', 'ESP', 1),
(8, 'Salle 106', 'SALLE', 'ESP', 1),
(9, 'Labo IRT', 'LABO', 'ESP', 1),
(10, 'Lab électronique', 'LABO', 'ESP', 1);

-- ============================================================
-- 5. MATIERES
-- ============================================================
INSERT INTO matiere (code, intitule, credits, h_cm, h_td, h_tp) VALUES
('IRT31', 'Développement JEE', 3, 6, 6, 12),
('IRT32', 'Intelligence artificielle', 2, 5, 5, 6),
('IRT33', 'Théorie des langages et compilation', 2, 5, 5, 6),
('IRT34', 'Communications numériques', 2, 5, 5, 6),
('IRT35', 'Architecture des ordinateurs', 3, 8, 8, 8),
('IRT36', 'Réseaux mobiles', 2, 5, 5, 6),
('IRT37', 'Réseaux d''opérateurs', 2, 5, 5, 6),
('IRT38', 'IoT', 2, 5, 5, 6),
('HE31', 'Anglais', 2, 0, 4, 0),
('HE33', 'Sociologie-Gestion', 2, 4, 0, 0),
('HE34', 'Gestion', 2, 0, 0, 0),
('PIE', 'Projet Industriel en Entreprise', 2, 2, 24, 48);

-- ============================================================
-- 6. SEMESTRES
-- ============================================================
INSERT INTO semestre (id, libelle, date_debut, date_fin) VALUES
(1, 'S3 2025-2026', '2025-10-15', '2026-01-31'),
(2, 'S4 2025-2026', '2026-02-15', '2026-06-30');

-- ============================================================
-- 7. SEMAINES ACADEMIQUES (S1: 15 semaines)
-- ============================================================
INSERT INTO semaine_academique (id, numero_semaine, date_debut, date_fin, semestre_id) VALUES
(1,  1,  '2025-10-13', '2025-10-17', 1),
(2,  2,  '2025-10-20', '2025-10-24', 1),
(3,  3,  '2025-10-27', '2025-10-31', 1),
(4,  4,  '2025-11-03', '2025-11-07', 1),
(5,  5,  '2025-11-10', '2025-11-14', 1),
(6,  6,  '2025-11-17', '2025-11-21', 1),
(7,  7,  '2025-11-24', '2025-11-28', 1),
(8,  8,  '2025-12-01', '2025-12-05', 1),
(9,  9,  '2025-12-08', '2025-12-12', 1),
(10, 10, '2025-12-15', '2025-12-19', 1),
(11, 11, '2025-12-22', '2025-12-26', 1),
(12, 12, '2026-01-05', '2026-01-09', 1),
(13, 13, '2026-01-12', '2026-01-16', 1),
(14, 14, '2026-01-19', '2026-01-23', 1),
(15, 15, '2026-01-26', '2026-01-30', 1);

-- S2: 15 semaines
INSERT INTO semaine_academique (id, numero_semaine, date_debut, date_fin, semestre_id) VALUES
(16, 1,  '2026-02-16', '2026-02-20', 2),
(17, 2,  '2026-02-23', '2026-02-27', 2),
(18, 3,  '2026-03-02', '2026-03-06', 2),
(19, 4,  '2026-03-09', '2026-03-13', 2),
(20, 5,  '2026-03-16', '2026-03-20', 2),
(21, 6,  '2026-03-23', '2026-03-27', 2),
(22, 7,  '2026-03-30', '2026-04-03', 2),
(23, 8,  '2026-04-06', '2026-04-10', 2),
(24, 9,  '2026-04-13', '2026-04-17', 2),
(25, 10, '2026-04-20', '2026-04-24', 2),
(26, 11, '2026-04-27', '2026-05-01', 2),
(27, 12, '2026-05-04', '2026-05-08', 2),
(28, 13, '2026-05-11', '2026-05-15', 2),
(29, 14, '2026-05-18', '2026-05-22', 2),
(30, 15, '2026-05-25', '2026-05-29', 2);

-- ============================================================
-- 8. CRENEAUX (Time slots for S3)
-- ============================================================
-- DEP slots (department-specific)
INSERT INTO creneau (id, jour, heure_debut, heure_fin, type_creneau, semestre_id) VALUES
-- Monday
(1,  'LUNDI',    '08:00', '09:30', 'DEP', 1),
(2,  'LUNDI',    '09:45', '11:15', 'DEP', 1),
(3,  'LUNDI',    '11:30', '13:00', 'HE',  1),
(4,  'LUNDI',    '15:10', '16:40', 'DEP', 1),
(5,  'LUNDI',    '17:00', '18:30', 'DEP', 1),
-- Tuesday
(6,  'MARDI',    '08:00', '09:30', 'DEP', 1),
(7,  'MARDI',    '09:45', '11:15', 'DEP', 1),
(8,  'MARDI',    '11:30', '13:00', 'HE',  1),
(9,  'MARDI',    '15:10', '16:40', 'DEP', 1),
(10, 'MARDI',    '17:00', '18:30', 'DEP', 1),
-- Wednesday
(11, 'MERCREDI', '08:00', '09:30', 'DEP', 1),
(12, 'MERCREDI', '09:45', '11:15', 'DEP', 1),
(13, 'MERCREDI', '11:30', '13:00', 'ST',  1),
(14, 'MERCREDI', '15:10', '16:40', 'DEP', 1),
(15, 'MERCREDI', '17:00', '18:30', 'DEP', 1),
-- Thursday
(16, 'JEUDI',    '08:00', '09:30', 'DEP', 1),
(17, 'JEUDI',    '09:45', '11:15', 'DEP', 1),
(18, 'JEUDI',    '11:30', '13:00', 'HE',  1),
(19, 'JEUDI',    '15:10', '16:40', 'DEP', 1),
(20, 'JEUDI',    '17:00', '18:30', 'DEP', 1),
-- Friday
(21, 'VENDREDI', '08:00', '09:30', 'DEP', 1),
(22, 'VENDREDI', '09:45', '11:15', 'DEP', 1),
(23, 'VENDREDI', '11:30', '13:00', 'HE',  1),
(24, 'VENDREDI', '15:10', '16:40', 'DEP', 1),
(25, 'VENDREDI', '17:00', '18:30', 'DEP', 1),
-- Saturday
(26, 'SAMEDI',   '08:00', '09:30', 'DEP', 1),
(27, 'SAMEDI',   '09:45', '11:15', 'DEP', 1);

-- ============================================================
-- 9. AFFECTATIONS (Will be done via Admin UI)
-- ============================================================
-- Empty initial data since the user wants their friend to do the configuration.

-- ============================================================
-- 10. SEANCES (Will be done via Admin UI)
-- ============================================================
-- Empty initial data since the user wants their friend to do the configuration.

-- ============================================================
-- 11. CALENDRIER EVENTS
-- ============================================================
INSERT INTO evenement_calendrier (id, titre, description, type, date_debut, date_fin, semestre_id, couleur) VALUES
(1, 'Rentrée Universitaire', 'Début des cours S1', 'RENTREE', '2025-10-15', NULL, 1, '#22c55e'),
(2, 'Vacances de Noël', 'Pause hivernale', 'VACANCES', '2025-12-22', '2026-01-04', 1, '#3b82f6'),
(3, 'Examens S1', 'Session d''examens du premier semestre', 'EXAMEN', '2026-01-26', '2026-01-31', 1, '#ef4444'),
(4, 'Rentrée S2', 'Début des cours S2', 'RENTREE', '2026-02-15', NULL, 2, '#22c55e'),
(5, 'Fête de l''Indépendance', 'Jour férié national', 'FERIE', '2025-11-28', NULL, 1, '#a855f7'),
(6, 'Soutenances PFE', 'Présentations de fin d''études', 'SOUTENANCE', '2026-06-15', '2026-06-30', 2, '#f97316');

-- ============================================================
-- 12. UTILISATEURS (passwords are BCrypt hashed)
-- ============================================================
-- All passwords: admin123 / student123 / prof123
INSERT INTO utilisateur (id, nom, prenom, email, password, role, departement_id, professeur_id) VALUES
-- Admin
(1, 'Admin', 'Super', 'admin@esp.mr',
 '$2a$10$ANKAVXgt/vwpRbhPSNNL0u1QgwgS21A6.auM2JgM7ASjZMJpJ.eS6',
 'ADMIN', NULL, NULL),

-- Student (IRT)
(2, 'Ould Ahmed', 'Mohamed', '24013@esp.mr',
 '$2a$10$ANKAVXgt/vwpRbhPSNNL0u1QgwgS21A6.auM2JgM7ASjZMJpJ.eS6',
 'ETUDIANT', 1, NULL),

-- Professor (linked to Professeur id=1 - Abderrahmane)
(3, 'Abderrahmane', '', 'abderrahmane@esp.mr',
 '$2a$10$ANKAVXgt/vwpRbhPSNNL0u1QgwgS21A6.auM2JgM7ASjZMJpJ.eS6',
 'PROFESSEUR', NULL, 1),

-- Chef de département IRT (linked to Professeur id=2 - Hafedh)
(4, 'Hafedh', '', 'hafedh@esp.mr',
 '$2a$10$ANKAVXgt/vwpRbhPSNNL0u1QgwgS21A6.auM2JgM7ASjZMJpJ.eS6',
 'CHEF_DEP', 1, 2),

-- Another student
(5, 'Mint Salem', 'Aissata', '24025@esp.mr',
 '$2a$10$ANKAVXgt/vwpRbhPSNNL0u1QgwgS21A6.auM2JgM7ASjZMJpJ.eS6',
 'ETUDIANT', 1, NULL);

-- Fix sequences to continue after seed data
SELECT setval('departement_id_seq', (SELECT MAX(id) FROM departement));
SELECT setval('professeur_id_seq', (SELECT MAX(id) FROM professeur));
SELECT setval('salle_id_seq', (SELECT MAX(id) FROM salle));
SELECT setval('semestre_id_seq', (SELECT MAX(id) FROM semestre));
SELECT setval('semaine_academique_id_seq', (SELECT MAX(id) FROM semaine_academique));
SELECT setval('creneau_id_seq', (SELECT MAX(id) FROM creneau));
SELECT setval('seance_id_seq', COALESCE((SELECT MAX(id) FROM seance), 1));
SELECT setval('affectation_enseignement_id_seq', COALESCE((SELECT MAX(id) FROM affectation_enseignement), 1));
SELECT setval('utilisateur_id_seq', (SELECT MAX(id) FROM utilisateur));
SELECT setval('evenement_calendrier_id_seq', (SELECT MAX(id) FROM evenement_calendrier));
