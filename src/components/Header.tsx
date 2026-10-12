/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Scale, Search, ShieldCheck, User } from 'lucide-react';
import { UserProfile } from '../types/law';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string, lawId?: string, sectionId?: string) => void;
  user: UserProfile;
  isAdmin: boolean;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  user,
  isAdmin,
  onOpenSearch,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#0B1220]/95 backdrop-blur-md border-b border-[#D4AF37]/20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand wordmark with golden scale icon */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#85691F] p-0.5 shadow-md shadow-[#D4AF37]/10 flex items-center justify-center">
            <div className="w-full h-full bg-[#0B1220] rounded-[10px] flex items-center justify-center">
              <Scale className="w-5 h-5 text-[#D4AF37] group-hover:scale-105 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-serif-bengali text-lg sm:text-xl font-bold tracking-tight text-[#F8FAFC] group-hover:text-[#D4AF37] transition-colors whitespace-nowrap">
              বাংলাদেশ আইন ভান্ডার
            </span>
            <span className="text-[10px] text-[#AAB4C3] hidden sm:block tracking-wider uppercase font-medium">
              Bangladesh Law Library
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#AAB4C3]">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap transition-colors hover:text-[#D4AF37] ${
              currentTab === 'home' ? 'text-[#D4AF37] font-semibold' : ''
            }`}
          >
            হোম
          </button>
          <button
            onClick={() => onNavigate('library')}
            className={`whitespace-nowrap transition-colors hover:text-[#D4AF37] ${
              currentTab === 'library' ? 'text-[#D4AF37] font-semibold' : ''
            }`}
          >
            আইনসমূহ
          </button>
          <button
            onClick={() => onNavigate('search')}
            className={`whitespace-nowrap transition-colors hover:text-[#D4AF37] ${
              currentTab === 'search' ? 'text-[#D4AF37] font-semibold' : ''
            }`}
          >
            অনুসন্ধান
          </button>
          <button
            onClick={() => onNavigate('bookmarks')}
            className={`whitespace-nowrap transition-colors hover:text-[#D4AF37] ${
              currentTab === 'bookmarks' ? 'text-[#D4AF37] font-semibold' : ''
            }`}
          >
            বুকমার্ক
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`whitespace-nowrap flex items-center gap-1.5 transition-colors hover:text-[#D4AF37] ${
              currentTab === 'admin' ? 'text-[#D4AF37] font-semibold' : ''
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            অ্যাডমিন ড্যাশবোর্ড
          </button>
        </nav>

        {/* Zone 3: Primary action button and user indicator */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151F30] border border-[#D4AF37]/25 text-[#AAB4C3] hover:text-[#F8FAFC] hover:border-[#D4AF37] transition-all text-xs"
            aria-label="অনুসন্ধান করুন"
          >
            <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">দ্রুত অনুসন্ধান</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-[#0B1220] rounded border border-slate-700 text-slate-400">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[#151F30] border border-slate-800 hover:border-[#D4AF37]/50 transition-all text-xs text-[#F8FAFC]"
            aria-label="ব্যবহারকারী প্রোফাইল"
          >
            <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline font-medium">
              {isAdmin ? 'প্রশাসক' : user.name}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
