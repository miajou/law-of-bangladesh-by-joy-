/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Law } from '../types/law';
import { BookOpen, FileText, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LawCardProps {
  law: Law;
  onOpenReader: (lawId: string) => void;
  onOpenPdf: (lawId: string) => void;
}

export const LawCard: React.FC<LawCardProps> = ({ law, onOpenReader, onOpenPdf }) => {
  return (
    <div className="bg-[#151F30] border border-slate-800 hover:border-[#D4AF37]/40 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-[#0B1220]/50 flex flex-col justify-between group">
      <div>
        {/* Unboxed Metadata (Zero-Pill discipline) */}
        <div className="flex items-center gap-2 text-xs text-[#AAB4C3] mb-2.5 flex-wrap">
          <span className="text-[#D4AF37] font-medium">{law.categoryNameBengali}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>প্রণয়ন: {law.enactmentYearBengali} খ্রি.</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{law.totalSections} টি ধারা/অনুচ্ছেদ</span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onOpenReader(law.id)}
          className="font-serif-bengali text-lg sm:text-xl font-bold text-[#F8FAFC] group-hover:text-[#D4AF37] transition-colors cursor-pointer line-clamp-2 mb-2"
        >
          {law.titleBengali}
        </h3>

        {/* English Title & Act Reference */}
        <div className="text-xs text-[#AAB4C3]/80 italic mb-3 font-sans line-clamp-1">
          {law.titleEnglish} ({law.actNumberBengali})
        </div>

        {/* Preamble Excerpt */}
        <p className="text-xs sm:text-sm text-[#AAB4C3] line-clamp-3 leading-relaxed mb-4">
          {law.preambleBengali}
        </p>
      </div>

      {/* Footer & Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 mt-auto">
        <div className="flex items-center gap-2">
          {law.status === 'needs_correction' ? (
            <span className="flex items-center gap-1 text-[11px] text-amber-400" title={law.needsCorrectionReason}>
              <AlertCircle className="w-3.5 h-3.5" />
              <span>ওসিআর সংশোধন আবশ্যক</span>
            </span>
          ) : law.status === 'in_review' ? (
            <span className="flex items-center gap-1 text-[11px] text-sky-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>পর্যালোচনাধীন</span>
            </span>
          ) : (
            <span className="text-[11px] text-[#AAB4C3]/60 flex items-center gap-1">
              <span>গেজেট যাচাইকৃত</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {law.pdfFileName && (
            <button
              onClick={() => onOpenPdf(law.id)}
              className="p-2 rounded-lg bg-[#0B1220] hover:bg-[#1A2744] text-[#AAB4C3] hover:text-[#D4AF37] border border-slate-800 hover:border-[#D4AF37]/30 transition-all text-xs flex items-center gap-1.5"
              title="মূল সরকারি পিডিএফ গেজেট দেখুন"
              aria-label="পিডিএফ দেখুন"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">পিডিএফ</span>
            </button>
          )}

          <button
            onClick={() => onOpenReader(law.id)}
            className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1220] font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-sm shadow-[#D4AF37]/20"
          >
            <span>পড়ুন</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
