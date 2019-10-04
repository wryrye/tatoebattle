#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
@author: ryan
"""

import sys
import os
import csv

src_dir = '../source'
lang1 = sys.argv[1]
lang2 = sys.argv[2]

merge_file = f'{lang1}_{lang2}_translations.csv'

# WARNING: may cause duplicates
last_line = None
if os.path.exists(merge_file):
    with open(merge_file) as f:
        for line in f:
            pass
        last_line = line

last_id = 0 if last_line is None else int(last_line[0:last_line.index(',')])
print(f'Last ID: {last_id}') 

writer = csv.writer(open(merge_file, 'w'))

with open(f'{lang1}_sentences.csv','r') as sents1, open(f'{lang2}_sentences.csv','r') as sents2, open(f'{src_dir}/links.csv','r') as links:

    for row_sents1 in csv.reader(sents1):
        id_sent1 = int(row_sents1[0])

        if (id_sent1 < last_id):
            continue

        for row_links in csv.reader(links, delimiter='\t'):
            id_link = int(row_links[0])

            # gone too far (return early)
            if  id_link > id_sent1:
                links.seek(0)
                break

            if id_link == id_sent1:
                id_target = int(row_links[1]);

                for row_sents2 in csv.reader(sents2):
                    id_sent2 = int(row_sents2[0])

                    # gone too far (return early)
                    if  id_sent2 > id_target:
                        sents2.seek(0)
                        break

                    if id_sent2 == id_target:
                        merged = row_sents1 + row_sents2
                        print('Match found:', merged);
                        writer.writerow(merged)
                        sents2.seek(0)
                        break

