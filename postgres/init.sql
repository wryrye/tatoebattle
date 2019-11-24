CREATE TABLE score_history (
    id SERIAL,
    user_id VARCHAR NOT NULL,
    win bit NOT NULL,
    score int NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id)
);

INSERT INTO score_history (user_id, win, score) VALUES
(1, B'1', 78),
(1, B'1', 34),
(1, B'0', 22),
(2, B'0', 84),
(2, B'0', 46),
(2, B'1', 47);