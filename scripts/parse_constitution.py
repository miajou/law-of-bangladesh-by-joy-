#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

with open('constitution-print-bdlaws.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Pattern to find parts, chapters, sections
part_pat = re.compile(r'<div\s+class=["\']act-part-group[^"\']*["\']>(.*?)</div>\s*</div>', re.DOTALL)
chap_pat = re.compile(r'<div\s+class=["\']act-chapter-group[^"\']*["\']>(.*?)</div>', re.DOTALL)
sec_pat = re.compile(r'<div\s+class=["\']col-sm-3\s+txt-head["\'][^>]*>(.*?)</div>\s*<div\s+class=["\']col-sm-9\s+txt-details["\'][^>]*>(.*?)</div>', re.DOTALL)

# Let's find tokens with start positions
tokens = []
for m in part_pat.finditer(html):
    tokens.append((m.start(), 'part', m.group(1)))
for m in chap_pat.finditer(html):
    tokens.append((m.start(), 'chap', m.group(1)))
for m in sec_pat.finditer(html):
    tokens.append((m.start(), 'sec', (m.group(1), m.group(2))))

tokens.sort(key=lambda x: x[0])

print(f"Total tokens found: {len(tokens)}")

current_part_no = "প্রথম ভাগ"
current_part_name = "প্রজাতন্ত্র"
current_chap_no = ""
current_chap_name = ""

part_list = []
sections_by_part = {}

for pos, kind, data in tokens:
    if kind == 'part':
        p_no = re.search(r'<p\s+class=["\']act-part-no["\'][^>]*>(.*?)</p>', data, re.DOTALL)
        p_name = re.search(r'<p\s+class=["\']act-part-name["\'][^>]*>(.*?)</p>', data, re.DOTALL)
        no_txt = re.sub(r'<[^>]+>', ' ', p_no.group(1)).strip() if p_no else ''
        name_txt = re.sub(r'<[^>]+>', ' ', p_name.group(1)).strip() if p_name else ''
        no_txt = re.sub(r'\s+', ' ', no_txt)
        name_txt = re.sub(r'\s+', ' ', name_txt)
        current_part_no = no_txt
        current_part_name = name_txt
        current_chap_no = ""
        current_chap_name = ""
        part_key = f"{current_part_no} - {current_part_name}"
        part_list.append(part_key)
        print(f"\n[PART] {part_key}")
    elif kind == 'chap':
        c_no = re.search(r'<p\s+class=["\']act-chapter-no["\'][^>]*>(.*?)</p>', data, re.DOTALL)
        c_name = re.search(r'<p\s+class=["\']act-chapter-name["\'][^>]*>(.*?)</p>', data, re.DOTALL)
        no_txt = re.sub(r'<[^>]+>', ' ', c_no.group(1)).strip() if c_no else ''
        name_txt = re.sub(r'<[^>]+>', ' ', c_name.group(1)).strip() if c_name else ''
        no_txt = re.sub(r'\s+', ' ', no_txt)
        name_txt = re.sub(r'\s+', ' ', name_txt)
        current_chap_no = no_txt
        current_chap_name = name_txt
        print(f"  [CHAP] {current_chap_no} - {current_chap_name}")
    elif kind == 'sec':
        head_raw, details_raw = data
        head_txt = re.sub(r'<[^>]+>', ' ', head_raw).strip()
        head_txt = re.sub(r'\s+', ' ', head_txt)
        
        details_txt = re.sub(r'<br\s*/?>', '\n', details_raw)
        details_txt = re.sub(r'</p>', '\n', details_txt)
        # remove footnotes markers like <sup>3</sup>
        # but keep text clean
        details_txt = re.sub(r'<sup[^>]*>.*?</sup>', '', details_txt)
        details_txt = re.sub(r'<span\s+class=["\']footnote["\'][^>]*>.*?</span>', '', details_txt)
        details_txt = re.sub(r'<[^>]+>', ' ', details_txt)
        # unescape HTML entities
        import html as html_lib
        details_txt = html_lib.unescape(details_txt)
        details_txt = re.sub(r'[ \t]+', ' ', details_txt).strip()
        
        part_key = f"{current_part_no} - {current_part_name}"
        if part_key not in sections_by_part:
            sections_by_part[part_key] = []
        sections_by_part[part_key].append((head_txt, details_txt[:60]))

print(f"\nTotal Parts with sections: {len(sections_by_part)}")
total_secs = 0
for pk, secs in sections_by_part.items():
    print(f"Part: {pk} -> {len(secs)} sections")
    total_secs += len(secs)
print(f"TOTAL SECTIONS: {total_secs}")
