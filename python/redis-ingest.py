import os
import redis
import pandas as pd

r = redis.from_url(os.environ.get("REDIS_URL"))

r.flushall()

pipe = r.pipeline()

df = pd.read_csv("both.csv", names = ["id", "eng", "simp", "trad"])

for index, row in df.iloc[1:].iterrows():
    pipe.lpush(index, *[row['eng'],row['simp'],row['trad']])

pipe.execute()
