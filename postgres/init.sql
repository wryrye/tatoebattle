CREATE TABLE score_history (
    id SERIAL,
    user_id VARCHAR NOT NULL,
    win bit NOT NULL,
    score int NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
);

INSERT INTO score_history (user_id, win, score) VALUES
('Lulu123', B'1', 47),
('Lulu123', B'1', 47),
('Lulu123', B'1', 47),
('Bobert1337', B'1', 78),
('Bobert1337', B'1', 34),
('Bobert1337', B'0', 22),
('Francisco3045', B'1', 84),
('Francisco3045', B'0', 46),
('Francisco3045', B'0', 11);