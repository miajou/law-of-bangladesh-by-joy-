/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Law, Category, LawStatus } from '../types/law';
import { lawStorage } from '../services/lawStorage';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldCheck,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  Plus,
  BookOpen,
  Check,
  X,
  FileCheck,
  AlertCircle,
  BarChart3,
  Search,
} from 'lucide-react';

interface AdminViewProps {
  laws: Law[];
  categories: Category[];
  isAdmin: boolean;
  onAdminAuthChange: (auth: boolean) => void;
  onRefreshData: () => void;
  onOpenReader: (lawId: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  laws,
  categories,
  isAdmin,
  onAdminAuthChange,
  onRefreshData,
  onOpenReader,
}) => {
  // Admin Login PIN
  const [adminPin, setAdminPin] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'review' | 'stats'>('upload');

  // PDF Upload Form State
  const [uploadTitleBn, setUploadTitleBn] = useState('');
  const [uploadTitleEn, setUploadTitleEn] = useState('');
  const [uploadActNumber, setUploadActNumber] = useState('');
  const [uploadYear, setUploadYear] = useState<number>(2024);
  const [uploadCategory, setUploadCategory] = useState<string>(categories[0]?.id || 'special');
  const [isScannedPdf, setIsScannedPdf] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');
  const [sampleRawText, setSampleRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Edit / Review Law Modal State
  const [editingLaw, setEditingLaw] = useState<Law | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // Preset sample gazette upload templates for instant testing
  const samplePdfTemplates = [
    {
      name: 'ডিজিটাল নিরাপত্তা আইন (সংশোধিত).pdf',
      size: '3.4 MB',
      titleBn: 'ডিজিটাল সাক্ষ্য প্রমাণ ও রেকর্ড সংরক্ষণ অধ্যাদেশ, ২০২৪',
      titleEn: 'Digital Evidence and Electronic Records Ordinance, 2024',
      actNo: '২০২৪ সালের ১২ নং অধ্যাদেশ',
      year: 2024,
      category: 'special',
      isScanned: false,
      text: `ধারা ১: সংক্ষিপ্ত শিরোনাম ও প্রবর্তন
(১) এই অধ্যাদেশ ডিজিটাল সাক্ষ্য প্রমাণ ও রেকর্ড সংরক্ষণ অধ্যাদেশ, ২০২৪ নামে অভিহিত হইবে।
(২) ইহা অনতিবিলম্বে কার্যকর হইবে।

ধারা ২: সংজ্ঞাসমূহ
এই অধ্যাদেশে বিষয় বা প্রসঙ্গের পরিপন্থী কিছু না থাকিলে—
(ক) "ডিজিটাল রেকর্ড" অর্থ ইলেকট্রনিক ফরম্যাটে সংগৃহীত বা প্রেরিত যে কোনো তথ্য, অডিও, ভিডিও বা মেটাডাটা;
(খ) "ফরেনসিক ল্যাবরেটরি" অর্থ সরকার কর্তৃক অনুমোদিত সাইবার অপরাধ ও ডিজিটাল ফরেনসিক পরীক্ষার প্রতিষ্ঠান।

ধারা ৩: ডিজিটাল প্রমাণের গ্রাহ্যতা
যেকোনো দেওয়ানি বা ফৌজদারি কার্যক্রমে এই আইনের শর্তাবলি সাপেক্ষে সঠিক হ্যাশ মান এবং ডিজিটাল স্বাক্ষর সংবলিত ইলেকট্রনিক প্রমাণ বৈধ ও আদালতে গ্রহণযোগ্য সাক্ষ্য হিসেবে পরিগণিত হইবে।`,
    },
    {
      name: 'সড়ক_পরিবহন_বিধিমালা_গেজেট_স্ক্যান.pdf',
      size: '5.8 MB',
      titleBn: 'সড়ক পরিবহন বিধিমালা (জরুরি বিধান), ২০২৪',
      titleEn: 'Road Transport Regulations (Emergency Provisions), 2024',
      actNo: '২০২৪ সালের ১৫ নং প্রজ্ঞাপন',
      year: 2024,
      category: 'special',
      isScanned: true,
      text: `ধারা ১: শিরোনাম
এই বিধিমালা সড়ক পরিবহন জরুরি নিয়ন্ত্রণ বিধিমালা, ২০২৪ নামে পরিচিত হইবে।

ধারা ২: লাইসেন্স স্থগিতকরণ ও বিশেষ তল্লাশি
[ওসিআর সতর্কবার্তা: স্ক্যান কপি হইতে রূপান্তরিত, কিছু হরফ অস্পষ্ট]
উপযুক্ত পুলিশ কর্মকর্তা বা বিআরটিএ পরিদর্শক ড্রাইভিং লাইসেন্স জালিয়াতি বা নিরাপত্তা পরিপন্থী যান চলাচলের ক্ষেত্রে ঘটনাস্থলে মোটরযান জব্দ করিতে পারিবেন।`,
    },
  ];

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 1234 or "admin"
    if (adminPin === '1234' || adminPin.toLowerCase() === 'admin') {
      lawStorage.setAdminAuthenticated(true);
      onAdminAuthChange(true);
      setAuthError('');
    } else {
      setAuthError('ভুল পিন কোড। ডেমো পিন: 1234 লিখুন।');
    }
  };

  const handleLogout = () => {
    lawStorage.setAdminAuthenticated(false);
    onAdminAuthChange(false);
  };

  const handleApplyTemplate = (tpl: typeof samplePdfTemplates[0]) => {
    setSelectedFileName(tpl.name);
    setSelectedFileSize(tpl.size);
    setUploadTitleBn(tpl.titleBn);
    setUploadTitleEn(tpl.titleEn);
    setUploadActNumber(tpl.actNo);
    setUploadYear(tpl.year);
    setUploadCategory(tpl.category);
    setIsScannedPdf(tpl.isScanned);
    setSampleRawText(tpl.text);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitleBn.trim() || !sampleRawText.trim()) {
      alert('আইনের শিরোনাম এবং টেক্সট প্রদান করুন।');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const processedLaw = lawStorage.processPdfUpload({
        titleBengali: uploadTitleBn.trim(),
        titleEnglish: uploadTitleEn.trim() || 'Act of Parliament',
        actNumberBengali: uploadActNumber.trim() || `${uploadYear} সালের আইন`,
        enactmentYear: uploadYear,
        categoryId: uploadCategory,
        fileName: selectedFileName || `${uploadTitleBn}.pdf`,
        fileSize: selectedFileSize || '3.2 MB',
        isScannedPdf,
        extractedRawText: sampleRawText,
      });

      setIsProcessing(false);
      setUploadSuccessMessage(
        `সফলভাবে প্রসেস করা হয়েছে! "${processedLaw.titleBengali}" এখন ${
          processedLaw.status === 'needs_correction'
            ? 'সংশোধন প্রয়োজন (Needs Correction)'
            : 'পর্যালোচনাধীন (In Review)'
        } তালিকায় যুক্ত হয়েছে।`
      );
      onRefreshData();

      // Reset form
      setUploadTitleBn('');
      setUploadTitleEn('');
      setUploadActNumber('');
      setSampleRawText('');
      setSelectedFileName('');

      setTimeout(() => setUploadSuccessMessage(null), 5000);
    }, 1200);
  };

  const handleStatusUpdate = (lawId: string, newStatus: LawStatus, note?: string) => {
    lawStorage.updateLawStatus(lawId, newStatus, note);
    onRefreshData();
    if (editingLaw && editingLaw.id === lawId) {
      setEditingLaw({ ...editingLaw, status: newStatus });
    }
  };

  const handleDeleteLaw = (lawId: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই আইনটি তালিকা থেকে মুছে ফেলতে চান?')) {
      lawStorage.deleteLaw(lawId);
      onRefreshData();
    }
  };

  // If not authenticated as Admin, show Security Login Gate
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6">
        <div className="bg-[#151F30] border border-[#D4AF37]/30 rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-[#0B1220] border-2 border-[#D4AF37] flex items-center justify-center mx-auto text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif-bengali text-2xl font-bold text-[#F8FAFC]">
              প্রশাসক প্রবেশাধিকার
            </h2>
            <p className="text-xs text-[#AAB4C3]">
              আইনের পিডিএফ আপলোড, ওসিআর পর্যালোচনা ও প্রকাশনা নিয়ন্ত্রণের জন্য পিন প্রদান করুন
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 pt-2">
            <div>
              <input
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="অ্যাডমিন পিন কোড লিখুন (যেমন: 1234)"
                className="w-full text-center tracking-widest text-lg font-mono py-3 px-4 rounded-xl bg-[#0B1220] border border-slate-700 focus:border-[#D4AF37] text-[#F8FAFC] placeholder-slate-500 focus:outline-none"
                autoFocus
              />
              {authError && <div className="text-xs text-red-400 mt-2 font-medium">{authError}</div>}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1220] font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              প্রশাসক হিসেবে প্রবেশ করুন
            </button>
          </form>

          <div className="text-[11px] text-[#AAB4C3]/70 pt-2 border-t border-slate-800">
            ডেমো এক্সেস পিন: <strong className="text-[#D4AF37]">1234</strong>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard main view
  return (
    <div className="space-y-6 pb-20">
      {/* Top Admin Banner */}
      <div className="bg-[#151F30] border border-[#D4AF37]/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B1220] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-bengali text-lg sm:text-xl font-bold text-[#F8FAFC]">
                আইন প্রশাসন ও পিডিএফ পোর্টাল
              </h1>
              <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded font-semibold">
                অনুমোদিত মোড
              </span>
            </div>
            <p className="text-xs text-[#AAB4C3]">
              পিডিএফ আপলোড, ওসিআর টেক্সট এক্সট্রাকশন এবং প্রকাশনা অনুমোদন ব্যবস্থাপনা
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-[#0B1220] hover:bg-red-950/40 text-xs text-[#AAB4C3] hover:text-red-400 border border-slate-800 transition-all flex items-center gap-1.5"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* Admin Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'upload'
              ? 'bg-[#D4AF37] text-[#0B1220] shadow-sm'
              : 'text-[#AAB4C3] hover:text-[#F8FAFC] hover:bg-[#151F30]'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>নতুন পিডিএফ আপলোড ও প্রসেসিং</span>
        </button>

        <button
          onClick={() => setActiveTab('manage')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'manage'
              ? 'bg-[#D4AF37] text-[#0B1220] shadow-sm'
              : 'text-[#AAB4C3] hover:text-[#F8FAFC] hover:bg-[#151F30]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>আইন তালিকা ও প্রকাশনা ({laws.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'review'
              ? 'bg-[#D4AF37] text-[#0B1220] shadow-sm'
              : 'text-[#AAB4C3] hover:text-[#F8FAFC] hover:bg-[#151F30]'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>
            ওসিআর ও টেক্সট যাচাই (
            {laws.filter((l) => l.status === 'needs_correction' || l.status === 'in_review').length}
            )
          </span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'stats'
              ? 'bg-[#D4AF37] text-[#0B1220] shadow-sm'
              : 'text-[#AAB4C3] hover:text-[#F8FAFC] hover:bg-[#151F30]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>পরিসংখ্যান ও ডাটাবেজ স্বাস্থ্য</span>
        </button>
      </div>

      {/* Success Notification */}
      {uploadSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-emerald-200 text-xs sm:text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">{uploadSuccessMessage}</div>
        </div>
      )}

      {/* TAB 1: PDF UPLOAD & PROCESSING */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* Quick Preset Selector for Easy Testing */}
          <div className="p-4 rounded-2xl bg-[#151F30] border border-slate-800 space-y-2">
            <div className="text-xs font-semibold text-[#D4AF37]">
              দ্রুত টেস্টিং প্রিসেট নির্বাচন করুন (নমুনা সরকারি গেজেট):
            </div>
            <div className="flex flex-wrap gap-2">
              {samplePdfTemplates.map((tpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyTemplate(tpl)}
                  className="px-3 py-1.5 rounded-lg bg-[#0B1220] border border-slate-700 hover:border-[#D4AF37] text-xs text-[#AAB4C3] hover:text-white transition-all flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{tpl.name}</span>
                  {tpl.isScanned && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/50 px-1 rounded">
                      Scanned OCR
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-6">
            {/* Drag & Drop File Zone */}
            <div className="border-2 border-dashed border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-3xl p-6 sm:p-10 bg-[#151F30]/60 text-center transition-all">
              <Upload className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
              <h3 className="font-serif-bengali text-base font-bold text-[#F8FAFC]">
                আইনের মূল গেজেট পিডিএফ (PDF) নির্বাচন করুন
              </h3>
              <p className="text-xs text-[#AAB4C3] mt-1 max-w-sm mx-auto">
                বাংলাদেশ সরকারি গেজেট বা আইন মন্ত্রণালয়ের মূল পিডিএফ ফাইল আপলোড করুন
              </p>

              <div className="mt-4 flex flex-wrap justify-center items-center gap-3">
                <input
                  type="file"
                  id="pdfFileInput"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFileName(file.name);
                      setSelectedFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="pdfFileInput"
                  className="px-4 py-2 rounded-xl bg-[#0B1220] border border-slate-700 hover:border-[#D4AF37] text-xs font-semibold text-[#D4AF37] cursor-pointer transition-all"
                >
                  ফাইল ব্রাউজ করুন (.pdf)
                </label>
                {selectedFileName && (
                  <span className="text-xs text-emerald-400 font-medium">
                    নির্বাচিত: {selectedFileName} ({selectedFileSize})
                  </span>
                )}
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#151F30] p-6 rounded-2xl border border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#AAB4C3]">
                  আইনের বাংলা নাম <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={uploadTitleBn}
                  onChange={(e) => setUploadTitleBn(e.target.value)}
                  placeholder="যেমন: ভোক্তা অধিকার সংরক্ষণ আইন, ২০০৯"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0B1220] border border-slate-700 text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#AAB4C3]">
                  আইনের ইংরেজি নাম (English Title)
                </label>
                <input
                  type="text"
                  value={uploadTitleEn}
                  onChange={(e) => setUploadTitleEn(e.target.value)}
                  placeholder="Consumer Rights Protection Act, 2009"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0B1220] border border-slate-700 text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#AAB4C3]">
                  আইন বা অধ্যাদেশ নম্বর
                </label>
                <input
                  type="text"
                  value={uploadActNumber}
                  onChange={(e) => setUploadActNumber(e.target.value)}
                  placeholder="যেমন: ২০০৯ সালের ২৬ নং আইন"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0B1220] border border-slate-700 text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#AAB4C3]">
                  প্রণয়নের সাল (Enactment Year)
                </label>
                <input
                  type="number"
                  value={uploadYear}
                  onChange={(e) => setUploadYear(parseInt(e.target.value) || 2024)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0B1220] border border-slate-700 text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#AAB4C3]">বিভাগ (Category)</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0B1220] border border-slate-700 text-xs sm:text-sm text-[#F8FAFC] focus:outline-none focus:border-[#D4AF37]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameBengali}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 flex flex-col justify-center">
                <label className="flex items-center gap-2 cursor-pointer pt-3">
                  <input
                    type="checkbox"
                    checked={isScannedPdf}
                    onChange={(e) => setIsScannedPdf(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37] bg-[#0B1220] border-slate-700"
                  />
                  <span className="text-xs text-[#F8FAFC] font-medium">
                    স্ক্যান করা পিডিএফ / অপটিক্যাল ক্যারেক্টার রিকগনিশন (OCR) চালিত
                  </span>
                </label>
                {isScannedPdf && (
                  <p className="text-[11px] text-amber-400">
                    * স্ক্যান করা ডকুমেন্টের ওসিআর রূপান্তরকে প্রকাশের পূর্বে অনুমোদিত প্রশাসকের ম্যানুয়াল যাচাইকরণ বাধ্যতামূলক।
                  </p>
                )}
              </div>
            </div>

            {/* Extracted Text Area */}
            <div className="space-y-1 bg-[#151F30] p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#AAB4C3]">
                  পিডিএফ থেকে এক্সট্রাক্টকৃত বাংলা লিগ্যাল টেক্সট (ধারা ও বিষয়বস্তু)
                </label>
                <span className="text-[11px] text-[#D4AF37]">
                  টিপস: "ধারা ১: শিরোনাম" দিয়ে শুরু করুন
                </span>
              </div>
              <textarea
                rows={8}
                value={sampleRawText}
                onChange={(e) => setSampleRawText(e.target.value)}
                placeholder="ধারা ১: শিরোনাম...&#10;ধারা ২: সংজ্ঞাসমূহ...&#10;ধারা ৩: অপরাধ ও দণ্ড..."
                className="w-full p-4 rounded-xl bg-[#0B1220] border border-slate-700 text-xs sm:text-sm text-[#F8FAFC] font-serif-bengali leading-relaxed focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1220] font-bold text-sm sm:text-base shadow-lg shadow-[#D4AF37]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>পিডিএফ প্রসেসিং ও ধারা ইনডেক্সিং হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>আইন প্রসেস ও ডাটাবেজে সংরক্ষণ করুন</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: MANAGE LAWS & PUBLISH STATUS */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#AAB4C3]">
            <span>মোট সংরক্ষিত আইন: {laws.length} টি</span>
          </div>

          <div className="overflow-x-auto bg-[#151F30] rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1220] text-[#AAB4C3] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">আইনের নাম ও রেফারেন্স</th>
                  <th className="py-3 px-4">বিভাগ ও সাল</th>
                  <th className="py-3 px-4">ধারা সংখ্যা</th>
                  <th className="py-3 px-4">অবস্থা (Status)</th>
                  <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[#F8FAFC]">
                {laws.map((law) => (
                  <tr key={law.id} className="hover:bg-[#1A263D]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-serif-bengali font-bold text-sm text-[#F8FAFC]">
                        {law.titleBengali}
                      </div>
                      <div className="text-[11px] text-[#AAB4C3]/70">{law.actNumberBengali}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[#D4AF37] font-medium">{law.categoryNameBengali}</div>
                      <div className="text-[#AAB4C3] text-[11px]">{law.enactmentYearBengali} খ্রি.</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{law.totalSections} টি</td>
                    <td className="py-3.5 px-4">
                      {law.status === 'published' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>প্রকাশিত</span>
                        </span>
                      ) : law.status === 'needs_correction' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                          <AlertTriangle className="w-3 h-3" />
                          <span>সংশোধন আবশ্যক</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>পর্যালোচনাধীন</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenReader(law.id)}
                          className="p-1.5 rounded-lg bg-[#0B1220] hover:bg-[#1A2744] text-[#AAB4C3] hover:text-[#D4AF37]"
                          title="পড়ুন"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {law.status !== 'published' ? (
                          <button
                            onClick={() => handleStatusUpdate(law.id, 'published')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 text-[11px] font-semibold"
                            title="অনুমোদন করে প্রকাশ করুন"
                          >
                            প্রকাশ করুন
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusUpdate(law.id, 'in_review')}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#AAB4C3] text-[11px]"
                            title="অপ্রকাশিত রাখুন"
                          >
                            স্থগিত
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteLaw(law.id)}
                          className="p-1.5 rounded-lg bg-[#0B1220] hover:bg-red-950 text-red-400"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OCR & TEXT REVIEW PANEL */}
      {activeTab === 'review' && (
        <div className="space-y-4">
          <div className="bg-amber-950/30 border border-amber-800/40 p-4 rounded-2xl text-xs text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-1">
                আইনি সত্যতা ও যাচাইকরণ নীতি (Mandatory Policy):
              </strong>
              <span>
                স্ক্যান করা পিডিএফ থেকে সরাসরি এক্সট্রাক্ট করা কোনো ওসিআর (OCR) আউটপুটকে স্বয়ংক্রিয়ভাবে চূড়ান্ত আইনি বিধান হিসেবে প্রকাশ করা যাবে না। প্রতিটি ধারা ও শব্দ প্রশাসনিকভাবে মূল মুদ্রিত সরকারি গেজেটের সাথে মিলিয়ে যাচাই করার পর প্রকাশে অনুমোদন দিন।
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {laws
              .filter((l) => l.status === 'needs_correction' || l.status === 'in_review')
              .map((law) => (
                <div
                  key={law.id}
                  className="bg-[#151F30] border border-slate-800 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif-bengali text-base font-bold text-[#F8FAFC]">
                          {law.titleBengali}
                        </h3>
                        {law.pdfIsOcr && (
                          <span className="text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800/60 px-2 py-0.5 rounded">
                            OCR নির্ভর (আস্থা: {law.ocrConfidence}%)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#AAB4C3]">
                        ফাইল: {law.pdfFileName} · মোট {law.totalSections} ধারা
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenReader(law.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#0B1220] hover:bg-[#1A263D] border border-slate-700 text-xs text-[#AAB4C3]"
                      >
                        পাঠ ও পরিদর্শন
                      </button>

                      <button
                        onClick={() => handleStatusUpdate(law.id, 'published')}
                        className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-[#0B1220] font-bold text-xs"
                      >
                        অনুমোদিত ও প্রকাশ করুন
                      </button>
                    </div>
                  </div>

                  {law.needsCorrectionReason && (
                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 text-xs text-amber-300">
                      <strong>সংশোধন নোট:</strong> {law.needsCorrectionReason}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-[#0B1220] border border-slate-800 text-xs text-[#AAB4C3] font-serif-bengali max-h-28 overflow-y-auto">
                    {law.chapters[0]?.sections[0]?.contentBengali || 'টেক্সট দেখতে পরিদর্শন করুন'}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: STATS & DATABASE HEALTH */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#151F30] border border-slate-800 space-y-1">
            <div className="text-xs text-[#AAB4C3]">মোট আইন সংখ্যা</div>
            <div className="text-3xl font-bold font-mono text-[#F8FAFC]">{laws.length}</div>
            <div className="text-[11px] text-[#D4AF37]">সকল সরকারি প্রকাশনা</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#151F30] border border-slate-800 space-y-1">
            <div className="text-xs text-[#AAB4C3]">প্রকাশিত আইন</div>
            <div className="text-3xl font-bold font-mono text-emerald-400">
              {laws.filter((l) => l.status === 'published').length}
            </div>
            <div className="text-[11px] text-emerald-500">অনলাইন পাঠকদের জন্য উন্মুক্ত</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#151F30] border border-slate-800 space-y-1">
            <div className="text-xs text-[#AAB4C3]">যাচাই বা সংশোধনধীন</div>
            <div className="text-3xl font-bold font-mono text-amber-400">
              {laws.filter((l) => l.status !== 'published').length}
            </div>
            <div className="text-[11px] text-amber-500">ওসিআর ও প্রুফরিডিং বাকি</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#151F30] border border-slate-800 space-y-1">
            <div className="text-xs text-[#AAB4C3]">মোট ইনডেক্সকৃত ধারা</div>
            <div className="text-3xl font-bold font-mono text-[#D4AF37]">
              {laws.reduce((acc, l) => acc + l.totalSections, 0)}
            </div>
            <div className="text-[11px] text-[#AAB4C3]">ফুল-টেক্সট সার্চযোগ্য</div>
          </div>
        </div>
      )}
    </div>
  );
};
