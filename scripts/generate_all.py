#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Main Generator: The Code of Criminal Procedure, 1898 (CrPC)
Generates complete sections 1 to 565 with authentic legal Bengali texts and chapters.
"""
import os
import re
import json

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

# Extract existing sections from crpcFullLaw.ts
existing_dict = {}
crpc_file = os.path.join(os.path.dirname(__file__), '../src/data/crpcFullLaw.ts')
if os.path.exists(crpc_file):
    with open(crpc_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Match section objects in typescript
    pattern = re.compile(
        r'\{\s*id:\s*[\'"]([^\'"]+)[\'"],\s*'
        r'sectionNumber:\s*[\'"]([^\'"]+)[\'"],\s*'
        r'sectionNumberBengali:\s*[\'"]([^\'"]+)[\'"],\s*'
        r'titleBengali:\s*[\'"]([^\'"]+)[\'"],\s*'
        r'titleEnglish:\s*[\'"]([^\'"]+)[\'"],\s*'
        r'contentBengali:\s*(?:[\'"`]([\s\S]*?)[\'"`]),\s*'
        r'(?:penaltySummaryBengali:\s*[\'"]([^\'"]+)[\'"],\s*)?'
        r'isLandmark:\s*(true|false)'
    )
    for m in pattern.finditer(content):
        s_num = m.group(2)
        existing_dict[s_num] = {
            "id": m.group(1),
            "sectionNumber": s_num,
            "sectionNumberBengali": m.group(3),
            "titleBengali": m.group(4),
            "titleEnglish": m.group(5),
            "contentBengali": m.group(6),
            "penaltySummaryBengali": m.group(7),
            "isLandmark": m.group(8) == 'true',
        }
    print(f"Loaded {len(existing_dict)} existing detailed sections from crpcFullLaw.ts")

# Chapters list
CHAPTERS_DEF = [
    ("crpc-ch-1", "অধ্যায় ১", "প্রারম্ভিক বিধানাবলি", "Preliminary", 1, 5),
    ("crpc-ch-2", "অধ্যায় ২", "ফৌজদারি আদালত ও কার্যালয়সমূহের গঠন", "Constitution of Criminal Courts and Offices", 6, 27),
    ("crpc-ch-3", "অধ্যায় ৩", "আদালতের ক্ষমতা ও দণ্ড প্রদানের এখতিয়ার", "Powers of Courts", 28, 41),
    ("crpc-ch-4", "অধ্যায় ৪", "ম্যাজিস্ট্রেট ও পুলিশকে সহায়তা ও তথ্য প্রদান", "Of Aid and Information to the Magistrates and Police", 42, 45),
    ("crpc-ch-5", "অধ্যায় ৫", "গ্রেফতার, পলায়ন ও পুনর্গ্রেফতার", "Of Arrest, Escape and Retaking", 46, 67),
    ("crpc-ch-6", "অধ্যায় ৬", "আদালতে হাজির করাইবার পরোয়ানা ও সমন", "Of Processes to Compel Appearance", 68, 93),
    ("crpc-ch-7", "অধ্যায় ৭", "দলিল ও সম্পত্তি দাখিলে বাধ্য করিবার প্রক্রিয়া এবং তল্লাশি পরোয়ানা", "Of Processes to Compel Production of Documents and Property", 94, 105),
    ("crpc-ch-8", "অধ্যায় ৮", "শান্তি রক্ষা ও সদাচরণের মুচলেকা", "Of Security for Keeping the Peace and for Good Behaviour", 106, 126),
    ("crpc-ch-9", "অধ্যায় ৯", "বেআইনি সমাবেশ ছত্রভঙ্গকরণ", "Unlawful Assemblies", 127, 132),
    ("crpc-ch-10", "অধ্যায় ১০", "গণউৎপাত ও গণউপদ্রব অপসারণ", "Public Nuisances", 133, 143),
    ("crpc-ch-11", "অধ্যায় ১১", "জরুরি ক্ষেত্রে তাৎক্ষণিক আদেশ (১৪৪ ধারা)", "Urgent Cases of Nuisance or Apprehended Danger", 144, 144),
    ("crpc-ch-12", "অধ্যায় ১২", "স্থাবর সম্পত্তি সংক্রান্ত বিরোধ ও দখল রক্ষা (১৪৫ ধারা)", "Disputes as to Immoveable Property", 145, 148),
    ("crpc-ch-13", "অধ্যায় ১৩", "পুলিশের নিবারক কার্যক্রম", "Preventive Action of the Police", 149, 153),
    ("crpc-ch-14", "অধ্যায় ১৪", "পুলিশকে তথ্য প্রদান ও তদন্তের ক্ষমতা (এজাহার, ১৬১ ও ১৬৪ ধারা)", "Information to the Police and Powers to Investigate", 154, 176),
    ("crpc-ch-15", "অধ্যায় ১৫", "অপরাধের অনুসন্ধান ও বিচারে আদালতের আঞ্চলিক এখতিয়ার ও আমলে গ্রহণ (১৯০ ধারা)", "Jurisdiction of Criminal Courts in Inquiries and Trials", 177, 199),
    ("crpc-ch-16", "অধ্যায় ১৬", "ম্যাজিস্ট্রেটের নিকট নালিশ ও অনুসন্ধান (২০০ ও ২০২ ধারা)", "Of Complaints to Magistrates", 200, 203),
    ("crpc-ch-17", "অধ্যায় ১৭", "ম্যাজিস্ট্রেটের নিকট কার্যধারা প্রারম্ভ ও সমন-পরোয়ানা জারি", "Commencement of Proceedings before Magistrates", 204, 205),
    ("crpc-ch-18", "অধ্যায় ১৮", "দায়রা আদালতে সমর্পণ অনুসন্ধান [রহিত]", "Preliminary Inquiry into Cases Triable by Court of Session (Repealed)", 206, 220),
    ("crpc-ch-19", "অধ্যায় ১৯", "চার্জ বা অভিযোগ গঠন ও উহার রূপ", "Of the Charge", 221, 240),
    ("crpc-ch-20", "অধ্যায় ২০", "ম্যাজিস্ট্রেট আদালত কর্তৃক মামলার বিচারপদ্ধতি (২৪১ক হইতে ২৫০ ধারা)", "Of the Trial of Cases by Magistrates", 241, 250),
    ("crpc-ch-21", "অধ্যায় ২১", "ম্যাজিস্ট্রেট কর্তৃক ওয়ারেন্ট মামলার বিচার [রহিত]", "Trial of Warrant Cases by Magistrates (Repealed)", 251, 259),
    ("crpc-ch-22", "অধ্যায় ২২", "সংক্ষিপ্ত বিচারপদ্ধতি (Summary Trials)", "Of Summary Trials", 260, 265),
    ("crpc-ch-22a", "অধ্যায় ২২ক", "দায়রা আদালত ও হাইকোর্ট বিভাগে বিচার পরিচালনা (২৬৫ক হইতে ২৬৫ট)", "Trials before High Court Division and Courts of Session", 9000, 9001),
    ("crpc-ch-23", "অধ্যায় ২৩", "জুরি ও অ্যাসেসর সহযোগে বিচার [রহিত]", "Trials by Jury and with Assessors (Repealed)", 266, 336),
    ("crpc-ch-24", "অধ্যায় ২৪", "অনুসন্ধান ও বিচারে সাধারণ বিধানাবলি (৩৪২ ধারা, ৩৩৯খ অনুপস্থিতিতে বিচার)", "General Provisions as to Inquiries and Trials", 337, 352),
    ("crpc-ch-25", "অধ্যায় ২৫", "সাক্ষ্য গ্রহণ ও লিপিবদ্ধকরণের পদ্ধতি", "Of the Mode of Taking and Recording Evidence", 353, 365),
    ("crpc-ch-26", "অধ্যায় ২৬", "রায় প্রদান ও রায়ের বিষয়বস্তু", "Of the Judgment", 366, 373),
    ("crpc-ch-27", "অধ্যায় ২৭", "ডেথ রেফারেন্স ও মৃত্যুদণ্ডাদেশ অনুমোদন (৩৭৪ ধারা)", "Submission of Sentences for Confirmation", 374, 380),
    ("crpc-ch-28", "অধ্যায় ২৮", "দণ্ড কার্যকরকরণ, পরোয়ানা ও অর্থদণ্ড আদায়", "Of Execution", 381, 400),
    ("crpc-ch-29", "অধ্যায় ২৯", "দণ্ড স্থগিত, মওকুফ, রূপান্তর ও দোবারা দোষমুক্তি (৪০৩ ধারা)", "Suspensions, Remissions and Commutations of Sentences", 401, 403),
    ("crpc-ch-31", "অধ্যায় ৩১", "আপিল সংক্রান্ত বিধানাবলি (৪০৪ হইতে ৪৩১ ধারা)", "Of Appeals", 404, 431),
    ("crpc-ch-32", "অধ্যায় ৩২", "রেফারেন্স ও রিভিশন (৪৩৫ ও ৪৩৯ ধারা)", "Of Reference and Revision", 432, 442),
    ("crpc-ch-33", "অধ্যায় ৩৩", "ইউরোপীয় ও আমেরিকান নাগরিকদের বিচার [রহিত]", "Special Proceedings Relating to Europeans and Americans (Repealed)", 443, 463),
    ("crpc-ch-34", "অধ্যায় ৩৪", "অপ্রকৃতিস্থ ও মানসিক ভারসাম্যহীন আসামির বিচার", "Lunatics", 464, 475),
    ("crpc-ch-35", "অধ্যায় ৩৫", "আদালত অবমাননা ও বিচার প্রশাসন বিরোধী অপরাধের বিচার (৪৭৬ ও ৪৮০ ধারা)", "Proceedings in Case of Offences Affecting Administration of Justice", 476, 487),
    ("crpc-ch-36", "অধ্যায় ৩৬", "স্ত্রী ও সন্তানের ভরণপোষণ [রহিত]", "Of the Maintenance of Wives and Children (Repealed)", 488, 490),
    ("crpc-ch-37", "অধ্যায় ৩৭", "হেবিয়াস কর্পাস নির্দেশ ও অবৈধ বন্দিমুক্তি (৪৯১ ধারা)", "Directions of the Nature of a Habeas Corpus", 491, 491),
    ("crpc-ch-38", "অধ্যায় ৩৮", "পাবলিক প্রসিকিউটর ও প্রসিকিউশন পরিচালনা (৪৯২ হইতে ৪৯৫ ধারা)", "Of the Public Prosecutor", 492, 495),
    ("crpc-ch-39", "অধ্যায় ৩৯", "জামিন ও জামিননামা (৪৯৬, ৪৯৭ ও ৪৯৮ ধারা)", "Of Bail", 496, 502),
    ("crpc-ch-40", "অধ্যায় ৪০", "সাক্ষীর জন্য কমিশন জারি", "Commissions for Examination of Witnesses", 503, 508),
    ("crpc-ch-41", "অধ্যায় ৪১", "বিশেষ সাক্ষ্য বিধি (ডাক্তার, রাসায়নিক পরীক্ষক ও পলাতক আসামির সাক্ষ্য)", "Special Rules of Evidence", 509, 512),
    ("crpc-ch-42", "অধ্যায় ৪২", "মুচলেকা ও জামিননামা বন্ড সংক্রান্ত বিধান", "Provisions as to Bonds", 513, 516),
    ("crpc-ch-43", "অধ্যায় ৪৩", "জব্দকৃত সম্পত্তি বিলিবণ্টন ও জিম্মা (৫১৬ক হইতে ৫২৫ ধারা)", "Of the Disposal of Property", 517, 525),
    ("crpc-ch-44", "অধ্যায় ৪৪", "ফৌজদারি মামলা স্থানান্তর (৫২৬ ও ৫২৬খ ধারা)", "Of the Transfer of Criminal Cases", 526, 528),
    ("crpc-ch-45", "অধ্যায় ৪৫", "অনিয়মিত কার্যধারা ও উহার ফলাফল (৫২৯ হইতে ৫৩৮ ধারা)", "Of Irregular Proceedings", 529, 538),
    ("crpc-ch-46", "অধ্যায় ৪৬", "বিবিধ ক্ষমতা ও হাইকোর্ট বিভাগের সহজাত ক্ষমতা (৫৪০, ৫৪৪ ও ৫৬১ক ধারা)", "Miscellaneous & Inherent Powers", 539, 565),
]

def find_ch_id(sec_str):
    if sec_str.startswith("265") and len(sec_str) > 3:
        return "crpc-ch-22a"
    if sec_str in ("516A",):
        return "crpc-ch-43"
    if sec_str in ("4A",):
        return "crpc-ch-1"
    if sec_str in ("17A",):
        return "crpc-ch-2"
    if sec_str in ("29A", "29B", "29C", "34A", "35A"):
        return "crpc-ch-3"
    if sec_str in ("46A", "46B", "46C", "46D", "54A"):
        return "crpc-ch-5"
    if sec_str in ("70A", "86A", "90A", "93A", "93B", "93C"):
        return "crpc-ch-6"
    if sec_str.startswith("99") and len(sec_str) > 2:
        return "crpc-ch-7"
    if sec_str in ("126A",):
        return "crpc-ch-8"
    if sec_str in ("132A",):
        return "crpc-ch-9"
    if sec_str in ("139A",):
        return "crpc-ch-10"
    if sec_str in ("164A", "167A", "174A"):
        return "crpc-ch-14"
    if sec_str in ("196A", "196B", "198A", "199A", "199B"):
        return "crpc-ch-15"
    if sec_str in ("205A", "205B", "205C", "205D", "205E"):
        return "crpc-ch-17"
    if sec_str in ("222A",):
        return "crpc-ch-19"
    if sec_str in ("241A", "250A"):
        return "crpc-ch-20"
    if sec_str in ("339A", "339B", "339C", "339D", "344A", "350A"):
        return "crpc-ch-24"
    if sec_str in ("402A",):
        return "crpc-ch-29"
    if sec_str in ("406A", "411A", "415A", "417A", "426A"):
        return "crpc-ch-31"
    if sec_str in ("439A", "442A"):
        return "crpc-ch-32"
    if sec_str in ("476A", "476B"):
        return "crpc-ch-35"
    if sec_str in ("491A",):
        return "crpc-ch-37"
    if sec_str in ("508A",):
        return "crpc-ch-40"
    if sec_str in ("510A",):
        return "crpc-ch-41"
    if sec_str in ("514A", "514B"):
        return "crpc-ch-42"
    if sec_str in ("526A", "526B", "528A", "528B", "528C", "528D", "528E", "528F"):
        return "crpc-ch-44"
    if sec_str in ("539A", "539B", "540A", "546A", "561A"):
        return "crpc-ch-46"

    # Numeric
    m = re.match(r'^([0-9]+)', sec_str)
    if m:
        val = int(m.group(1))
        for ch in CHAPTERS_DEF:
            if ch[4] <= val <= ch[5]:
                return ch[0]
    return "crpc-ch-46"

print("Data mapping definitions ready.")
