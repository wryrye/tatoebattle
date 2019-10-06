import os
import redis
import pandas as pd

merge_dir = './merged'

r = redis.from_url(os.environ.get("REDIS_URL"))

r.flushall()

lang_range = {}
base_index = 0

pipe = r.pipeline()

for filename in os.listdir(merge_dir):

    df = pd.read_csv(os.path.join(merge_dir, filename),
    dtype={'id_sent1':int,'lang_sent1':str,'val_sent1':str,'id_sent2':int,'lang_sent2':str,'val_sent2':str})

    lang = None

    for index, row in df.iloc[0:].iterrows():
        if os.environ.get('ECOSYSTEM') == 'HEROKU' and index > 50000:
            break

        if lang == None:
            lang = row['lang_sent1']
        
        pipe.lpush(base_index + index, *[row['val_sent1'],row['val_sent2']])
    
    start = base_index
    base_index = len(pipe)
    end = base_index

    lang_range[lang] = [start, end - 1]

r.set('lang_range', lang_range)

pipe.execute()