-- V1: Initial Schema (Standardized)
CREATE TABLE person (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20)
);

CREATE TABLE administrator (
    id BIGINT PRIMARY KEY,
    CONSTRAINT fk_admin_person FOREIGN KEY (id) REFERENCES person(id) ON DELETE CASCADE
);

CREATE TABLE professor (
    id BIGINT PRIMARY KEY,
    active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_prof_person FOREIGN KEY (id) REFERENCES person(id) ON DELETE CASCADE
);

CREATE TABLE routine (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    goal VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    version INT DEFAULT 1,
    parent_id BIGINT
);

CREATE TABLE exercise (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    muscle_group VARCHAR(50),
    description TEXT
);

CREATE TABLE routine_day (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    routine_id BIGINT NOT NULL,
    day_order INT NOT NULL,
    CONSTRAINT fk_day_routine FOREIGN KEY (routine_id) REFERENCES routine(id) ON DELETE CASCADE
);

CREATE TABLE routine_exercise (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    routine_day_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    sets INT NOT NULL,
    repetitions INT NOT NULL,
    CONSTRAINT fk_re_day FOREIGN KEY (routine_day_id) REFERENCES routine_day(id) ON DELETE CASCADE,
    CONSTRAINT fk_re_ex FOREIGN KEY (exercise_id) REFERENCES exercise(id)
);

CREATE TABLE group_class (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(100) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NOT NULL,
    capacity INT NOT NULL,
    professor_id BIGINT,
    routine_id BIGINT,
    CONSTRAINT fk_class_prof FOREIGN KEY (professor_id) REFERENCES professor(id),
    CONSTRAINT fk_class_routine FOREIGN KEY (routine_id) REFERENCES routine(id)
);

CREATE TABLE client (
    id BIGINT PRIMARY KEY,
    active BOOLEAN DEFAULT TRUE,
    routine_active_id BIGINT,
    active_class_id BIGINT,
    CONSTRAINT fk_client_person FOREIGN KEY (id) REFERENCES person(id) ON DELETE CASCADE,
    CONSTRAINT fk_client_routine FOREIGN KEY (routine_active_id) REFERENCES routine(id),
    CONSTRAINT fk_client_class FOREIGN KEY (active_class_id) REFERENCES group_class(id)
);

CREATE TABLE client_routine (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT NOT NULL,
    routine_id BIGINT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    start_date DATE DEFAULT (CURRENT_DATE),
    CONSTRAINT fk_cr_client FOREIGN KEY (client_id) REFERENCES client(id) ON DELETE CASCADE,
    CONSTRAINT fk_cr_routine FOREIGN KEY (routine_id) REFERENCES routine(id)
);

CREATE TABLE clients_routines (
    client_id BIGINT NOT NULL,
    routine_id BIGINT NOT NULL,
    PRIMARY KEY (client_id, routine_id),
    CONSTRAINT fk_clients_routines_client FOREIGN KEY (client_id) REFERENCES client(id) ON DELETE CASCADE,
    CONSTRAINT fk_clients_routines_routine FOREIGN KEY (routine_id) REFERENCES routine(id) ON DELETE CASCADE
);

CREATE TABLE client_schedule (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_routine_id BIGINT NOT NULL,
    day_order INT NOT NULL,
    assigned_day VARCHAR(20) NOT NULL,
    CONSTRAINT fk_cs_cr FOREIGN KEY (client_routine_id) REFERENCES client_routine(id) ON DELETE CASCADE
);

CREATE TABLE monthly_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    price DOUBLE NOT NULL,
    duration_days INT NOT NULL
);

CREATE TABLE payment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT NOT NULL,
    professor_id BIGINT,
    monthly_type_id BIGINT,
    amount DOUBLE NOT NULL,
    date DATE DEFAULT (CURRENT_DATE),
    payment_type VARCHAR(20) NOT NULL,
    CONSTRAINT fk_pay_client FOREIGN KEY (client_id) REFERENCES client(id),
    CONSTRAINT fk_pay_prof FOREIGN KEY (professor_id) REFERENCES professor(id),
    CONSTRAINT fk_pay_type FOREIGN KEY (monthly_type_id) REFERENCES monthly_type(id)
);

CREATE TABLE product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    price DOUBLE NOT NULL,
    stock INT DEFAULT 0,
    administrator_id BIGINT,
    CONSTRAINT fk_prod_admin FOREIGN KEY (administrator_id) REFERENCES administrator(id)
);

CREATE TABLE payment_product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    client_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DOUBLE,
    CONSTRAINT fk_pp_pay FOREIGN KEY (payment_id) REFERENCES payment(id) ON DELETE CASCADE,
    CONSTRAINT fk_pp_prod FOREIGN KEY (product_id) REFERENCES product(id),
    CONSTRAINT fk_pp_client FOREIGN KEY (client_id) REFERENCES client(id)
);

CREATE TABLE assistance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT NOT NULL,
    staff_id BIGINT,
    date DATE DEFAULT (CURRENT_DATE),
    input_hour TIME NOT NULL,
    CONSTRAINT fk_assist_client FOREIGN KEY (client_id) REFERENCES client(id),
    CONSTRAINT fk_assist_staff FOREIGN KEY (staff_id) REFERENCES person(id)
);

CREATE TABLE physical_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT NOT NULL,
    date DATE DEFAULT (CURRENT_DATE),
    weight DOUBLE,
    muscle_mass DOUBLE,
    fat_percentage DOUBLE,
    notes TEXT,
    CONSTRAINT fk_phys_client FOREIGN KEY (client_id) REFERENCES client(id) ON DELETE CASCADE
);

CREATE TABLE exercise_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    date DATE DEFAULT (CURRENT_DATE),
    weight DOUBLE,
    reps_achieved INT,
    sets_achieved INT,
    time_in_seconds DOUBLE,
    notes TEXT,
    CONSTRAINT fk_log_client FOREIGN KEY (client_id) REFERENCES client(id) ON DELETE CASCADE,
    CONSTRAINT fk_log_ex FOREIGN KEY (exercise_id) REFERENCES exercise(id)
);
