/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppLanguage, NoticeData, EduDocument, InstitutionProfile } from '../types';
import { translationData } from '../translations';
import CrestLogo from './CrestLogo';
import { COLOR_THEMES, FONT_CLASSES, formatNumerals } from '../utils';
import { 
  Building, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3, 
  Save, 
  Printer, 
  Download, 
  Upload, 
  HelpCircle, 
  ChevronRight, 
  Undo2, 
  Redo2, 
  Sparkles, 
  Palette, 
  Type, 
  Layout, 
  CheckCircle2, 
  FileText, 
  RefreshCw, 
  Calendar, 
  Signature,
  Copy
} from 'lucide-react';

interface NoticeBuilderProps {
  currentLang: AppLanguage;
  initialDoc?: NoticeData | null;
  onSave: (doc: EduDocument) => Promise<void>;
  onBackToDashboard: () => void;
}

interface NoticeFormState {
  institutionName: string;
  logoOption: string;
  logoUploadedData?: string;
  noticeTitle: string;
  noticeDate: string;
  noticeContent: string;
  signatureName: string;
  signatureTitle: string;
  templateVariant: number; // 1 to 10
  customColor: 'indigo' | 'emerald' | 'crimson' | 'amber' | 'slate' | 'violet' | 'rose' | 'sky' | 'teal' | 'gold';
  customFont: 'sans' | 'display' | 'serif' | 'elegant' | 'mono' | 'tajawal' | 'amiri';
  headerStyle: 'centered' | 'split-left' | 'badge-stamp' | 'ribbon-strip' | 'traditional';
  arabicNumerals: boolean;
}

export default function NoticeBuilder({
  currentLang,
  initialDoc,
  onSave,
  onBackToDashboard,
}: NoticeBuilderProps) {
  const t = translationData[currentLang];
  const isArabic = currentLang === 'ar';

  // Step-by-Step Workflow state config
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1); // 1: Create, 2: Preview & Customize, 3: Export
  
  // Base State containing all form elements
  const [formState, setFormState] = useState<NoticeFormState>({
    institutionName: '',
    logoOption: 'preset-school',
    logoUploadedData: undefined,
    noticeTitle: '',
    noticeDate: '',
    noticeContent: '',
    signatureName: '',
    signatureTitle: '',
    templateVariant: 1,
    customColor: 'indigo',
    customFont: isArabic ? 'tajawal' : 'sans',
    headerStyle: 'centered',
    arabicNumerals: isArabic,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [autoSaveNotification, setAutoSaveNotification] = useState<'saved' | null>(null);

  // Undo/Redo Stacks
  const undoStackRef = useRef<NoticeFormState[]>([]);
  const redoStackRef = useRef<NoticeFormState[]>([]);
  const isUndoRedoAction = useRef(false);

  // Auto-Save and Initial setup triggers
  useEffect(() => {
    if (initialDoc) {
      setFormState({
        institutionName: initialDoc.institutionName || '',
        logoOption: initialDoc.logoOption || 'preset-school',
        logoUploadedData: initialDoc.logoUploadedData,
        noticeTitle: initialDoc.noticeTitle || '',
        noticeDate: initialDoc.noticeDate || '',
        noticeContent: initialDoc.noticeContent || '',
        signatureName: initialDoc.signatureName || '',
        signatureTitle: initialDoc.signatureTitle || '',
        templateVariant: initialDoc.templateVariant || 1,
        customColor: initialDoc.customColor || 'indigo',
        customFont: initialDoc.customFont || (isArabic ? 'tajawal' : 'sans'),
        headerStyle: (initialDoc.headerStyle as any) || 'centered',
        arabicNumerals: !!initialDoc.arabicNumerals,
      });
    } else {
      // Look for saved Institution Profile first
      const savedProfile = localStorage.getItem('eduprint_institution_profile');
      let profile: Partial<InstitutionProfile> = {};
      if (savedProfile) {
        try {
          profile = JSON.parse(savedProfile);
        } catch (e) {
          console.error(e);
        }
      }

      // Check if there is an unsaved draft to recover
      const draftKey = 'eduprint_draft_notice';
      const draft = localStorage.getItem(draftKey);
      
      if (draft) {
        setShowDraftBanner(true);
      }

      // Load defaults
      if (currentLang === 'bn') {
        setFormState(prev => ({
          ...prev,
          institutionName: profile.name || 'রোজ গার্ডেন বিদ্যানিকেতন',
          logoOption: profile.logoOption || 'preset-school',
          logoUploadedData: profile.logoUploadedData,
          noticeTitle: 'আসন্ন পবিত্র রমজান উপলক্ষে স্কুল ছুটির নোটিশ',
          noticeDate: new Date().toISOString().split('T')[0],
          noticeContent: 'এতদ্বারা বিদ্যালয়ের সকল শিক্ষক, কর্মচারী ও ছাত্র-ছাত্রীদের অবগতির জন্য জানানো যাচ্ছে যে, পবিত্র মাহে রমজান ও ঈদ-উল-ফিতর উপলক্ষে আগামী ১০ই মার্চ ২০২৬ রোজ রবিবার থেকে বিদ্যালয় প্রধান কার্যালয় ওসকল শ্রেণীর ক্লাস কার্যক্রম বন্ধ থাকিবে। আগামী ০৬ই এপ্রিল স্কুল পুনরায় যথানিয়মে উৎসবমুখর পরিবেশে চালু হবে। অভিভাবকগণকে এই সময়ে শিক্ষার্থীদের স্বাস্থ্যের প্রতি যত্নবান হতে অনুরোধ করা হলো।\n\nধন্যবাদান্তে,\nঅধ্যক্ষ কমিটি',
          signatureName: profile.principal || 'মোহাম্মদ হাসানুজ্জামান',
          signatureTitle: 'অধ্যক্ষ ও প্রধান শিক্ষক',
          templateVariant: 1,
          customColor: 'emerald',
          customFont: 'sans',
          headerStyle: 'centered',
          arabicNumerals: false,
        }));
      } else if (currentLang === 'ar') {
        setFormState(prev => ({
          ...prev,
          institutionName: profile.name || 'مدرسة التوحيد الأهلية الابتدائية',
          logoOption: profile.logoOption || 'preset-madrasa',
          logoUploadedData: profile.logoUploadedData,
          noticeTitle: 'إعلان عطلة نهاية الفصل الدراسي الثاني وبداية رمضان مبارك',
          noticeDate: new Date().toISOString().split('T')[0],
          noticeContent: 'تعلن إدارة مدرسة التوحيد الأهلية بأن إجازة نهاية الفصل الدراسي الثاني وبداية شهر رمضان المبارك سوف تبدأ من يوم الأحد القادم الموافق ١٠ مارس ٢٠٢٦م لجميع المراحل التعليمية. وستستأنف الدراسة والدوام الرسمي لجميع الطلاب والمدرسين يوم الاثنين الموافق ٦ أبريل ٢٠٢٦م بصورة طبيعية، راجين من العلي القدير أن يتقبل منا ومنكم صالح الأعمال ونرجو لطلابنا وقتاً ممتعاً ومفيداً.',
          signatureName: profile.principal || 'فضيلة الشيخ عبد الله المنصوري',
          signatureTitle: 'مدير المدرسة العام',
          templateVariant: 5,
          customColor: 'indigo',
          customFont: 'tajawal',
          headerStyle: 'traditional',
          arabicNumerals: true,
        }));
      } else {
        setFormState(prev => ({
          ...prev,
          institutionName: profile.name || 'Evercrest International School',
          logoOption: profile.logoOption || 'preset-school',
          logoUploadedData: profile.logoUploadedData,
          noticeTitle: 'Commencement of Annual Summer Camp Program 2026',
          noticeDate: new Date().toISOString().split('T')[0],
          noticeContent: 'This is to formally notify all students, faculty members, and parents that our much-anticipated Annual Summer Camp 2026 is scheduled to commence from June 15, 2026. The camp will run for three weeks, focusing on critical analytical skills, creative paper crafting, and indoor sports championships. Interested students are requested to register their details with the class monitor before June 5, 2026. Late registrations will not be entertained.\n\nYour presence and active participation are highly welcomed.',
          signatureName: profile.principal || 'Dr. Arthur Jenkins',
          signatureTitle: 'Principal & Chief Administrator',
          templateVariant: 1,
          customColor: 'indigo',
          customFont: 'sans',
          headerStyle: 'centered',
          arabicNumerals: false,
        }));
      }
    }
  }, [initialDoc, currentLang]);

  // Save state to Undo history before modifying
  const updateFormState = (updater: Partial<NoticeFormState>) => {
    setFormState(prev => {
      const next = { ...prev, ...updater };
      
      if (!isUndoRedoAction.current) {
        // Push previous state to undo stack
        undoStackRef.current.push(prev);
        // Clear redo stack on manual interaction
        redoStackRef.current = [];
      }
      isUndoRedoAction.current = false;
      
      return next;
    });
  };

  const handleUndo = () => {
    if (undoStackRef.current.length > 0) {
      isUndoRedoAction.current = true;
      const prev = undoStackRef.current.pop()!;
      redoStackRef.current.push(formState);
      setFormState(prev);
    }
  };

  const handleRedo = () => {
    if (redoStackRef.current.length > 0) {
      isUndoRedoAction.current = true;
      const next = redoStackRef.current.pop()!;
      undoStackRef.current.push(formState);
      setFormState(next);
    }
  };

  // Auto-save mechanism: Triggers every 10 seconds on change
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem('eduprint_draft_notice', JSON.stringify(formState));
      setAutoSaveNotification('saved');
      setTimeout(() => setAutoSaveNotification(null), 2500);
    }, 10000);

    return () => clearInterval(timer);
  }, [formState]);

  const handleRecoverDraft = () => {
    const draft = localStorage.getItem('eduprint_draft_notice');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setFormState(parsed);
        setShowDraftBanner(false);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem('eduprint_draft_notice');
    setShowDraftBanner(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFormState({
          logoUploadedData: reader.result as string,
          logoOption: 'uploaded',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getNoticePayload = (): NoticeData => {
    return {
      id: initialDoc?.id || 'not_' + Math.random().toString(36).substr(2, 9),
      type: 'notice',
      lang: currentLang,
      institutionName: formState.institutionName,
      logoOption: formState.logoOption,
      logoUploadedData: formState.logoUploadedData,
      noticeTitle: formState.noticeTitle,
      noticeDate: formState.noticeDate,
      noticeContent: formState.noticeContent,
      signatureName: formState.signatureName,
      signatureTitle: formState.signatureTitle,
      templateStyle: 'classic', // legacy compatibility
      templateVariant: formState.templateVariant,
      customColor: formState.customColor,
      customFont: formState.customFont,
      headerStyle: formState.headerStyle,
      arabicNumerals: formState.arabicNumerals,
      createdAt: initialDoc?.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
  };

  const handleSave = async () => {
    if (!formState.noticeTitle.trim()) {
      alert('Please fill the Notice Title.');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(getNoticePayload());
      // Clear draft on successful save
      localStorage.removeItem('eduprint_draft_notice');
      onBackToDashboard();
    } catch (e) {
      console.error(e);
      alert('Error saving document.');
    } finally {
      setIsSaving(false);
    }
  };

  // Printing Helper
  const triggerPdfPrint = () => {
    window.print();
  };

  // Copy notice formatting to clipboard as a resilient backup for locked mobile devices
  const copyFormattedDocument = async () => {
    try {
      const element = document.getElementById('notice-preview-a4');
      if (!element) return;
      
      // We will clone the element to modify it slightly for copy clipboard friendliness (removes absolute positions if any)
      const cloned = element.cloneNode(true) as HTMLElement;
      
      const blob = new Blob([cloned.innerHTML], { type: 'text/html' });
      const item = new ClipboardItem({ 
        'text/html': blob, 
        'text/plain': new Blob([element.innerText], { type: 'text/plain' }) 
      });
      await navigator.clipboard.write([item]);
      alert(currentLang === 'bn' ? 'নোটিশটি ফর্ম্যাটসহ কপি করা হয়েছে! এমএস ওয়ার্ড বা গুগলে পেস্ট করতে পারবেন।' : 'Notice copied with formatting! You can paste it directly into MS Word or other document editors.');
    } catch (err) {
      try {
        const element = document.getElementById('notice-preview-a4');
        if (element) {
          await navigator.clipboard.writeText(element.innerText);
          alert(currentLang === 'bn' ? 'নোটিশের সাধারণ টেক্সট কপি করা হয়েছে!' : 'Plain text notice copied to clipboard!');
        }
      } catch (e) {
        alert('Failed to copy document content.');
      }
    }
  };

  // Direct Word DOC document generation
  const triggerDocxExport = () => {
    const payload = getNoticePayload();
    const dateStr = formatNumerals(payload.noticeDate, currentLang, payload.arabicNumerals);
    const refNum = formatNumerals(Math.floor(Math.random() * 800) + 101, currentLang, payload.arabicNumerals);
    
    // Generates static HTML word documents with CSS embedded inline
    const isRtl = currentLang === 'ar';
    const directionCss = isRtl ? 'direction: rtl !important; text-align: right !important;' : 'direction: ltr !important; text-align: left !important;';
    const bodyFont = payload.customFont === 'amiri' || payload.customFont === 'tajawal' ? 'Amiri, Arial' : 'Calibri, Arial';

    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Official Notice</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body {
            font-family: ${bodyFont};
            margin: 1.5in 1.0in 1.0in 1.0in;
            ${directionCss}
          }
          .title-text {
            font-size: 20pt;
            font-weight: bold;
            color: #0b2545;
            text-align: center;
            margin-bottom: 5px;
          }
          .sub-bar {
            text-align: center;
            border-bottom: 2px solid #334155;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .meta-table {
            width: 100%;
            margin-bottom: 30px;
            font-size: 10pt;
            color: #475569;
          }
          .badge-box {
            text-align: center;
            margin: 20px 0;
          }
          .badge {
            border: 2px solid #dc2626;
            color: #dc2626;
            font-size: 14pt;
            font-weight: bold;
            padding: 8px 30px;
            display: inline-block;
          }
          .h2-subject {
            text-align: center;
            font-size: 13pt;
            font-weight: bold;
            margin: 15px 0;
          }
          .body-content {
            font-size: 12pt;
            line-height: 1.6;
            text-align: justify;
            margin-bottom: 45px;
            white-space: pre-wrap;
          }
          .sig-table {
            width: 100%;
            margin-top: 50px;
          }
        </style>
      </head>
      <body>
        <div class="title-text">${payload.institutionName}</div>
        <div class="sub-bar">${isRtl ? 'إعلان رسمي عام' : currentLang === 'bn' ? 'অফিসিয়াল নোটিশ বোর্ড' : 'OFFICIAL NOTICE BOARD'}</div>
        
        <table class="meta-table" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="${isRtl ? 'right' : 'left'}">Ref No: EP-2026-${refNum}</td>
            <td align="${isRtl ? 'left' : 'right'}">Date: ${dateStr}</td>
          </tr>
        </table>

        <div class="badge-box">
          <span class="badge">${isRtl ? 'إعــــــــلان' : currentLang === 'bn' ? 'নোটিশ' : 'NOTICE'}</span>
        </div>

        <div class="h2-subject">${payload.noticeTitle}</div>

        <div class="body-content">${payload.noticeContent}</div>

        <table class="sig-table" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="60%"></td>
            <td align="${isRtl ? 'right' : 'left'}" style="border-top: 1px dashed #94a3b8; padding-top: 6px;">
              <strong>${payload.signatureName}</strong><br/>
              <span style="font-size: 9pt; color: #64748b;">${payload.signatureTitle}</span>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Notice_${payload.noticeTitle.replace(/\s+/g, '_') || 'board'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Return specific CSS properties for Notice based on selected templateVariant (1 to 10)
  const getTemplateStyles = () => {
    const col = COLOR_THEMES[formState.customColor] || COLOR_THEMES.indigo;
    const variant = formState.templateVariant;

    let borderClass = 'border-slate-200';
    let wrapperClass = 'p-6 sm:p-12';
    let decoratorSvg = null;

    if (variant === 1) {
      borderClass = `border-8 border-double ${col.primaryBorder}`;
    } else if (variant === 2) {
      borderClass = `border-l-8 ${col.primaryBorder} border-y border-r border-slate-200`;
    } else if (variant === 3) {
      borderClass = 'border border-slate-100 bg-slate-50/20';
    } else if (variant === 4) {
      borderClass = `border-2 ${col.primaryBorder}`;
      // floral-like corner stars
      decoratorSvg = (
        <div className="absolute inset-0 pointer-events-none p-2 border border-dashed border-slate-300 m-1.5 rounded-sm">
          <div className="absolute top-1 left-1 font-bold text-slate-300">✦</div>
          <div className="absolute top-1 right-1 font-bold text-slate-300">✦</div>
          <div className="absolute bottom-1 left-1 font-bold text-slate-300">✦</div>
          <div className="absolute bottom-1 right-1 font-bold text-slate-300">✦</div>
        </div>
      );
    } else if (variant === 5) {
      borderClass = 'border-4 border-slate-800';
    } else if (variant === 6) {
      borderClass = 'border-2 border-slate-300';
    } else if (variant === 7) {
      borderClass = 'border-2 border-stone-400 bg-orange-50/20';
    } else if (variant === 8) {
      borderClass = 'border border-dashed border-slate-400 font-mono';
    } else if (variant === 9) {
      borderClass = `border-t-8 border-b-8 ${col.primaryBorder} border-x border-slate-200`;
    } else if (variant === 10) {
      borderClass = 'border-4 border-amber-600 bg-yellow-50/10';
    }

    return { borderClass, wrapperClass, decoratorSvg };
  };

  const { borderClass, wrapperClass, decoratorSvg } = getTemplateStyles();
  const themeColors = COLOR_THEMES[formState.customColor] || COLOR_THEMES.indigo;
  const fontClass = FONT_CLASSES[formState.customFont] || FONT_CLASSES.sans;

  return (
    <div id="notice-builder-main" className="space-y-6">
      
      {/* 3-STEP WORKFLOW COMPONENT INDENTATION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between gap-1 max-w-xl mx-auto thumb-indicator-sticky">
        {[
          { step: 1, title: isArabic ? '١. صياغة الإعلان' : currentLang === 'bn' ? '১. ফরম লিখুন' : '1. Write Form', icon: Edit3 },
          { step: 2, title: isArabic ? '٢. المظهر والمعاينة' : currentLang === 'bn' ? '২. স্টাইল ও প্রিভিউ' : '2. Refine Style', icon: Eye },
          { step: 3, title: isArabic ? '٣. تصدير وطباعة' : currentLang === 'bn' ? '৩. প্রিন্ট করুন' : '3. Print out', icon: Printer },
        ].map((item) => (
          <button
            key={item.step}
            onClick={() => setActiveStep(item.step as any)}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-center text-[11px] font-black tracking-tight transition cursor-pointer ${
              activeStep === item.step 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'bg-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="leading-none">{item.title}</span>
          </button>
        ))}
      </div>

      {/* Undo, Redo, Auto-save Notification top line bar */}
      <div className="flex items-center justify-between px-2 max-w-3xl mx-auto">
        <div className="flex gap-2">
          <button
            id="btn-undo-action"
            onClick={handleUndo}
            disabled={undoStackRef.current.length === 0}
            className="p-1 px-3 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:bg-slate-50 text-xs flex items-center gap-1 transition cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>{isArabic ? 'تراجع' : 'Undo'}</span>
          </button>

          <button
            id="btn-redo-action"
            onClick={handleRedo}
            disabled={redoStackRef.current.length === 0}
            className="p-1 px-3 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 hover:bg-slate-50 text-xs flex items-center gap-1 transition cursor-pointer"
          >
            <Redo2 className="w-3.5 h-3.5" />
            <span>{isArabic ? 'إعادة' : 'Redo'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          {autoSaveNotification === 'saved' ? (
            <span className="text-emerald-500 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md">
              <CheckCircle2 className="w-3 h-3" /> Auto-saved
            </span>
          ) : (
            <span className="opacity-75 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin duration-3000" /> Auto-saving draft...
            </span>
          )}
        </div>
      </div>

      {/* Recover Unsaved Draft alert banner */}
      {showDraftBanner && (
        <div className="max-w-3xl mx-auto bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-amber-900 animate-slide-in">
          <div>
            <span className="font-extrabold text-xs block uppercase tracking-wider text-amber-600">Draft Found</span>
            <p className="text-xs text-amber-700">
              {isArabic ? 'لقد وجدنا مسودة غير محفوظة مخزنة من الجلسة السابقة. هل ترغب باسترجاعها؟' : currentLang === 'bn' ? 'পূর্বে কাজ করা একটি খসড়া বা ড্রাফট পাওয়া গেছে। উদ্ধার করতে চান?' : 'We recovered an unsaved draft from your previous session.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRecoverDraft}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
            >
              {isArabic ? 'استرجاع المسودة' : currentLang === 'bn' ? 'ড্রাফট লোড করুন' : 'Load Draft'}
            </button>
            <button
              onClick={handleClearDraft}
              className="bg-transparent hover:bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition border border-amber-300"
            >
              {isArabic ? 'تجاهل' : currentLang === 'bn' ? 'মুছে ফেলুন' : 'Discard'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: CONSTRUCT/WRITE FORM PANEL */}
      {activeStep === 1 && (
        <div id="notice-edit-form" className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 max-w-3xl mx-auto animate-fade-in">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
              {isArabic ? 'بيانات وإدخالات التعميم وعنوان المؤسسة' : currentLang === 'bn' ? 'অনুমোদিত নোটিশের মূল তথ্যসমূহ' : 'Notice Narrative & Subject Details'}
            </span>
          </div>

          <div className="space-y-4">
            
            {/* Institution Profile Info block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.institutionName}
                </label>
                <div className="relative">
                  <Building className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400`} />
                  <input
                    id="not-inst-name"
                    type="text"
                    placeholder={t.institutionPlaceholder}
                    value={formState.institutionName}
                    onChange={(e) => updateFormState({ institutionName: e.target.value })}
                    className={`w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white ${isArabic ? 'pr-9' : 'pl-9'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.noticeDate}
                </label>
                <div className="relative">
                  <Calendar className={`absolute top-3 ${isArabic ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400`} />
                  <input
                    id="not-date"
                    type="date"
                    value={formState.noticeDate}
                    onChange={(e) => updateFormState({ noticeDate: e.target.value })}
                    className={`w-full border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white ${isArabic ? 'pr-9' : 'pl-9'}`}
                  />
                </div>
              </div>
            </div>

            {/* Document Logo Selection and Custom Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-100 bg-slate-50/50 p-4 rounded-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.logoSelect}
                </label>
                <select
                  value={formState.logoOption}
                  onChange={(e) => updateFormState({ logoOption: e.target.value })}
                  className="w-full border border-slate-250 bg-white rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="preset-school">{t.logoSchool}</option>
                  <option value="preset-madrasa">{t.logoMadrasa}</option>
                  <option value="preset-college">{t.logoCollege}</option>
                  <option value="preset-star">{t.logoStar}</option>
                  <option value="uploaded">{t.logoUpload}</option>
                  <option value="preset-none">{t.logoNone}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {formState.logoOption === 'uploaded' ? t.logoUpload : t.logoSelect + ' Preview'}
                </label>
                <div className="flex items-center gap-3">
                  {formState.logoOption === 'uploaded' ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer w-full"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Preset {formState.logoOption.replace('preset-', '')} is chosen.
                    </span>
                  )}
                  {formState.logoUploadedData && formState.logoOption === 'uploaded' && (
                    <img
                      src={formState.logoUploadedData}
                      alt="Logo Preview"
                      className="w-10 h-10 object-contain rounded-lg border border-slate-200 p-0.5 bg-white shrink-0"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Notice Main Title Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.noticeTitle} <span className="text-red-500">*</span>
              </label>
              <input
                id="not-title"
                type="text"
                placeholder={t.noticeTitlePlaceholder}
                value={formState.noticeTitle}
                onChange={(e) => updateFormState({ noticeTitle: e.target.value })}
                className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Text description details area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.noticeContent}
              </label>
              <textarea
                id="not-desc"
                placeholder={t.noticeContentPlaceholder}
                value={formState.noticeContent}
                onChange={(e) => updateFormState({ noticeContent: e.target.value })}
                rows={8}
                className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white resize-y font-normal leading-relaxed"
              />
            </div>

            {/* Authentic signature details block */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-black uppercase text-slate-600 flex items-center gap-1">
                <Signature className="w-4 h-4 text-slate-500" />
                {isArabic ? 'التوقيع والمصادقة الإدارية' : currentLang === 'bn' ? 'স্বাক্ষরকারী ও অনুমোদন কর্মকর্তা' : 'Authentication & Signatures'}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {t.signatureName}
                  </label>
                  <input
                    id="not-sig-name"
                    type="text"
                    placeholder={t.signatureNamePlaceholder}
                    value={formState.signatureName}
                    onChange={(e) => updateFormState({ signatureName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {t.signatureTitle}
                  </label>
                  <input
                    id="not-sig-title"
                    type="text"
                    placeholder={t.signatureTitlePlaceholder}
                    value={formState.signatureTitle}
                    onChange={(e) => updateFormState({ signatureTitle: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Nav to step 2 directly */}
          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setActiveStep(2)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl flex items-center gap-1 transition"
            >
              <span>{isArabic ? 'متابعة تصميم الاستايل' : currentLang === 'bn' ? 'স্টাইল প্রিভিউ পাতায় যান' : 'Continue to Customize Style'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: REFINING PREVIEW & STYLING */}
      {activeStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto animate-fade-in relative">
          
          {/* Controls column sidebar */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 h-fit">
            
            {/* Color preset swatches selector */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5 tracking-wide">
                <Palette className="w-4 h-4 text-indigo-500" />
                {isArabic ? 'اختر الألوان للمستند' : currentLang === 'bn' ? 'রং বা টোন নির্বাচন করুন' : 'Pick Theme Color (10 Swatches)'}
              </span>
              <div className="grid grid-cols-5 gap-2">
                {Object.keys(COLOR_THEMES).map((themeKey) => {
                  const item = COLOR_THEMES[themeKey];
                  return (
                    <button
                      key={themeKey}
                      onClick={() => updateFormState({ customColor: themeKey as any })}
                      className={`h-9 w-full rounded-xl border border-slate-150 relative transition active:scale-95 cursor-pointer ${item.solidBg} ${
                        formState.customColor === themeKey 
                          ? 'ring-4 ring-offset-2 ring-indigo-500 scale-102' 
                          : 'opacity-90 hover:opacity-100'
                      }`}
                      title={themeKey}
                    >
                      {formState.customColor === themeKey && (
                        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs select-none">✓</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Design template frame selections (1 to 10 options) */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5 tracking-wide">
                <Layout className="w-4 h-4 text-indigo-500" />
                {isArabic ? 'نمط وثيقة الإعلان (١٠ خيارات تميز)' : currentLang === 'bn' ? '১০টি ভিন্ন ভিন্ন ডিজাইন টেমপ্লেট' : 'Notice Layout Border Frames (10 Styles)'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-2 gap-1.5">
                {[
                  { id: 1, label: isArabic ? '١. الكلاسيكي المزدوج' : '1. Double Borders' },
                  { id: 2, label: isArabic ? '٢. العمود الجانبي' : '2. Modern Stripe' },
                  { id: 3, label: isArabic ? '٣. البسيط النظيف' : '3. Simple Sheet' },
                  { id: 4, label: isArabic ? '٤. الزوايا المزخرفة' : '4. Ornate Corner' },
                  { id: 5, label: isArabic ? '٥. رسمي برأسية ملونة' : '5. Major Board' },
                  { id: 6, label: isArabic ? '٦. شهادة تقليدية' : '6. Vintage Crest' },
                  { id: 7, label: isArabic ? '٧. الورق الكلاسيكي تموج' : '7. Ivory Antique' },
                  { id: 8, label: isArabic ? '٨. مصفوفة مفرغة' : '8. Grid Monospace' },
                  { id: 9, label: isArabic ? '٩. البادئة الممدودة' : '9. Parallel Stripe' },
                  { id: 10, label: isArabic ? '١٠. الإطار الذهبي الفخم' : '10. Gold Royal' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateFormState({ templateVariant: item.id })}
                    className={`py-2 px-2 border text-center transition text-[10.5px] rounded-xl flex flex-col items-center justify-center gap-1 font-bold truncate leading-none cursor-pointer ${
                      formState.templateVariant === item.id 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom fonts choice selector */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5 tracking-wide">
                <Type className="w-4 h-4 text-indigo-500" />
                {isArabic ? 'اختر الخط المناسب' : currentLang === 'bn' ? 'ফন্ট স্টাইল পরিবর্তন করুন' : 'Typography Fonts'}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'sans', label: 'Default Sans' },
                  { id: 'display', label: 'Space Grotesk' },
                  { id: 'serif', label: 'Playfair Serif' },
                  { id: 'elegant', label: 'Elegant Outfit' },
                  { id: 'mono', label: 'Fira Computer' },
                  { id: 'tajawal', label: 'Tajawal Arabic' },
                  { id: 'amiri', label: 'Arabic Amiri' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateFormState({ customFont: item.id as any })}
                    className={`py-2 text-[10.5px] font-bold border rounded-xl text-center cursor-pointer ${
                      formState.customFont === item.id 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom institutional header alignment styles */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5 tracking-wide">
                <Building className="w-4 h-4 text-indigo-500" />
                {isArabic ? 'تنسيق محاذاة شعار المدرسة' : currentLang === 'bn' ? 'লোগো ও কলেজ নাম বিন্যাস' : 'Institution Header Style'}
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'centered', label: isArabic ? 'رأسية مركزية وشعار بالأعلى' : 'Centered Traditional Logo Theme' },
                  { id: 'split-left', label: isArabic ? 'شعار عائم يسار الرأسية' : 'Split-layout Left Crest Logo' },
                  { id: 'badge-stamp', label: isArabic ? 'الختام الدائري المتداخل' : 'Badge Stamp Corner Emblem' },
                  { id: 'ribbon-strip', label: isArabic ? 'شريط الرأسية الحاد والملون' : 'Ribbon Strip Block Accent' },
                  { id: 'traditional', label: isArabic ? 'البسيط الرسمي القديم' : 'Underline Ruling Classic Header' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateFormState({ headerStyle: item.id as any })}
                    className={`p-2.5 text-left text-xs border rounded-xl font-bold cursor-pointer transition ${
                      formState.headerStyle === item.id 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-extrabold' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className="block truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Arabic numeral settings for dates and numbers */}
            {isArabic && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-150 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-700 block">
                    الأرقام الهندية والتواريخ (٠-٩)
                  </span>
                  <span className="text-[10px] text-slate-400">تحويل الأرقام الغربية إلى ترقيم المشرق العربي</span>
                </div>
                <input
                  id="chk-arabic-num"
                  type="checkbox"
                  checked={formState.arabicNumerals}
                  onChange={(e) => updateFormState({ arabicNumerals: e.target.checked })}
                  className="w-4.5 h-4.5 accent-indigo-600 cursor-pointer"
                />
              </div>
            )}

            {/* Quick action save & jump to step 3 */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => setActiveStep(3)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{isArabic ? 'متابعة التصدير والطباعة' : currentLang === 'bn' ? 'ডাউনলোড ও প্রিন্ট পাতায় যান' : 'Proceed to Export & Print'}</span>
              </button>
            </div>
          </div>

          {/* Simulated interactive live A4 sheet display column */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="bg-slate-500/10 border border-slate-200 p-2 sm:p-5 rounded-3xl overflow-x-auto min-h-[750px] shadow-inner relative flex justify-center items-center">
              
              {/* Dynamic Simulated A4 notice layout container */}
              <div
                id="notice-preview-a4"
                className={`bg-white text-slate-900 w-full max-w-[700px] min-h-[920px] shadow-2xl relative ${borderClass} ${wrapperClass} ${fontClass} transition-all duration-300`}
                dir={isArabic ? 'rtl' : 'ltr'}
              >
                {decoratorSvg}

                {/* INSTITUTION HEADER RENDER ENGINE */}
                {formState.headerStyle === 'centered' && (
                  <div className="flex flex-col items-center text-center border-b-[3px] border-slate-800 pb-4 mb-5">
                    {formState.logoOption !== 'preset-none' && (
                      <div className="mb-2.5">
                        <CrestLogo option={formState.logoOption} uploadedData={formState.logoUploadedData} className="w-18 h-18" />
                      </div>
                    )}
                    <h1 className={`text-xl sm:text-2xl font-black ${themeColors.primaryText} leading-tight`}>
                      {formState.institutionName || ' sunflower seed nursery'}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-6 h-[1.5px] bg-slate-300"></span>
                      <span className="text-[9.5px] tracking-widest font-extrabold uppercase text-slate-400">
                        {isArabic ? 'تعميم رسمي إداري' : currentLang === 'bn' ? 'অফিসিয়াল নোটিশ বোর্ড' : 'OFFICIAL ANNOUNCEMENT'}
                      </span>
                      <span className="w-6 h-[1.5px] bg-slate-300"></span>
                    </div>
                  </div>
                )}

                {formState.headerStyle === 'split-left' && (
                  <div className="flex items-center gap-4 border-b-2 border-slate-700 pb-4 mb-5">
                    {formState.logoOption !== 'preset-none' && (
                      <CrestLogo option={formState.logoOption} uploadedData={formState.logoUploadedData} className="w-16 h-16" />
                    )}
                    <div className={isArabic ? 'text-right' : 'text-left'}>
                      <h1 className={`text-lg sm:text-xl font-black ${themeColors.primaryText}`}>
                        {formState.institutionName || ' sunflower seed nursery'}
                      </h1>
                      <span className="text-[10px] font-bold text-slate-400">
                        {isArabic ? 'تعميم منشور معتمد' : 'Verified Educational Board'}
                      </span>
                    </div>
                  </div>
                )}

                {formState.headerStyle === 'badge-stamp' && (
                  <div className="relative pb-4 border-b-2 border-slate-200 mb-5 flex justify-between items-start">
                    <div className={isArabic ? 'text-right' : 'text-left'}>
                      <span className={`text-[10px] font-black uppercase text-slate-400 block tracking-widest`}>
                        {isArabic ? 'كتاب رسمي متبادل ' : 'Official Memorandum'}
                      </span>
                      <h1 className={`text-lg sm:text-xl font-black ${themeColors.primaryText} mt-1`}>
                        {formState.institutionName || ' sunflower seed nursery'}
                      </h1>
                    </div>
                    {formState.logoOption !== 'preset-none' && (
                      <div className="border-4 border-dashed border-indigo-100 p-1 rounded-full shrink-0">
                        <CrestLogo option={formState.logoOption} uploadedData={formState.logoUploadedData} className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                )}

                {formState.headerStyle === 'ribbon-strip' && (
                  <div className="mb-5 flex flex-col gap-2">
                    <div className={`${themeColors.solidBg} text-white p-3.5 rounded-lg flex justify-between items-center shadow-xs`}>
                      <h1 className="text-sm sm:text-base font-black uppercase tracking-wider">
                        {formState.institutionName || ' sunflower seed nursery'}
                      </h1>
                      {formState.logoOption !== 'preset-none' && (
                        <div className="bg-white p-1 rounded-sm shrink-0">
                          <CrestLogo option={formState.logoOption} uploadedData={formState.logoUploadedData} className="w-7 h-7" />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-400 px-1">
                      <span>{isArabic ? 'مستند مصنف' : 'Classified Document'}</span>
                      <span>{isArabic ? 'الجمعية الأكاديمية الأولى' : 'EduPrint Mobile Suite'}</span>
                    </div>
                  </div>
                )}

                {formState.headerStyle === 'traditional' && (
                  <div className="flex flex-col items-center text-center pb-3 border-b border-dashed border-slate-800 mb-5">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 uppercase">
                      {formState.institutionName}
                    </h1>
                    <span className="text-xs text-slate-500 font-serif italic mt-0.5">
                      {isArabic ? 'تأسس عام ٢٠١٣ م' : 'Est. 2013 • Academic Bulletin'}
                    </span>
                  </div>
                )}

                {/* NOTICE REFERENCE DATA ROW */}
                <div className="flex justify-between items-center text-[11px] text-slate-500 mb-6 font-mono font-medium">
                  <div>
                    {isArabic 
                      ? `الرقم: ع د / ٢٦ م / ${formatNumerals(814, 'ar', formState.arabicNumerals)}` 
                      : currentLang === 'bn' ? `স্মারক নং: নো-২৬/${formatNumerals(814, 'bn')}` : `Memo No: NCT/2026/${formatNumerals(814, 'en')}`}
                  </div>
                  <div>
                    {isArabic ? 'التاريخ: ' : currentLang === 'bn' ? 'তারিখ: ' : 'Date: '}
                    <span className="underline decoration-slate-200 underline-offset-4 decoration-2 font-bold text-slate-700">
                      {formatNumerals(formState.noticeDate || new Date().toISOString().split('T')[0], currentLang, formState.arabicNumerals)}
                    </span>
                  </div>
                </div>

                {/* CENTRED EMPHASIZED NOTICE SIGNAGE BANNER */}
                <div className="text-center my-6">
                  <span className={`border-2 ${themeColors.primaryBorder} ${themeColors.primaryText} text-xs font-black tracking-widest uppercase px-5 py-1.5 rounded-md inline-block shadow-xs`}>
                    {isArabic ? 'إعــــــــلان مهم' : currentLang === 'bn' ? 'জরুরী নোটিশ' : 'OFFICIAL NOTICE'}
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-slate-850 mt-4 px-2 leading-relaxed tracking-tight">
                    {formState.noticeTitle || 'Subject Title of the announcement goes here'}
                  </h2>
                </div>

                {/* THE MAIN INTERACTIVE CONTENT PARAGRAPH BLOCKS */}
                <div className="text-xs sm:text-sm leading-relaxed text-slate-800 p-1 whitespace-pre-wrap font-normal my-6 min-h-[220px] text-justify tracking-wide">
                  {formState.noticeContent || 'Start writing detailed notice parameters here. Mixed text is supported!'}
                </div>

                {/* AUTHORIZED COUNTER SIG BLOCK */}
                <div className="mt-14 pt-6 border-t border-slate-100 flex justify-end">
                  <div className={`w-52 text-xs ${isArabic ? 'text-right' : 'text-left'}`}>
                    {formState.signatureName && (
                      <div className="border-b border-slate-350 pb-0.5 mb-1.5 font-extrabold text-slate-900 border-dashed">
                        {formState.signatureName}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block leading-none">
                      {formState.signatureTitle || (isArabic ? 'الرئيس المخول' : 'Authorized Signatory')}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-1">
                      {formState.institutionName}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: EXPORT PANEL */}
      {activeStep === 3 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-6 text-center animate-fade-in">
          
          <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-700 w-16 h-16 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-800">
              {isArabic ? 'مستندك جاهز تماماً للتصدير' : currentLang === 'bn' ? 'আপনার নোটিশ বা রিপোর্ট প্রিন্ট করার জন্য প্রস্তুত!' : 'Your notice is generated and ready!'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {isArabic ? 'اختر التصدير كملف وورد لتعديله على الكومبيوتر أو اطبع الإعلان فوراً كملف PDF مخصص' : currentLang === 'bn' ? 'কোনো কম্পিউটার ছাড়াই সরাসরি মোবাইল থেকে প্রিন্ট বা শেয়ার করতে নিচের বাটনগুলো চাপুন।' : 'Download onto your Android phone for paper printing or export as a DOC format.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-2">
            <button
              id="btn-print-pdf-step3"
              onClick={triggerPdfPrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition active:scale-97 cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>{isArabic ? 'طباعة المستند / PDF' : currentLang === 'bn' ? 'সরাসরি প্রিন্ট / PDF' : 'Print Paper / Save PDF'}</span>
            </button>

            <button
              id="btn-word-docx-step3"
              onClick={triggerDocxExport}
              className="bg-white hover:bg-indigo-50 text-indigo-700 border-2 border-indigo-100 font-black text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-97 cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>{isArabic ? 'تحميل ملف وورد DOC' : currentLang === 'bn' ? 'ওয়ার্ড ফাইল ডাউনলোড' : 'Download Word (.DOC)'}</span>
            </button>

            <button
              id="btn-copy-formatted-step3"
              onClick={copyFormattedDocument}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-200 font-extrabold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-97 cursor-pointer"
              title="Copies rich formatting text for painless copy pasting into locally installed soft copy apps"
            >
              <Copy className="w-5 h-5" />
              <span>{isArabic ? 'نسخ المضمون للورد' : currentLang === 'bn' ? 'ফর্ম্যাট কপি করুন (ওয়ার্ডে পেস্ট)' : 'Copy Formatted Word'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveStep(2)}
              className="text-xs text-slate-500 hover:text-slate-850 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>← {isArabic ? 'العودة للتصميم والتعديل' : 'Modify Template Design'}</span>
            </button>

            <button
              id="btn-not-save-finish"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2 px-4 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? t.saving : isArabic ? 'حفظ وإنهاء التعريب' : currentLang === 'bn' ? 'ডাটাবেসে সংরক্ষণ করে ফিরুন' : 'Save & Exit'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
