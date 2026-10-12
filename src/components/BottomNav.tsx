/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, BookOpen, Search, Bookmark, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate }) => {
  const navItems = [
    { id: 'home', label: 'হোম', icon: Home },
    { id: 'library', label: 'আইনসমূহ', icon: BookOpen },
    { id: 'search', label: 'অনুসন্ধান', icon: Search },
    { id: 'bookmarks', label: 'বুকমার্ক', icon: Bookmark },
    { id: 'profile', label: 'প্রোফাইল', icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1220]/95 backdrop-blur-lg border-t border-[#D4AF37]/20 safe-area-bottom shadow-xl"
      aria-label="মোবাইল নেভিগেশন"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all ${
                isActive ? 'text-[#D4AF37]' : 'text-[#AAB4C3] hover:text-[#F8FAFC]'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                  isActive ? 'bg-[#D4AF37]/15' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 leading-none ${
                  isActive ? 'text-[#D4AF37] font-semibold' : 'text-[#AAB4C3]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
