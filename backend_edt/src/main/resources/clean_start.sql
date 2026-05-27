-- Clean all tables
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

-- Drop the old role check constraint (it was created without SUPER_ADMIN)
-- Hibernate will re-create it with the correct values on next startup.
ALTER TABLE utilisateur DROP CONSTRAINT IF EXISTS utilisateur_role_check;

-- Insert the Super Admin user so you can log in
-- Password: admin (bcrypt hash)
INSERT INTO utilisateur (id, nom, prenom, email, password, role, departement_id, professeur_id, ecole_id, must_change_password) VALUES
(1, 'Admin', 'Super', 'admin@esp.mr',
 '$2b$12$d8b2sMl.KPzBKgf.xAAYGOyUPEmOwwzw7oFv02g/jDVsA2qT8hY3q',
 'SUPER_ADMIN', NULL, NULL, NULL, false);

SELECT setval('utilisateur_id_seq', (SELECT MAX(id) FROM utilisateur));