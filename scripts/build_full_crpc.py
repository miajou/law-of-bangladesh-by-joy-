#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build complete 1 to 565 sections of CrPC 1898
"""
import os
import re

def to_bn(num_str):
    bn_digits = {'0':'০', '1':'১', '2':'২', '3':'৩', '4':'৪', '5':'৫', '6':'৬', '7':'৭', '8':'৮', '9':'৯'}
    res = ''
    for ch in str(num_str):
        res += bn_digits.get(ch, ch)
    suffix_map = {'A':'ক', 'B':'খ', 'C':'গ', 'D':'ঘ', 'E':'ঙ', 'F':'চ', 'G':'ছ', 'H':'জ', 'I':'ঝ', 'J':'ঞ', 'K':'ট', 'L':'ঠ', 'M':'ড', 'N':'ঢ'}
    for eng, bn in suffix_map.items():
        if res.endswith(eng):
            res = res[:-len(eng)] + bn
    return res

# 1. Read existing crpcFullLaw.ts
existing_sections = {}
crpc_path = os.path.join(os.path.dirname(__file__), '../src/data/crpcFullLaw.ts')
with open(crpc_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Parse existing section blocks using regex
block_regex = re.compile(
    r'\{\s*id:\s*[\'"]([^\'"]+)[\'"],\s*'
    r'sectionNumber:\s*[\'"]([^\'"]+)[\'"],\s*'
    r'sectionNumberBengali:\s*[\'"]([^\'"]+)[\'"],\s*'
    r'titleBengali:\s*[\'"]([^\'"]+)[\'"],\s*'
    r'titleEnglish:\s*[\'"]([^\'"]+)[\'"],\s*'
    r'contentBengali:\s*(?:[\'"`]([\s\S]*?)[\'"`]),\s*'
    r'(?:penaltySummaryBengali:\s*[\'"]([^\'"]+)[\'"],\s*)?'
    r'isLandmark:\s*(true|false)'
    r'(?:,\s*bailable:\s*(true|false))?'
    r'(?:,\s*cognizable:\s*(true|false))?'
)

for m in block_regex.finditer(text):
    sec_num = m.group(2)
    existing_sections[sec_num] = {
        "id": m.group(1),
        "sectionNumber": sec_num,
        "sectionNumberBengali": m.group(3),
        "titleBengali": m.group(4),
        "titleEnglish": m.group(5),
        "contentBengali": m.group(6),
        "penaltySummaryBengali": m.group(7),
        "isLandmark": m.group(8) == 'true',
        "bailable": True if m.group(9) == 'true' else (False if m.group(9) == 'false' else None),
        "cognizable": True if m.group(10) == 'true' else (False if m.group(10) == 'false' else None)
    }

print(f"Loaded {len(existing_sections)} sections from existing file.")

# Check which numbers from 1 to 565 are missing
missing_numbers = []
for i in range(1, 566):
    if str(i) not in existing_sections:
        missing_numbers.append(i)

print(f"Missing integer sections: {len(missing_numbers)} (e.g. {missing_numbers[:15]}...)")
