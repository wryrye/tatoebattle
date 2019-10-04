#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
@author: ryan
"""

import sys
import csv

lang = sys.argv[1]

src_dir = './source'
filter_dir = './filtered'

with open(f'{src_dir}/sentences.csv','r') as sents, open(f'{src_dir}/links.csv','r') as links:
    writer = csv.writer(open(f'{filter_dir}/{lang}_sentences.csv', 'w'))
    for rowi in csv.reader(sents,delimiter='\t'):
        if rowi[1] == lang:
            writer.writerow(rowi)
