/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Law, Section } from '../types/law';
import { lawStorage } from '../services/lawStorage';
import { PdfGazetteViewer } from '../components/PdfGazetteViewer';
import {
  BookOpen,
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight,
  List,
  Search,
  Sun,
  Moon,
  Type,
  FileText,
  Copy,
  Check,
  ArrowLeft,
  X,
  AlertTriangle,
} from 'lucide-react';

interface ReaderViewProps {
  law: Law;
  initialSectionId?: string;
  onBack: () => void;
  onBookmarkChange: () => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  law,
  initialSectionId,
  onBack,
  onBookmarkChange,
}) => {
  // All flattened sections
  const allSections = useMemo(() => {
    return law.chapters.flatMap((c) => c.sections);
  }, [law]);

  const [currentSectionId, setCurrentSectionId] = useState<string>(
    initialSectionId || (allSections[0]?.id ?? '')
  );

  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text');
  const [showTocDrawer, setShowTocDrawer] = useState(false);
  const [inLawSearch, setInLawSearch] = useState('');
  const [readingTheme, setReadingTheme] = useState<'dark' | 'ivory'>('dark');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync section if initialSectionId changes
  useEffect(() => {
    if (initialSectionId) {
      setCurrentSectionId(initialSectionId);
    }
  }, [initialSectionId]);

  // Current section details
  const currentSectionIndex = allSections.findIndex((s) => s.id === currentSectionId);
  const currentSection: Section | undefined = allSections[currentSectionIndex] || allSections[0];

  // Record history & view count
  useEffect(() => {
    if (currentSection) {
      lawStorage.addToHistory(law, currentSection);
      lawStorage.incrementViewCount(law.id);
    }
  }, [currentSection?.id, law.id]);

  const isBookmarked = currentSection ? lawStorage.isBookmarked(currentSection.id) : false;

  const handleToggleBookmark = () => {
    if (!currentSection) return;
    const added = lawStorage.toggleBookmark(law, currentSection);
    onBookmarkChange();
    showToast(added ? 'ধারাটি বুকমার্কে সংরক্ষিত হয়েছে' : 'ধারাটি বুকমার্ক থেকে সরানো হয়েছে');
  };

  const handleShareOrCopy = () => {
    if (!currentSection) return;
    const shareText = `【${law.titleBengali}】\n${currentSection.sectionNumberBengali}। ${currentSection.titleBengali}\n\n"${currentSection.contentBengali}"\n\n— বাংলাদেশ আইন ভান্ডার`;
    navigator.clipboard.writeText(shareText);
    showToast('ধারার উদ্ধৃতি ক্লিপবোর্ডে কপি করা হয়েছে');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionId(allSections[currentSectionIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextSection = () => {
    if (currentSectionIndex < allSections.length - 1) {
      setCurrentSectionId(allSections[currentSectionIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Font size classes
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small':
        return 'text-sm sm:text-base leading-relaxed';
      case 'large':
        return 'text-lg sm:text-xl leading-loose';
      case 'xlarge':
        return 'text-xl sm:text-2xl leading-loose';
      default:
        return 'text-base sm:text-lg leading-relaxed';
    }
  };

  // In-law TOC filtered
  const filteredChapters = useMemo(() => {
    if (!inLawSearch.trim()) return law.chapters;
    const q = inLawSearch.toLowerCase().trim();
    const bnDigits = '০১২৩৪৫৬৭৮৯';
    const qEn = q.replace(/[০-৯]/g, (d) => bnDigits.indexOf(d).toString());
    const qBn = q.replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);

    return law.chapters
      .map((ch) => ({
        ...ch,
        sections: ch.sections.filter(
          (s) =>
            s.sectionNumber.toLowerCase() === qEn ||
            s.sectionNumber.toLowerCase() === q ||
            s.sectionNumberBengali.toLowerCase().includes(q) ||
            s.sectionNumberBengali.toLowerCase().includes(qBn) ||
            s.titleBengali.toLowerCase().includes(q) ||
            (s.titleEnglish && s.titleEnglish.toLowerCase().includes(q)) ||
            s.contentBengali.toLowerCase().includes(q)
        ),
      }))
      .filter((ch) => ch.sections.length > 0);
  }, [law.chapters, inLawSearch]);

  return (
    <div className="relative min-h-[calc(100vh-6rem)] pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-[#D4AF37] text-[#0B1220] font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm animate-fade-in border border-[#F3E5AB]">
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reader Top Bar */}
      <div className="sticky top-16 z-20 bg-[#0B1220]/95 backdrop-blur-md border-b border-slate-800 py-3 px-2 sm:px-4 flex items-center justify-between gap-3">
        {/* Left: Back button & Law Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#151F30] hover:bg-[#1A2744] text-[#AAB4C3] hover:text-[#F8FAFC] border border-slate-800 shrink-0"
            title="লাইব্রেরিতে ফিরে যান"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="truncate">
            <h2 className="font-serif-bengali text-sm sm:text-base font-bold text-[#F8FAFC] truncate">
              {law.titleBengali}
            </h2>
            <div className="text-[11px] text-[#AAB4C3]/70 truncate hidden sm:block">
              {law.actNumberBengali} · {law.enactmentYearBengali} খ্রি.
            </div>
          </div>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Switch Mode: Text vs PDF */}
          <div className="flex items-center bg-[#151F30] p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'text'
                  ? 'bg-[#D4AF37] text-[#0B1220] font-bold shadow-sm'
                  : 'text-[#AAB4C3] hover:text-white'
              }`}
            >
              আইন ধারা
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                activeTab === 'pdf'
                  ? 'bg-[#D4AF37] text-[#0B1220] font-bold shadow-sm'
                  : 'text-[#AAB4C3] hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>গেজেট PDF</span>
            </button>
          </div>

          {activeTab === 'text' && (
            <>
              {/* Font Size Selector */}
              <div className="flex items-center bg-[#151F30] rounded-xl border border-slate-800 p-0.5 hidden sm:flex">
                <button
                  onClick={() =>
                    setFontSize((prev) =>
                      prev === 'xlarge' ? 'large' : prev === 'large' ? 'medium' : 'small'
                    )
                  }
                  className="p-1.5 hover:text-[#D4AF37] text-xs text-[#AAB4C3]"
                  title="ফন্ট ছোট করুন"
                >
                  A-
                </button>
                <button
                  onClick={() =>
                    setFontSize((prev) =>
                      prev === 'small' ? 'medium' : prev === 'medium' ? 'large' : 'xlarge'
                    )
                  }
                  className="p-1.5 hover:text-[#D4AF37] text-xs text-[#AAB4C3]"
                  title="ফন্ট বড় করুন"
                >
                  A+
                </button>
              </div>

              {/* Theme Toggle (Dark vs Ivory) */}
              <button
                onClick={() => setReadingTheme((t) => (t === 'dark' ? 'ivory' : 'dark'))}
                className="p-2 rounded-xl bg-[#151F30] border border-slate-800 hover:border-[#D4AF37]/40 text-[#AAB4C3] hover:text-[#D4AF37]"
                title={readingTheme === 'dark' ? 'আইভরি রিডিং মোড' : 'ডার্ক রিডিং মোড'}
              >
                {readingTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Table of contents drawer trigger */}
              <button
                onClick={() => setShowTocDrawer(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#151F30] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] text-xs font-semibold"
              >
                <List className="w-4 h-4" />
                <span className="hidden md:inline">সূচিপত্র</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'pdf' ? (
        <div className="pt-4 h-[calc(100vh-11rem)]">
          <PdfGazetteViewer law={law} onSwitchToText={() => setActiveTab('text')} />
        </div>
      ) : (
        <div className="pt-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Desktop Persistent TOC Sidebar */}
          <div className="hidden lg:block lg:col-span-1 bg-[#151F30] border border-slate-800 rounded-2xl p-4 sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-serif-bengali text-sm font-bold text-[#F8FAFC]">
                আইন সূচিপত্র
              </span>
              <span className="text-[11px] text-[#AAB4C3]/70">{law.totalSections} ধারা</span>
            </div>

            {/* In-Law Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#AAB4C3]" />
              <input
                type="text"
                value={inLawSearch}
                onChange={(e) => setInLawSearch(e.target.value)}
                placeholder="ধারায় খুঁজুন..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0B1220] border border-slate-700 text-xs text-[#F8FAFC] placeholder-[#AAB4C3]/60 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Chapters and Sections List */}
            <div className="space-y-4">
              {filteredChapters.map((ch) => (
                <div key={ch.id} className="space-y-1">
                  <div className="text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider px-1">
                    {ch.numberBengali}: {ch.titleBengali}
                  </div>
                  <div className="space-y-0.5">
                    {ch.sections.map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() => {
                          setCurrentSectionId(sec.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between group ${
                          sec.id === currentSection?.id
                            ? 'bg-[#D4AF37] text-[#0B1220] font-bold shadow-sm'
                            : 'text-[#AAB4C3] hover:text-[#F8FAFC] hover:bg-[#0B1220]'
                        }`}
                      >
                        <span className="truncate pr-1">
                          {sec.sectionNumberBengali}: {sec.titleBengali}
                        </span>
                        {sec.isLandmark && (
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded ${
                              sec.id === currentSection?.id
                                ? 'bg-[#0B1220] text-[#D4AF37]'
                                : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                            }`}
                          >
                            মূল
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Legal Section Reader Canvas */}
          <div className="lg:col-span-3 space-y-6">
            {currentSection ? (
              <div
                className={`rounded-3xl p-6 sm:p-10 border transition-colors shadow-2xl ${
                  readingTheme === 'dark'
                    ? 'bg-[#151F30] border-[#D4AF37]/25 text-[#F8FAFC]'
                    : 'bg-[#FAF6EE] border-[#D4AF37]/50 text-[#1E293B]'
                }`}
              >
                {/* Section Header Controls */}
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-700/60 mb-6 flex-wrap">
                  <div>
                    <div
                      className={`text-xs font-semibold ${
                        readingTheme === 'dark' ? 'text-[#D4AF37]' : 'text-[#85691F]'
                      }`}
                    >
                      {law.titleBengali} ({law.enactmentYearBengali})
                    </div>
                    <div
                      className={`text-[11px] ${
                        readingTheme === 'dark' ? 'text-[#AAB4C3]' : 'text-slate-600'
                      }`}
                    >
                      {law.chapters.find((c) => c.sections.some((s) => s.id === currentSection.id))
                        ?.numberBengali}
                    </div>
                  </div>

                  {/* Actions: Bookmark & Share */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleBookmark}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        isBookmarked
                          ? 'bg-[#D4AF37] text-[#0B1220] border-[#D4AF37] shadow-md shadow-[#D4AF37]/20'
                          : readingTheme === 'dark'
                          ? 'bg-[#0B1220] text-[#AAB4C3] border-slate-700 hover:text-[#D4AF37] hover:border-[#D4AF37]'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-[#D4AF37]'
                      }`}
                      title={isBookmarked ? 'বুকমার্ক সংরক্ষিত' : 'বুকমার্ক করুন'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                      <span>{isBookmarked ? 'সংরক্ষিত' : 'বুকমার্ক'}</span>
                    </button>

                    <button
                      onClick={handleShareOrCopy}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        readingTheme === 'dark'
                          ? 'bg-[#0B1220] text-[#AAB4C3] border-slate-700 hover:text-[#D4AF37] hover:border-[#D4AF37]'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-[#D4AF37]'
                      }`}
                      title="উদ্ধৃতি কপি করুন"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">কপি</span>
                    </button>
                  </div>
                </div>

                {/* Section Title */}
                <div className="space-y-2 mb-6">
                  <div className="inline-block px-3 py-1 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-bold text-xs sm:text-sm">
                    {currentSection.sectionNumberBengali}
                  </div>
                  <h1
                    className={`font-serif-bengali text-xl sm:text-2xl md:text-3xl font-extrabold leading-snug ${
                      readingTheme === 'dark' ? 'text-[#F8FAFC]' : 'text-[#0B1220]'
                    }`}
                  >
                    {currentSection.titleBengali}
                  </h1>
                  {currentSection.titleEnglish && (
                    <div className="text-xs italic text-slate-400 font-sans">
                      {currentSection.titleEnglish}
                    </div>
                  )}
                </div>

                {/* Legal Section Body Text */}
                <div className={`font-serif-bengali whitespace-pre-line ${getFontSizeClass()}`}>
                  {currentSection.contentBengali}
                </div>

                {/* English Version Accordion if available */}
                {currentSection.contentEnglish && (
                  <details className="mt-6 p-4 rounded-xl border border-slate-700/50 bg-[#101A2B]/60 text-slate-300 text-xs sm:text-sm">
                    <summary className="font-semibold text-[#D4AF37] cursor-pointer select-none flex items-center justify-between">
                      <span>ইংরেজি প্রমিত পাঠ (Official English Version)</span>
                      <span className="text-[11px] font-normal text-slate-400">ক্লিক করে খুলুন</span>
                    </summary>
                    <div className="mt-3 pt-3 border-t border-slate-700/40 font-sans whitespace-pre-line leading-relaxed text-slate-300">
                      {currentSection.contentEnglish}
                    </div>
                  </details>
                )}

                {/* Penalty / Special Note Box if applicable */}
                {currentSection.penaltySummaryBengali && (
                  <div className="mt-8 p-4 rounded-xl bg-red-950/20 border border-red-800/40 text-red-300 text-xs sm:text-sm flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block mb-0.5">আইনি দণ্ডের সারসংক্ষেপ:</strong>
                      <span>{currentSection.penaltySummaryBengali}</span>
                    </div>
                  </div>
                )}

                {/* Section Index Indicator */}
                <div className="mt-10 pt-4 border-t border-slate-700/40 flex items-center justify-between text-xs text-[#AAB4C3]">
                  <span>
                    ধারা {currentSectionIndex + 1} / {allSections.length}
                  </span>
                  <button
                    onClick={() => setShowTocDrawer(true)}
                    className="hover:text-[#D4AF37] underline text-xs lg:hidden"
                  >
                    সম্পূর্ণ সূচিপত্র খুলুন
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[#AAB4C3]">কোনো ধারা পাওয়া যায়নি।</div>
            )}

            {/* Bottom Next / Previous Section Stepper */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={handlePrevSection}
                disabled={currentSectionIndex <= 0}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#151F30] border border-slate-800 hover:border-[#D4AF37]/50 text-xs sm:text-sm font-semibold text-[#F8FAFC] disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md group"
              >
                <ChevronLeft className="w-4 h-4 text-[#D4AF37] group-hover:-translate-x-1 transition-transform" />
                <span>পূর্ববর্তী ধারা</span>
              </button>

              <button
                onClick={() => setShowTocDrawer(true)}
                className="px-4 py-3 rounded-xl bg-[#0B1220] border border-slate-800 text-xs text-[#AAB4C3] hover:text-[#D4AF37] lg:hidden"
              >
                <List className="w-4 h-4 inline mr-1" />
                <span>সূচিপত্র</span>
              </button>

              <button
                onClick={handleNextSection}
                disabled={currentSectionIndex >= allSections.length - 1}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1220] text-xs sm:text-sm font-bold disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md group"
              >
                <span>পরবর্তী ধারা</span>
                <ChevronRight className="w-4 h-4 text-[#0B1220] stroke-[2.5] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile / Slide-Over Table of Contents Drawer */}
      {showTocDrawer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-md bg-[#0B1220] border-l border-[#D4AF37]/30 h-full flex flex-col p-5 shadow-2xl animate-slide-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-serif-bengali text-base font-bold text-[#F8FAFC]">
                  আইনের সূচিপত্র
                </h3>
                <div className="text-[11px] text-[#AAB4C3]">{law.titleBengali}</div>
              </div>
              <button
                onClick={() => setShowTocDrawer(false)}
                className="p-1.5 rounded-lg bg-[#151F30] text-[#AAB4C3] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In-drawer search */}
            <div className="relative my-3">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#AAB4C3]" />
              <input
                type="text"
                value={inLawSearch}
                onChange={(e) => setInLawSearch(e.target.value)}
                placeholder="ধারা নম্বর বা শিরোনাম..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#151F30] border border-slate-800 text-xs text-[#F8FAFC] placeholder-[#AAB4C3]/60 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {filteredChapters.map((ch) => (
                <div key={ch.id} className="space-y-1">
                  <div className="text-[11px] font-semibold text-[#D4AF37] px-1">
                    {ch.numberBengali}: {ch.titleBengali}
                  </div>
                  <div className="space-y-1">
                    {ch.sections.map((sec) => (
                      <button
                        key={sec.id}
                        onClick={() => {
                          setCurrentSectionId(sec.id);
                          setShowTocDrawer(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                          sec.id === currentSection?.id
                            ? 'bg-[#D4AF37] text-[#0B1220] font-bold'
                            : 'bg-[#151F30] text-[#AAB4C3] hover:text-[#F8FAFC]'
                        }`}
                      >
                        <span className="truncate pr-2">
                          {sec.sectionNumberBengali}: {sec.titleBengali}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
