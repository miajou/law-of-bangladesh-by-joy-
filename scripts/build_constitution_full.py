#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Builds complete src/data/constitutionFullLaw.ts containing all 170 articles
(Articles 1 to 153 including all lettered articles 2A, 4A, 7A, 7B, 18A, 23A, 47A, 117A, 141A-C, etc.)
along with all 11 Parts, Chapters, English titles, and complete official legal texts.
"""
import re
import json
import html as html_lib

with open('constitution-print-bdlaws.html', 'r', encoding='utf-8') as f:
    bn_html = f.read()

with open('constitution-en-print.html', 'r', encoding='utf-8') as f:
    en_html = f.read()

bengali_digits = {'০':'0', '১':'1', '২':'2', '৩':'3', '৪':'4', '৫':'5', '৬':'6', '৭':'7', '৮':'8', '৯':'9'}
english_to_bn_digits = {'0':'০', '1':'১', '2':'২', '3':'৩', '4':'৪', '5':'৫', '6':'৬', '7':'৭', '8':'৮', '9':'৯'}

def to_bn_digits(s):
    res = ''
    for ch in str(s):
        res += english_to_bn_digits.get(ch, ch)
    return res

def clean_text(raw_html):
    if not raw_html:
        return ""
    # remove footnote references
    t = re.sub(r'<sup[^>]*>.*?</sup>', '', raw_html, flags=re.DOTALL)
    t = re.sub(r'<span\s+class=["\']footnote["\'][^>]*>.*?</span>', '', t, flags=re.DOTALL)
    t = re.sub(r'<br\s*/?>', '\n', t)
    t = re.sub(r'</p>', '\n\n', t)
    t = re.sub(r'</div>', '\n', t)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = html_lib.unescape(t)
    lines = [re.sub(r'[ \t]+', ' ', l).strip() for l in t.split('\n')]
    # keep non-redundant empty lines
    result_lines = []
    prev_empty = False
    for l in lines:
        if not l:
            if not prev_empty:
                result_lines.append("")
                prev_empty = True
        else:
            result_lines.append(l)
            prev_empty = False
    return '\n'.join(result_lines).strip()

sec_pat = re.compile(r'<div\s+class=[\"\']col-sm-3\s+txt-head[\"\'][^>]*>(.*?)</div>\s*<div\s+class=[\"\']col-sm-9\s+txt-details[\"\'][^>]*>(.*?)</div>', re.DOTALL)

bn_secs = list(sec_pat.finditer(bn_html))
en_secs = list(sec_pat.finditer(en_html))

print(f"Bengali sections: {len(bn_secs)}, English sections: {len(en_secs)}")

# Now find where parts and chapters occur relative to sections in bn_html
part_pat = re.compile(r'<div\s+class=["\']act-part-group[^"\']*["\']>(.*?)</div>\s*</div>', re.DOTALL)
chap_pat = re.compile(r'<div\s+class=["\']act-chapter-group[^"\']*["\']>(.*?)</div>', re.DOTALL)

markers = []
for m in part_pat.finditer(bn_html):
    p_no = re.search(r'<p\s+class=["\']act-part-no["\'][^>]*>(.*?)</p>', m.group(1), re.DOTALL)
    p_name = re.search(r'<p\s+class=["\']act-part-name["\'][^>]*>(.*?)</p>', m.group(1), re.DOTALL)
    no_txt = clean_text(p_no.group(1)) if p_no else ''
    name_txt = clean_text(p_name.group(1)) if p_name else ''
    markers.append((m.start(), 'part', (no_txt, name_txt)))

for m in chap_pat.finditer(bn_html):
    c_no = re.search(r'<p\s+class=["\']act-chapter-no["\'][^>]*>(.*?)</p>', m.group(1), re.DOTALL)
    c_name = re.search(r'<p\s+class=["\']act-chapter-name["\'][^>]*>(.*?)</p>', m.group(1), re.DOTALL)
    no_txt = clean_text(c_no.group(1)) if c_no else ''
    name_txt = clean_text(c_name.group(1)) if c_name else ''
    markers.append((m.start(), 'chap', (no_txt, name_txt)))

for idx, m in enumerate(bn_secs):
    markers.append((m.start(), 'sec', idx))

markers.sort(key=lambda x: x[0])

# Known landmark articles in the Constitution
LANDMARK_ARTICLES = {
    '1', '7', '7A', '7B', '11', '19', '21', '26', '27', '28', '29', '31', '32',
    '33', '35', '36', '37', '38', '39', '41', '42', '44', '47', '47A',
    '48', '56', '65', '70', '94', '102', '117', '118', '137', '141A', '142'
}

# Specific manual overrides for repealed or special section numbers
SPECIAL_NUMBERS = {
    65: ('58A', '৫৮ক'),
    66: ('58B-58E', '৫৮খ-৫৮ঙ'),
    129: ('117A', '১১৭ক'),
}

chapters_list = []
current_part_no = "প্রথম ভাগ"
current_part_name = "প্রজাতন্ত্র"
current_chap_no = ""
current_chap_name = ""
current_sections = []

def save_current_chapter():
    global current_sections
    if not current_sections:
        return
    chap_id = f"const-part-{len(chapters_list) + 1}"
    full_title = current_part_name
    if current_chap_name:
        full_title += f" : {current_chap_no} ({current_chap_name})"
    
    chapters_list.append({
        "id": chap_id,
        "numberBengali": current_part_no + (f" ({current_chap_no})" if current_chap_no else ""),
        "titleBengali": full_title,
        "sections": current_sections
    })
    current_sections = []

for pos, kind, data in markers:
    if kind == 'part':
        save_current_chapter()
        current_part_no, current_part_name = data
        current_chap_no = ""
        current_chap_name = ""
    elif kind == 'chap':
        save_current_chapter()
        current_chap_no, current_chap_name = data
    elif kind == 'sec':
        idx = data
        bn_m = bn_secs[idx]
        en_m = en_secs[idx]
        
        bn_head = clean_text(bn_m.group(1))
        bn_details = clean_text(bn_m.group(2))
        en_head = clean_text(en_m.group(1))
        en_details = clean_text(en_m.group(2))
        
        if idx in SPECIAL_NUMBERS:
            sec_num_en, sec_num_bn = SPECIAL_NUMBERS[idx]
        else:
            # Extract section number from bn_details or bn_head
            m_bracket = re.search(r'\[\s*([০-৯]+(?:\s*[ক-ঙ])?)\s*[৷।\.]', bn_details[:60])
            m_num = re.search(r'([০-৯]+(?:\s*[ক-ঙ])?)\s*[৷।\.]', bn_details[:60])
            if m_bracket:
                raw_num = m_bracket.group(1).replace(' ', '')
            elif m_num:
                raw_num = m_num.group(1).replace(' ', '')
            else:
                raw_num = str(idx + 1)
            
            sec_num_bn = raw_num
            # convert to english
            sec_num_en = ''
            for ch in raw_num:
                if ch in bengali_digits:
                    sec_num_en += bengali_digits[ch]
                elif ch == 'ক': sec_num_en += 'A'
                elif ch == 'খ': sec_num_en += 'B'
                elif ch == 'গ': sec_num_en += 'C'
                elif ch == 'ঘ': sec_num_en += 'D'
                elif ch == 'ঙ': sec_num_en += 'E'
                else: sec_num_en += ch

        is_landmark = sec_num_en in LANDMARK_ARTICLES
        
        art_id = f"const-art-{sec_num_en.lower()}"
        
        current_sections.append({
            "id": art_id,
            "sectionNumber": sec_num_en,
            "sectionNumberBengali": f"অনুচ্ছেদ {sec_num_bn}",
            "titleBengali": bn_head,
            "titleEnglish": en_head,
            "contentBengali": bn_details,
            "contentEnglish": en_details,
            "isLandmark": is_landmark
        })

save_current_chapter()

print(f"Generated {len(chapters_list)} chapters/parts with a total of {sum(len(c['sections']) for c in chapters_list)} sections!")

# Write out src/data/constitutionFullLaw.ts
ts_code = """// Complete official 1 to 153 Articles of The Constitution of the People's Republic of Bangladesh
// (গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধান, ১৯৭২)
// Generated from official Ministry of Law (bdlaws.minlaw.gov.bd) texts (Acts 957 & 367)

import { Law } from '../types/law';

export const CONSTITUTION_FULL_LAW: Law = {
  id: 'constitution-1972',
  titleBengali: 'গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধান',
  titleEnglish: 'The Constitution of the People’s Republic of Bangladesh',
  actNumberBengali: '১৯৭২ সালের মূল সংবিধান (সর্বশেষ পঞ্চদশ সংশোধনীসহ প্রমিত পাঠ)',
  enactmentYear: 1972,
  enactmentYearBengali: '১৯৭২',
  categoryId: 'constitution',
  categoryNameBengali: 'বাংলাদেশের সংবিধান',
  preambleBengali: `বিস্‌মিল্লাহির-রহ্‌মানির রহিম (দয়াময়, পরম দয়ালু, আল্লাহের নামে) / পরম করুণাময় সৃষ্টিকর্তার নামে\\n\\nআমরা, বাংলাদেশের জনগণ, ১৯৭১ খ্রীষ্টাব্দের মার্চ মাসের ২৬ তারিখে স্বাধীনতা ঘোষণা করিয়া জাতীয় মুক্তির জন্য ঐতিহাসিক সংগ্রামের মাধ্যমে স্বাধীন ও সার্বভৌম গণপ্রজাতন্ত্রী বাংলাদেশ প্রতিষ্ঠিত করিয়াছি;\\n\\nঅঙ্গীকার করিতেছি যে, যে সকল মহান আদর্শ আমাদের বীর জনগণকে জাতীয় মুক্তিসংগ্রামে আত্মনিয়োগ ও বীর শহীদদিগকে প্রাণোৎসর্গ করিতে উদ্বুদ্ধ করিয়াছিল—জাতীয়তাবাদ, সমাজতন্ত্র, গণতন্ত্র ও ধর্মনিরপেক্ষতার সেই সকল আদর্শ এই সংবিধানের মূলনীতি হইবে;\\n\\nআরও অঙ্গীকার করিতেছি যে, আমাদের রাষ্ট্রের অন্যতম মূল লক্ষ্য হইবে গণতান্ত্রিক পদ্ধতিতে এমন এক শোষণমুক্ত সমাজতান্ত্রিক সমাজের প্রতিষ্ঠা—যেখানে সকল নাগরিকের জন্য আইনের শাসন, মৌলিক মানবাধিকার এবং রাজনৈতিক, অর্থনৈতিক ও সামাজিক সাম্য, স্বাধীনতা ও সুবিচার নিশ্চিত হইবে;\\n\\nদৃঢ়ভাবে ঘোষণা করিতেছি যে, আমরা যাহাতে স্বাধীন সত্তায় সমৃদ্ধি লাভ করিতে পারি এবং মানবজাতির প্রগতিশীল আশা-আকাঙ্ক্ষার সহিত সঙ্গতি রক্ষা করিয়া আন্তর্জাতিক শান্তি ও সহযোগিতার ক্ষেত্রে পূর্ণ ভূমিকা পালন করিতে পারি, সেইজন্য বাংলাদেশের জনগণের অভিপ্রায়ের অভিব্যক্তি-স্বরূপ এই সংবিধানের প্রাধান্য অক্ষুণ্ণ রাখা এবং ইহার রক্ষণ, সমর্থন ও নিরাপত্তাবিধান আমাদের পবিত্র কর্তব্য;\\n\\nএতদ্বারা আমাদের এই গণপরিষদে, অদ্য তের শত উনআশী বঙ্গাব্দের কার্তিক মাসের আঠারো তারিখ, মোতাবেক উনিশ শত বাহাত্তর খ্রীষ্টাব্দের নভেম্বর মাসের চার তারিখে, আমরা এই সংবিধান রচনা ও বিধিবদ্ধ করিয়া সমবেতভাবে গ্রহণ করিলাম।`,
  totalSections: %d,
  status: 'published',
  pdfFileName: 'bdlaws.minlaw.gov.bd_act-print-957.html.pdf',
  pdfFileSize: '4.8 MB',
  pdfIsOcr: false,
  ocrConfidence: 100,
  lastUpdated: '২০২৪-১০-১২',
  viewCount: 35600,
  chapters: %s,
};
""" % (
    sum(len(c['sections']) for c in chapters_list),
    json.dumps(chapters_list, ensure_ascii=False, indent=4)
)

with open('src/data/constitutionFullLaw.ts', 'w', encoding='utf-8') as f:
    f.write(ts_code)

print("Saved src/data/constitutionFullLaw.ts successfully! File size:", len(ts_code))
