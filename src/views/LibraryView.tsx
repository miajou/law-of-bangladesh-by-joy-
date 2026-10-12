/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Law, Category } from '../types/law';
import { LawCard } from '../components/LawCard';
import { Search, SlidersHorizontal, BookOpen, PlusCircle } from 'lucide-react';

interface LibraryViewProps {
  laws: Law[];
  categories: Category[];
  selectedCategory?: string;
  onOpenReader: (lawId: string) => void;
  onOpenPdf: (lawId: string) => void;
  onGoToUpload: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  laws,
  categories,
  selectedCategory = 'all',
  onOpenReader,
  onOpenPdf,
  onGoToUpload,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategory);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'year_asc' | 'year_desc' | 'sections'>('year_asc');

  // Filtered and sorted laws
  const filteredLaws = useMemo(() => {
    return laws
      .filter((law) => {
        // category filter
        if (activeCategory !== 'all' && law.categoryId !== activeCategory) {
          return false;
        }
        // search filter
        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase();
          const matchTitle = law.titleBengali.toLowerCase().includes(q) || law.titleEnglish.toLowerCase().includes(q);
          const matchAct = law.actNumberBengali.toLowerCase().includes(q);
          const matchYear = law.enactmentYear.toString().includes(q) || law.enactmentYearBengali.includes(q);
          if (!matchTitle && !matchAct && !matchYear) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'alphabetical') {
          return a.titleBengali.localeCompare(b.titleBengali, 'bn');
        } else if (sortBy === 'year_asc') {
          return a.enactmentYear - b.enactmentYear;
        } else if (sortBy === 'year_desc') {
          return b.enactmentYear - a.enactmentYear;
        } else if (sortBy === 'sections') {
          return b.totalSections - a.totalSections;
        }
        return 0;
      });
  }, [laws, activeCategory, searchFilter, sortBy]);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="font-serif-bengali text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
            বাংলাদেশ আইন লাইব্রেরি
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB4C3] mt-1">
            মোট সংগৃহীত ও সূচিপত্রভুক্ত {laws.length} টি আইন ও অধ্যাদেশ
          </p>
        </div>

        <button
          onClick={onGoToUpload}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[#151F30] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>নতুন আইন আপলোড করুন</span>
        </button>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#AAB4C3]" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="লাইব্রেরির মধ্যে নাম বা সাল দ্বারা খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#151F30] border border-slate-800 text-xs sm:text-sm text-[#F8FAFC] placeholder-[#AAB4C3]/60 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#151F30] border border-slate-800 text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="year_asc">প্রণয়নের সাল (পুরাতন থেকে নতুন)</option>
            <option value="year_desc">প্রণয়নের সাল (নতুন থেকে পুরাতন)</option>
            <option value="alphabetical">বর্ণানুক্রমিক (অ - হ)</option>
            <option value="sections">ধারার সংখ্যা অনুসারে</option>
          </select>
        </div>
      </div>

      {/* Category Filter Tabs (Segmented Control conforming to Zero-Pill rules) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeCategory === 'all'
              ? 'bg-[#D4AF37] text-[#0B1220] font-bold shadow-sm'
              : 'bg-[#151F30] text-[#AAB4C3] hover:text-[#F8FAFC] hover:bg-[#1A2744]'
          }`}
        >
          সব আইন ({laws.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-[#D4AF37] text-[#0B1220] font-bold shadow-sm'
                : 'bg-[#151F30] text-[#AAB4C3] hover:text-[#F8FAFC] hover:bg-[#1A2744]'
            }`}
          >
            {cat.nameBengali}
          </button>
        ))}
      </div>

      {/* Law Cards Grid */}
      {filteredLaws.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredLaws.map((law) => (
            <LawCard
              key={law.id}
              law={law}
              onOpenReader={onOpenReader}
              onOpenPdf={onOpenPdf}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-[#151F30]/40 rounded-2xl border border-dashed border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#0B1220] text-[#D4AF37] flex items-center justify-center mx-auto border border-[#D4AF37]/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif-bengali text-lg font-bold text-[#F8FAFC]">
              কোনো আইন পাওয়া যায়নি
            </h3>
            <p className="text-xs text-[#AAB4C3] max-w-sm mx-auto">
              অনুসন্ধানের শর্ত পরিবর্তন করুন অথবা অ্যাডমিন প্যানেল থেকে নতুন আইনের পিডিএফ আপলোড করুন।
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchFilter('');
              }}
              className="px-4 py-2 rounded-lg bg-[#0B1220] border border-slate-700 hover:border-[#D4AF37] text-xs text-[#D4AF37]"
            >
              ফিল্টার রিসেট করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
