/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Law } from '../types/law';
import {
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  AlertTriangle,
  FileCheck2,
} from 'lucide-react';

interface PdfGazetteViewerProps {
  law: Law;
  onSwitchToText: () => void;
}

export const PdfGazetteViewer: React.FC<PdfGazetteViewerProps> = ({ law, onSwitchToText }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const totalPages = Math.max(3, Math.ceil(law.totalSections / 4));

  const handleDownload = () => {
    // Generate a simple downloadable text/pdf blob simulation
    const content = `গণপ্রজাতন্ত্রী বাংলাদেশ সরকার\nবাংলাদেশ গেজেট (অতিরিক্ত সংখ্যা)\n\n${law.titleBengali}\n(${law.titleEnglish})\n${law.actNumberBengali}\n\n${law.preambleBengali}\n\n` +
      law.chapters.map(c => `${c.numberBengali}: ${c.titleBengali}\n` + c.sections.map(s => `${s.sectionNumberBengali}: ${s.titleBengali}\n${s.contentBengali}\n`).join('\n')).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${law.pdfFileName || law.titleEnglish}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1220] rounded-2xl border border-slate-800 overflow-hidden">
      {/* Top Controls Bar */}
      <div className="bg-[#151F30] border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#F8FAFC] font-medium truncate max-w-xs sm:max-w-md">
            <FileText className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span className="truncate">{law.pdfFileName || `${law.titleBengali}.pdf`}</span>
          </div>
          <span className="text-[#AAB4C3]/70 hidden sm:inline">
            ({law.pdfFileSize || '4.2 MB'})
          </span>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-2">
          {/* Zoom */}
          <div className="flex items-center bg-[#0B1220] rounded-lg border border-slate-700 px-1.5 py-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
              className="p-1 hover:text-[#D4AF37] transition-colors"
              title="জুম আউট"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-[#AAB4C3]">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
              className="p-1 hover:text-[#D4AF37] transition-colors"
              title="জুম ইন"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page nav */}
          <div className="flex items-center bg-[#0B1220] rounded-lg border border-slate-700 px-1.5 py-0.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 disabled:opacity-30 hover:text-[#D4AF37]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] text-[#AAB4C3]">
              পৃষ্ঠা {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 disabled:opacity-30 hover:text-[#D4AF37]"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1220] font-semibold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">সংরক্ষণ করুন</span>
          </button>
        </div>
      </div>

      {/* OCR Quality Notice Bar if applicable */}
      {law.pdfIsOcr && (
        <div className="bg-amber-950/40 border-b border-amber-800/40 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>ওসিআর (OCR) বিজ্ঞপ্তি:</strong> এই আইনটি মূল স্ক্যান কপি থেকে অপটিক্যাল ক্যারেক্টার রিকগনিশন দ্বারা পঠিত। চূড়ান্ত আইনি সত্যতার জন্য মূল গেজেট পৃষ্ঠা রেফারেন্স করুন।
            </span>
          </div>
          <button
            onClick={onSwitchToText}
            className="underline hover:text-white shrink-0 ml-2 font-medium"
          >
            টেক্সট সংস্করণ দেখুন
          </button>
        </div>
      )}

      {/* Main Document Viewer Canvas */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-[#070C14]">
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="w-full max-w-3xl bg-[#FCFAF6] text-[#1E293B] shadow-2xl rounded-sm p-8 sm:p-14 font-serif-bengali min-h-[950px] flex flex-col justify-between transition-transform duration-150 border border-amber-100"
        >
          {/* Authentic Bangladesh Gazette Header */}
          <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
            <div className="text-[11px] font-sans font-semibold tracking-wider text-slate-700 uppercase mb-1">
              রেজিস্টার্ড নং ডি এ-১
            </div>
            <div className="text-base font-bold text-slate-900 tracking-wide mb-1">
              বাংলাদেশ গেজেট
            </div>
            <div className="text-xs text-slate-700 italic mb-2">
              অতিরিক্ত সংখ্যা · কর্তৃপক্ষ কর্তৃক প্রকাশিত
            </div>
            <div className="inline-block border-y border-slate-700 py-1 px-8 text-xs font-semibold text-slate-800 uppercase tracking-widest my-1">
              আইন, বিচার ও সংসদ বিষয়ক মন্ত্রণালয়
            </div>
          </div>

          {/* Body Content of Current Page */}
          <div className="flex-1 space-y-6 text-sm leading-relaxed text-justify text-slate-900">
            {currentPage === 1 ? (
              <>
                <div className="text-center space-y-2 mb-6">
                  <div className="text-xs font-semibold text-slate-600">
                    ঢাকা, {law.enactmentYearBengali} খ্রিষ্টাব্দ
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-serif-bengali">
                    {law.titleBengali}
                  </h2>
                  <div className="text-xs text-slate-700 font-sans italic">
                    {law.actNumberBengali}
                  </div>
                </div>

                <div className="bg-amber-50/60 p-4 rounded border border-amber-200/60 text-xs italic text-slate-800 text-center leading-relaxed">
                  {law.preambleBengali}
                </div>

                <div className="space-y-4 pt-4">
                  {law.chapters[0]?.sections.slice(0, 3).map((sec) => (
                    <div key={sec.id} className="space-y-1">
                      <div className="font-bold text-slate-950 text-sm">
                        {sec.sectionNumberBengali}। {sec.titleBengali}—
                      </div>
                      <p className="text-slate-800 pl-4 whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                        {sec.contentBengali}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-5">
                <div className="text-xs font-semibold text-slate-600 text-center pb-2 border-b border-slate-300">
                  {law.titleBengali} — পৃষ্ঠা {currentPage}
                </div>
                {law.chapters.flatMap((c) => c.sections).slice((currentPage - 1) * 3, currentPage * 3).map((sec) => (
                  <div key={sec.id} className="space-y-1 pt-2">
                    <div className="font-bold text-slate-950 text-sm">
                      {sec.sectionNumberBengali}। {sec.titleBengali}—
                    </div>
                    <p className="text-slate-800 pl-4 whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                      {sec.contentBengali}
                    </p>
                    {sec.penaltySummaryBengali && (
                      <div className="pl-4 text-xs font-semibold text-red-900 mt-1">
                        [দণ্ডের সারসংক্ষেপ: {sec.penaltySummaryBengali}]
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gazette Footer Seal */}
          <div className="pt-8 mt-8 border-t border-slate-400 flex items-center justify-between text-[11px] text-slate-600 font-sans">
            <div>
              বাংলাদেশ সরকারি মুদ্রণালয়, তেজগাঁও, ঢাকা কর্তৃক মুদ্রিত।
            </div>
            <div className="font-semibold text-slate-800">
              পৃষ্ঠা {currentPage}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
