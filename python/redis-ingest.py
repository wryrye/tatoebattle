import os
import redis
import pandas as pd


r = redis.from_url(os.environ.get("REDIS_URL"))
# r.set('foo', 'bar')
# print(r.get('foo'))

pipe = r.pipeline()

df = pd.read_csv("both.csv", names = ["id", "eng", "simp", "trad"])
# r.delete('1')

for index, row in df.iloc[1:].iterrows():
    pipe.lpush(index, *[row['eng'],row['simp'],row['trad']])

pipe.execute()

# print(r.lindex(20,1).decode('utf-8'))
