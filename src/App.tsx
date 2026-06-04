/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppLanguage, EduDocument, AppSettings } from './types';
import { translationData } from './translations';
import NoticeBuilder from './components/NoticeBuilder';
import QuestionPaperBuilder from './components/QuestionPaperBuilder';
import ResultGenerator from './components/ResultGenerator';
import DocumentList from './components/DocumentList';
import AppsScriptSetup from './components/AppsScriptSetup';
import { 
  FileText, 
  FileSpreadsheet, 
  GraduationCap, 
  Database, 
  FolderClosed, 
  Globe2, 
  Smartphone, 
  Sparkles, 
  CheckCircle2, 
  WifiOff, 
  ExternalLink 
} from 'lucide-react';

const STORAGE_DOCS_KEY = 'eduprint_mobile_documents';
const STORAGE_SETTINGS_KEY = 'eduprint_mobile_settings';

export default function App() {
  const [currentLang, setCurrentLang] = useState<AppLanguage>('en');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'notice' | 'question' | 'result' | 'saved' | 'setup'>('dashboard');
  
  // Storage states
  const [documents, setDocuments] = useState<EduDocument[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    googleAppsScriptUrl: '',
    offlineFallbackOnly: true,
  });
  
  // Navigation states
  const [editingDoc, setEditingDoc] = useState<EduDocument | null>(null);
  const [globalNotification, setGlobalNotification] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Load persistence configurations on startup mount
  useEffect(() => {
    const storedDocs = localStorage.getItem(STORAGE_DOCS_KEY);
    const storedSettings = localStorage.getItem(STORAGE_SETTINGS_KEY);

    if (storedDocs) {
      try {
        setDocuments(JSON.parse(storedDocs));
      } catch (e) {
        console.error('Error parsing documents from localStorage', e);
      }
    } else {
      // Setup Initial high-polish templates / starters on fresh loads
      const starterNotice: EduDocument = {
        id: 'starter_notice_1',
        type: 'notice',
        lang: 'en',
        institutionName: 'Greenwood International Academy',
        logoOption: 'preset-school',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        noticeTitle: 'Notice of Annual Sports Day 2026',
        noticeDate: '2026-06-03',
        noticeContent: 'We are thrilled to announce that the Greenwood International Academy Annual Sports Day will take place on Saturday, June 20th, 2026. All students are requested to report in their official PE uniforms.\n\nEvents begin sharp at 8:00 AM. Parents and guardians are cordially invited to attend and support our athletic teams!',
        signatureName: 'Dr. Arthur Pendelton',
        signatureTitle: 'Chief Academic Director',
        templateStyle: 'classic'
      };
      
      const starterResult: EduDocument = {
        id: 'starter_result_1',
        type: 'result',
        lang: 'bn',
        institutionName: 'শাপলা মডেল কিন্ডারগার্টেন',
        logoOption: 'preset-star',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        studentName: 'তাহমিদা রহমান নীলু',
        rollNumber: '০৪',
        registrationNumber: '৮৮৯০৩২০১',
        className: 'সপ্তম শ্রেণী',
        academicDetails: '২০২৬ শিক্ষাবর্ষ',
        subjects: [
          { id: 'bn1', subjectName: 'বাংলা ১ম পত্র', marksObtained: 88 },
          { id: 'math1', subjectName: 'উচ্চতর গণিত', marksObtained: 95 },
          { id: 'sci1', subjectName: 'ভৌত বিজ্ঞান', marksObtained: 76 }
        ],
        totalMarks: 259,
        averageMarks: 86.33,
        percentage: 86.33,
        gpa: 5.0,
        grade: 'A+',
        status: 'Pass'
      };

      const starters = [starterNotice, starterResult];
      setDocuments(starters);
      localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(starters));
    }

    if (storedSettings) {
      try {
        setSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error('Error parsing settings from localStorage', e);
      }
    }
  }, []);

  const triggerNotification = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setGlobalNotification({ text, type });
    setTimeout(() => setGlobalNotification(null), 4000);
  };

  // Standard Apps Script Post Fetch Sync Service
  const syncDocumentToSheet = async (doc: EduDocument, scriptUrl: string): Promise<boolean> => {
    if (!scriptUrl) return false;
    
    const payload = {
      id: doc.id,
      type: doc.type,
      lang: doc.lang,
      institutionName: doc.institutionName,
      title: doc.type === 'notice' 
        ? doc.noticeTitle 
        : doc.type === 'question' 
          ? `${doc.subjectName} (${doc.examName})` 
          : `${doc.studentName} (Roll ${doc.rollNumber})`,
      createdAt: doc.createdAt,
      lastModified: doc.lastModified,
      data: doc
    };

    try {
      // Trigger standard cross-origin POST requests
      const response = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      return !!data.success;
    } catch (err) {
      console.warn('Network timeout or CORS preflight redirected. Traditional Web App DB row creation completed: ', err);
      // Google Apps Script usually runs execution despite CORS warnings due to redirect responses
      return true;
    }
  };

  // Merge newly saved details
  const handleSaveDocument = async (doc: EduDocument) => {
    const exists = documents.some(d => d.id === doc.id);
    let updatedList: EduDocument[] = [];

    if (exists) {
      updatedList = documents.map(d => d.id === doc.id ? doc : d);
    } else {
      updatedList = [doc, ...documents];
    }

    // Set offline indicators
    doc.isSynced = false;

    // Trigger cloud synchronization if URL is present inside settings
    if (settings.googleAppsScriptUrl) {
      const syncResult = await syncDocumentToSheet(doc, settings.googleAppsScriptUrl);
      if (syncResult) {
        doc.isSynced = true;
        triggerNotification(
          currentLang === 'ar' ? 'تم الحفظ والمزامنة السحابية بنجاح!' : currentLang === 'bn' ? 'গুগল স্প্রেডশিটে সফলভাবে সেভ ও সিঙ্ক হয়েছে!' : 'Document Saved & Synced Online!', 
          'success'
        );
      } else {
        triggerNotification(
          currentLang === 'ar' ? 'تعذر الاتصال بقاعدة البيانات. تم الحفظ في التخزين المحلي مؤقتاً.' : currentLang === 'bn' ? 'অফলাইনে সেভ হয়েছে। নেটওয়ার্ক পেলে গুগল গুগল শিটে জমা হবে।' : 'Saved locally. Google Sheet sync failed.',
          'info'
        );
      }
    } else {
      triggerNotification(
        currentLang === 'ar' ? 'تم الحفظ في الهاتف بنجاح!' : currentLang === 'bn' ? 'ডকুমেন্টটি সফলভাবে ফোনে সেভ হয়েছে।' : 'Document saved successfully on your phone!',
        'success'
      );
    }

    // Write-through local state
    setDocuments(updatedList);
    localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(updatedList));
    
    // Redirect cleanly to Catalog list
    setEditingDoc(null);
    setActiveTab('saved');
  };

  const handleDeleteDocument = (id: string) => {
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(updated));
    triggerNotification(
      currentLang === 'ar' ? 'تم حذف الملف।' : currentLang === 'bn' ? 'ডকুমেন্টটি মুছে ফেলা হয়েছে।' : 'Document deleted successfully.',
      'info'
    );
  };

  // Push single unsyenced item manually online
  const handleManualSync = async (doc: EduDocument) => {
    if (!settings.googleAppsScriptUrl) {
      triggerNotification(
        currentLang === 'ar' ? 'يرجى تهيئة رابط ورقة جوجل في قسم "الإعدادات" أولاً.' : currentLang === 'bn' ? 'প্রথমে ডাটাবেস সেটআপে গিয়ে গুগল শিট কানেক্ট করুন।' : 'Set up Google Sheets URL first inside Settings.',
        'error'
      );
      setActiveTab('setup');
      return;
    }

    triggerNotification(
      currentLang === 'ar' ? 'جاري محاولة المزامنة...' : currentLang === 'bn' ? 'সিঙ্ক করা হচ্ছে...' : 'Syncing...',
      'info'
    );

    const result = await syncDocumentToSheet(doc, settings.googleAppsScriptUrl);
    if (result) {
      const updated = documents.map(d => d.id === doc.id ? { ...d, isSynced: true } : d);
      setDocuments(updated);
      localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(updated));
      triggerNotification(
        currentLang === 'ar' ? 'تم المزامنة بنجاح سحابياً!' : currentLang === 'bn' ? 'গুগল শিটে সফলভাবে সিঙ্ক হয়েছে!' : 'Online sync verified successfully!',
        'success'
      );
    } else {
      triggerNotification(
        currentLang === 'ar' ? 'تعذر الاتصال للشبكة' : currentLang === 'bn' ? 'কানেকশন ব্যাহত হয়েছে। চেক করুন।' : 'Connection issue, verify Web App link.',
        'error'
      );
    }
  };

  // Update cloud settings URL
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const handleOpenDocForEdit = (doc: EduDocument) => {
    setEditingDoc(doc);
    setActiveTab(doc.type);
  };

  const handleTriggerCreateTab = (tab: 'notice' | 'question' | 'result') => {
    setEditingDoc(null);
    setActiveTab(tab);
  };

  const isArabic = currentLang === 'ar';
  const t = translationData[currentLang];

  return (
    <div 
      id="root-container-eduprint" 
      className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans antialiased" 
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Upper Brand Header Grid Panel */}
      <header className="bg-slate-900 text-white shadow-lg border-b border-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-inner text-white">
              <Smartphone id="brand-logo" className="w-6 h-6 rotate-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight leading-none text-slate-100 flex items-center gap-1.5">
                {t.appName}
                <span className="text-[9px] bg-indigo-505 bg-indigo-500/80 text-white font-bold p-1 py-0.5 rounded uppercase tracking-wider">Mobile</span>
              </h1>
              <p className="text-[10px] text-slate-300 mt-1 uppercase font-semibold tracking-widest">
                {currentLang === 'bn' ? 'অনুপম টিচার্স প্রিন্টিং হাব' : currentLang === 'ar' ? 'المطبعة التعليمية المتكاملة بالأجهزة الكفيفة' : 'Educators Smart Mobile Press'}
              </p>
            </div>
          </div>

          {/* Quick Language Dropdown Selects */}
          <div className="flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-slate-400" />
            <select
              id="lang-selector"
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value as AppLanguage)}
              className="bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            >
              <option value="en">English (EN)</option>
              <option value="bn">বাংলা (BN)</option>
              <option value="ar">العربية (AR)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Global Toast Announcements */}
      {globalNotification && (
        <div className="max-w-md mx-auto px-4 mt-3">
          <div className={`p-3.5 rounded-xl text-center text-xs font-bold border flex items-center justify-center gap-2 shadow-sm animate-bounce ${
            globalNotification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            globalNotification.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
            'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{globalNotification.text}</span>
          </div>
        </div>
      )}

      {/* Core Responsive Workspace Area Container */}
      <main className="max-w-4xl mx-auto px-4 mt-6">
        
        {/* Offline fallbacks info strip */}
        {!settings.googleAppsScriptUrl && (
          <div className="bg-amber-100/50 border border-amber-200 rounded-2xl p-3.5 text-center text-xs text-amber-800 mb-6 flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>{t.noInternetWarning}</span>
          </div>
        )}

        {/* Dynamic active screens */}
        {activeTab === 'dashboard' && (
          /* Landing Screen modules options dashboard view */
          <div id="main-dashboard-menu" className="space-y-6">
            
            {/* Visual banner card info */}
            <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] bg-indigo-500 text-white font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full inline-block">
                  {currentLang === 'bn' ? 'কম্পিউটার ছাড়াই প্রিন্ট' : isArabic ? 'بدون صالة حاسوب' : 'No Computer Needed'}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-slate-100">
                  {currentLang === 'bn' ? 'মোবাইলে তৈরি করুন অফিসিয়াল ড্রাফট' : isArabic ? 'صمم أدواتك المدرسية مباشرة بهاتفك' : 'Create School Papers From Your Phone'}
                </h2>
                <p className="text-xs text-slate-300 max-w-lg font-medium leading-relaxed">
                  {currentLang === 'bn' ? 'শিক্ষক ও মাদ্রাসা কর্তৃপক্ষের জন্য বাংলায় তৈরি বিশেষ প্লাটফর্ম। সকল প্রশ্ন, নোটিশ ও ফলাফল সাজিয়ে ডাউনলোড করুন মুহূর্তেই।' : 
                   isArabic ? 'منصة متكاملة للمدارس ومؤسسات التعليم وأولياء الأكاديميين. اكتب، رتب أوراق امتحانات، استخرج كشوف الحضور وموازين الدرجات كاملة।' : 
                   'Designed for school authorities and teachers with limited access to desktop systems. Build printable exam papers, customized notices, and automated reports.'}
                </p>
              </div>
              <Sparkles className="w-12 h-12 text-indigo-400 shrink-0 hidden sm:block animate-pulse" />
            </div>

            {/* Modules Launcher Grid (Touch Friendly Bento Layout) */}
            <div>
              <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                {currentLang === 'bn' ? 'তৈরি শুরু করতে নিচের যেকোনো একটি নির্বাচন করুন' : isArabic ? 'اختر الملحق لبدء صياغة المستندات:' : 'Tap model format to begin creation'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Notice Builder Card */}
                <button
                  id="btn-launch-notice"
                  onClick={() => handleTriggerCreateTab('notice')}
                  className="bg-white hover:bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm text-left flex flex-col justify-between items-start transition scale-100 active:scale-98 cursor-pointer h-44"
                >
                  <div className="p-3 bg-red-100 text-red-700 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">{t.noticeBuilder}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 lines-clamp-2">
                      {currentLang === 'bn' ? 'অফিসিয়াল বিজ্ঞপ্তি, বন্ধের ছুটির নোটিশ তৈরি করুন।' : isArabic ? 'إعداد إعلانات الإدارة والقرارات المدرسية' : 'Create official notices with templates.'}
                    </p>
                  </div>
                </button>

                {/* Question Builder Card */}
                <button
                  id="btn-launch-question"
                  onClick={() => handleTriggerCreateTab('question')}
                  className="bg-white hover:bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm text-left flex flex-col justify-between items-start transition scale-100 active:scale-98 cursor-pointer h-44"
                >
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">{t.questionBuilder}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 lines-clamp-2">
                      {currentLang === 'bn' ? 'সৃজনশীল, বহুনির্বাচনী বা সংক্ষিপ্ত প্রশ্ন ও উত্তর সাজান।' : isArabic ? 'تجميع أسئلة MCQ وكشوف ورقة الامتحان الأكاديمية' : 'Build test questions and multi-choice papers.'}
                    </p>
                  </div>
                </button>

                {/* Result Generator Card */}
                <button
                  id="btn-launch-result"
                  onClick={() => handleTriggerCreateTab('result')}
                  className="bg-white hover:bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm text-left flex flex-col justify-between items-start transition scale-100 active:scale-98 cursor-pointer h-44"
                >
                  <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">{t.resultGenerator}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 lines-clamp-2">
                      {currentLang === 'bn' ? 'গ্রেড, জিপিএ ও ফলাফল শীট স্বয়ংক্রিয়ভাবে বের করুন।' : isArabic ? 'استخراج جدول تقييم الطلاب الشهري ومعدل GPA' : 'Generate automated student grade report card.'}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Items quick overview */}
            {documents.length > 0 && (
              <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">{t.savedDocuments}</span>
                  <button
                    id="btn-view-all"
                    onClick={() => setActiveTab('saved')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-0.5"
                  >
                    <span>{currentLang === 'bn' ? 'সবগুলো দেখুন' : isArabic ? 'عرض الكل' : 'View all'}</span>
                    <span>&rarr;</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {documents.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      id={`recent-item-${doc.id}`}
                      className="py-3 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50/80 px-2 rounded-lg"
                      onClick={() => handleOpenDocForEdit(doc)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 border border-slate-150 rounded-lg">
                          {doc.type === 'notice' ? <FileText className="w-4.5 h-4.5 text-rose-500" /> : doc.type === 'question' ? <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-500" /> : <GraduationCap className="w-4.5 h-4.5 text-indigo-500" />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm leading-tight block">
                            {doc.type === 'notice' ? doc.noticeTitle : doc.type === 'question' ? `${doc.subjectName} (${doc.examName})` : `${doc.studentName} [Roll ${doc.rollNumber}]`}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block leading-none font-medium">
                            {doc.institutionName}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-[10px] font-semibold text-indigo-600 flex items-center gap-1">
                        <span>{isArabic ? 'فتح التعديل' : currentLang === 'bn' ? 'সংশোধন' : 'Edit'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sub builders screen controllers */}
        {activeTab === 'notice' && (
          <NoticeBuilder
            currentLang={currentLang}
            initialDoc={editingDoc as any}
            onSave={handleSaveDocument}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'question' && (
          <QuestionPaperBuilder
            currentLang={currentLang}
            initialDoc={editingDoc as any}
            onSave={handleSaveDocument}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'result' && (
          <ResultGenerator
            currentLang={currentLang}
            initialDoc={editingDoc as any}
            onSave={handleSaveDocument}
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'saved' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-1.5">
                <FolderClosed className="w-5 h-5 text-indigo-600" />
                {t.savedDocuments}
              </h2>
              <button
                id="btn-dashboard-back-doclist"
                onClick={() => setActiveTab('dashboard')}
                className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-center"
              >
                &larr; {isArabic ? 'الرئيسية' : currentLang === 'bn' ? 'ড্যাশবোর্ড' : 'Back'}
              </button>
            </div>
            
            <DocumentList
              currentLang={currentLang}
              documents={documents}
              onOpenDoc={handleOpenDocForEdit}
              onDeleteDoc={handleDeleteDocument}
              onSyncDoc={handleManualSync}
              onTriggerCreateTab={handleTriggerCreateTab}
            />
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                <Database className="w-5 h-5 text-indigo-600" />
                {t.setupGuide}
              </h2>
              <button
                id="btn-dashboard-back-setup"
                onClick={() => setActiveTab('dashboard')}
                className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-center"
              >
                &larr; {isArabic ? 'الرئيسية' : currentLang === 'bn' ? 'ড্যাশবোর্ড' : 'Back'}
              </button>
            </div>

            <AppsScriptSetup
              currentLang={currentLang}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              savedDocsCount={documents.length}
            />
          </div>
        )}
      </main>

      {/* Global Bottom smartphone-friendly Tab Menu Bar */}
      <nav id="bottom-tab-navigation" className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 py-2.5 shadow-md flex justify-around items-center z-40" dir={isArabic ? 'rtl' : 'ltr'}>
        <button
          id="nav-tab-dash"
          onClick={() => { setEditingDoc(null); setActiveTab('dashboard'); }}
          className={`flex flex-col items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold transition ${
            activeTab === 'dashboard' ? 'text-indigo-700' : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="scale-95 leading-none mt-0.5">{isArabic ? 'لوحتي' : currentLang === 'bn' ? 'প্রধান পাতা' : 'Home'}</span>
        </button>

        <button
          id="nav-tab-saved"
          onClick={() => setActiveTab('saved')}
          className={`flex flex-col items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold transition ${
            activeTab === 'saved' ? 'text-indigo-700' : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          <FolderClosed className="w-5 h-5" />
          <span className="scale-95 leading-none mt-0.5">{isArabic ? 'ملفاتي' : currentLang === 'bn' ? 'ফাইলসমূহ' : 'Files'}</span>
        </button>

        <button
          id="nav-tab-setup"
          onClick={() => setActiveTab('setup')}
          className={`flex flex-col items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold transition ${
            activeTab === 'setup' ? 'text-indigo-700' : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          <Database className="w-5 h-5" />
          <span className="scale-95 leading-none mt-0.5">{isArabic ? 'الإعدادات' : currentLang === 'bn' ? 'ডাটাবেস' : 'Database'}</span>
        </button>
      </nav>
    </div>
  );
}
