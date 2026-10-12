/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bookmark } from '../types/law';
import { lawStorage } from '../services/lawStorage';
import { Bookmark as BookmarkIcon, Trash2, ExternalLink, Copy, Check, BookOpen } from 'lucide-react';

interface BookmarksViewProps {
  bookmarks: Bookmark[];
  onOpenReader: (lawId: string, sectionId?: string) => void;
  onRefreshBookmarks: () => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  onOpenReader,
  onRefreshBookmarks,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleRemove = (bmId: string) => {
    lawStorage.removeBookmark(bmId);
    onRefreshBookmarks();
  };

  const handleCopy = (bm: Bookmark) => {
    const quote = `【${bm.lawTitleBengali}】\n${bm.sectionNumberBengali}। ${bm.sectionTitleBengali}\n"${bm.excerptBengali}"`;
    navigator.clipboard.writeText(quote);
    setCopiedId(bm.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="font-serif-bengali text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
            সংরক্ষিত ধারা ও বুকমার্ক
          </h1>
          <p className="text-xs sm:text-sm text-[#AAB4C3] mt-1">
            আপনার চিহ্নিত গুরুত্বপূর্ণ আইনি ধারা ও বিধানের সংগ্রহ
          </p>
        </div>
        <div className="text-xs font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-lg border border-[#D4AF37]/30">
          মোট {bookmarks.length} টি সংরক্ষিত
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20 px-4 bg-[#151F30]/40 rounded-3xl border border-dashed border-slate-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#0B1220] text-[#D4AF37] flex items-center justify-center mx-auto border border-[#D4AF37]/30">
            <BookmarkIcon className="w-6 h-6" />
          </div>
          <h3 className="font-serif-bengali text-lg font-bold text-[#F8FAFC]">
            কোনো সংরক্ষিত ধারা নেই
          </h3>
          <p className="text-xs text-[#AAB4C3] max-w-sm mx-auto leading-relaxed">
            যেকোনো আইন পড়ার সময় ডানপাশের বুকমার্ক বোতামে ক্লিক করে পছন্দের ধারাগুলো এখানে সংরক্ষণ করতে পারেন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              className="bg-[#151F30] border border-slate-800 hover:border-[#D4AF37]/40 rounded-2xl p-5 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 text-xs text-[#AAB4C3]">
                  <span className="text-[#D4AF37] font-medium truncate max-w-[200px]">
                    {bm.lawTitleBengali}
                  </span>
                  <span className="text-[10px] text-slate-500 shrink-0">{bm.createdAt}</span>
                </div>

                <h3
                  onClick={() => onOpenReader(bm.lawId, bm.sectionId)}
                  className="font-serif-bengali text-base sm:text-lg font-bold text-[#F8FAFC] group-hover:text-[#D4AF37] transition-colors cursor-pointer mb-2"
                >
                  {bm.sectionNumberBengali}: {bm.sectionTitleBengali}
                </h3>

                <p className="text-xs text-[#AAB4C3] line-clamp-3 leading-relaxed mb-4">
                  {bm.excerptBengali}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => handleRemove(bm.id)}
                  className="p-1.5 rounded-lg bg-[#0B1220] hover:bg-red-950/40 text-[#AAB4C3] hover:text-red-400 border border-slate-800 transition-colors"
                  title="বুকমার্ক মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(bm)}
                    className="p-1.5 px-2.5 rounded-lg bg-[#0B1220] hover:bg-[#1A263D] text-xs text-[#AAB4C3] hover:text-[#D4AF37] border border-slate-800 transition-colors flex items-center gap-1"
                    title="উদ্ধৃতি কপি করুন"
                  >
                    {copiedId === bm.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">কপি</span>
                  </button>

                  <button
                    onClick={() => onOpenReader(bm.lawId, bm.sectionId)}
                    className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1220] font-semibold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <span>পড়ুন</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
