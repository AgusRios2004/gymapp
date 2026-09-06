-- Core
ALTER TABLE person RENAME TO core_person;
ALTER TABLE person_AUD RENAME TO core_person_aud;
ALTER TABLE administrator RENAME TO core_administrator;
ALTER TABLE professor RENAME TO core_professor;

-- Clients
ALTER TABLE client RENAME TO cli_client;
ALTER TABLE client_AUD RENAME TO cli_client_aud;
ALTER TABLE client_schedule RENAME TO cli_client_schedule;
ALTER TABLE physical_record RENAME TO cli_physical_record;

-- Routines
ALTER TABLE routine RENAME TO rout_routine;
ALTER TABLE routine_AUD RENAME TO rout_routine_aud;
ALTER TABLE exercise RENAME TO rout_exercise;
ALTER TABLE routine_day RENAME TO rout_routine_day;
ALTER TABLE routine_exercise RENAME TO rout_routine_exercise;
ALTER TABLE client_routine RENAME TO rout_client_routine;
ALTER TABLE clients_routines RENAME TO rout_clients_routines;
ALTER TABLE exercise_log RENAME TO rout_exercise_log;

-- Payments
ALTER TABLE monthly_type RENAME TO pay_monthly_type;
ALTER TABLE payment RENAME TO pay_payment;
ALTER TABLE payment_AUD RENAME TO pay_payment_aud;
ALTER TABLE product RENAME TO pay_product;
ALTER TABLE product_AUD RENAME TO pay_product_aud;
ALTER TABLE payment_product RENAME TO pay_payment_product;

-- Attendance
ALTER TABLE group_class RENAME TO att_group_class;
ALTER TABLE assistance RENAME TO att_assistance;
