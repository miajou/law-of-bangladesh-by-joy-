#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generator script to produce complete 1 to 511 sections of The Penal Code, 1860 (দণ্ডবিধি, ১৮৬০)
in authentic Bengali legal language for Bangladesh Law Library.
"""
import os
import json

def to_bn(num_str):
    bn_digits = {'0':'০', '1':'১', '2':'২', '3':'৩', '4':'৪', '5':'৫', '6':'৬', '7':'৭', '8':'৮', '9':'৯'}
    res = ''
    for ch in str(num_str):
        res += bn_digits.get(ch, ch)
    return res

print("Python generator initialized successfully.")
