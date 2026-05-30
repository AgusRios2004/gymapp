-- V3: Envers Auditing and Soft Delete Support
CREATE TABLE REVINFO (
    REV INT AUTO_INCREMENT PRIMARY KEY,
    REVTSTMP BIGINT
);

ALTER TABLE person ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE routine ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE payment ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE product ADD COLUMN deleted BOOLEAN DEFAULT FALSE;

CREATE TABLE person_AUD (
    id BIGINT NOT NULL,
    REV INT NOT NULL,
    REVTYPE TINYINT,
    dni VARCHAR(20),
    email VARCHAR(100),
    last_name VARCHAR(50),
    name VARCHAR(50),
    password VARCHAR(255),
    phone VARCHAR(20),
    deleted BOOLEAN,
    PRIMARY KEY (id, REV),
    CONSTRAINT fk_person_aud_revinfo FOREIGN KEY (REV) REFERENCES REVINFO(REV)
);

CREATE TABLE client_AUD (
    id BIGINT NOT NULL,
    REV INT NOT NULL,
    REVTYPE TINYINT,
    active BOOLEAN,
    active_class_id BIGINT,
    routine_active_id BIGINT,
    PRIMARY KEY (id, REV),
    CONSTRAINT fk_client_aud_revinfo FOREIGN KEY (REV) REFERENCES REVINFO(REV)
);

CREATE TABLE routine_AUD (
    id BIGINT NOT NULL,
    REV INT NOT NULL,
    REVTYPE TINYINT,
    name VARCHAR(100),
    goal VARCHAR(255),
    active BOOLEAN,
    version INT,
    parent_id BIGINT,
    deleted BOOLEAN,
    PRIMARY KEY (id, REV),
    CONSTRAINT fk_routine_aud_revinfo FOREIGN KEY (REV) REFERENCES REVINFO(REV)
);

CREATE TABLE payment_AUD (
    id BIGINT NOT NULL,
    REV INT NOT NULL,
    REVTYPE TINYINT,
    client_id BIGINT,
    professor_id BIGINT,
    monthly_type_id BIGINT,
    amount DOUBLE,
    date DATE,
    payment_type VARCHAR(20),
    deleted BOOLEAN,
    PRIMARY KEY (id, REV),
    CONSTRAINT fk_payment_aud_revinfo FOREIGN KEY (REV) REFERENCES REVINFO(REV)
);

CREATE TABLE product_AUD (
    id BIGINT NOT NULL,
    REV INT NOT NULL,
    REVTYPE TINYINT,
    product_name VARCHAR(100),
    price DOUBLE,
    stock INT,
    administrator_id BIGINT,
    deleted BOOLEAN,
    PRIMARY KEY (id, REV),
    CONSTRAINT fk_product_aud_revinfo FOREIGN KEY (REV) REFERENCES REVINFO(REV)
);
