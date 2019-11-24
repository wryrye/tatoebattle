DROP TABLE score_history;

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

TRUNCATE TABLE score_history 
RESTART IDENTITY;


SELECT 
    user_id
    , SUM(CAST(win AS INT)) as win_sum 
    , SUM(score) as score_sum 
FROM 
    score_history
GROUP BY user_id
ORDER BY user_id ASC;


SELECT 
    user_id,
    RANK () OVER (ORDER BY total_wins DESC) AS rank,
    total_wins,
    total_score
FROM (
    SELECT 
        user_id,
        SUM(CAST(win AS INT)) as total_wins,
        SUM(score) as total_score
    FROM 
        score_history
    GROUP BY user_id
    ORDER BY user_id ASC
) as myTableAlias
ORDER BY rank;


SELECT 
    user_id,
    total_wins,
    RANK () OVER (ORDER BY total_score DESC) AS rank,
    total_score
FROM (
    SELECT 
        user_id,
        SUM(CAST(win AS INT)) as total_wins,
        SUM(score) as total_score
    FROM 
        score_history
    GROUP BY user_id
    ORDER BY user_id ASC
) as myTableAlias
ORDER BY rank;