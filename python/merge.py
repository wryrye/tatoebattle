#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
@author: ryan
"""

import sys
import os
import csv

lang1 = sys.argv[1]
lang2 = sys.argv[2]

src_dir = './source'
filter_dir = './filtered'
merge_dir = './merged'

merge_file = f'{merge_dir}/{lang1}_{lang2}_translations.csv'

last_line = None
if os.path.exists(merge_file):
    with open(merge_file) as f:
        for line in f:
            pass
        last_line = line

last_id = 0 if last_line is None else int(last_line[0:last_line.index(',')])
print(f'Last ID: {last_id}') 

print('Storing links in memory...')
with open(f'{src_dir}/links.csv','r') as links:
    dict_links = {}
    for row_links in csv.reader(links, delimiter='\t'):
        id_link = int(row_links[0])

        if id_link in dict_links:
            dict_links[id_link].append(int(row_links[1]))
        else:
            dict_links[id_link] = [int(row_links[1])];

print('Storing 2nd language in memory...')
with open(f'{filter_dir}/{lang2}_sentences.csv','r') as sents2:
    dict_sent2 = {}
    for row_sents2 in csv.reader(sents2):
        id_sent2 = int(row_sents2[0])
        dict_sent2[id_sent2] = row_sents2;

with open(f'{filter_dir}/{lang1}_sentences.csv','r') as sents1:
    writer = csv.writer(open(merge_file, 'w'))

    for row_sents1 in csv.reader(sents1):
        id_sent1 = int(row_sents1[0])

        if (id_sent1 < last_id):
            continue

        if id_sent1 in dict_links:
            target_list = dict_links[id_sent1]

            for id_target in target_list:
                if id_target in dict_sent2:
                    merged = row_sents1 + dict_sent2[id_target]
                    print('Match found:', merged);
                    writer.writerow(merged)
