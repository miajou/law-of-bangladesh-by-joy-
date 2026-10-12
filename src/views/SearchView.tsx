/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Law, Category, SearchResult } from '../types/law';
import { lawStorage } from '../services/lawStorage';
import { Search, ChevronRight, SlidersHorizontal, BookOpen, AlertCircle } from 'lucide-react';

interface SearchViewProps {
  categories: Category[];
  initialQuery?: string;
  onOpenReader: (lawId: string, sectionId?: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  categories,
  initialQuery = '',
  onOpenReader,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery, selectedCategory, yearFilter);
    }
  }, [initialQuery]);

  const performSearch = (q: string, catId: string, yr: string) => {
    setHasSearched(true);
    let minYear: number | undefined;
    let maxYear: number | undefined;

    if (yr === 'pre-1947') {
      maxYear = 1946;
    } else if (yr === '1947-1971') {
      minYear = 1947;
      maxYear = 1971;
    } else if (yr === 'post-1971') {
      minYear = 1972;
    }

    const res = lawStorage.searchLaws(
      q,
      catId === 'all' ? undefined : catId,
      minYear,
      maxYear
    );
    setResults(res);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, selectedCategory, yearFilter);
  };

  // Helper function to highlight search keywords in text
  const highlightMatches = (text: string, searchKey: string) => {
    if (!searchKey.trim()) return text;
    const cleanKey = searchKey.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${cleanKey})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className="bg-[#D4AF37]/30 text-[#F8FAFC] font-semibold px-0.5 rounded border-b border-[#D4AF37]"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const quickSearchQueries = [
    'ধারা ৫৪',
    'ধারা ৩০২',
    'ধারা ১৬৭',
    'অগ্রিম জামিন',
    'অনুচ্ছেদ ২৭',
    'রেস জুডিকাটা',
    'স্বীকারোক্তি',
    'চুক্তি আইন',
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div className="pb-3 border-b border-slate-800">
        <h1 className="font-serif-bengali text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
          উন্নত আইনি অনুসন্ধান
        </h1>
        <p className="text-xs sm:text-sm text-[#AAB4C3] mt-1">
          আইনের নাম, ধারা বা অনুচ্ছেদের নম্বর এবং বিধিমালার মূল বক্তব্য দিয়ে অনুসন্ধান করুন
        </p>
      </div>

      {/* Main Search Panel */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#D4AF37]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ধারা নম্বর বা কীওয়ার্ড লিখুন (যেমন: ধারা ৫৪, জামিন, আত্মরক্ষা)..."
            className="w-full pl-12 pr-28 py-3.5 bg-[#151F30] border-2 border-slate-800 focus:border-[#D4AF37] rounded-2xl text-sm sm:text-base text-[#F8FAFC] placeholder-[#AAB4C3]/60 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-lg"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1220] font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            অনুসন্ধান
          </button>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#AAB4C3] shrink-0 font-medium">বিভাগ:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                performSearch(query, e.target.value, yearFilter);
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#151F30] border border-slate-800 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all">সকল আইনি বিভাগ</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameBengali}
                </option>
              ))}
            </select>
          </div>

          {/* Era / Year Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#AAB4C3] shrink-0 font-medium">সময়কাল:</span>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                performSearch(query, selectedCategory, e.target.value);
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#151F30] border border-slate-800 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all">সকল ঐতিহাসিক সময়কাল</option>
              <option value="pre-1947">ব্রিটিশ আমল (১৮৬০ - ১৯৪৭)</option>
              <option value="1947-1971">পাকিস্তান আমল (১৯৪৭ - ১৯৭১)</option>
              <option value="post-1971">স্বাধীন বাংলাদেশ (১৯৭২ - বর্তমান)</option>
            </select>
          </div>
        </div>
      </form>

      {/* Suggested Quick Searches */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-[#AAB4C3] text-[11px] font-medium">পরামর্শ:</span>
        {quickSearchQueries.map((term, i) => (
          <button
            key={i}
            onClick={() => {
              setQuery(term);
              performSearch(term, selectedCategory, yearFilter);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#151F30] hover:bg-[#1A2744] border border-slate-800 hover:border-[#D4AF37]/50 text-[#AAB4C3] hover:text-[#D4AF37] transition-all"
          >
            {term}
          </button>
        ))}
      </div>

      {/* Search Results Display */}
      <div className="space-y-4 pt-2">
        {hasSearched && (
          <div className="flex items-center justify-between text-xs text-[#AAB4C3] pb-2 border-b border-slate-800/80">
            <span>
              <strong>{results.length}</strong> টি প্রাসঙ্গিক বিধান ও ধারা পাওয়া গিয়েছে
            </span>
            {query && <span>কীওয়ার্ড: “{query}”</span>}
          </div>
        )}

        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((item, idx) => (
              <div
                key={idx}
                onClick={() => onOpenReader(item.law.id, item.section?.id)}
                className="p-5 rounded-2xl bg-[#151F30] border border-slate-800 hover:border-[#D4AF37]/50 transition-all cursor-pointer hover:shadow-xl hover:shadow-[#0B1220] group"
              >
                {/* Result Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs text-[#AAB4C3] flex-wrap">
                    <span className="text-[#D4AF37] font-semibold">{item.law.titleBengali}</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span>{item.law.enactmentYearBengali} খ্রি.</span>
                    {item.section && (
                      <>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-[#F8FAFC] font-bold">
                          {item.section.sectionNumberBengali}
                        </span>
                      </>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#AAB4C3] group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all shrink-0" />
                </div>

                {/* Section / Law Title */}
                <h3 className="font-serif-bengali text-base sm:text-lg font-bold text-[#F8FAFC] group-hover:text-[#D4AF37] transition-colors mb-2">
                  {item.section ? (
                    <>
                      {item.section.sectionNumberBengali}: {highlightMatches(item.section.titleBengali, query)}
                    </>
                  ) : (
                    highlightMatches(item.law.titleBengali, query)
                  )}
                </h3>

                {/* Excerpt with Highlight */}
                <p className="text-xs sm:text-sm text-[#AAB4C3] leading-relaxed line-clamp-3">
                  {highlightMatches(item.excerptBengali, query)}
                </p>

                {item.section?.penaltySummaryBengali && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs text-red-400 font-medium">
                    দণ্ডের সারসংক্ষেপ: {item.section.penaltySummaryBengali}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : hasSearched ? (
          /* No Results Found State */
          <div className="text-center py-16 px-4 bg-[#151F30]/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#0B1220] text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif-bengali text-lg font-bold text-[#F8FAFC]">
              কোনো ফলাফল মেলেনি
            </h3>
            <p className="text-xs text-[#AAB4C3] max-w-md mx-auto leading-relaxed">
              “{query}” শব্দের সাথে মিলে এমন কোনো বিধান পাওয়া যায়নি। বানান পরীক্ষা করুন অথবা বিকল্প শব্দ (যেমন “খুন” এর পরিবর্তে “হত্যা” বা “ধারা ৩০২”) দিয়ে পুনরায় অনুসন্ধান করুন।
            </p>
          </div>
        ) : (
          /* Initial Guidance State */
          <div className="text-center py-12 px-4 bg-[#151F30]/30 rounded-2xl border border-slate-800/60 space-y-2">
            <BookOpen className="w-8 h-8 text-[#D4AF37]/50 mx-auto" />
            <h3 className="font-serif-bengali text-sm font-semibold text-[#F8FAFC]">
              অনুসন্ধান করতে কীওয়ার্ড বা ধারা নম্বর লিখুন
            </h3>
            <p className="text-xs text-[#AAB4C3]">
              উদাহরণস্বরূপ: “ধারা ৫৪”, “অনুচ্ছেদ ২৭”, “জামিন”, “খুনের শাস্তি”
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
