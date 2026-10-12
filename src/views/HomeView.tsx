/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Law, Category, Bookmark, ReadingHistoryItem } from '../types/law';
import {
  Search,
  Scale,
  ShieldAlert,
  Gavel,
  Landmark,
  FileText,
  BookMarked,
  ArrowRight,
  Bookmark as BookmarkIcon,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import scalesImage from '../assets/images/scales_of_justice_gold_1791706027684.jpg';
import emblemImage from '../assets/images/bangladesh_constitution_emblem_1791706052945.jpg';

interface HomeViewProps {
  laws: Law[];
  categories: Category[];
  bookmarks: Bookmark[];
  history: ReadingHistoryItem[];
  onNavigate: (tab: string, lawId?: string, sectionId?: string) => void;
  onSearchSubmit: (query: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  laws,
  categories,
  bookmarks,
  history,
  onNavigate,
  onSearchSubmit,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchSubmit(searchInput.trim());
    }
  };

  // Popular provisions with quick links
  const popularProvisions = [
    { label: 'ধারা ৫৪ (বিনা পরোয়ানায় গ্রেফতার)', lawId: 'crpc-1898', secId: 'crpc-sec-54' },
    { label: 'ধারা ৪৬ক (গ্রেফতারের নতুন নির্দেশিকা)', lawId: 'crpc-1898', secId: 'crpc-sec-46a' },
    { label: 'ধারা ১৬৭ (রিমান্ডের বিধান)', lawId: 'crpc-1898', secId: 'crpc-sec-167' },
    { label: 'ধারা ১৫৪ (এজাহার বা FIR)', lawId: 'crpc-1898', secId: 'crpc-sec-154' },
    { label: 'ধারা ৪৯৮ (অগ্রিম জামিন)', lawId: 'crpc-1898', secId: 'crpc-sec-498' },
    { label: 'ধারা ১৪৪ (১৪৪ ধারা জারি)', lawId: 'crpc-1898', secId: 'crpc-sec-144' },
    { label: 'ধারা ১৪৫ (জমির দখল বিরোধ)', lawId: 'crpc-1898', secId: 'crpc-sec-145' },
    { label: 'ধারা ২৪১ক (অভিযোগ হতে অব্যাহতি)', lawId: 'crpc-1898', secId: 'crpc-sec-241a' },
    { label: 'ধারা ৫৬১ক (কোয়াশমেন্ট ও সহজাত ক্ষমতা)', lawId: 'crpc-1898', secId: 'crpc-sec-561a' },
    { label: 'ধারা ৩০২ (খুনের শাস্তি)', lawId: 'penal-code-1860', secId: 'pc-sec-302' },
    { label: 'অনুচ্ছেদ ২৭ (আইনের দৃষ্টিতে সমতা)', lawId: 'constitution-1972', secId: 'const-art-27' },
    { label: 'অনুচ্ছেদ ৩২ (জীবন ও ব্যক্তিস্বাধীনতা)', lawId: 'constitution-1972', secId: 'const-art-32' },
    { label: 'ধারা ৪২০ (প্রতারণা)', lawId: 'penal-code-1860', secId: 'pc-sec-420' },
  ];

  // Helper to map category icon
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'constitution':
        return BookMarked;
      case 'criminal':
        return ShieldAlert;
      case 'civil':
        return Scale;
      case 'special':
        return Gavel;
      case 'police':
        return Landmark;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 bg-gradient-to-b from-[#151F30] to-[#0B1220] p-6 sm:p-10 shadow-2xl">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#1A2744]/40 blur-2xl pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          {/* Logo Brand Lockup */}
          <div className="inline-flex items-center gap-3 p-1.5 pr-4 rounded-full bg-[#0B1220]/80 border border-[#D4AF37]/40 shadow-inner">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D4AF37]/60 shrink-0">
              <img
                src={scalesImage}
                alt="Scales of Justice and Open Law Book"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-left">
              <div className="text-xs font-serif-bengali font-semibold text-[#D4AF37] leading-tight">
                গণপ্রজাতন্ত্রী বাংলাদেশ
              </div>
              <div className="text-[10px] text-[#AAB4C3]">ডিজিটাল আইন কোষাগার</div>
            </div>
          </div>

          {/* Headlines */}
          <div className="space-y-2">
            <h1 className="font-serif-bengali text-3xl sm:text-4xl md:text-5xl font-black text-[#F8FAFC] tracking-tight leading-tight">
              বাংলাদেশ আইন ভান্ডার
            </h1>
            <p className="text-sm sm:text-base text-[#D4AF37] font-medium tracking-wide">
              বাংলাদেশের আইন, এখন আপনার হাতেই
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#AAB4C3] max-w-xl mx-auto leading-relaxed">
            সংবিধান, দণ্ডবিধি, ফৌজদারি কার্যবিধি, দেওয়ানি বিধিমালা এবং সরকারি গেজেট সহ সকল আইনি বিধানের সমৃদ্ধ ভাণ্ডার ও অনুসন্ধান প্ল্যাটফর্ম।
          </p>

          {/* Prominent Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative pt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-[#D4AF37] pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="আইন, ধারা বা কীওয়ার্ড লিখুন... (যেমন: ধারা ৫৪, জামিন, চুক্তি)"
                className="w-full pl-12 pr-28 py-3.5 sm:py-4 bg-[#0B1220] border-2 border-[#D4AF37]/40 focus:border-[#D4AF37] rounded-2xl text-sm sm:text-base text-[#F8FAFC] placeholder-[#AAB4C3]/60 focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/15 shadow-xl transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2 sm:py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1220] font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                খুঁজুন
              </button>
            </div>
          </form>

          {/* Popular searched chips */}
          <div className="pt-2">
            <div className="text-[11px] text-[#AAB4C3]/80 uppercase tracking-wider mb-2 font-medium">
              জনপ্রিয় অনুসন্ধান:
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {popularProvisions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate('reader', item.lawId, item.secId)}
                  className="px-3 py-1 rounded-lg bg-[#0B1220]/70 hover:bg-[#151F30] border border-slate-700/80 hover:border-[#D4AF37]/50 text-xs text-[#AAB4C3] hover:text-[#D4AF37] transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Categories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif-bengali text-xl sm:text-2xl font-bold text-[#F8FAFC]">
              প্রধান বিভাগসমূহ
            </h2>
            <p className="text-xs text-[#AAB4C3]">
              আইনের ধরন অনুযায়ী সহজে আইন নির্বাচন করুন
            </p>
          </div>
          <button
            onClick={() => onNavigate('library')}
            className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-medium"
          >
            <span>সকল আইন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => onNavigate('library', cat.id)}
                className="group p-4 rounded-2xl bg-[#151F30] border border-slate-800 hover:border-[#D4AF37]/50 transition-all text-left flex flex-col justify-between hover:shadow-lg hover:shadow-[#0B1220] min-h-[120px]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#0B1220] border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 transition-transform mb-3">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-bengali text-xs sm:text-sm font-bold text-[#F8FAFC] group-hover:text-[#D4AF37] transition-colors leading-snug">
                    {cat.nameBengali}
                  </h3>
                  <div className="text-[11px] text-[#AAB4C3]/70 mt-1">
                    {cat.count} টি আইন
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Premium Featured Section with Golden Border */}
      <section className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#151F30] via-[#101A2B] to-[#151F30] border-2 border-[#D4AF37] shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>সুবর্ণ সংস্করণ · বিশিষ্ট আইনি সনদ</span>
            </div>

            <h3 className="font-serif-bengali text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] leading-snug">
              গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধান (১৯৭২)
            </h3>

            <p className="text-xs sm:text-sm text-[#AAB4C3] leading-relaxed">
              বাংলাদেশের সর্বোচ্চ আইন। রাষ্ট্র পরিচালনার মূলনীতি, নাগরিকের মৌলিক অধিকারসমূহ, নির্বাহী বিভাগ, বিচার বিভাগ ও আইনসভার সকল সাংবিধানিক বিধিমালার পূর্ণাঙ্গ ও সংশোধিত ডিজিটাল সংগ্রহ।
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('reader', 'constitution-1972')}
                className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1220] font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>সংবিধান পাঠ করুন</span>
              </button>
              <button
                onClick={() => onNavigate('reader', 'constitution-1972', 'const-art-27')}
                className="px-4 py-2.5 rounded-xl bg-[#0B1220] hover:bg-[#1A263D] border border-[#D4AF37]/40 text-[#F8FAFC] text-xs sm:text-sm transition-all"
              >
                মৌলিক অধিকার (অনুচ্ছেদ ২৭-৪৪)
              </button>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-2xl relative group">
              <img
                src={emblemImage}
                alt="Seal of Bangladesh Justice"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Section: Recently Viewed & Saved Bookmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Viewed */}
        <div className="bg-[#151F30] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-serif-bengali text-base font-bold text-[#F8FAFC]">
                সম্প্রতি পঠিত ধারা ও আইন
              </h3>
            </div>
            <span className="text-xs text-[#AAB4C3]/70">{history.length} টি</span>
          </div>

          {history.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#AAB4C3]">
              এখনো কোনো সাম্প্রতিক পঠন রেকর্ড নেই। একটি আইন খুলে পড়া শুরু করুন।
            </div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate('reader', item.lawId, item.sectionId)}
                  className="p-3 rounded-xl bg-[#0B1220]/70 hover:bg-[#0B1220] border border-slate-800 hover:border-[#D4AF37]/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="text-xs font-semibold text-[#F8FAFC] group-hover:text-[#D4AF37] transition-colors">
                      {item.sectionNumberBengali}: {item.sectionTitleBengali}
                    </div>
                    <div className="text-[11px] text-[#AAB4C3] truncate">
                      {item.lawTitleBengali}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#AAB4C3]/60 shrink-0 font-mono">
                    {item.timestamp}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorite Bookmarks */}
        <div className="bg-[#151F30] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BookmarkIcon className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-serif-bengali text-base font-bold text-[#F8FAFC]">
                সংরক্ষিত ধারা ও বুকমার্ক
              </h3>
            </div>
            <button
              onClick={() => onNavigate('bookmarks')}
              className="text-xs text-[#D4AF37] hover:underline"
            >
              সকল দেখুন
            </button>
          </div>

          {bookmarks.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#AAB4C3]">
              কোনো ধারা এখনো সংরক্ষিত হয়নি। পড়ার সময় বুকমার্ক আইকনে ক্লিক করে সংরক্ষণ করুন।
            </div>
          ) : (
            <div className="space-y-2">
              {bookmarks.slice(0, 4).map((bm) => (
                <div
                  key={bm.id}
                  onClick={() => onNavigate('reader', bm.lawId, bm.sectionId)}
                  className="p-3 rounded-xl bg-[#0B1220]/70 hover:bg-[#0B1220] border border-slate-800 hover:border-[#D4AF37]/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="text-xs font-semibold text-[#F8FAFC] group-hover:text-[#D4AF37] transition-colors">
                      {bm.sectionNumberBengali}: {bm.sectionTitleBengali}
                    </div>
                    <div className="text-[11px] text-[#AAB4C3] truncate">
                      {bm.lawTitleBengali}
                    </div>
                  </div>
                  <BookmarkIcon className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37] shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
