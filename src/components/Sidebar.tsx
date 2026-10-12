/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, BookOpen, Search, Bookmark, User, ShieldCheck, FileText, ExternalLink } from 'lucide-react';
import { UserProfile } from '../types/law';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string, lawId?: string) => void;
  user: UserProfile;
  isAdmin: boolean;
  bookmarkCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  isAdmin,
  bookmarkCount,
}) => {
  const mainNav = [
    { id: 'home', label: 'হোম ড্যাশবোর্ড', icon: Home },
    { id: 'library', label: 'আইন ভান্ডার (লাইব্রেরি)', icon: BookOpen },
    { id: 'search', label: 'উন্নত অনুসন্ধান', icon: Search },
    { id: 'bookmarks', label: 'সংরক্ষিত ধারা ও বুকমার্ক', icon: Bookmark, badge: bookmarkCount },
    { id: 'profile', label: 'ব্যবহারকারী প্রোফাইল', icon: User },
  ];

  const quickLaws = [
    { id: 'constitution-1972', label: 'গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধান', year: '১৯৭২' },
    { id: 'crpc-1898', label: 'ফৌজদারী কার্যবিধি আইন (CrPC)', year: '১৮৯৮' },
    { id: 'penal-code-1860', label: 'দণ্ডবিধি (Penal Code)', year: '১৮৬০' },
    { id: 'cpc-1908', label: 'দেওয়ানি কার্যবিধি (CPC)', year: '১৯০৮' },
  ];

  return (
    <aside className="w-64 shrink-0 bg-[#0B1220] border-r border-[#D4AF37]/15 flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-6">
        {/* Main Nav Items */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[11px] font-semibold text-[#AAB4C3]/60 uppercase tracking-wider">
            প্রধান মেনু
          </div>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#151F30] text-[#D4AF37] border border-[#D4AF37]/30 shadow-sm'
                    : 'text-[#AAB4C3] hover:text-[#F8FAFC] hover:bg-[#151F30]/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-[#AAB4C3]'}`} />
                  <span className="font-serif-bengali text-sm">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Core Laws */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="px-3 text-[11px] font-semibold text-[#AAB4C3]/60 uppercase tracking-wider">
            শীর্ষ সংবিধিবদ্ধ আইন
          </div>
          <div className="space-y-1">
            {quickLaws.map((law) => (
              <button
                key={law.id}
                onClick={() => onNavigate('reader', law.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#AAB4C3] hover:text-[#F8FAFC] hover:bg-[#151F30]/80 transition-all flex items-center justify-between group"
              >
                <span className="truncate pr-2 font-medium">{law.label}</span>
                <span className="text-[10px] text-[#D4AF37]/80 group-hover:text-[#D4AF37] shrink-0">
                  {law.year}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Admin Section */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            onClick={() => onNavigate('admin')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentTab === 'admin'
                ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                : 'text-[#D4AF37] hover:bg-[#D4AF37]/10 border border-[#D4AF37]/20'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <div className="text-left">
              <div className="text-xs font-semibold leading-tight">অ্যাডমিন কন্ট্রোল</div>
              <div className="text-[10px] text-[#AAB4C3]">
                {isAdmin ? 'অনুমোদিত প্রশাসক' : 'লগইন প্রয়োজন'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Footer Info in Sidebar */}
      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-[#AAB4C3]/70 space-y-2">
        <div className="flex items-center justify-between">
          <span>ডিজিটাল আইন প্রকাশনা</span>
          <span className="text-[#D4AF37] font-semibold">২০২৬ সংস্করণ</span>
        </div>
        <p className="leading-relaxed">
          বাংলাদেশের সুপ্রিম কোর্ট ও আইন মন্ত্রণালয়ের সরকারি প্রকাশনা অনুসারে সংগৃহীত।
        </p>
      </div>
    </aside>
  );
};
