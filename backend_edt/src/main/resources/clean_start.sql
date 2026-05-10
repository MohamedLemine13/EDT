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

-- Insert ONLY the Admin user so you can log in
INSERT INTO utilisateur (id, nom, prenom, email, password, role, departement_id, professeur_id) VALUES
(1, 'Admin', 'Super', 'admin@esp.mr',
 '$2a$10$ANKAVXgt/vwpRbhPSNNL0u1QgwgS21A6.auM2JgM7ASjZMJpJ.eS6',
 'ADMIN', NULL, NULL);

SELECT setval('utilisateur_id_seq', (SELECT MAX(id) FROM utilisateur));
