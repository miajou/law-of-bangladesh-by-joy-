/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, ReadingHistoryItem } from '../types/law';
import { lawStorage } from '../services/lawStorage';
import {
  User,
  Shield,
  Clock,
  Trash2,
  Lock,
  ExternalLink,
  BookOpen,
  CheckCircle,
  FileText,
  KeyRound,
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  history: ReadingHistoryItem[];
  isAdmin: boolean;
  onUserUpdate: (updated: UserProfile) => void;
  onAdminAuthChange: (auth: boolean) => void;
  onOpenReader: (lawId: string, sectionId?: string) => void;
  onRefreshHistory: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  history,
  isAdmin,
  onUserUpdate,
  onAdminAuthChange,
  onOpenReader,
  onRefreshHistory,
}) => {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [pinInput, setPinInput] = useState('');
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name,
      role,
    };
    lawStorage.saveUser(updated);
    onUserUpdate(updated);
    alert('প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে।');
  };

  const handleClearHistory = () => {
    if (confirm('আপনি কি আপনার সকল পড়ার ইতিহাস মুছে ফেলতে চান?')) {
      lawStorage.clearHistory();
      onRefreshHistory();
    }
  };

  const handleAdminToggle = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin) {
      lawStorage.setAdminAuthenticated(false);
      onAdminAuthChange(false);
      setPinMessage('প্রশাসক সেশন সমাপ্ত হয়েছে।');
    } else {
      if (pinInput === '1234' || pinInput.toLowerCase() === 'admin') {
        lawStorage.setAdminAuthenticated(true);
        onAdminAuthChange(true);
        setPinMessage('প্রশাসক হিসেবে সফলভাবে লগইন হয়েছে!');
        setPinInput('');
      } else {
        setPinMessage('ভুল পিন কোড। ডেমো পিন: 1234');
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      {/* Header Profile Card */}
      <div className="bg-[#151F30] border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-[#0B1220] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-lg shrink-0">
            <User className="w-10 h-10" />
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif-bengali text-xl sm:text-2xl font-bold text-[#F8FAFC]">
                {user.name}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-semibold">
                {isAdmin ? 'অনুমোদিত প্রশাসক' : user.role === 'lawyer' ? 'বিজ্ঞ আইনজীবী' : 'সাধারণ নাগরিক / গবেষক'}
              </span>
            </div>
            <div className="text-xs text-[#AAB4C3]">{user.email}</div>
            <div className="text-[11px] text-[#AAB4C3]/70 pt-1">
              সদস্য অন্তর্ভুক্তি: {user.joinedDate}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Setup: Profile Settings & Admin Passkey */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-[#151F30] border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-serif-bengali text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <User className="w-4 h-4 text-[#D4AF37]" />
            <span>ব্যক্তিগত তথ্য ও পদবি</span>
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-[#AAB4C3] font-medium">নাম</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0B1220] border border-slate-700 text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#AAB4C3] font-medium">ব্যবহারকারীর ধরন</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0B1220] border border-slate-700 text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="citizen">সাধারণ নাগরিক / আইন শিক্ষার্থী</option>
                <option value="lawyer">আইনজীবী / আইন গবেষক</option>
                <option value="admin">প্রশাসক</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1220] font-bold transition-all shadow-sm"
            >
              সংরক্ষণ করুন
            </button>
          </form>
        </div>

        {/* Administrator Authentication Switch */}
        <div className="bg-[#151F30] border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-serif-bengali text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#D4AF37]" />
            <span>প্রশাসনিক প্রবেশাধিকার (Admin Access)</span>
          </h2>

          <p className="text-xs text-[#AAB4C3] leading-relaxed">
            সরকারি আইন গেজেটের পিডিএফ ফাইল আপলোড, ওসিআর টেক্সট পরিবর্তন ও প্রকাশনা কার্যক্রমে অংশ নিতে অ্যাডমিন পিন দিয়ে যাচাই করুন।
          </p>

          <form onSubmit={handleAdminToggle} className="space-y-3">
            {isAdmin ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>আপনি প্রশাসক হিসেবে অনুমোদিত আছেন।</span>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0B1220] border border-red-800/60 hover:bg-red-950/40 text-xs text-red-400 font-semibold transition-all"
                >
                  প্রশাসক লগআউট করুন
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="অ্যাডমিন পিন লিখুন (ডেমো: 1234)"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0B1220] border border-slate-700 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1220] font-bold text-xs shadow-sm transition-all"
                >
                  প্রশাসক মোড সক্রিয় করুন
                </button>
              </div>
            )}
            {pinMessage && (
              <div className="text-[11px] text-[#D4AF37] font-medium">{pinMessage}</div>
            )}
          </form>
        </div>
      </div>

      {/* Reading History */}
      <div className="bg-[#151F30] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="font-serif-bengali text-base font-bold text-[#F8FAFC]">
              পঠনের ইতিহাস (Reading History)
            </h2>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-red-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ইতিহাস মুছুন</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#AAB4C3]">
            কোনো সাম্প্রতিক পঠন ইতিহাস পাওয়া যায়নি।
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenReader(item.lawId, item.sectionId)}
                className="py-3 px-2 rounded-xl hover:bg-[#0B1220] transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="text-xs sm:text-sm font-semibold text-[#F8FAFC] group-hover:text-[#D4AF37] transition-colors">
                    {item.sectionNumberBengali}: {item.sectionTitleBengali}
                  </div>
                  <div className="text-xs text-[#AAB4C3]">{item.lawTitleBengali}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-mono">{item.timestamp}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#D4AF37] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legal Disclaimer Box */}
      <div className="p-4 rounded-2xl bg-[#0B1220] border border-slate-800 text-[11px] text-[#AAB4C3] leading-relaxed space-y-1">
        <strong className="text-slate-300 block">আইনি সতর্কীকরণ (Legal Disclaimer):</strong>
        <span>
          “বাংলাদেশ আইন ভান্ডার” অ্যাপের সকল তথ্য কেবল গবেষণা ও সাধারণ নাগরিক সচেতনতার উদ্দেশ্যে সরবরাহ করা হয়েছে। চূড়ান্ত বিচারিক কার্যক্রমের ক্ষেত্রে বাংলাদেশ সরকারের সরকারি মুদ্রিত গেজেট বা সুপ্রিম কোর্টের প্রামাণ্য ল রিপোর্ট রেফারেন্স হিসেবে গ্রহণযোগ্য।
        </span>
      </div>
    </div>
  );
};
