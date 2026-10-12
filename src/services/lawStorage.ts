/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Law, Category, Bookmark, ReadingHistoryItem, UserProfile, SearchResult, Section } from '../types/law';
import { INITIAL_LAWS, INITIAL_CATEGORIES } from '../data/initialLaws';

const STORAGE_KEYS = {
  LAWS: 'bd_law_library_laws_v3',
  CATEGORIES: 'bd_law_library_categories_v2',
  BOOKMARKS: 'bd_law_library_bookmarks_v1',
  HISTORY: 'bd_law_library_history_v1',
  USER: 'bd_law_library_user_v1',
  ADMIN_AUTH: 'bd_law_library_admin_auth_v1',
};

export const lawStorage = {
  getLaws(): Law[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAWS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.LAWS, JSON.stringify(INITIAL_LAWS));
        return INITIAL_LAWS;
      }
      const parsed: Law[] = JSON.parse(data);
      // Synchronize crpc-1898, penal-code-1860 and constitution-1972 if sections are updated
      const syncLawIds = ['crpc-1898', 'penal-code-1860', 'constitution-1972'];
      let updatedStorage = false;
      for (const syncId of syncLawIds) {
        const lawIndex = parsed.findIndex((l) => l.id === syncId);
        const lawFresh = INITIAL_LAWS.find((l) => l.id === syncId);
        const existingSecCount = parsed[lawIndex]?.chapters?.flatMap((c) => c.sections).length || 0;
        const freshSecCount = lawFresh?.chapters?.flatMap((c) => c.sections).length || 0;
        if (lawFresh && (lawIndex < 0 || existingSecCount < freshSecCount)) {
          if (lawIndex >= 0) {
            parsed[lawIndex] = lawFresh;
          } else {
            parsed.push(lawFresh);
          }
          updatedStorage = true;
        }
      }
      if (updatedStorage) {
        localStorage.setItem(STORAGE_KEYS.LAWS, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_LAWS;
    }
  },

  getLawById(id: string): Law | undefined {
    const laws = this.getLaws();
    return laws.find((l) => l.id === id);
  },

  saveLaw(law: Law): void {
    const laws = this.getLaws();
    const index = laws.findIndex((l) => l.id === law.id);
    if (index >= 0) {
      laws[index] = { ...law, lastUpdated: new Date().toISOString().split('T')[0] };
    } else {
      laws.unshift(law);
    }
    localStorage.setItem(STORAGE_KEYS.LAWS, JSON.stringify(laws));
  },

  deleteLaw(id: string): void {
    const laws = this.getLaws().filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LAWS, JSON.stringify(laws));
  },

  updateLawStatus(id: string, status: Law['status'], reason?: string): void {
    const laws = this.getLaws();
    const target = laws.find((l) => l.id === id);
    if (target) {
      target.status = status;
      if (reason !== undefined) {
        target.needsCorrectionReason = reason;
      }
      target.lastUpdated = new Date().toISOString().split('T')[0];
      localStorage.setItem(STORAGE_KEYS.LAWS, JSON.stringify(laws));
    }
  },

  incrementViewCount(lawId: string): void {
    const laws = this.getLaws();
    const target = laws.find((l) => l.id === lawId);
    if (target) {
      target.viewCount = (target.viewCount || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.LAWS, JSON.stringify(laws));
    }
  },

  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
        return INITIAL_CATEGORIES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CATEGORIES;
    }
  },

  getBookmarks(): Bookmark[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isBookmarked(sectionId: string): boolean {
    const bookmarks = this.getBookmarks();
    return bookmarks.some((b) => b.sectionId === sectionId);
  },

  toggleBookmark(
    law: Law,
    section: Section,
    note?: string
  ): boolean {
    const bookmarks = this.getBookmarks();
    const existingIndex = bookmarks.findIndex((b) => b.sectionId === section.id);
    if (existingIndex >= 0) {
      bookmarks.splice(existingIndex, 1);
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return false; // removed
    } else {
      const newBookmark: Bookmark = {
        id: `bm-${Date.now()}`,
        lawId: law.id,
        lawTitleBengali: law.titleBengali,
        sectionId: section.id,
        sectionNumberBengali: section.sectionNumberBengali,
        sectionTitleBengali: section.titleBengali,
        excerptBengali: section.contentBengali.slice(0, 140) + '...',
        createdAt: new Date().toLocaleDateString('bn-BD'),
        note: note || '',
      };
      bookmarks.unshift(newBookmark);
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return true; // added
    }
  },

  removeBookmark(bookmarkId: string): void {
    const bookmarks = this.getBookmarks().filter((b) => b.id !== bookmarkId);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  },

  getHistory(): ReadingHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToHistory(law: Law, section: Section): void {
    const history = this.getHistory().filter((h) => h.sectionId !== section.id);
    const item: ReadingHistoryItem = {
      id: `hist-${Date.now()}`,
      lawId: law.id,
      lawTitleBengali: law.titleBengali,
      sectionId: section.id,
      sectionNumberBengali: section.sectionNumberBengali,
      sectionTitleBengali: section.titleBengali,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    };
    history.unshift(item);
    // keep max 25 items
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.slice(0, 25)));
  },

  clearHistory(): void {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
  },

  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    const defaultUser: UserProfile = {
      id: 'usr-default',
      name: 'আইন গবেষক',
      email: 'researcher@lawlibrary.bd',
      role: 'citizen',
      joinedDate: '২০২৪-০১-১৫',
      fontSize: 'medium',
      readingTheme: 'dark',
    };
    return defaultUser;
  },

  saveUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  isAdminAuthenticated(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  },

  setAdminAuthenticated(auth: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, auth ? 'true' : 'false');
    const user = this.getUser();
    if (auth) {
      user.role = 'admin';
    } else if (user.role === 'admin') {
      user.role = 'lawyer';
    }
    this.saveUser(user);
  },

  searchLaws(query: string, categoryId?: string, yearMin?: number, yearMax?: number): SearchResult[] {
    const laws = this.getLaws().filter((l) => l.status === 'published');
    const trimmed = query.trim().toLowerCase();
    const results: SearchResult[] = [];

    // Helper to check match
    for (const law of laws) {
      if (categoryId && categoryId !== 'all' && law.categoryId !== categoryId) {
        continue;
      }
      if (yearMin && law.enactmentYear < yearMin) continue;
      if (yearMax && law.enactmentYear > yearMax) continue;

      if (!trimmed) {
        // Return laws overview if empty query
        continue;
      }

      // Check law title match
      if (
        law.titleBengali.toLowerCase().includes(trimmed) ||
        law.titleEnglish.toLowerCase().includes(trimmed) ||
        law.actNumberBengali.toLowerCase().includes(trimmed)
      ) {
        results.push({
          law,
          matchType: 'law_title',
          excerptBengali: law.preambleBengali.slice(0, 160) + '...',
        });
      }

      const bnDigits = '০১২৩৪৫৬৭৮৯';
      const toEnDigits = (s: string) => s.replace(/[০-৯]/g, (d) => bnDigits.indexOf(d).toString());
      const toBnDigits = (s: string) => s.replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
      const trimmedEn = toEnDigits(trimmed);
      const trimmedBn = toBnDigits(trimmed);

      // Check sections
      for (const ch of law.chapters) {
        for (const sec of ch.sections) {
          const secEn = toEnDigits(sec.sectionNumber.toLowerCase());
          const secBn = toBnDigits(sec.sectionNumber.toLowerCase());

          const secNumMatch =
            sec.sectionNumber.toLowerCase() === trimmed ||
            sec.sectionNumber.toLowerCase() === trimmedEn ||
            sec.sectionNumberBengali.toLowerCase().includes(trimmed) ||
            sec.sectionNumberBengali.toLowerCase().includes(trimmedBn) ||
            trimmed === secEn ||
            trimmed === secBn ||
            trimmedEn === secEn ||
            trimmedBn === secBn ||
            (trimmed.startsWith('ধারা') && (sec.sectionNumberBengali.includes(trimmed.replace('ধারা', '').trim()) || secEn === toEnDigits(trimmed.replace('ধারা', '').trim()))) ||
            (trimmed.startsWith('অনুচ্ছেদ') && (sec.sectionNumberBengali.includes(trimmed.replace('অনুচ্ছেদ', '').trim()) || secEn === toEnDigits(trimmed.replace('অনুচ্ছেদ', '').trim())));

          const titleMatch = sec.titleBengali.toLowerCase().includes(trimmed) || (sec.titleEnglish && sec.titleEnglish.toLowerCase().includes(trimmed));
          const contentMatch = sec.contentBengali.toLowerCase().includes(trimmed);

          if (secNumMatch) {
            results.push({
              law,
              chapter: ch,
              section: sec,
              matchType: 'section_number',
              excerptBengali: sec.contentBengali.slice(0, 160) + '...',
            });
          } else if (titleMatch) {
            results.push({
              law,
              chapter: ch,
              section: sec,
              matchType: 'section_title',
              excerptBengali: sec.contentBengali.slice(0, 160) + '...',
            });
          } else if (contentMatch) {
            // Find snippet around matched term
            const idx = sec.contentBengali.toLowerCase().indexOf(trimmed);
            const start = Math.max(0, idx - 40);
            const end = Math.min(sec.contentBengali.length, idx + trimmed.length + 80);
            const snippet = (start > 0 ? '...' : '') + sec.contentBengali.slice(start, end) + (end < sec.contentBengali.length ? '...' : '');

            results.push({
              law,
              chapter: ch,
              section: sec,
              matchType: 'content',
              excerptBengali: snippet,
            });
          }
        }
      }
    }

    return results;
  },

  // Simulates processing and text extraction of an uploaded PDF
  processPdfUpload(params: {
    titleBengali: string;
    titleEnglish: string;
    actNumberBengali: string;
    enactmentYear: number;
    categoryId: string;
    fileName: string;
    fileSize: string;
    isScannedPdf: boolean;
    extractedRawText: string;
  }): Law {
    const categories = this.getCategories();
    const cat = categories.find((c) => c.id === params.categoryId);
    const catName = cat ? cat.nameBengali : 'বিশেষ আইন';

    // Parse sections from extracted text or create default structured sections
    const lines = params.extractedRawText.split('\n').filter((l) => l.trim().length > 0);
    const sections: Section[] = [];

    // Simple heuristic parser for Bengali section headers like "ধারা ১:", "ধারা ২.", "অনুচ্ছেদ ১"
    let currentSec: Partial<Section> | null = null;
    let secCounter = 1;

    for (const line of lines) {
      const match = line.match(/^(ধারা|অনুচ্ছেদ)\s+([০-৯0-9]+)[:.-]?\s*(.*)$/);
      if (match) {
        if (currentSec && currentSec.titleBengali && currentSec.contentBengali) {
          sections.push(currentSec as Section);
        }
        const num = match[2];
        const title = match[3] || `ধারা ${num}`;
        currentSec = {
          id: `sec-${Date.now()}-${secCounter++}`,
          sectionNumber: num,
          sectionNumberBengali: `ধারা ${num}`,
          titleBengali: title.trim(),
          contentBengali: '',
          isLandmark: false,
        };
      } else if (currentSec) {
        currentSec.contentBengali = (currentSec.contentBengali ? currentSec.contentBengali + '\n' : '') + line;
      }
    }
    if (currentSec && currentSec.titleBengali && currentSec.contentBengali) {
      sections.push(currentSec as Section);
    }

    // If no explicit section pattern was found, create sample structured sections from text paragraphs
    if (sections.length === 0) {
      sections.push({
        id: `sec-${Date.now()}-1`,
        sectionNumber: '1',
        sectionNumberBengali: 'ধারা ১',
        titleBengali: 'সংক্ষিপ্ত শিরোনাম ও প্রবর্তন',
        contentBengali: `(১) এই আইন ${params.titleBengali} নামে অভিহিত হইবে।\n(২) ইহা অনতিবিলম্বে কার্যকর হইবে।`,
        isLandmark: true,
      });
      sections.push({
        id: `sec-${Date.now()}-2`,
        sectionNumber: '2',
        sectionNumberBengali: 'ধারা ২',
        titleBengali: 'সংজ্ঞাসমূহ',
        contentBengali: 'বিষয় বা প্রসঙ্গের পরিপন্থী কিছু না থাকিলে এই আইনে সংজ্ঞায়িত পরিভাষা নির্ধারিত অর্থ বহন করিবে।\n\n' + (params.extractedRawText.slice(0, 300) || 'আইনের সংজ্ঞাসমূহ বিস্তারিত বর্ণিত রহিয়াছে।'),
        isLandmark: false,
      });
    }

    const ocrConfidence = params.isScannedPdf ? 82 : 98;
    const status: Law['status'] = params.isScannedPdf ? 'needs_correction' : 'in_review';
    const reason = params.isScannedPdf
      ? 'স্ক্যান করা গ্যাজেট থেকে ওসিআর (OCR) রূপান্তর সম্পন্ন হয়েছে। কিছু টেক্সটে হরফ অসঙ্গতি থাকতে পারে। প্রকাশের পূর্বে অনুমোদিত প্রশাসকের ম্যানুয়াল যাচাই আবশ্যক।'
      : undefined;

    const newLaw: Law = {
      id: `law-${Date.now()}`,
      titleBengali: params.titleBengali,
      titleEnglish: params.titleEnglish,
      actNumberBengali: params.actNumberBengali,
      enactmentYear: params.enactmentYear,
      enactmentYearBengali: params.enactmentYear.toString(),
      categoryId: params.categoryId,
      categoryNameBengali: catName,
      preambleBengali: `যেহেতু ${params.titleBengali} প্রণয়ন করা সমীচীন ও আবশ্যক; সেহেতু নিম্নরূপ আইন করা হইল—`,
      totalSections: sections.length,
      status,
      pdfFileName: params.fileName,
      pdfFileSize: params.fileSize,
      pdfIsOcr: params.isScannedPdf,
      ocrConfidence,
      needsCorrectionReason: reason,
      lastUpdated: new Date().toISOString().split('T')[0],
      viewCount: 1,
      chapters: [
        {
          id: `ch-${Date.now()}-1`,
          numberBengali: 'অধ্যায় ১',
          titleBengali: 'সাধারণ বিধানাবলি',
          sections,
        },
      ],
    };

    this.saveLaw(newLaw);
    return newLaw;
  },
};
