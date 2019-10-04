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

# TODO: store as list for multiple versions of translation
print('Storing links in memory...')
dict_links = {}
with open(f'{src_dir}/links.csv','r') as links:
    for row_links in csv.reader(links, delimiter='\t'):
        id_link = int(row_links[0])
        dict_links[id_link] = int(row_links[1]);

print('Storing 2nd language in memory...')
dict_sent2 = {}
with open(f'{lang2}_sentences.csv','r') as sents2:
    for row_sents2 in csv.reader(sents2):
        id_sent2 = int(row_sents2[0])
        dict_sent2[id_sent2] = row_sents2;

with open(f'{lang1}_sentences.csv','r') as sents1:
    writer = csv.writer(open(merge_file, 'w'))

    for row_sents1 in csv.reader(sents1):
        id_sent1 = int(row_sents1[0])

        if (id_sent1 < last_id):
            continue

        if id_sent1 in dict_links:
            id_target = dict_links[id_sent1]

            if id_target in dict_sent2:
                merged = row_sents1 + dict_sent2[id_target]
                print('Match found:', merged);
                writer.writerow(merged)
