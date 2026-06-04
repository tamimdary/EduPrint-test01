/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppLanguage, EduDocument } from '../types';
import { translationData } from '../translations';
import { 
  Search, 
  Trash2, 
  FileText, 
  FileSpreadsheet, 
  GraduationCap, 
  Eye, 
  Cloud, 
  CloudOff, 
  Plus, 
  Clock 
} from 'lucide-react';

interface DocumentListProps {
  currentLang: AppLanguage;
  documents: EduDocument[];
  onOpenDoc: (doc: EduDocument) => void;
  onDeleteDoc: (id: string) => void;
  onSyncDoc: (doc: EduDocument) => Promise<void>;
  onTriggerCreateTab: (tab: 'notice' | 'question' | 'result') => void;
}

export default function DocumentList({
  currentLang,
  documents,
  onOpenDoc,
  onDeleteDoc,
  onSyncDoc,
  onTriggerCreateTab,
}: DocumentListProps) {
  const t = translationData[currentLang];
  const isArabic = currentLang === 'ar';
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter(doc => {
    const term = searchQuery.toLowerCase();
    const instMatch = doc.institutionName?.toLowerCase().includes(term);
    let titleMatch = false;

    if (doc.type === 'notice') {
      titleMatch = doc.noticeTitle?.toLowerCase().includes(term);
    } else if (doc.type === 'question') {
      titleMatch = doc.subjectName?.toLowerCase().includes(term) || doc.examName?.toLowerCase().includes(term);
    } else if (doc.type === 'result') {
      titleMatch = doc.studentName?.toLowerCase().includes(term);
    }

    return instMatch || titleMatch;
  });

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString(currentLang === 'bn' ? 'bn-BD' : currentLang === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'notice':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'question':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'result':
        return <GraduationCap className="w-5 h-5 text-indigo-600" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case 'notice':
        return isArabic ? 'تعميم الإعلان' : currentLang === 'bn' ? 'নোটিশ' : 'Notice';
      case 'question':
        return isArabic ? 'ورقة اختبار' : currentLang === 'bn' ? 'প্রশ্নপত্র' : 'Question';
      case 'result':
        return isArabic ? 'شهادة علامات' : currentLang === 'bn' ? 'ফলাফল শীট' : 'Result';
      default:
        return '';
    }
  };

  const getDocHeading = (doc: EduDocument) => {
    if (doc.type === 'notice') return doc.noticeTitle;
    if (doc.type === 'question') return `${doc.subjectName} (${doc.examName})`;
    if (doc.type === 'result') return `${doc.studentName} [Roll ${doc.rollNumber}]`;
    return '';
  };

  return (
    <div className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Search Bar Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          id="search-input-field"
          type="text"
          placeholder={t.searchDocs}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none focus:outline-none text-sm text-slate-700"
        />
      </div>

      {filteredDocs.length === 0 ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-150 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-700">
              {isArabic ? 'أولا قم بمطابقة اسم ورقة في القائمة' : currentLang === 'bn' ? 'কোনো সংরক্ষিত ডকুমেন্ট মেলেনি।' : 'No matches found.'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isArabic ? 'لم نعثر على أي تعاميم أو كشوفات تطابق عبارة البحث الخاصة بك.' : currentLang === 'bn' ? 'আপনার সার্চ করা শব্দের সাথে কোনো ফাইল মেলেনি। পুনরায় ট্রাই করুন।' : "We couldn't find any notices, question papers, or report cards."}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-1.5">
            <button
              id="empty-add-notice"
              onClick={() => onTriggerCreateTab('notice')}
              className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg font-semibold transition hover:bg-indigo-100 cursor-pointer"
            >
              + {t.noticeBuilder}
            </button>
            <button
              id="empty-add-question"
              onClick={() => onTriggerCreateTab('question')}
              className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg font-semibold transition hover:bg-indigo-100 cursor-pointer"
            >
              + {t.questionBuilder}
            </button>
            <button
              id="empty-add-result"
              onClick={() => onTriggerCreateTab('result')}
              className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg font-semibold transition hover:bg-indigo-100 cursor-pointer"
            >
              + {t.resultGenerator}
            </button>
          </div>
        </div>
      ) : (
        /* Real Grid Layout cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              id={`card-saved-${doc.id}`}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-indigo-300 shadow-sm transition flex flex-col justify-between"
            >
              {/* Header types with sync cloud indicators */}
              <div className="flex justify-between items-start mb-3 gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl shrink-0">
                    {getDocIcon(doc.type)}
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">
                      {getDocTypeLabel(doc.type)}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 block underline underline-offset-2 mt-0.5 max-w-xs truncate font-mono">
                      {doc.institutionName}
                    </span>
                  </div>
                </div>

                {/* Database Sync Status Indicators and Manual synchronization pushes */}
                <button
                  id={`btn-sync-${doc.id}`}
                  onClick={() => onSyncDoc(doc)}
                  className="p-1 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                  title={doc.isSynced ? 'Synced online to Google Sheet' : 'Saved offline on device. Tap to Sync.'}
                >
                  {doc.isSynced ? (
                    <Cloud className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <CloudOff className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Central Title details */}
              <div className="mb-4">
                <h3 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-2">
                  {getDocHeading(doc)}
                </h3>
              </div>

              {/* Dates + actions spacer toolbar */}
              <div className="border-t border-slate-100 pt-3 mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {formatDate(doc.lastModified)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    id={`btn-open-doc-${doc.id}`}
                    onClick={() => onOpenDoc(doc)}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3.5 py-1.5 rounded-lg shadow-sm transition inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {isArabic ? 'فتح وتعديل' : currentLang === 'bn' ? 'দেখুন ও সংশোধন' : 'Open Edit'}
                  </button>
                  <button
                    id={`btn-delete-doc-${doc.id}`}
                    onClick={() => {
                      if (confirm(t.confirmDelete)) {
                        onDeleteDoc(doc.id);
                      }
                    }}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-100 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
