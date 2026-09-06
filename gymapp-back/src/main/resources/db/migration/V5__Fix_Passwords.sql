-- V5: Fix default credentials with valid BCrypt hashes
UPDATE core_person SET password = '$2a$10$d3mbWQCtw1XK/KO9dEqKcuRHiJK6VXKc0nQyjz9PmQB1FjZT0NrsG' WHERE email = 'admin@gymapp.com';
UPDATE core_person SET password = '$2a$10$gEC/MZyKA5s.iV7WaHJBPesA7FPy7TA91Sqg30OLRJLF/Gqcnv7F6' WHERE email = 'marcos@gymapp.com';
UPDATE core_person SET password = '$2a$10$WLrNMXgtYEvqrQ4fFN7kkeR6HpVorqVw2hXtV87ql2jTpr23HKA62' WHERE email = 'sofia@gymapp.com';
