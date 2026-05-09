-- ============================================================
-- EdT Seed Data — Realistic ESP (École Supérieure Polytechnique)
-- Run: PGPASSWORD=00000000 psql -U postgres -h localhost -d emploi_du_temps -f seed.sql
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
INSERT INTO professeur (id, nom, prenom, statut) VALUES
(1, 'Ba', 'Mamadou', 'PERMANENT'),
(2, 'Diallo', 'Ousmane', 'PERMANENT'),
(3, 'Ould Cheikh', 'Ahmed', 'PERMANENT'),
(4, 'Kane', 'Fatimata', 'VACATAIRE'),
(5, 'Mint Abderrahmane', 'Mariem', 'PERMANENT'),
(6, 'Sy', 'Ibrahima', 'VACATAIRE');

-- ============================================================
-- 4. SALLES
-- ============================================================
-- Amphis (shared — no departement)
INSERT INTO salle (id, nom, type_salle, ecole_id, departement_id) VALUES
(1, 'Amphi A', 'AMPHI', 'ESP', NULL),
(2, 'Amphi B', 'AMPHI', 'ESP', NULL);

-- Department-specific rooms
INSERT INTO salle (id, nom, type_salle, ecole_id, departement_id) VALUES
(3, 'Salle IRT-1', 'SALLE', 'ESP', 1),
(4, 'Salle IRT-2', 'SALLE', 'ESP', 1),
(5, 'Labo IRT', 'LABO', 'ESP', 1),
(6, 'Salle GC-1', 'SALLE', 'ESP', 2),
(7, 'Salle GC-2', 'SALLE', 'ESP', 2),
(8, 'Salle GM-1', 'SALLE', 'ESP', 3);

-- ============================================================
-- 5. MATIERES
-- ============================================================
INSERT INTO matiere (code, intitule, credits, h_cm, h_td, h_tp) VALUES
('IRT31', 'Bases de Données Avancées', 4, 20, 10, 10),
('IRT32', 'Réseaux & Protocoles', 4, 20, 10, 10),
('IRT33', 'Programmation Web', 3, 15, 10, 15),
('IRT34', 'Systèmes d''Exploitation', 3, 20, 10, 10),
('IRT35', 'Architecture des Systèmes', 2, 15, 10, 0),
('COM01', 'Mathématiques Appliquées', 4, 30, 15, 0),
('COM02', 'Physique Générale', 3, 20, 10, 10),
('COM03', 'Anglais Technique', 2, 15, 10, 0);

-- ============================================================
-- 6. SEMESTRES
-- ============================================================
INSERT INTO semestre (id, libelle, date_debut, date_fin) VALUES
(1, 'S1 2025-2026', '2025-10-15', '2026-01-31'),
(2, 'S2 2025-2026', '2026-02-15', '2026-06-30');

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
-- 8. CRENEAUX (Time slots for S1)
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
-- 9. AFFECTATIONS (prof + salle for each course/dept)
-- ============================================================
-- IRT department assignments
INSERT INTO affectation_enseignement (id, semestre_id, departement_id, is_commun, matiere_code, type, professeur_id, salle_id) VALUES
(1,  1, 1, false, 'IRT31', 'CM', 1, 3),  -- Ba teaches BDD in Salle IRT-1
(2,  1, 1, false, 'IRT31', 'TD', 1, 3),
(3,  1, 1, false, 'IRT31', 'TP', 1, 5),  -- TP in Labo IRT
(4,  1, 1, false, 'IRT32', 'CM', 2, 4),  -- Diallo teaches Réseaux
(5,  1, 1, false, 'IRT32', 'TD', 2, 4),
(6,  1, 1, false, 'IRT32', 'TP', 2, 5),
(7,  1, 1, false, 'IRT33', 'CM', 3, 3),  -- Ould Cheikh teaches Web
(8,  1, 1, false, 'IRT33', 'TD', 3, 3),
(9,  1, 1, false, 'IRT33', 'TP', 3, 5),
(10, 1, 1, false, 'IRT34', 'CM', 4, 4),  -- Kane teaches OS
(11, 1, 1, false, 'IRT34', 'TD', 4, 4);

-- Common (HE) assignments
INSERT INTO affectation_enseignement (id, semestre_id, departement_id, is_commun, matiere_code, type, professeur_id, salle_id) VALUES
(12, 1, NULL, true, 'COM01', 'CM', 5, 1),  -- Mint Abderrahmane teaches Math in Amphi A
(13, 1, NULL, true, 'COM01', 'TD', 5, 1),
(14, 1, NULL, true, 'COM02', 'CM', 6, 2),  -- Sy teaches Physics in Amphi B
(15, 1, NULL, true, 'COM03', 'CM', 4, 1);  -- Kane teaches English in Amphi A

-- ============================================================
-- 10. SEANCES (Actual class sessions for semaine 1)
-- ============================================================
-- IRT department sessions (DEP slots)
INSERT INTO seance (id, type, statut, creneau_id, matiere_code, salle_id, semaine_id, professeur_id) VALUES
(1,  'CM', 'PLANIFIEE', 1,  'IRT31', 3, 1, 1),  -- Lundi 08:00 BDD CM
(2,  'TD', 'PLANIFIEE', 2,  'IRT31', 3, 1, 1),  -- Lundi 09:45 BDD TD
(3,  'CM', 'PLANIFIEE', 6,  'IRT32', 4, 1, 2),  -- Mardi 08:00 Réseaux CM
(4,  'TD', 'PLANIFIEE', 7,  'IRT32', 4, 1, 2),  -- Mardi 09:45 Réseaux TD
(5,  'CM', 'PLANIFIEE', 11, 'IRT33', 3, 1, 3),  -- Mercredi 08:00 Web CM
(6,  'TP', 'PLANIFIEE', 12, 'IRT33', 5, 1, 3),  -- Mercredi 09:45 Web TP
(7,  'CM', 'PLANIFIEE', 16, 'IRT34', 4, 1, 4),  -- Jeudi 08:00 OS CM
(8,  'TD', 'PLANIFIEE', 17, 'IRT34', 4, 1, 4),  -- Jeudi 09:45 OS TD
(9,  'TP', 'PLANIFIEE', 21, 'IRT31', 5, 1, 1),  -- Vendredi 08:00 BDD TP
(10, 'TP', 'PLANIFIEE', 22, 'IRT32', 5, 1, 2);  -- Vendredi 09:45 Réseaux TP

-- Common sessions (HE slots)
INSERT INTO seance (id, type, statut, creneau_id, matiere_code, salle_id, semaine_id, professeur_id) VALUES
(11, 'CM', 'PLANIFIEE', 3,  'COM01', 1, 1, 5),  -- Lundi 11:30 Math CM (Amphi A)
(12, 'CM', 'PLANIFIEE', 8,  'COM02', 2, 1, 6),  -- Mardi 11:30 Physique CM (Amphi B)
(13, 'CM', 'PLANIFIEE', 18, 'COM03', 1, 1, 4),  -- Jeudi 11:30 Anglais CM (Amphi A)
(14, 'TD', 'PLANIFIEE', 23, 'COM01', 1, 1, 5);  -- Vendredi 11:30 Math TD (Amphi A)

-- Link seances to departments
-- IRT dep seances → IRT
INSERT INTO seance_departement (seance_id, departement_id) VALUES
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1),
(6, 1), (7, 1), (8, 1), (9, 1), (10, 1);

-- Common seances → all departments
INSERT INTO seance_departement (seance_id, departement_id) VALUES
(11, 1), (11, 2), (11, 3),  -- Math → all
(12, 1), (12, 2), (12, 3),  -- Physics → all
(13, 1), (13, 2), (13, 3),  -- English → all
(14, 1), (14, 2), (14, 3);  -- Math TD → all

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

-- Professor (linked to Professeur id=1)
(3, 'Ba', 'Mamadou', 'mba@esp.mr',
 '$2a$10$ANKAVXgt/vwpRbhPSNNL0u1QgwgS21A6.auM2JgM7ASjZMJpJ.eS6',
 'PROFESSEUR', NULL, 1),

-- Chef de département IRT
(4, 'Diallo', 'Ousmane', 'odiallo@esp.mr',
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
SELECT setval('seance_id_seq', (SELECT MAX(id) FROM seance));
SELECT setval('affectation_enseignement_id_seq', (SELECT MAX(id) FROM affectation_enseignement));
SELECT setval('utilisateur_id_seq', (SELECT MAX(id) FROM utilisateur));
SELECT setval('evenement_calendrier_id_seq', (SELECT MAX(id) FROM evenement_calendrier));

-- ============================================================
-- Summary of test accounts:
-- ============================================================
-- | Role       | Email          | Password  | Notes                    |
-- |------------|----------------|-----------|--------------------------|
-- | ADMIN      | admin@esp.mr   | admin123  | Full access              |
-- | ETUDIANT   | 24013@esp.mr   | admin123  | IRT department           |
-- | ETUDIANT   | 24025@esp.mr   | admin123  | IRT department           |
-- | PROFESSEUR | mba@esp.mr     | admin123  | Prof Ba (BDD)            |
-- | CHEF_DEP   | odiallo@esp.mr | admin123  | Chef IRT (Prof Diallo)   |
-- ============================================================
