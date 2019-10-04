import os
import redis
import pandas as pd

merge_dir = './merged'

r = redis.from_url(os.environ.get("REDIS_URL"))

r.flushall()

pipe = r.pipeline()

for filename in os.listdir(merge_dir):
    df = pd.read_csv(filename, names = ['id_sent1','lang_sent1','val_sent1','id_sent2','lang_sent2','val_sent2'])

    for index, row in df.iloc[1:].iterrows():
        pipe.lpush(index, *[row['val_sent1'],row['val_sent2']])

pipe.execute()
