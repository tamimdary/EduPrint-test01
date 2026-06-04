/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppLanguage, QuestionPaperData, QuestionItem, QuestionType, MCQOption, EduDocument, InstitutionProfile } from '../types';
import { translationData } from '../translations';
import CrestLogo from './CrestLogo';
import { COLOR_THEMES, FONT_CLASSES, formatNumerals } from '../utils';
import { 
  Building, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
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
  RefreshCw,
  FolderOpen,
  Star,
  Copy,
  Layout,
  Palette,
  Type,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Settings
} from 'lucide-react';

interface QuestionPaperBuilderProps {
  currentLang: AppLanguage;
  initialDoc?: QuestionPaperData | null;
  onSave: (doc: EduDocument) => Promise<void>;
  onBackToDashboard: () => void;
}

interface QuestionFormState {
  institutionName: string;
  logoOption: string;
  logoUploadedData?: string;
  examName: string;
  className: string;
  subjectName: string;
  fullMarks: string;
  examTime: string;
  instructions: string;
  questions: QuestionItem[];
  templateVariant: number; // 1 to 10
  customColor: 'indigo' | 'emerald' | 'crimson' | 'amber' | 'slate' | 'violet' | 'rose' | 'sky' | 'teal' | 'gold';
  customFont: 'sans' | 'display' | 'serif' | 'elegant' | 'mono' | 'tajawal' | 'amiri';
  headerStyle: 'centered' | 'split-left' | 'badge-stamp' | 'ribbon-strip' | 'traditional';
  arabicNumerals: boolean;
}

export default function QuestionPaperBuilder({
  currentLang,
  initialDoc,
  onSave,
  onBackToDashboard,
}: QuestionPaperBuilderProps) {
  const t = translationData[currentLang];
  const isArabic = currentLang === 'ar';

  // Step state
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1); // 1: Create, 2: Customize & Live Preview, 3: Export & Print

  // Primary component state
  const [formState, setFormState] = useState<QuestionFormState>({
    institutionName: '',
    logoOption: 'preset-school',
    logoUploadedData: undefined,
    examName: '',
    className: '',
    subjectName: '',
    fullMarks: '100',
    examTime: '',
    instructions: '',
    questions: [],
    templateVariant: 1,
    customColor: 'indigo',
    customFont: isArabic ? 'tajawal' : 'sans',
    headerStyle: 'centered',
    arabicNumerals: isArabic,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [autoSaveNotification, setAutoSaveNotification] = useState<'saved' | null>(null);
  
  // Question Bank states
  const [questionBank, setQuestionBank] = useState<QuestionItem[]>([]);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSavedToast, setBankSavedToast] = useState(false);

  // Undo/Redo Stacks
  const undoStackRef = useRef<QuestionFormState[]>([]);
  const redoStackRef = useRef<QuestionFormState[]>([]);
  const isUndoRedoActive = useRef(false);

  // Load configuration details & defaults
  useEffect(() => {
    // Load Question Bank from storage
    const savedBank = localStorage.getItem('eduprint_question_bank');
    if (savedBank) {
      try {
        setQuestionBank(JSON.parse(savedBank));
      } catch (e) {
        console.error(e);
      }
    }

    if (initialDoc) {
      setFormState({
        institutionName: initialDoc.institutionName || '',
        logoOption: initialDoc.logoOption || 'preset-school',
        logoUploadedData: initialDoc.logoUploadedData,
        examName: initialDoc.examName || '',
        className: initialDoc.className || '',
        subjectName: initialDoc.subjectName || '',
        fullMarks: initialDoc.fullMarks || '100',
        examTime: initialDoc.examTime || '',
        instructions: initialDoc.instructions || '',
        questions: initialDoc.questions || [],
        templateVariant: initialDoc.templateVariant || 1,
        customColor: initialDoc.customColor || 'indigo',
        customFont: initialDoc.customFont || (isArabic ? 'tajawal' : 'sans'),
        headerStyle: (initialDoc.headerStyle as any) || 'centered',
        arabicNumerals: !!initialDoc.arabicNumerals,
      });
    } else {
      // Check for saved school profile
      const savedProfile = localStorage.getItem('eduprint_institution_profile');
      let profile: Partial<InstitutionProfile> = {};
      if (savedProfile) {
        try {
          profile = JSON.parse(savedProfile);
        } catch (e) {
          console.error(e);
        }
      }

      // Check if unsaved draft exists
      const draft = localStorage.getItem('eduprint_draft_question');
      if (draft) {
        setShowDraftBanner(true);
      }

      // Default Setup
      if (currentLang === 'bn') {
        setFormState(prev => ({
          ...prev,
          institutionName: profile.name || 'আমীর আলী একাডেমী মাধ্যমিক বিদ্যালয়',
          logoOption: profile.logoOption || 'preset-school',
          logoUploadedData: profile.logoUploadedData,
          examName: 'অর্ধ-বার্ষিক সামষ্টিক মূল্যায়ন ২০২৬',
          className: 'অষ্টম শ্রেণী',
          subjectName: 'গণিত ও যুক্তিশাস্ত্র',
          fullMarks: '১০০',
          examTime: '৩ ঘণ্টা',
          instructions: 'সকল প্রশ্নের উত্তর আবশ্যক। ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান নির্দেশ করে। ক্যালকুলেটর ব্যবহার নিষেধ।',
          templateVariant: 5,
          customColor: 'indigo',
          customFont: 'sans',
          headerStyle: 'centered',
          arabicNumerals: false,
          questions: [
            { id: 'sec1', type: 'section', questionText: 'ক-বিভাগ: বহুনির্বাচনি প্রশ্নাবলি (মান: ২০)' },
            {
              id: 'q1',
              type: 'mcq',
              questionText: 'একটি চতুর্ভুজের চার কোণের সমষ্টি সমান কত ডিগ্রী?',
              marks: 1,
              options: [
                { id: 'o1', text: 'ক) ১৮০°' },
                { id: 'o2', text: 'খ) ২৭০°' },
                { id: 'o3', text: 'গ) ৩৬০°' },
                { id: 'o4', text: 'ঘ) ৯০°' }
              ]
            },
            { id: 'sec2', type: 'section', questionText: 'খ-বিভাগ: সৃজনশীল রচনামূলক প্রশ্ন (মান: ৮০)' },
            {
              id: 'q2',
              type: 'creative',
              questionText: 'উদ্দীপক: একটি সমকোণী ত্রিভুজের অতিভুজ ১৩ সে.মি. এবং ভূমির দৈর্ঘ্য ১২ সে.মি.। এটি একটি সাধারণ বীজগণিতীয় কাঠামোর সাথে মিলযুক্ত।',
              marks: 10,
              subQuestions: [
                'ক) পিথাগোরাসের উপপাদ্যটি বিবৃত করো।',
                'খ) ত্রিভুজটির লম্বের সঠিক দৈর্ঘ্য নির্ণয় করো।',
                'গ) যদি অতিভুজ পরিবর্তিত হয়ে ১৫ সে.মি হয়, তবে ক্ষেত্রফলের কি পরিবর্তন হবে হিসাব কর।'
              ]
            }
          ]
        }));
      } else if (currentLang === 'ar') {
        setFormState(prev => ({
          ...prev,
          institutionName: profile.name || 'المعهد النموذجي الإسلامي للبنين',
          logoOption: profile.logoOption || 'preset-madrasa',
          logoUploadedData: profile.logoUploadedData,
          examName: 'اختبارات نصف العام الدراسي الأول',
          className: 'الصف الثاني الإعدادي',
          subjectName: 'العقيدة والتوحيد الإسلامي',
          fullMarks: '٨٠',
          examTime: 'ساعتان',
          instructions: 'أجب عن الأسئلة الموضَّحة كاملةً بخط واضح، ومجموع الدقائق الممنوحة لا تزيد عن مائة وعشرين دقيقة.',
          templateVariant: 10,
          customColor: 'gold',
          customFont: 'tajawal',
          headerStyle: 'centered',
          arabicNumerals: true,
          questions: [
            { id: 'sec1', type: 'section', questionText: 'أولاً: أصول الفرائض والتوحيد (٢٠ درجة)' },
            {
              id: 'q1',
              type: 'short',
              questionText: 'ما هي حقيقة الإيمان عند أهل السنة والجماعة؟ وهل يزيد وينقص؟ وضح بأدلة من القرآن الحكيم.',
              marks: 10
            }
          ]
        }));
      } else {
        setFormState(prev => ({
          ...prev,
          institutionName: profile.name || 'Saint George Science Academy',
          logoOption: profile.logoOption || 'preset-school',
          logoUploadedData: profile.logoUploadedData,
          examName: 'Mid-term Assessment Examination 2026',
          className: 'Grade 10',
          subjectName: 'Physics and Applied Mechanics',
          fullMarks: '100',
          examTime: '3 Hours',
          instructions: 'All questions in Section A and Section B are compulsory. Highlight neat diagrams where applicable.',
          templateVariant: 1,
          customColor: 'indigo',
          customFont: 'sans',
          headerStyle: 'centered',
          arabicNumerals: false,
          questions: [
            { id: 'sec1', type: 'section', questionText: 'SECTION A: MULTIPLE CHOICE QUESTIONS (MCQs)' },
            {
              id: 'q1',
              type: 'mcq',
              questionText: 'According to Newton’s Second Law of Motion, Force is equal to:',
              marks: 2,
              options: [
                { id: 'o1', text: 'A) Mass / Acceleration' },
                { id: 'o2', text: 'B) Acceleration / Mass' },
                { id: 'o3', text: 'C) Mass x Velocity' },
                { id: 'o4', text: 'D) Mass x Acceleration' }
              ]
            }
          ]
        }));
      }
    }
  }, [initialDoc, currentLang]);

  // Auto-Save Interval on change
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem('eduprint_draft_question', JSON.stringify(formState));
      setAutoSaveNotification('saved');
      setTimeout(() => setAutoSaveNotification(null), 2500);
    }, 10000);

    return () => clearInterval(timer);
  }, [formState]);

  const updateFormState = (updater: Partial<QuestionFormState>) => {
    setFormState(prev => {
      const next = { ...prev, ...updater };
      if (!isUndoRedoActive.current) {
        undoStackRef.current.push(prev);
        redoStackRef.current = [];
      }
      isUndoRedoActive.current = false;
      return next;
    });
  };

  const handleUndo = () => {
    if (undoStackRef.current.length > 0) {
      isUndoRedoActive.current = true;
      const prev = undoStackRef.current.pop()!;
      redoStackRef.current.push(formState);
      setFormState(prev);
    }
  };

  const handleRedo = () => {
    if (redoStackRef.current.length > 0) {
      isUndoRedoActive.current = true;
      const next = redoStackRef.current.pop()!;
      undoStackRef.current.push(formState);
      setFormState(next);
    }
  };

  const handleRecoverDraft = () => {
    const draft = localStorage.getItem('eduprint_draft_question');
    if (draft) {
      try {
        setFormState(JSON.parse(draft));
        setShowDraftBanner(false);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem('eduprint_draft_question');
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

  // Add blank question
  const handleAddQuestion = (type: QuestionType) => {
    const letters = isArabic ? ['أ)', 'ب)', 'جـ)', 'د)'] : currentLang === 'bn' ? ['ক)', 'খ)', 'গ)', 'ঘ)'] : ['A)', 'B)', 'C)', 'D)'];
    
    const newQuestion: QuestionItem = {
      id: 'q_' + Math.random().toString(36).substring(2, 11),
      type,
      questionText: '',
      marks: type === 'section' ? undefined : (type === 'mcq' ? 1 : 10),
      options: type === 'mcq' ? [
        { id: '1', text: letters[0] + ' ' },
        { id: '2', text: letters[1] + ' ' },
        { id: '3', text: letters[2] + ' ' },
        { id: '4', text: letters[3] + ' ' },
      ] : undefined,
      subQuestions: type === 'creative' ? [
        letters[0] + ' ',
        letters[1] + ' ',
        letters[2] + ' ',
      ] : undefined
    };

    updateFormState({
      questions: [...formState.questions, newQuestion]
    });
  };

  const handleRemoveQuestion = (id: string) => {
    updateFormState({
      questions: formState.questions.filter(q => q.id !== id)
    });
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formState.questions.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const nextArr = [...formState.questions];
    const temp = nextArr[index];
    nextArr[index] = nextArr[targetIndex];
    nextArr[targetIndex] = temp;

    updateFormState({ questions: nextArr });
  };

  const handleQuestionValueChange = (id: string, updates: Partial<QuestionItem>) => {
    updateFormState({
      questions: formState.questions.map(q => q.id === id ? { ...q, ...updates } : q)
    });
  };

  // Duplicate detecting scanning helper
  const detectDuplicates = (text: string, qId: string): boolean => {
    if (!text.trim() || text.length < 10) return false;
    const cleanText = text.trim().toLowerCase().replace(/[?।.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    
    let isDupe = false;
    formState.questions.forEach(q => {
      if (q.id !== qId && q.questionText) {
        const otherClean = q.questionText.trim().toLowerCase().replace(/[?।.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
        if (otherClean === cleanText) {
          isDupe = true;
        }
      }
    });

    return isDupe;
  };

  // Automated Allocated Marks calculation helper
  const calculateTotalAllocatedMarks = (): number => {
    return formState.questions.reduce((acc, q) => acc + (q.marks || 0), 0);
  };

  // Star-saving to Question Bank Local Storage
  const handleSaveToBank = (q: QuestionItem) => {
    if (!q.questionText.trim()) return;
    
    // Check if copy is already in bank
    const exists = questionBank.some(item => item.questionText === q.questionText);
    if (exists) return;

    const nextBank = [...questionBank, { ...q, id: 'bank_' + Math.random().toString(36).substring(2, 9) }];
    setQuestionBank(nextBank);
    localStorage.setItem('eduprint_question_bank', JSON.stringify(nextBank));
    setBankSavedToast(true);
    setTimeout(() => setBankSavedToast(false), 2000);
  };

  const handleImportFromBank = (q: QuestionItem) => {
    const imported: QuestionItem = {
      ...q,
      id: 'q_' + Math.random().toString(36).substring(2, 11),
    };
    updateFormState({
      questions: [...formState.questions, imported]
    });
  };

  const handleClearBank = () => {
    setQuestionBank([]);
    localStorage.removeItem('eduprint_question_bank');
  };

  const getQuestionPaperPayload = (): QuestionPaperData => {
    return {
      id: initialDoc?.id || 'qpaper_' + Math.random().toString(36).substr(2, 9),
      type: 'question',
      lang: currentLang,
      institutionName: formState.institutionName,
      logoOption: formState.logoOption,
      logoUploadedData: formState.logoUploadedData,
      examName: formState.examName,
      className: formState.className,
      subjectName: formState.subjectName,
      fullMarks: formState.fullMarks,
      examTime: formState.examTime,
      instructions: formState.instructions,
      questions: formState.questions,
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
    if (!formState.examName.trim() || !formState.className.trim() || !formState.subjectName.trim()) {
      alert('Please fill out Class, Subject and Exam Name.');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(getQuestionPaperPayload());
      localStorage.removeItem('eduprint_draft_question');
      onBackToDashboard();
    } catch (e) {
      console.error(e);
      alert('Error saving exam question paper.');
    } finally {
      setIsSaving(false);
    }
  };

  const triggerPdfPrint = () => {
    window.print();
  };

  // Copy formatting to clipboard as a resilient backup for locked mobile devices
  const copyFormattedDocument = async () => {
    try {
      const element = document.getElementById('exam-preview-a4');
      if (!element) return;
      
      const cloned = element.cloneNode(true) as HTMLElement;
      
      const blob = new Blob([cloned.innerHTML], { type: 'text/html' });
      const item = new ClipboardItem({ 
        'text/html': blob, 
        'text/plain': new Blob([element.innerText], { type: 'text/plain' }) 
      });
      await navigator.clipboard.write([item]);
      alert(currentLang === 'bn' ? 'প্রশ্নপত্রটি ফর্ম্যাটসহ কপি করা হয়েছে! এমএস ওয়ার্ড বা গুগলে পেস্ট করতে পারবেন।' : 'Question paper copied with formatting! You can paste it directly into MS Word or other document editors.');
    } catch (err) {
      try {
        const element = document.getElementById('exam-preview-a4');
        if (element) {
          await navigator.clipboard.writeText(element.innerText);
          alert(currentLang === 'bn' ? 'প্রশ্নের সাধারণ টেক্সট কপি করা হয়েছে!' : 'Plain text questions copied to clipboard!');
        }
      } catch (e) {
        alert('Failed to copy questions content.');
      }
    }
  };

  // High formatting inline CSS Word Exporter
  const triggerDocxExport = () => {
    const payload = getQuestionPaperPayload();
    const isRtl = currentLang === 'ar';
    const alignCss = isRtl ? 'direction: rtl !important; text-align: right !important;' : 'direction: ltr !important; text-align: left !important;';
    const headingFont = payload.customFont === 'amiri' || payload.customFont === 'tajawal' ? 'Amiri, Arial' : 'Calibri, Arial';
    
    let questionsHtml = '';
    let questionCounter = 1;

    payload.questions.forEach((q) => {
      const marksDisplay = q.marks ? `(${formatNumerals(q.marks, currentLang, payload.arabicNumerals)})` : '';
      const localizedNum = formatNumerals(questionCounter, currentLang, payload.arabicNumerals);

      if (q.type === 'section') {
        questionsHtml += `
          <div style="margin: 25px 0 15px 0; border-bottom: 2px solid #ccc; padding-bottom: 4px; text-align: center;">
            <strong style="font-size: 11.5pt; color: #1e293b;">${q.questionText}</strong>
          </div>
        `;
      } else {
        questionsHtml += `
          <div style="margin-bottom: 18px; ${alignCss}">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td valign="top" style="font-weight: bold; width: 35px; font-size: 11pt;">
                  ${isRtl ? 'س' + localizedNum + '.' : localizedNum + '.'}
                </td>
                <td valign="top" style="font-size: 11pt;">
                  ${q.questionText} 
                </td>
                <td valign="top" align="${isRtl ? 'left' : 'right'}" style="width: 60px; font-weight: bold; font-size: 10.5pt; color: #475569;">
                  ${marksDisplay}
                </td>
              </tr>
            </table>
        `;

        if (q.type === 'mcq' && q.options) {
          questionsHtml += `<table width="100%" border="0" cellspacing="0" cellpadding="5" style="margin-top: 5px; margin-left: 30px;"><tr>`;
          q.options.forEach((opt, idx) => {
            if (idx > 0 && idx % 2 === 0) questionsHtml += `</tr><tr>`;
            questionsHtml += `<td width="50%" style="font-size: 10pt; color: #334155;">${opt.text}</td>`;
          });
          questionsHtml += `</tr></table>`;
        }

        if (q.type === 'creative' && q.subQuestions) {
          questionsHtml += `<div style="margin-left: 35px; margin-top: 8px;">`;
          q.subQuestions.forEach((sub, sIdx) => {
            questionsHtml += `<div style="font-size: 10.5pt; color: #1e293b; margin-bottom: 4px;">${sub}</div>`;
          });
          questionsHtml += `</div>`;
        }

        questionsHtml += `</div>`;
        questionCounter++;
      }
    });

    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Educational Question Paper</title>
        <!--[if gte mso 9]>
        <xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml>
        <![endif]-->
        <style>
          body { font-family: ${headingFont}; margin: 1in; ${alignCss} }
          .inst-title { text-align: center; font-size: 18pt; font-weight: bold; color: #0f172a; margin-bottom: 2px; }
          .exam-sub { text-align: center; font-size: 12pt; font-weight: bold; color: #334155; margin-bottom: 5px; }
          .meta-row { width: 100%; border-bottom: 2px solid #000; padding: 6px 0; margin-bottom: 15px; font-size: 10.5pt; font-weight: bold; }
          .instru { font-size: 9.5pt; font-style: italic; color: #475569; margin-bottom: 20px; line-height: 1.4; border-left: 3px solid #dc2626; padding-left: 8px; }
        </style>
      </head>
      <body>
        <div class="inst-title">${payload.institutionName}</div>
        <div class="exam-sub">${payload.examName}</div>
        <div class="exam-sub" style="font-size: 11pt;">${payload.className} • ${payload.subjectName}</div>
        
        <table class="meta-row" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="${isRtl ? 'right' : 'left'}">Full Marks: ${formatNumerals(payload.fullMarks, currentLang ?? 'en', payload.arabicNumerals)}</td>
            <td align="${isRtl ? 'left' : 'right'}">Exam Time: ${payload.examTime}</td>
          </tr>
        </table>

        <div class="instru"><strong>Instructions:</strong> ${payload.instructions}</div>

        <div>${questionsHtml}</div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Exam_${payload.subjectName.replace(/\s+/g, '_') || 'paper'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Determine template card border based on selected variant (1 to 10)
  const getTemplateBorder = () => {
    const c = COLOR_THEMES[formState.customColor] || COLOR_THEMES.indigo;
    const variant = formState.templateVariant;

    if (variant === 1) return `border-6 border-double ${c.primaryBorder}`;
    if (variant === 2) return `border-t-4 border-b-4 ${c.primaryBorder} border-x border-slate-200`;
    if (variant === 3) return `border-l-8 ${c.primaryBorder} border-y border-r border-slate-200`;
    if (variant === 4) return `border border-dashed ${c.primaryBorder} m-1 rounded-lg`;
    if (variant === 5) return 'border-4 border-slate-800 shadow-md';
    if (variant === 6) return 'border-2 border-stone-300 bg-orange-50/10 font-serif';
    if (variant === 7) return 'border border-slate-200 font-mono text-slate-800';
    if (variant === 8) return `border-t-8 ${c.primaryBorder} border-b-2 border-x border-slate-200`;
    if (variant === 9) return `border-2 ${c.primaryBorder} rounded-3xl p-8`;
    if (variant === 10) return 'border-4 border-amber-600';
    return 'border border-slate-200';
  };

  const totalAllocated = calculateTotalAllocatedMarks();
  const fullMarksNum = parseInt(formState.fullMarks.replace(/[^0-9]/g, '')) || 100;
  const isMarksMatching = totalAllocated === fullMarksNum;
  const computedTheme = COLOR_THEMES[formState.customColor] || COLOR_THEMES.indigo;
  const fontStyles = FONT_CLASSES[formState.customFont] || FONT_CLASSES.sans;

  return (
    <div id="qpaper-builder-main" className="space-y-6">
      
      {/* 3-STEP PROGRESS NAVIGATION COMPONENT */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between gap-1 max-w-xl mx-auto thumb-indicator-sticky">
        {[
          { step: 1, title: isArabic ? '١. صياغة الأسئلة' : currentLang === 'bn' ? '১. প্রশ্ন লিখুন' : '1. Write Questions', icon: Edit3 },
          { step: 2, title: isArabic ? '٢. المظهر والمعاينة' : currentLang === 'bn' ? '২. স্টাইল ও প্রিভিউ' : '2. Refine Style', icon: Eye },
          { step: 3, title: isArabic ? '٣. التصدير والطباعة' : currentLang === 'bn' ? '৩. প্রিন্ট করুন' : '3. Print & Export', icon: Printer },
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
              <CheckCircle2 className="w-3 h-3" /> Saved Draft
            </span>
          ) : (
            <span className="opacity-75 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin duration-3000" /> Auto-saving...
            </span>
          )}
        </div>
      </div>

      {/* Recover Unsaved Draft alert banner */}
      {showDraftBanner && (
        <div className="max-w-3xl mx-auto bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-amber-900 animate-slide-in">
          <div>
            <span className="font-extrabold text-xs block uppercase tracking-wider text-amber-600">Draft Found</span>
            <p className="text-xs text-amber-700 font-medium">
              {isArabic ? 'لقد وجدنا مسودة غير محفوظة مخزنة من الجلسة السابقة. هل ترغب باسترجاعها؟' : currentLang === 'bn' ? 'পূর্বে কাজ করা একটি খসড়া বা ড্রাফট পাওয়া গেছে। উদ্ধার করতে চান?' : 'We recovered an unsaved draft of this question paper.'}
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

      {/* STEP 1: CREATE WRITE QUESTIONS AREA */}
      {activeStep === 1 && (
        <div id="question-edit-form" className="max-w-4xl mx-auto space-y-6 animate-fade-in">
          
          {/* HEADER DESCRIPTION PARTICULARS FORM CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1">
              <Building className="w-4 h-4" />
              {isArabic ? 'بيانات ورأسية الامتحان' : currentLang === 'bn' ? 'পরীক্ষার বেসিক তথ্যসমূহ' : 'Exam Particulars & Guidelines'}
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">{t.institutionName}</label>
                <input
                  type="text"
                  value={formState.institutionName}
                  onChange={(e) => updateFormState({ institutionName: e.target.value })}
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl py-2 px-3 mt-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder={t.institutionPlaceholder}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">{t.examName}</label>
                <input
                  type="text"
                  value={formState.examName}
                  onChange={(e) => updateFormState({ examName: e.target.value })}
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl py-2 px-3 mt-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder={isArabic ? 'مثال: امتحانات نهاية الفترة الثالثة' : 'e.g. Mid-term Assessment 2026'}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">{t.className}</label>
                <input
                  type="text"
                  value={formState.className}
                  onChange={(e) => updateFormState({ className: e.target.value })}
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl py-2 px-3 mt-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder={isArabic ? 'الصف الثامن الإعدادي' : 'e.g. Class 8 / Grade 10'}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">{t.subjectName}</label>
                <input
                  type="text"
                  value={formState.subjectName}
                  onChange={(e) => updateFormState({ subjectName: e.target.value })}
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl py-2 px-3 mt-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder={isArabic ? 'اللغة الإنجليزية' : 'e.g. Mathematics'}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">{t.fullMarks}</label>
                <input
                  type="text"
                  value={formState.fullMarks}
                  onChange={(e) => updateFormState({ fullMarks: e.target.value })}
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl py-2 px-3 mt-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. 100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">{t.examTime}</label>
                <input
                  type="text"
                  value={formState.examTime}
                  onChange={(e) => updateFormState({ examTime: e.target.value })}
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl py-2 px-3 mt-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder={isArabic ? 'ساعتان ونصف' : 'e.g. 3 Hours'}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">{t.instructions}</label>
                <input
                  type="text"
                  value={formState.instructions}
                  onChange={(e) => updateFormState({ instructions: e.target.value })}
                  className="w-full text-sm border border-slate-200 bg-slate-50 focus:bg-white rounded-xl py-2.5 px-3 mt-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  placeholder={isArabic ? 'الرجاء الإجابة على خمس أسئلة فقط...' : 'e.g. Candidates must write answers in their own handwords.'}
                />
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
          </div>

          {/* REAL-TIME SMART MARKING INDEX */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
            isMarksMatching 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <div className="flex items-center gap-2">
              <Layers className={`w-5 h-5 ${isMarksMatching ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div>
                <span className="font-extrabold text-xs block uppercase tracking-wider">
                  {isArabic ? 'عداد حساب علامات ورقة الامتحان' : currentLang === 'bn' ? 'অটোমেটেড পূর্ণমান কাউন্টার' : 'Real-Time Mark Summation Index'}
                </span>
                <span className="text-xs">
                  {isMarksMatching 
                    ? (isArabic ? 'رائع! توزيع علامات الأسئلة يتطابق بدقة مع علامة المادة الكلية.' : currentLang === 'bn' ? 'চমৎকার! প্রশ্নগুলির মোট মান এবং পরীক্ষার পূর্ণমান মিলে গেছে।' : 'Perfect! Subtotal allocated marks match full marks.') 
                    : (isArabic ? `انتبه: إجمالي الدرجات الموزعة (${totalAllocated}) والدرجة المطلوبة (${fullMarksNum}) متباعدة.` : currentLang === 'bn' ? `রং অ্যালার্ট: মোট মার্ক্স যোগ করে (${totalAllocated}) হয়েছে, পূর্ণমান হওয়ার কথা ডিক্লেয়ার করা (${fullMarksNum}) মডিউল স্পর্শ করুন।` : `Sum allocated marks is ${totalAllocated} while expected exam full marks is ${fullMarksNum}.`)}
                </span>
              </div>
            </div>
            <div className={`text-base font-black px-4 py-1.5 rounded-full text-center shrink-0 ${isMarksMatching ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
              {totalAllocated} / {fullMarksNum}
            </div>
          </div>

          {/* ACTIVE QUESTIONS REORDER & EDIT PORTAL */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-xs font-black uppercase text-slate-500">
                {isArabic ? 'قائمة وصياغة الأسئلة المكتوبة' : currentLang === 'bn' ? 'প্রশ্নের ক্রম ও রচনাকৌশল তালিকা' : 'Draft Questions List'}
              </span>

              {/* Show Question Bank button */}
              <button
                onClick={() => setShowBankPicker(!showBankPicker)}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
              >
                <Star className="w-3.5 h-3.5" />
                <span>{isArabic ? 'فتح بنك الأسئلة المساعد' : currentLang === 'bn' ? 'প্রশ্ন ব্যাংক ওপেন করুন' : 'Open Question Bank'}</span>
              </button>
            </div>

            {/* EXPANDED LOCAL QUESTION BANK DRAWER */}
            {showBankPicker && (
              <div className="bg-slate-100 border border-slate-200 p-5 rounded-3xl space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1">
                    <Star className="w-4.5 h-4.5 text-indigo-500 fill-indigo-500" />
                    {isArabic ? 'أسئلة معتكفة ومحفوظة مسبقاً' : currentLang === 'bn' ? 'পূর্বের সংরক্ষিত প্রশ্ন ব্যাংক তালিকা' : 'Your Stared Question Bank'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={handleClearBank} className="text-[10px] text-red-600 hover:underline font-bold">
                      {isArabic ? 'تفريغ البنك' : 'Clear Bank'}
                    </button>
                    <button onClick={() => setShowBankPicker(false)} className="text-[10px] text-slate-500 hover:underline font-bold">
                      {isArabic ? 'إغلاق البنك' : 'Collapse'}
                    </button>
                  </div>
                </div>

                {questionBank.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    {isArabic ? 'لا توجد أسئلة مخزنة حالياً في البنك. اضغط على أيقونة النجمة بجانب أي سؤال لحفظه واستخدامه مستقبلاً.' : currentLang === 'bn' ? 'প্রশ্ন ব্যাংকে পজিশন খালি! কোনো নতুন প্রশ্ন লিখে তা সেভ করতে নামের পাশে স্টার চিহ্নে ক্লিক করুন।' : 'Your bank is empty. Click the Star icon on any question field to bookmark it here.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {questionBank.map((q, idx) => (
                      <div key={q.id || idx} className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2 justify-between">
                        <div className="space-y-1 min-w-0">
                          <span className="bg-slate-100 text-slate-600 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-md uppercase">
                            {q.type} {q.marks && `[${q.marks} Marks]`}
                          </span>
                          <p className="text-xs text-slate-700 font-medium truncate-2" style={{ contentVisibility: 'auto' }}>
                            {q.questionText}
                          </p>
                        </div>
                        <button
                          onClick={() => handleImportFromBank(q)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg shrink-0 cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* DYNAMIC LIST OF INDIVIDUAL QUESTION ELEMENT BLOCKS */}
            {formState.questions.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
                <Trash2 className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-500">
                  {isArabic ? 'لم تضف أسئلة بعد! اضغط على الأزرار بالأسفل لإدراج أسئلة متعددة الاختيارات، مقالية أو فواصل فصول.' : currentLang === 'bn' ? 'আপনি এখনো কোনো প্রশ্ন যোগ করেননি! নিচে প্লাস চিহ্নে ক্লিক করে একের পর এক কাস্টম কোশ্চেন যোগ করতে থাকুন।' : 'No questions created yet! Use the triggers below to add questions.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formState.questions.map((q, index) => {
                  const isDuplicated = detectDuplicates(q.questionText, q.id);
                  return (
                    <div 
                      key={q.id}
                      className={`bg-white rounded-2xl border p-4 sm:p-5 relative transition-all duration-200 ${
                        isRtlLayout(q.type) ? 'border-indigo-100 ring-1 ring-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                      style={{ contentVisibility: 'auto' }}
                    >
                      {/* TOP BADGE AND CONTROL BUTTON ROW */}
                      <div className="flex justify-between items-center gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${
                            q.type === 'section' 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {q.type === 'section' ? 'Section Bar' : q.type}
                          </span>

                          {q.type !== 'section' && (
                            <span className="text-xs text-slate-400 font-mono">
                              {isArabic ? `الترتيب: #${index + 1}` : `Pos: #${index + 1}`}
                            </span>
                          )}
                        </div>

                        {/* Top quick arrows & trash elements */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveQuestion(index, 'up')}
                            disabled={index === 0}
                            className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 active:scale-95 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => moveQuestion(index, 'down')}
                            disabled={index === formState.questions.length - 1}
                            className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 disabled:opacity-30 hover:bg-slate-100 active:scale-95 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {q.type !== 'section' && (
                            <button
                              onClick={() => handleSaveToBank(q)}
                              className="p-1 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-600 hover:bg-yellow-100 active:scale-95 cursor-pointer"
                              title="Save to Bank"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="p-1 bg-rose-50 border border-rose-200 rounded-lg text-rose-600 hover:bg-rose-100 active:scale-95 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* DUPLICATE QUESTION DUPLICATION WARNING MODAL */}
                      {isDuplicated && (
                        <div className="mb-3 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium p-2.5 rounded-lg flex items-center gap-1.5 animate-pulse">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>⚠️ {isArabic ? 'تنبيه مكرر: لقد كتبت هذا السؤال مسبقاً في مكان آخر.' : currentLang === 'bn' ? 'অ্যালার্ট: এই প্রশ্নটি অলরেডি উপরে এক জায়গায় লিখেছেন!' : 'Duplicate alert: Same question text found elsewhere.'}</span>
                        </div>
                      )}

                      {/* MAIN QUESTION TEXT AREA AND MARKS VALUE INPUT */}
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <textarea
                            value={q.questionText}
                            onChange={(e) => handleQuestionValueChange(q.id, { questionText: e.target.value })}
                            placeholder={
                              q.type === 'section' 
                                ? (isArabic ? 'مثال: القسم الأول: العقيدة الإسلامية السهلة (١٠ درجات)' : 'e.g. PART A: READING & GRAMMAR ASSESSMENT') 
                                : (isArabic ? 'اكتب نص السؤال هنا...' : 'Write question statement here...')
                            }
                            rows={q.type === 'section' ? 2 : 3}
                            className="w-full text-sm border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 focus:outline-none"
                          />
                        </div>

                        {q.type !== 'section' && (
                          <div className="w-20 shrink-0">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Marks</label>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={q.marks || ''}
                              onChange={(e) => handleMarksChangeInItem(q.id, e.target.value)}
                              className="w-full text-center font-bold text-sm border border-slate-200 bg-slate-50 rounded-xl py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>

                      {/* MCQ OPTIONS BUILDER (IF APPLICABLE) */}
                      {q.type === 'mcq' && q.options && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <span className="text-[11px] font-black uppercase text-slate-500 block">MCQ Options</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt, oIdx) => (
                              <input
                                key={opt.id}
                                type="text"
                                value={opt.text}
                                onChange={(e) => handleMCQOptionChangeInItem(q.id, opt.id, e.target.value)}
                                className="w-full text-xs font-medium border border-slate-250 bg-white rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CREATIVE SUB-QUESTIONS LIST BUILDER (IF APPLICABLE) */}
                      {q.type === 'creative' && q.subQuestions && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                          <span className="text-[11px] font-black uppercase text-slate-500 block">Creative Sub-questions / Sub-tasks</span>
                          <div className="space-y-2">
                            {q.subQuestions.map((subQ, sIdx) => (
                              <input
                                key={sIdx}
                                type="text"
                                value={subQ}
                                onChange={(e) => handleCreativeSubQuestionChangeInItem(q.id, sIdx, e.target.value)}
                                className="w-full text-xs border border-slate-250 bg-white rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

            {/* BUTTON TRIGGERS TO ADD DIFFERENT TYPES OF QUESTIONS STOCHASTIC */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 bg-white p-4 rounded-3xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleAddQuestion('mcq')}
                className="py-3 px-1 border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ MCQ Option</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddQuestion('short')}
                className="py-3 px-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Short Question</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddQuestion('long')}
                className="py-3 px-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Essay Question</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddQuestion('creative')}
                className="py-3 px-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Creative Unit</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddQuestion('section')}
                className="py-3 px-1 border border-dashed border-indigo-300 bg-indigo-50/30 hover:bg-indigo-100/50 text-indigo-700 font-extrabold text-xs rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition active:scale-95 col-span-2 sm:col-span-1"
              >
                <Plus className="w-4 h-4" />
                <span>+ Section Divider</span>
              </button>
            </div>

            {/* Save to Databank drawer finish */}
            {bankSavedToast && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold py-2 rounded-xl text-center shadow-xs animate-bounce">
                ✓ Question added to Local Question Bank successfully!
              </div>
            )}

            {/* Nav to Step 2 */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveStep(2)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-97 cursor-pointer"
              >
                <span>{isArabic ? 'متابعة تصميم الاستايل' : currentLang === 'bn' ? 'স্টাইল প্রিভিউ পাতায় যান' : 'Continue to Customize Layout'}</span>
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 2: LIVE PREVIEW AND PARAMETER CUSTOMIZING PANEL */}
      {activeStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto animate-fade-in relative">
          
          {/* Layout control sidebar elements */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 h-fit">
            
            {/* Theme picker */}
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

            {/* layout border frame templates */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5 tracking-wide">
                <Layout className="w-4 h-4 text-indigo-500" />
                {isArabic ? 'نمط الإطار (١٠ خيارات تميز)' : currentLang === 'bn' ? '১০টি ভিন্ন ভিন্ন ডিজাইন টেমপ্লেট' : 'Exam Layout Border Frames (10 Styles)'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-2 gap-1.5">
                {[
                  { id: 1, label: isArabic ? '١. الكلاسيكي المزدوج' : '1. Double Borders' },
                  { id: 2, label: isArabic ? '٢. برواز جانبي علوي' : '2. Parallel Rules' },
                  { id: 3, label: isArabic ? '٣. خط سميك للأورطة' : '3. Left-Stripe' },
                  { id: 4, label: isArabic ? '٤. زوايا ممهورة' : '4. Rounded Corners' },
                  { id: 5, label: isArabic ? '٥. مجلس الإدارة الأسود' : '5. Dark Board' },
                  { id: 6, label: isArabic ? '٦. شهادة ورق عتيق' : '6. Vintage Sepia' },
                  { id: 7, label: isArabic ? '٧. مصفوفة علمية' : '7. Grid Matrix' },
                  { id: 8, label: isArabic ? '٨. رأسية الترويسة العليا' : '8. Header Block' },
                  { id: 9, label: isArabic ? '٩. المدرسة الإبداعية' : '9. Rounded Box' },
                  { id: 10, label: isArabic ? '١٠. الإطار الملكي المذهب' : '10. Regal Crest' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => updateFormState({ templateVariant: item.id })}
                    className={`py-2 px-1 border text-center transition text-[10.5px] rounded-xl flex flex-col items-center justify-center gap-1 font-bold truncate leading-none cursor-pointer ${
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
                {isArabic ? 'اختر خط الكتابة للامتحان' : currentLang === 'bn' ? 'ফন্ট স্টাইল পরিবর্তন করুন' : 'Typography Choice'}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'sans', label: 'Default Sans' },
                  { id: 'display', label: 'Space Grotesk' },
                  { id: 'serif', label: 'Playfair Serif' },
                  { id: 'elegant', label: 'Elegant Outfit' },
                  { id: 'mono', label: 'Fira Academic' },
                  { id: 'tajawal', label: 'Tajawal Arabic' },
                  { id: 'amiri', label: 'Amiri Naskh' },
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

            {/* Header alignments */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5 tracking-wide">
                <Building className="w-4 h-4 text-indigo-500" />
                {isArabic ? 'تنسيق محاذاة اسم المرسل والترويسة' : currentLang === 'bn' ? 'লোগো ও কলেজ নাম বিন্যাস' : 'Institution Header align'}
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

            {/* Numeral systems */}
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

            {/* Proceed to export */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveStep(3)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{isArabic ? 'متابعة التصدير والطباعة' : currentLang === 'bn' ? 'ডাউনলোড ও প্রিন্ট পাতায় যান' : 'Proceed to Export & Print'}</span>
              </button>
            </div>
          </div>

          {/* Live Preview Display screen */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="bg-slate-500/10 border border-slate-200 p-2 sm:p-5 rounded-3xl overflow-x-auto min-h-[750px] shadow-inner relative flex justify-center items-center">
              
              <div
                id="exam-preview-a4"
                className={`bg-white text-slate-900 w-full max-w-[700px] min-h-[920px] shadow-2xl relative p-6 sm:p-12 ${getTemplateBorder()} ${fontStyles} transition-all duration-300`}
                dir={isArabic ? 'rtl' : 'ltr'}
              >
                {/* DYNAMIC INSTITUTION HEADER RENDER ENGINE */}
                {formState.headerStyle === 'centered' && (
                  <div className="flex flex-col items-center text-center border-b-2 border-slate-850 pb-3.5 mb-5">
                    {formState.logoOption !== 'preset-none' && (
                      <div className="mb-2 shrink-0">
                        <CrestLogo option={formState.logoOption} uploadedData={formState.logoUploadedData} className="w-16 h-16" />
                      </div>
                    )}
                    <h1 className={`text-lg sm:text-xl font-black uppercase tracking-tight ${computedTheme.primaryText}`}>
                      {formState.institutionName || 'Sunflower Green Academy'}
                    </h1>
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-widest mt-1">
                      {formState.examName || 'Assessment Term'}
                    </span>
                  </div>
                )}

                {formState.headerStyle === 'split-left' && (
                  <div className="flex items-center gap-4 border-b-2 border-slate-700 pb-3 mb-5">
                    {formState.logoOption !== 'preset-none' && (
                      <CrestLogo option={formState.logoOption} uploadedData={formState.logoUploadedData} className="w-14 h-14" />
                    )}
                    <div className={isArabic ? 'text-right' : 'text-left'}>
                      <h1 className={`text-base sm:text-lg font-black uppercase ${computedTheme.primaryText}`}>
                        {formState.institutionName || 'Sunflower Green Academy'}
                      </h1>
                      <span className="text-[10px] text-slate-400 font-bold block">{formState.examName}</span>
                    </div>
                  </div>
                )}

                {formState.headerStyle === 'badge-stamp' && (
                  <div className="relative pb-3 border-b-2 border-slate-200 mb-5 flex justify-between items-start">
                    <div className={isArabic ? 'text-right' : 'text-left'}>
                      <h1 className={`text-base sm:text-lg font-black uppercase ${computedTheme.primaryText}`}>
                        {formState.institutionName}
                      </h1>
                      <span className="text-[10px] text-slate-400 font-bold block mt-1">{formState.examName}</span>
                    </div>
                    {formState.logoOption !== 'preset-none' && (
                      <div className="border border-dashed border-slate-350 p-1 rounded-full">
                        <CrestLogo option={formState.logoOption} uploadedData={formState.logoUploadedData} className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                )}

                {formState.headerStyle === 'ribbon-strip' && (
                  <div className="mb-5 flex flex-col gap-1.5">
                    <div className={`${computedTheme.solidBg} text-white p-3 rounded-lg flex justify-between items-center`}>
                      <h1 className="text-xs sm:text-sm font-black uppercase">
                        {formState.institutionName}
                      </h1>
                      {formState.logoOption !== 'preset-none' && (
                        <div className="bg-white p-0.5 rounded-sm">
                          <CrestLogo option={formState.logoOption} uploadedData={formState.logoUploadedData} className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formState.headerStyle === 'traditional' && (
                  <div className="flex flex-col items-center text-center pb-3 border-b-2 border-slate-900 mb-5">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                      {formState.institutionName}
                    </h1>
                  </div>
                )}

                {/* EXAM META TITLE */}
                <div className="text-center mb-4 space-y-1">
                  <h2 className="text-sm sm:text-base font-black text-slate-800">
                    {formState.examName}
                  </h2>
                  <p className="text-[11px] font-bold text-slate-500">
                    {formState.className} • {formState.subjectName}
                  </p>
                </div>

                {/* FULL MARKS AND TIME ROW */}
                <div className="border-y border-slate-300 py-1.5 flex justify-between items-center text-xs font-bold text-slate-700 mb-5">
                  <span className="text-slate-600 block shrink-0">
                    {isArabic ? `الدرجة الكاملة: ${formatNumerals(formState.fullMarks, 'ar', formState.arabicNumerals)}` : currentLang === 'bn' ? `পূর্ণমান: ${formatNumerals(formState.fullMarks, 'bn')}` : `Full Marks: ${formatNumerals(formState.fullMarks, 'en')}`}
                  </span>
                  
                  <span className="text-slate-600 block shrink-0">
                    {isArabic ? `الزمن: ${formState.examTime}` : currentLang === 'bn' ? `সময়: ${formState.examTime}` : `Time: ${formState.examTime}`}
                  </span>
                </div>

                {/* EXAM INSTRUCTIONS BLOCK */}
                {formState.instructions && (
                  <div className={`p-3 bg-slate-50 text-[11px] italic leading-relaxed text-slate-600 mb-6 border-l-3 ${computedTheme.primaryBorder} relative rounded-r-md`}>
                    <strong>Instructions:</strong> {formState.instructions}
                  </div>
                )}

                {/* DYNAMIC LIST OF QUESTIONS LAYOUT PRINT */}
                <div className="space-y-6">
                  {(() => {
                    let printableCounter = 1;

                    return formState.questions.map((q) => {
                      if (q.type === 'section') {
                        return (
                          <div 
                            key={q.id}
                            className="text-center border-b border-dashed border-slate-300 pb-1 mt-6"
                          >
                            <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                              {q.questionText}
                            </span>
                          </div>
                        );
                      }

                      const localizedNumber = formatNumerals(printableCounter, currentLang, formState.arabicNumerals);
                      printableCounter++;

                      return (
                        <div key={q.id} className="text-xs sm:text-sm">
                          <table className="w-full" border={0} cellSpacing={0} cellPadding={0}>
                            <tbody>
                              <tr>
                                <td valign="top" className="w-10 font-bold text-slate-800 leading-relaxed text-xs shrink-0">
                                  {isArabic ? `س${localizedNumber}` : `${localizedNumber}.`}
                                </td>
                                <td valign="top" className="text-slate-800 font-medium leading-relaxed">
                                  {q.questionText}
                                </td>
                                <td valign="top" className="w-12 text-right font-black text-xs text-slate-400 tracking-tight shrink-0">
                                  {q.marks && `[${formatNumerals(q.marks, currentLang, formState.arabicNumerals)}]`}
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          {/* MCQ Options representation */}
                          {q.type === 'mcq' && q.options && (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 my-2 pl-10 pr-4">
                              {q.options.map((opt, oIdx) => (
                                <div key={opt.id || oIdx} className="text-[11px] text-slate-650">
                                  {opt.text}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Creative sub questions representative display */}
                          {q.type === 'creative' && q.subQuestions && (
                            <div className="space-y-1 my-2 pl-10 pr-4">
                              {q.subQuestions.map((subQ, sIdx) => (
                                <div key={sIdx} className="text-[11.5px] text-slate-700 leading-normal font-sans">
                                  {subQ}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: EXPORT TERMINAL ACTION SHEET */}
      {activeStep === 3 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6 text-center animate-fade-in">
          
          <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-700 w-16 h-16 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-800">
              {isArabic ? 'ورقة الأسئلة جاهزة تماماً للطباعة والتوزيع' : currentLang === 'bn' ? 'পরীক্ষামূলক প্রশ্নপত্র প্রস্তুত!' : 'Your Exam Paper is Ready for Printing!'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {isArabic ? 'اطبع الورقة فوراً كملف PDF مخصص عالي الألوان، أو حمل الملف كصيغة وورد لتعديله على الكومبيوتر' : currentLang === 'bn' ? 'মোবাইল থেকে সরাসরি প্রিন্টআউট বা ডাব্লুওআরডি ফাইল হিসাবে ডাউনলোড করতে নিচের বাটন প্রেস করুন।' : 'Export and print this question paper securely in one thumb tap.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-2">
            <button
              id="btn-print-pdf-step3"
              onClick={triggerPdfPrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition active:scale-97 cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>{isArabic ? 'طباعة ورقة الأسئلة / PDF' : currentLang === 'bn' ? 'সরাসরি প্রশ্ন প্রিন্ট / PDF' : 'Print Question Paper / PDF'}</span>
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
              <span>{isArabic ? 'نسخ الأسئلة للورد' : currentLang === 'bn' ? 'ফর্ম্যাট কপি করুন (ওয়ার্ডে পেস্ট)' : 'Copy Formatted Word'}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveStep(2)}
              className="text-xs text-slate-500 hover:text-slate-850 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>← {isArabic ? 'العودة للتصميم والتعديل' : 'Modify Style Designs'}</span>
            </button>

            <button
              id="btn-q-save-finish"
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

  // Inner helpers to modify lists safely and push histories
  function handleMarksChangeInItem(id: string, text: string) {
    const numeric = parseInt(text) || 0;
    handleQuestionValueChange(id, { marks: numeric });
  }

  function handleMCQOptionChangeInItem(qId: string, optId: string, text: string) {
    const qItem = formState.questions.find(item => item.id === qId);
    if (qItem && qItem.options) {
      const nextOpts = qItem.options.map(opt => opt.id === optId ? { ...opt, text } : opt);
      handleQuestionValueChange(qId, { options: nextOpts });
    }
  }

  function handleCreativeSubQuestionChangeInItem(qId: string, subIdx: number, text: string) {
    const qItem = formState.questions.find(item => item.id === qId);
    if (qItem && qItem.subQuestions) {
      const nextSubs = [...qItem.subQuestions];
      nextSubs[subIdx] = text;
      handleQuestionValueChange(qId, { subQuestions: nextSubs });
    }
  }

  function isRtlLayout(type: string): boolean {
    return isArabic && type !== 'section';
  }
}
