// scripts/generate_complete_crpc.cjs
const fs = require('fs');
const path = require('path');

function toBn(num) {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
}

// Master list of all chapters in CrPC 1898
const CHAPTER_DEFINITIONS = [
  { id: 'crpc-ch-1', numBn: 'অধ্যায় ১', titleBn: 'প্রারম্ভিক বিধানাবলি', titleEn: 'Preliminary', min: 1, max: 5 },
  { id: 'crpc-ch-2', numBn: 'অধ্যায় ২', titleBn: 'ফৌজদারি আদালত ও কার্যালয়সমূহের গঠন', titleEn: 'Constitution of Criminal Courts and Offices', min: 6, max: 27 },
  { id: 'crpc-ch-3', numBn: 'অধ্যায় ৩', titleBn: 'আদালতের ক্ষমতা ও দণ্ড প্রদানের এখতিয়ার', titleEn: 'Powers of Courts', min: 28, max: 41 },
  { id: 'crpc-ch-4', numBn: 'অধ্যায় ৪', titleBn: 'ম্যাজিস্ট্রেট ও পুলিশকে সহায়তা ও তথ্য প্রদান', titleEn: 'Of Aid and Information to the Magistrates and Police', min: 42, max: 45 },
  { id: 'crpc-ch-5', numBn: 'অধ্যায় ৫', titleBn: 'গ্রেফতার, পলায়ন ও পুনর্গ্রেফতার', titleEn: 'Of Arrest, Escape and Retaking', min: 46, max: 67 },
  { id: 'crpc-ch-6', numBn: 'অধ্যায় ৬', titleBn: 'আদালতে হাজির করাইবার পরোয়ানা ও সমন', titleEn: 'Of Processes to Compel Appearance', min: 68, max: 93 },
  { id: 'crpc-ch-7', numBn: 'অধ্যায় ৭', titleBn: 'দলিল ও সম্পত্তি দাখিলে বাধ্য করিবার প্রক্রিয়া এবং তল্লাশি পরোয়ানা', titleEn: 'Of Processes to Compel Production of Documents and Property', min: 94, max: 105 },
  { id: 'crpc-ch-8', numBn: 'অধ্যায় ৮', titleBn: 'শান্তি রক্ষা ও সদাচরণের মুচলেকা', titleEn: 'Of Security for Keeping the Peace and for Good Behaviour', min: 106, max: 126 },
  { id: 'crpc-ch-9', numBn: 'অধ্যায় ৯', titleBn: 'বেআইনি সমাবেশ ছত্রভঙ্গকরণ', titleEn: 'Unlawful Assemblies', min: 127, max: 132 },
  { id: 'crpc-ch-10', numBn: 'অধ্যায় ১০', titleBn: 'গণউৎপাত ও গণউপদ্রব অপসারণ', titleEn: 'Public Nuisances', min: 133, max: 143 },
  { id: 'crpc-ch-11', numBn: 'অধ্যায় ১১', titleBn: 'জরুরি ক্ষেত্রে তাৎক্ষণিক আদেশ (১৪৪ ধারা)', titleEn: 'Urgent Cases of Nuisance or Apprehended Danger (Section 144)', min: 144, max: 144 },
  { id: 'crpc-ch-12', numBn: 'অধ্যায় ১২', titleBn: 'স্থাবর সম্পত্তি সংক্রান্ত বিরোধ ও দখল রক্ষা (১৪৫ ধারা)', titleEn: 'Disputes as to Immoveable Property (Section 145)', min: 145, max: 148 },
  { id: 'crpc-ch-13', numBn: 'অধ্যায় ১৩', titleBn: 'পুলিশের নিবারক কার্যক্রম', titleEn: 'Preventive Action of the Police', min: 149, max: 153 },
  { id: 'crpc-ch-14', numBn: 'অধ্যায় ১৪', titleBn: 'পুলিশকে তথ্য প্রদান ও তদন্তের ক্ষমতা (এজাহার, ১৬১ ও ১৬৪ ধারা)', titleEn: 'Information to the Police and Powers to Investigate', min: 154, max: 176 },
  { id: 'crpc-ch-15', numBn: 'অধ্যায় ১৫', titleBn: 'অপরাধের অনুসন্ধান ও বিচারে আদালতের আঞ্চলিক এখতিয়ার ও আমলে গ্রহণ (১৯০ ধারা)', titleEn: 'Jurisdiction of Criminal Courts in Inquiries and Trials', min: 177, max: 199 },
  { id: 'crpc-ch-16', numBn: 'অধ্যায় ১৬', titleBn: 'ম্যাজিস্ট্রেটের নিকট নালিশ ও অনুসন্ধান (২০০ ও ২০২ ধারা)', titleEn: 'Of Complaints to Magistrates', min: 200, max: 203 },
  { id: 'crpc-ch-17', numBn: 'অধ্যায় ১৭', titleBn: 'ম্যাজিস্ট্রেটের নিকট কার্যধারা প্রারম্ভ ও সমন-পরোয়ানা জারি', titleEn: 'Commencement of Proceedings before Magistrates', min: 204, max: 205 },
  { id: 'crpc-ch-18', numBn: 'অধ্যায় ১৮', titleBn: 'দায়রা আদালতে সমর্পণ অনুসন্ধান [রহিত]', titleEn: 'Preliminary Inquiry into Cases Triable by Court of Session (Repealed)', min: 206, max: 220 },
  { id: 'crpc-ch-19', numBn: 'অধ্যায় ১৯', titleBn: 'চার্জ বা অভিযোগ গঠন ও উহার রূপ', titleEn: 'Of the Charge', min: 221, max: 240 },
  { id: 'crpc-ch-20', numBn: 'অধ্যায় ২০', titleBn: 'ম্যাজিস্ট্রেট আদালত কর্তৃক মামলার বিচারপদ্ধতি (২৪১ক হইতে ২৫০ ধারা)', titleEn: 'Of the Trial of Cases by Magistrates', min: 241, max: 250 },
  { id: 'crpc-ch-21', numBn: 'অধ্যায় ২১', titleBn: 'ম্যাজিস্ট্রেট কর্তৃক ওয়ারেন্ট মামলার বিচার [রহিত]', titleEn: 'Trial of Warrant Cases by Magistrates (Repealed)', min: 251, max: 259 },
  { id: 'crpc-ch-22', numBn: 'অধ্যায় ২২', titleBn: 'সংক্ষিপ্ত বিচারপদ্ধতি (Summary Trials)', titleEn: 'Of Summary Trials', min: 260, max: 265 },
  { id: 'crpc-ch-22a', numBn: 'অধ্যায় ২২ক', titleBn: 'দায়রা আদালত ও হাইকোর্ট বিভাগে বিচার পরিচালনা (২৬৫ক হইতে ২৬৫ট)', titleEn: 'Trials before High Court Division and Courts of Session', min: 9991, max: 9991 }, // Special sub-chapter
  { id: 'crpc-ch-23', numBn: 'অধ্যায় ২৩', titleBn: 'জুরি ও অ্যাসেসর সহযোগে বিচার [রহিত]', titleEn: 'Trials by Jury and with Assessors (Repealed)', min: 266, max: 336 },
  { id: 'crpc-ch-24', numBn: 'অধ্যায় ২৪', titleBn: 'অনুসন্ধান ও বিচারে সাধারণ বিধানাবলি (৩৪২ ধারা, ৩৩৯খ অনুপস্থিতিতে বিচার)', titleEn: 'General Provisions as to Inquiries and Trials', min: 337, max: 352 },
  { id: 'crpc-ch-25', numBn: 'অধ্যায় ২৫', titleBn: 'সাক্ষ্য গ্রহণ ও লিপিবদ্ধকরণের পদ্ধতি', titleEn: 'Of the Mode of Taking and Recording Evidence', min: 353, max: 365 },
  { id: 'crpc-ch-26', numBn: 'অধ্যায় ২৬', titleBn: 'রায় প্রদান ও রায়ের বিষয়বস্তু', titleEn: 'Of the Judgment', min: 366, max: 373 },
  { id: 'crpc-ch-27', numBn: 'অধ্যায় ২৭', titleBn: 'ডেথ রেফারেন্স ও মৃত্যুদণ্ডাদেশ অনুমোদন (৩৭৪ ধারা)', titleEn: 'Submission of Sentences for Confirmation', min: 374, max: 380 },
  { id: 'crpc-ch-28', numBn: 'অধ্যায় ২৮', titleBn: 'দণ্ড কার্যকরকরণ, পরোয়ানা ও অর্থদণ্ড আদায়', titleEn: 'Of Execution', min: 381, max: 400 },
  { id: 'crpc-ch-29', numBn: 'অধ্যায় ২৯', titleBn: 'দণ্ড স্থগিত, মওকুফ, রূপান্তর ও দোবারা দোষমুক্তি (৪০৩ ধারা)', titleEn: 'Suspensions, Remissions and Commutations of Sentences', min: 401, max: 403 },
  { id: 'crpc-ch-31', numBn: 'অধ্যায় ৩১', titleBn: 'আপিল সংক্রান্ত বিধানাবলি (৪০৪ হইতে ৪৩১ ধারা)', titleEn: 'Of Appeals', min: 404, max: 431 },
  { id: 'crpc-ch-32', numBn: 'অধ্যায় ৩২', titleBn: 'রেফারেন্স ও রিভিশন (৪৩৫ ও ৪৩৯ ধারা)', titleEn: 'Of Reference and Revision', min: 432, max: 442 },
  { id: 'crpc-ch-33', numBn: 'অধ্যায় ৩৩', titleBn: 'ইউরোপীয় ও আমেরিকান নাগরিকদের বিচার [রহিত]', titleEn: 'Special Proceedings Relating to Europeans and Americans (Repealed)', min: 443, max: 463 },
  { id: 'crpc-ch-34', numBn: 'অধ্যায় ৩৪', titleBn: 'অপ্রকৃতিস্থ ও মানসিক ভারসাম্যহীন আসামির বিচার', titleEn: 'Lunatics', min: 464, max: 475 },
  { id: 'crpc-ch-35', numBn: 'অধ্যায় ৩৫', titleBn: 'আদালত অবমাননা ও বিচার প্রশাসন বিরোধী অপরাধের বিচার (৪৭৬ ও ৪৮০ ধারা)', titleEn: 'Proceedings in Case of Offences Affecting Administration of Justice', min: 476, max: 487 },
  { id: 'crpc-ch-36', numBn: 'অধ্যায় ৩৬', titleBn: 'স্ত্রী ও সন্তানের ভরণপোষণ [রহিত]', titleEn: 'Of the Maintenance of Wives and Children (Repealed)', min: 488, max: 490 },
  { id: 'crpc-ch-37', numBn: 'অধ্যায় ৩৭', titleBn: 'হেবিয়াস কর্পাস নির্দেশ ও অবৈধ বন্দিমুক্তি (৪৯১ ধারা)', titleEn: 'Directions of the Nature of a Habeas Corpus', min: 491, max: 491 },
  { id: 'crpc-ch-38', numBn: 'অধ্যায় ৩৮', titleBn: 'পাবলিক প্রসিকিউটর ও প্রসিকিউশন পরিচালনা (৪৯২ হইতে ৪৯৫ ধারা)', titleEn: 'Of the Public Prosecutor', min: 492, max: 495 },
  { id: 'crpc-ch-39', numBn: 'অধ্যায় ৩৯', titleBn: 'জামিন ও জামিননামা (৪৯৬, ৪৯৭ ও ৪৯৮ ধারা)', titleEn: 'Of Bail', min: 496, max: 502 },
  { id: 'crpc-ch-40', numBn: 'অধ্যায় ৪০', titleBn: 'সাক্ষীর জন্য কমিশন জারি', titleEn: 'Commissions for Examination of Witnesses', min: 503, max: 508 },
  { id: 'crpc-ch-41', numBn: 'অধ্যায় ৪১', titleBn: 'বিশেষ সাক্ষ্য বিধি (ডাক্তার, রাসায়নিক পরীক্ষক ও পলাতক আসামির সাক্ষ্য)', titleEn: 'Special Rules of Evidence', min: 509, max: 512 },
  { id: 'crpc-ch-42', numBn: 'অধ্যায় ৪২', titleBn: 'মুচলেকা ও জামিননামা বন্ড সংক্রান্ত বিধান', titleEn: 'Provisions as to Bonds', min: 513, max: 516 },
  { id: 'crpc-ch-43', numBn: 'অধ্যায় ৪৩', titleBn: 'জব্দকৃত সম্পত্তি বিলিবণ্টন ও জিম্মা (৫১৬ক হইতে ৫২৫ ধারা)', titleEn: 'Of the Disposal of Property', min: 517, max: 525 }, // 516A will be placed here
  { id: 'crpc-ch-44', numBn: 'অধ্যায় ৪৪', titleBn: 'ফৌজদারি মামলা স্থানান্তর (৫২৬ ও ৫২৬খ ধারা)', titleEn: 'Of the Transfer of Criminal Cases', min: 526, max: 528 },
  { id: 'crpc-ch-45', numBn: 'অধ্যায় ৪৫', titleBn: 'অনিয়মিত কার্যধারা ও উহার ফলাফল (৫২৯ হইতে ৫৩৮ ধারা)', titleEn: 'Of Irregular Proceedings', min: 529, max: 538 },
  { id: 'crpc-ch-46', numBn: 'অধ্যায় ৪৬', titleBn: 'বিবিধ ক্ষমতা ও হাইকোর্ট বিভাগের সহজাত ক্ষমতা (৫৪০, ৫৪৪ ও ৫৬১ক ধারা)', titleEn: 'Miscellaneous & Inherent Powers', min: 539, max: 565 },
];

function findChapterForSec(secNum) {
  const num = parseInt(secNum, 10);
  if (isNaN(num)) return CHAPTER_DEFINITIONS[0];
  
  // Chapter 22A for 265A-265N
  if (String(secNum).startsWith('265') && secNum.length > 3) {
    return CHAPTER_DEFINITIONS.find(c => c.id === 'crpc-ch-22a');
  }
  // Section 516A is in Chapter 43
  if (secNum === '516A') {
    return CHAPTER_DEFINITIONS.find(c => c.id === 'crpc-ch-43');
  }

  for (const ch of CHAPTER_DEFINITIONS) {
    if (num >= ch.min && num <= ch.max) {
      return ch;
    }
  }
  return CHAPTER_DEFINITIONS[CHAPTER_DEFINITIONS.length - 1];
}

console.log("Chapter lookup helper ready");
