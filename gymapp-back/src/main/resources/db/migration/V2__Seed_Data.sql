-- V2: Seed Default Data (Development/Demo)
INSERT INTO person (dni, email, last_name, name, password, phone) VALUES
('11111111', 'admin@gymapp.com', 'Gym', 'Admin', '$2a$10$8.UnVuG9HHgffUDAlk8KnOsyER0Mn5LcNS.yW7jW.v.YJtF2N0yOW', '12345678'), -- admin123
('22222222', 'marcos@gymapp.com', 'Entrenador', 'Marcos', '$2a$10$G0N0LwW/yYJkP0X3K9Qk5O7xR6S9yG2R6E9J7X1W9v.YJtF2N0yOW', '11667788'), -- marcos123
('33333333', 'sofia@gymapp.com', 'Gimnasia', 'Sofia', '$2a$10$K9Qk5O7xR6S9yG2R6E9J7X1W9v.YJtF2N0yOWG0N0LwW/yYJkP0X3', '11443322'); -- sofia123

INSERT INTO administrator (id) VALUES (1);
INSERT INTO professor (id, active) VALUES (2, TRUE), (3, TRUE);

INSERT INTO monthly_type (type, price, duration_days) VALUES
('Plan Básico (3 veces por semana)', 15000.00, 30),
('Plan Full (Acceso Total)', 22000.00, 30),
('Plan Estudiante', 12000.00, 30);

INSERT INTO exercise (name, muscle_group, description) VALUES
('Sentadilla Libre', 'Piernas', 'Músculo principal: Cuádriceps'),
('Press de Banca', 'Pectoral', 'Músculo principal: Pectoral Mayor'),
('Peso Muerto', 'Espalda/Piernas', 'Músculo principal: Isquios/Lumbar'),
('Dominadas', 'Espalda', 'Músculo principal: Dorsal Ancho');
