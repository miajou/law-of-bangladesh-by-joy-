/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LawStatus = 'published' | 'in_review' | 'needs_correction' | 'draft';

export interface Section {
  id: string;
  sectionNumber: string; // e.g. "54", "302", "27"
  sectionNumberBengali: string; // e.g. "ধারা ৫৪", "অনুচ্ছেদ ২৭"
  titleBengali: string;
  titleEnglish?: string;
  contentBengali: string;
  contentEnglish?: string;
  explanationBengali?: string;
  penaltySummaryBengali?: string;
  isLandmark?: boolean;
  bailable?: boolean; // For criminal offenses
  cognizable?: boolean;
}

export interface Chapter {
  id: string;
  numberBengali: string; // e.g. "অধ্যায় ১", "প্রথম খণ্ড"
  titleBengali: string;
  titleEnglish?: string;
  sections: Section[];
}

export interface Law {
  id: string;
  titleBengali: string;
  titleEnglish: string;
  actNumberBengali: string; // e.g. "১৮৬০ সালের ৪৫ নং আইন"
  enactmentYear: number;
  enactmentYearBengali: string; // e.g. "১৮৬০"
  categoryId: string;
  categoryNameBengali: string;
  preambleBengali: string;
  totalSections: number;
  status: LawStatus;
  pdfFileName?: string;
  pdfFileSize?: string;
  pdfUrl?: string;
  pdfIsOcr?: boolean;
  ocrConfidence?: number; // percentage 0-100
  needsCorrectionReason?: string;
  chapters: Chapter[];
  lastUpdated: string;
  viewCount?: number;
}

export interface Category {
  id: string;
  nameBengali: string;
  nameEnglish: string;
  iconName: string;
  count: number;
  descriptionBengali: string;
}

export interface Bookmark {
  id: string;
  lawId: string;
  lawTitleBengali: string;
  sectionId: string;
  sectionNumberBengali: string;
  sectionTitleBengali: string;
  excerptBengali: string;
  createdAt: string;
  note?: string;
}

export interface ReadingHistoryItem {
  id: string;
  lawId: string;
  lawTitleBengali: string;
  sectionId: string;
  sectionNumberBengali: string;
  sectionTitleBengali: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'lawyer' | 'admin';
  joinedDate: string;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  readingTheme: 'dark' | 'ivory';
}

export interface SearchResult {
  law: Law;
  section?: Section;
  chapter?: Chapter;
  matchType: 'law_title' | 'section_number' | 'section_title' | 'content';
  excerptBengali: string;
}
