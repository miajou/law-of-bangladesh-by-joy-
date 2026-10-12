#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Assembles the complete 1 to 511 sections of The Penal Code, 1860 into src/data/penalCodeFullLaw.ts.
"""
import os
import json
import re

import sys
sys.path.insert(0, '/app/applet/scripts')
sys.path.insert(0, '/app/applet')

import build_penal_code_full as m1
import build_penal_code_part3 as m3

def to_bn(num_str):
    bn_digits = {'0':'০', '1':'১', '2':'২', '3':'৩', '4':'৪', '5':'৫', '6':'৬', '7':'৭', '8':'৮', '9':'৯'}
    res = ''
    for ch in str(num_str):
        res += bn_digits.get(ch, ch)
    suffix_map = {
        'A':'ক', 'B':'খ', 'C':'গ', 'D':'ঘ', 'E':'ঙ', 'F':'চ', 'G':'ছ', 'H':'জ', 'I':'ঝ', 
        '-I':'ঝ', '-i':'ঝ', 'J':'ঞ', 'K':'ট', 'L':'ঠ', 'M':'ড', 'N':'ঢ'
    }
    for eng, bn in suffix_map.items():
        if res.endswith(eng):
            res = res[:-len(eng)] + bn
    return res

# Combine all definition dictionaries
all_defs = {}
for k, v in m1.PENAL_REPEALED.items():
    # v is (title_bn, title_en, note_bn)
    all_defs[k] = (v[0], v[1], v[2], False, None, None, None)

for k, v in m1.PC_STATUTORY_DEFS.items():
    all_defs[k] = v

for k, v in m1.PC_STATUTORY_DEFS_2.items():
    all_defs[k] = v

for k, v in m3.PC_STATUTORY_DEFS_3.items():
    all_defs[k] = v

print(f"Total definitions unified: {len(all_defs)}")

# Verify all 1 to 511 are present
for i in range(1, 512):
    assert str(i) in all_defs, f"Missing section {i}!"

# Chapter definitions
chapters_data = []
for ch in m1.PENAL_CHAPTERS:
    ch_id, ch_num_bn, ch_title_bn, ch_title_en, _, _ = ch
    chapters_data.append({
        'id': ch_id,
        'numberBengali': ch_num_bn,
        'titleBengali': ch_title_bn,
        'titleEnglish': ch_title_en,
        'sections': []
    })

ch_map = {ch['id']: ch for ch in chapters_data}

# Assign every section to its appropriate chapter
sorted_keys = list(m1.PC_ALL_KEYS)
for key in sorted_keys:
    def_item = all_defs.get(key)
    if not def_item:
        continue
    
    title_bn, title_en, content_bn, is_landmark, bailable, cognizable, penalty = def_item
    ch_id = m1.find_pc_chapter(key)
    
    sec_obj = {
        'id': f"pc-sec-{key.lower()}",
        'sectionNumber': str(key),
        'sectionNumberBengali': f"ধারা {to_bn(key)}",
        'titleBengali': title_bn,
        'titleEnglish': title_en,
        'contentBengali': content_bn,
    }
    if is_landmark:
        sec_obj['isLandmark'] = True
    if bailable is not None:
        sec_obj['bailable'] = bailable
    if cognizable is not None:
        sec_obj['cognizable'] = cognizable
    if penalty:
        sec_obj['penaltySummaryBengali'] = penalty
        
    ch_map[ch_id]['sections'].append(sec_obj)

# Validate section counts
total_sec_count = sum(len(c['sections']) for c in chapters_data)
print(f"Total sections organized across {len(chapters_data)} chapters: {total_sec_count}")

# Generate TypeScript code
ts_lines = [
    "/**",
    " * @license",
    " * SPDX-License-Identifier: Apache-2.0",
    " */",
    "",
    "import { Law } from '../types/law';",
    "",
    "export const PENAL_CODE_FULL_LAW: Law = {",
    "  id: 'penal-code-1860',",
    "  titleBengali: 'দণ্ডবিধি, ১৮৬০',",
    "  titleEnglish: 'The Penal Code, 1860',",
    "  actNumberBengali: '১৮৬০ সালের ৪৫ নং আইন (সর্বশেষ সংশোধনীসহ)',",
    "  enactmentYear: 1860,",
    "  enactmentYearBengali: '১৮৬০',",
    "  categoryId: 'criminal',",
    "  categoryNameBengali: 'ফৌজদারি আইন',",
    "  preambleBengali:",
    "    'যেহেতু বাংলাদেশের জন্য একটি সাধারণ দণ্ডবিধি প্রণয়ন করা সমীচীন ও আবশ্যক; সেহেতু নিম্নরূপ আইন করা হইল—',",
    f"  totalSections: {total_sec_count},",
    "  status: 'published',",
    "  pdfFileName: 'The_Penal_Code_1860_Act_XLV.pdf',",
    "  pdfFileSize: '8.4 MB',",
    "  pdfIsOcr: false,",
    "  ocrConfidence: 99,",
    "  lastUpdated: '২০২৬-১০-১২',",
    "  viewCount: 38200,",
    "  chapters: [",
]

for ch in chapters_data:
    ts_lines.append("    {")
    ts_lines.append(f"      id: '{ch['id']}',")
    ts_lines.append(f"      numberBengali: '{ch['numberBengali']}',")
    ts_lines.append(f"      titleBengali: '{ch['titleBengali']}',")
    ts_lines.append(f"      titleEnglish: '{ch['titleEnglish']}',")
    ts_lines.append("      sections: [")
    for sec in ch['sections']:
        ts_lines.append("        {")
        ts_lines.append(f"          id: '{sec['id']}',")
        ts_lines.append(f"          sectionNumber: '{sec['sectionNumber']}',")
        ts_lines.append(f"          sectionNumberBengali: '{sec['sectionNumberBengali']}',")
        # Escape quotes in title
        esc_t_bn = sec['titleBengali'].replace("'", "\\'")
        esc_t_en = (sec.get('titleEnglish') or '').replace("'", "\\'")
        ts_lines.append(f"          titleBengali: '{esc_t_bn}',")
        ts_lines.append(f"          titleEnglish: '{esc_t_en}',")
        
        # Use template literal for content
        esc_c_bn = sec['contentBengali'].replace("`", "\\`").replace("${", "\\${")
        ts_lines.append(f"          contentBengali: `{esc_c_bn}`,")
        
        if sec.get('isLandmark'):
            ts_lines.append("          isLandmark: true,")
        if 'bailable' in sec:
            ts_lines.append(f"          bailable: {'true' if sec['bailable'] else 'false'},")
        if 'cognizable' in sec:
            ts_lines.append(f"          cognizable: {'true' if sec['cognizable'] else 'false'},")
        if sec.get('penaltySummaryBengali'):
            esc_pen = sec['penaltySummaryBengali'].replace("'", "\\'")
            ts_lines.append(f"          penaltySummaryBengali: '{esc_pen}',")
        ts_lines.append("        },")
    ts_lines.append("      ],")
    ts_lines.append("    },")

ts_lines.append("  ],")
ts_lines.append("};")
ts_lines.append("")

output_path = "/app/applet/src/data/penalCodeFullLaw.ts"
with open(output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(ts_lines))

print(f"Successfully generated {output_path} with {total_sec_count} sections!")
